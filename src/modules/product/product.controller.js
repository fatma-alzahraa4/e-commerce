import slugify from 'slugify';
import {categoryModel} from '../../../DB/models/category.model.js'
import {subCategoryModel} from '../../../DB/models/subCategory.model.js'
import { brandModel } from './../../../DB/models/brand.model.js';
import cloudinary from './../../utils/cloudinaryConfigrations.js';
import { customAlphabet } from 'nanoid';
import { productModel } from '../../../DB/models/product.model.js';
import { paginationFunc } from '../../utils/pagination.js';
const nanoid = customAlphabet('123456789_=!abcdefghijkl',5)
export const addProduct = async(req,res,next)=>{
    const {_id} = req.authUser
    const {
        title,
        desc,
        colors,
        sizes,
        price,
        appliedDiscount,
        stock
    } = req.body
    const{categoryId,subCategoryId,brandId} = req.query
    const categoryIsExist = await categoryModel.findById(categoryId)
    if(!categoryIsExist){
        return next(new Error('invalid category id',{cause:400}))
    }
    const subCategoryIsExist = await subCategoryModel.findById(subCategoryId)
    if(!subCategoryIsExist){
        return next(new Error('invalid subCategory id',{cause:400}))
    }
    const brandIsExist = await brandModel.findById(brandId)
    if(!brandIsExist){
        return next(new Error('invalid barnd id',{cause:400}))
    }
    // if(parseInt(subCategoryIsExist.categoryId) != categoryId || parseInt(brandIsExist.subCategoryId) != subCategoryId){
    //     return next(new Error('wrong relation',{cause:400}))
    // }
    const slug = slugify(title,{
        replacement:'_'
    })
    const afterPrice = price-(price*((appliedDiscount||0)/100))
    if(!req.files){
        return next(new Error('please upload photos',{cause:400}))
    }
    let images = []
    let public_ids = []
    const customId = nanoid()
    for (const file of req.files) {
        const {secure_url,public_id} = await cloudinary.uploader.upload(file.path,{
            folder:`${process.env.PROJECT_FOLDER}/Category/${categoryIsExist.customId}/SubCategory/${subCategoryIsExist.customId}/Brands/${brandIsExist.customId}/Products/${customId}`
        })
        images.push({secure_url,public_id})
        public_ids.push(public_id)
    }
    req.imagePath = `${process.env.PROJECT_FOLDER}/Category/${categoryIsExist.customId}/SubCategory/${subCategoryIsExist.customId}/Brands/${brandIsExist.customId}/Products/${customId}`
    const productObj = {
        title,
        desc,
        slug,
        colors,
        sizes,
        price,
        appliedDiscount,
        afterPrice,
        stock,
        categoryId,
        subCategoryId,
        brandId,
        images, 
        customId,
        createdBy:_id
    }
    const product = await productModel.create(productObj)
    if(!product){
        await cloudinary.api.delete_resources(public_ids)
        return next(new Error('creation failed',{cause:400}))
    }
    res.status(201).json({message:"Done",product})
}

