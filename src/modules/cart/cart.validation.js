import Joi from "joi";
import { generalFields } from './../../middlewares/validation.js';

export const addToCartSchema = {
    body:Joi.object({
        productId:generalFields._id,
        quantity:Joi.number()
    }).required().options({presence:'required'})
}
export const deleteFromCartSchema = {
    query:Joi.object({
        productId:generalFields._id, 
    }).required()
}