import slugify from 'slugify';
import { subCategoryModel } from '../../../DB/models/subCategory.model.js';
import { categoryModel } from '../../../DB/models/category.model.js';
import cloudinary from '../../utils/cloudinaryConfigrations.js';
import { customAlphabet } from 'nanoid';
import { brandModel } from '../../../DB/models/brand.model.js';
import { productModel } from '../../../DB/models/product.model.js';
const nanoid = customAlphabet('123456789_=!abcdefghijkl',5)
export const createSubCategory = async (req,res,next)=>{
    const{_id} = req.authUser
    const {categoryId} =  req.params
    const {name} = req.body
    //check category id
    const categoryIsExist = await categoryModel.findById(categoryId)
    if(!(categoryIsExist)){
        return next(new Error('invalid category id',{cause:400}))
    }
    //check sub category name
    if(await subCategoryModel.findOne({name})){
        return next(new Error('duplicate name',{cause:400}))

    }
    //generate slug
    const slug = slugify(name)
    //image upload 
    if(!req.file){
        return next(new Error('please upload subCategory image',{cause:400}))
    }
    const customId = nanoid()
    const {secure_url,public_id}= await cloudinary.uploader.upload(req.file.path,{
        folder:`${process.env.PROJECT_FOLDER}/Category/${categoryIsExist.customId}/SubCategory/${customId}`
    })
    //db
    const subCategoryObject = {
        name,
        slug,
        image:{
            secure_url,public_id
        },
        customId,
        categoryId,
        createdBy:_id
    }
    const subCategory=await subCategoryModel.create(subCategoryObject)
    if(!subCategory){
        await cloudinary.uploader.destroy(public_id)
        return next(new Error('please try again later',{cause:400}))
    }
    res.status(200).json({message:'Done',subCategory})
}

export const deleteSubCategory = async (req,res,next) =>{
    const{_id}  =req.authUser
    const {subCategoryId} = req.params
    const subCategory = await subCategoryModel.findOneAndDelete({_id:subCategoryId,createdBy:_id})
    if(!subCategory) {
        return next(new Error("subCategory doesn't exist"),{cause:400})
    }
    const category = await categoryModel.findById(subCategory.categoryId)
    await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_FOLDER}/Category/${category.customId}/SubCategory/${subCategory.customId}`)
    await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Category/${category.customId}/SubCategory/${subCategory.customId}`)
    const deletedBrands = await brandModel.deleteMany({subCategoryId})
    if(!deletedBrands){
        return next(new Error("failed brands delete"),{cause:400})
    }
    const deletedProducts = await productModel.deleteMany({subCategoryId})
    if(!deletedProducts){
        return next(new Error("failed products delete"),{cause:400})
    }
    res.status(200).json({message:'Done'})

}
export const updateSubCategory = async (req,res,next)=>{
    const{_id} = req.authUser
    const {subCategoryId} = req.query
    const {name} = req.body
    const subCategory = await subCategoryModel.findOne({_id:subCategoryId,createdBy:_id})
    if(!subCategory){
        return next(new Error('invalid subCategory id',{cause:400}))
    }
    //check that the name differ from the old one
    if(subCategory.name==name.tolower){
        return next(new Error('please different name from the old one',{cause:400}))
    }
    if(await subCategoryModel.findOne({name})){
        return next(new Error('please different name , duplicate name',{cause:400}))
    }
    subCategory.name= name;
    subCategory.slug = slugify(name)
    const category = await categoryModel.findById(subCategory.categoryId)

    if(req.file){
        await cloudinary.uploader.destroy(subCategory.image.public_id)
        const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,
            {
                folder:`${process.env.PROJECT_FOLDER}/Category/${category.customId}/SubCategory/${subCategory.customId}`
            }
            )
        subCategory.image = {secure_url,public_id}

    }
    subCategory.updatedBy=_id
    await subCategory.save()
    return res.status(200).json({message:"Done",subCategory})
}

export const getAllSubCategories = async (req,res,next)=>{
    //=========================================virtual==========================================
    const subCategory = await subCategoryModel.find().populate([
        {
            path:'Brands',
            select:'-_id name image',
            populate:[{
                path:'Products',
                select:'-_id name image'
            }]
        }])
    
    // const categories = await categoryModel.find()
    // const categoryArr = []
    //====================================arr====================================================
    // for(const category of categories){
    //     const subCategories = await subCategoryModel.find({
    //         categoryId:category._id
    //     })
    //     const catObj = category.toObject()
    //     catObj.subcategories = subCategories
    //     categoryArr.push(catObj)
    // }

    //================================cursor=====================================================
    // const cursor = await categoryModel.find().cursor()
    // for(let doc = await cursor.next();doc!=null;doc = await cursor.next()){
    //     const subCategories = await subCategoryModel.find({
    //                 categoryId:doc._id
    //             })
    //             const catObj = doc.toObject()
    //             catObj.subcategories = subCategories
    //             categoryArr.push(catObj)
    // }
    return res.status(200).json({message:'done',subCategory})
}