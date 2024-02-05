import slugify from "slugify"
import { categoryModel } from "../../../DB/models/category.model.js"
import { subCategoryModel } from "../../../DB/models/subCategory.model.js";
import { brandModel } from "../../../DB/models/brand.model.js";
import { productModel } from "../../../DB/models/product.model.js";
import cloudinary from './../../utils/cloudinaryConfigrations.js';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('123456789_=!abcdefghijkl',5)
export const createCategory =async (req,res,next)=>{
    const{_id} = req.authUser
    const {name} = req.body
    const slug = slugify(name)
    if (await categoryModel.findOne({name})){
        return next(new Error('please enter different category name', {cause:400}))
    }
    if(!req.file){
        return next(new Error('please upload category image', {cause:400}))
    }
    const customId =nanoid() 
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,
        {folder:`${process.env.PROJECT_FOLDER}/Category/${customId}`}
        )
    const categoryObject = {
        name,
        slug,
        image:{
            secure_url,
            public_id
        },
        customId,
        createdBy:_id
    }
    const category = await categoryModel.create(categoryObject)
    if(!category) {
        await cloudinary.uploader.destroy(public_id)
        return next(new Error('craetion fail',{cause:400}))
    }
    return res.status(200).json({message:"Done",category})

}

export const updateCategory = async (req,res,next)=>{
    const{_id} = req.authUser
    const {categoryId} = req.query
    const {name} = req.body
    const category = await categoryModel.findOne({_id:categoryId,createdBy:_id})
    if(!category){
        return next(new Error('invalid category id',{cause:400}))
    }
    //check that the name differ from the old one
    if(category.name==name.tolower){
        return next(new Error('please enter different name from the old one',{cause:400}))
    }
    if(await categoryModel.findOne({name})){
        return next(new Error('please enter different name , duplicate name',{cause:400}))
    }
    category.name= name;
    category.slug = slugify(name)
    if(req.file){
        await cloudinary.uploader.destroy(category.image.public_id)
        const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,
            {folder:`${process.env.PROJECT_FOLDER}/Category/${category.customId}`}
            )
        category.image = {secure_url,public_id}

    }
    category.updatedBy=_id
    await category.save()
    return res.status(200).json({message:"Done",category})
}

export const deleteCategory = async (req,res,next) =>{
    const{_id}  =req.authUser
    const {categoryId} = req.params
    const category = await categoryModel.findOneAndDelete({_id:categoryId,createdBy:_id})
    if(!category) {
        return next(new Error("category doesn't exist"),{cause:400})
    }
    await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_FOLDER}/Category/${category.customId}`)
    await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Category/${category.customId}`)
    const deletedSubCategories = await subCategoryModel.deleteMany({categoryId})
    if(!deletedSubCategories){
        return next(new Error("failed subCategories delete"),{cause:400})
    }
    const deletedBrands = await brandModel.deleteMany({categoryId})
    if(!deletedBrands){
        return next(new Error("failed brands delete"),{cause:400})
    }
    const deletedProducts = await productModel.deleteMany({categoryId})
    if(!deletedProducts){
        return next(new Error("failed products delete"),{cause:400})
    }
    res.status(200).json({message:'Done'})

}

export const getAllCategories = async (req,res,next)=>{
    //=========================================virtual==========================================
    const categories = await categoryModel.find().populate([
        {
            path:'subcategories',
            select:'-_id name image',
            populate:[{
                path:'Brands',
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
    return res.status(200).json({message:'done',categories})
}

