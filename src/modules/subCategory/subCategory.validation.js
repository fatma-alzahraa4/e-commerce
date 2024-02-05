import joi from "joi"
import { generalFields } from "../../middlewares/validation.js"
export const createSubCategorySchema ={
    body:joi.object({
        name:joi.string().min(2).max(30),
    }).required().options({presence:"required"}),
    params:joi.object({
        categoryId:generalFields._id
    }).required().options({presence:'required'})

}
export const updateSubCategorySchema ={
    body:joi.object({
        name:joi.string().min(3).max(30)
    }).required().options({presence:"optional"}),
    query:joi.object({
        subCategoryId:generalFields._id
    }).required().options({presence:"optional"}),

}
export const deleteSubCategorySchema={
    params:joi.object({
        subCategoryId:generalFields._id
    }).required().options({presence:"optional"}),
}