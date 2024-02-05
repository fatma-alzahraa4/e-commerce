import joi from "joi"
import { generalFields } from "../../middlewares/validation.js"
export const createCategorySchema ={
    body:joi.object({
        name:joi.string().min(2).max(30)
    }).required().options({presence:"required"})

}
export const updateCategorySchema ={
    body:joi.object({
        name:joi.string().min(3).max(30)
    }).required().options({presence:"optional"}),
    query:joi.object({
        categoryId:generalFields._id
    }).required().options({presence:"optional"}),

}
export const deleteCategorySchema={
    params:joi.object({
        categoryId:generalFields._id
    }).required().options({presence:"optional"}),
}