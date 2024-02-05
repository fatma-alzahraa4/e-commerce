import joi from "joi"
import { generalFields } from "../../middlewares/validation.js"
export const addProductSchema ={
    query:joi.object({
        categoryId:generalFields._id,
        subCategoryId:generalFields._id,
        brandId:generalFields._id
    }).required().options({presence:"required"}),
    body:joi.object({
        title:joi.string().min(3).max(20).required(),
        desc:joi.string().min(3).max(100).required(),
        colors:joi.array().items(joi.string()).required(),
        sizes:joi.array().items(joi.string()).required(),
        price:joi.number().required(),
        appliedDiscount:joi.number().required(),
        stock:joi.number().required()
    }).required()
}

export const updateProductSchema = {
    query:joi.object({
        categoryId:generalFields._id,
        subCategoryId:generalFields._id,
        brandId:generalFields._id,
        productId:generalFields._id

    }).required().options({presence:"required"}),
    body:joi.object({
        title:joi.string().min(3).max(20).required(),
        desc:joi.string().min(3).max(100).required(),
        colors:joi.array().items(joi.string()).required(),
        sizes:joi.array().items(joi.string()).required(),
        price:joi.number().required(),
        appliedDiscount:joi.number().required(),
        stock:joi.number().required()
    }).required(),

}

export const deleteProductSchema = {
    params:joi.object({
        productId:generalFields._id
    }).required()
}

export const getProductsSchema = {
    query:joi.object({
        pa_ge:joi.number(),
        size:joi.number()
    }).required()
   
}

export const getProductByTitleSchema = {
    query:joi.object({
        pa_ge:joi.number(),
        size:joi.number(),
        searchKey:joi.string().min(3).max(50).required()
    }).required()
}

// export const listProductsSchema = {
//     query:joi.object({
//         pa_ge:joi.number(),
//         size:joi.number(),
//         search:joi.string().min(3).max(50).required()

//     }).required()
   
// }