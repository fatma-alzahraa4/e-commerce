import Joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addBrandSchema = {
    body:Joi.object({
        name:Joi.string().min(3).max(20).required(),
    }).required().options({presence:'required'}),
    query:Joi.object({
        categoryId:generalFields._id,
        subCategoryId:generalFields._id
    }).required().options({presence:'required'})
}

export const deleteBrandSchema = {
query:Joi.object({
    brandId:generalFields._id
}).required().options({presence:"required"})
}

export const updateBrandSchema = {
    body:Joi.object({
        name:Joi.string().min(3).max(20).required(),
    }).required().options({presence:'required'}),
    query:Joi.object({
        brandId:generalFields._id
    }).required().options({presence:"required"})
    }
    