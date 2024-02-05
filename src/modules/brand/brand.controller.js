import slugify from 'slugify'
import { categoryModel } from '../../../DB/models/category.model.js'
import { subCategoryModel } from '../../../DB/models/subCategory.model.js'
import cloudinary from '../../utils/cloudinaryConfigrations.js'
import { customAlphabet } from 'nanoid'
import { brandModel } from '../../../DB/models/brand.model.js'
import { productModel } from './../../../DB/models/product.model.js';
const nanoid = customAlphabet('123456_=!ascbhdtel', 5)

//=================================== Add Brand ========================
export const addBrand = async (req, res, next) => {
  const {_id} = req.authUser
  const { name } = req.body
  const { subCategoryId, categoryId } = req.query
  if(await brandModel.findOne({name})){
    return next(new Error('please enter different brand name', { cause: 400 }))

  }
  // check categories
  const categoryExists = await categoryModel.findById(categoryId)
  if(!categoryExists){
    return next(new Error('invalid category', { cause: 400 }))
  }
  const subCategoryExists = await subCategoryModel.findById(subCategoryId)
  if (!subCategoryExists ) {
    return next(new Error('invalid subCategory', { cause: 400 }))
  }
  // slug
  const slug = slugify(name, {
    replacement: '_',
    lower: true,
  })
  //logo
  if (!req.file) {
    return next(new Error('please upload your logo', { cause: 400 }))
  }
  const customId = nanoid()
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Categories/${categoryExists.customId}/subCategories/${subCategoryExists.customId}/Brands/${customId}`,
    },
  )
  // db
  const brandObject = {
    name,
    slug,
    image: { secure_url, public_id },
    categoryId,
    subCategoryId,
    customId,
    createdBy:_id
  }
  const dbBrand = await brandModel.create(brandObject)
  if (!dbBrand) {
    await cloudinary.uploader.destroy(public_id)
    return next(new Error('try again later', { cause: 400 }))
  }
  res.status(201).json({ message: 'CreatedDone', dbBrand })
}
export const deleteBrand = async (req,res,next) =>{
  const{_id}  =req.authUser
  const {brandId} = req.query
  const brand = await brandModel.findOneAndDelete({_id:brandId,createdBy:_id})
  if(!brand) {
      return next(new Error("brand doesn't exist"),{cause:400})
  }
  const category = await categoryModel.findById(brand.categoryId)
  const subCategory = await subCategoryModel.findById(brand.subCategoryId)

  await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${brand.customId}`)
  await cloudinary.api.delete_folder(`${process.env.PROJECT_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${brand.customId}`)
  
  const deletedProducts = await productModel.deleteMany({brandId})
  if(!deletedProducts){
      return next(new Error("failed products delete"),{cause:400})
  }
  res.status(200).json({message:'Done'})

}
export const updateBrand = async (req,res,next)=>{
  const{_id} = req.authUser
  const {brandId} = req.query
  const {name} = req.body
  const brand = await brandModel.findOne({_id:brandId,createdBy:_id})
  if(!brand){
      return next(new Error('invalid brand id',{cause:400}))
  }
  //check that the name differ from the old one
  if(brand.name==name.tolower){
      return next(new Error('please different name from the old one',{cause:400}))
  }
  if(await brandModel.findOne({name})){
      return next(new Error('please different name , duplicate name',{cause:400}))
  }
  brand.name= name;
  brand.slug = slugify(name)
  const category = await categoryModel.findById(brand.categoryId)
  const subCategory = await subCategoryModel.findById(brand.subCategoryId)

  if(req.file){
      await cloudinary.uploader.destroy(brand.image.public_id)
      const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,
          {
              folder:`${process.env.PROJECT_FOLDER}/Categories/${category.customId}/subCategories/${subCategory.customId}/Brands/${brand.customId}`
          }
          )
      brand.image = {secure_url,public_id}

  }
  brand.updatedBy=_id
  await brand.save()
  return res.status(200).json({message:"Done",brand})
}

export const getAllBrands = async (req,res,next)=>{
  //=========================================virtual==========================================
  const brands = await brandModel.find().populate([
      {
          path:'Products',
          select:'-_id name images',
          
      }])
  

  return res.status(200).json({message:'done',brands})
}