export const updateProduct = async (req,res,next)=>{
    const {_id} = req.authUser
    const {
        title,
        desc,
        colors,
        sizes,
        price,
        appliedDiscount,
        stock
    } = req.body
    const{productId,categoryId,subCategoryId,brandId} = req.query
    const product = await productModel.findOne({_id:productId,createdBy:_id})
    if(!product){
        return next(new Error('invalid product id',{cause:400}))
    }
    //ids
    const categoryIsExist = await categoryModel.findById(categoryId||product.categoryId)
    const subCategoryIsExist = await subCategoryModel.findById(subCategoryId||product.subCategoryId)
    const brandIsExist = await brandModel.findById(brandId||product.brandId)
    //price
    if(price&&appliedDiscount){
        const afterPrice = price-(price*((appliedDiscount||0)/100))
        product.price = price
        product.appliedDiscound = appliedDiscount
        product.afterPrice = afterPrice
    }
    else if(price){
        const afterPrice = price-(price*((product.appliedDiscound||0)/100))
        product.price = price
        product.afterPrice = afterPrice
    }
    else if(appliedDiscount){
        const afterPrice = product.price-(product.price*((appliedDiscount||0)/100))
        product.appliedDiscound = appliedDiscount
        product.afterPrice = afterPrice
    }
    if(req.files?.length){
        let images = []
        for (const file of req.files) {
            const{secure_url,public_id} =await cloudinary.uploader.upload(file.path,
                {folder:`${process.env.PROJECT_FOLDER}/Category/${categoryIsExist.customId}/SubCategory/${subCategoryIsExist.customId}/Brands/${brandIsExist.customId}/Products/${product.customId}`})
            images.push({secure_url,public_id})
        }
        let public_ids = []
        for (const image of product.images) {
            public_ids.push(image.public_id)
        }
        await cloudinary.api.delete_resources(public_ids)
        product.images = images
    }
    if(title){
        product.title = title
        product.slug  = slugify(title,{replacement:'_'})
    }
    if(desc){product.desc = desc}    
    if(colors){product.colors = colors}
    if(sizes){product.sizes = sizes}
    if(stock){product.stock = stock}
    if(categoryId){product.categoryId = categoryId}
    if(subCategoryId){product.subCategoryId = subCategoryId}
    if(brandId){product.brandId = brandId}
    product.updatedBy = _id
    await product.save()
    res.status(200).json({message:'Done',product})

}

export const deleteProduct = async (req,res,next)=>{
    const{_id} = req.authUser
    const {productId} = req.params
    const product = await productModel.findOneAndDelete({productId,createdBy:_id})
    if(product){
        let imageArr = []
        for (const image of product.images) {
            imageArr.push(image.public_id)
        }
        await cloudinary.api.delete_resources(imageArr)
        return res.status(200).json({message:'Done'})
    }
    else{
        return next(new Error('failed to delete',{cause:400}))
    }
}

export const getProducts = async(req,res,next)=>{
    const {pa_ge,size}  =req.query
    const page = pa_ge*1||1
    const {limit,skip} = paginationFunc({page,size})
    const products = await productModel.find().limit(limit).skip(skip)
    return res.status(200).json({message:'Done',products})
}
export const getProductsByTitle = async(req,res,next)=>{
    const {searchKey,pa_ge,size}  =req.query
    const page = pa_ge*1||1
    const {limit,skip} = paginationFunc({page,size})
    const products = await productModel.find({
        $or: [
          { title: { $regex: searchKey, $options: 'i' } },
          { desc: { $regex: searchKey, $options: 'i' } },
        ],
      }).limit(limit).skip(skip)
    return res.status(200).json({message:'Done',products})
}

export const listProducts = async(req,res,next)=>{
    const {pa_ge,size,sort,select,search,...filters}  =req.query
    // ==================================pagination==========================================
    
        const page = pa_ge*1||1
    const {limit,skip} = paginationFunc({page,size})
    const productsPagination = await productModel.find().limit(limit).skip(skip)
    
    // ==================================sort=================================================
    
        const productsSort = await productModel.find().sort(sort.replaceAll(',',' '))

    
    // ==================================select=================================================
    
        const productsSelect = await productModel.find().select(select.replaceAll(',',' '))

    
    // ==================================search=================================================


        const productsSearch = await productModel.find({
            $or:[
                {title:{$regex:search,$options:'i'}},
                {desc:{$regex:search,$options:'i'}}
            ]
        })
        
        
        // ==================================filter================================================
        
        const queryString = JSON.parse(JSON.stringify(filters).replace(
            /gt|gte|lt|lte|in|nin|eq|neq|regex/g,(match)=>`$${match}`
            ))
            const productFilter = await productModel.find(queryString).limit(limit).skip(skip)
            console.log(filters);
            console.log(queryString);
            console.log(productFilter);
            return res.status(200).json({message:'Done',productFilter})
            
}