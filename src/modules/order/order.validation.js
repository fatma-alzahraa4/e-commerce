import Joi from "joi";
import { generalFields } from './../../middlewares/validation.js';

export const createOrderSchema = {
    body:Joi.object({
        productId:generalFields._id.required(),
        quantity:Joi.number().required(),
        address:Joi.string().min(5).max(50).required(),
        phoneNumbers:generalFields.phoneNumbers.required(),
        paymentMethod:Joi.string().valid('card','cash').required(),
        couponCode:Joi.string().min(3).max(10),
    }).required()
}
 export const cartToOrder = {
    query:Joi.object({
        cartId:generalFields._id.required()
    }).required(),
    body:Joi.object({
        address:Joi.string().min(5).max(50).required(),
        phoneNumbers:generalFields.phoneNumbers.required(),
        paymentMethod:Joi.string().valid('card','cash').required(),
        couponCode:Joi.string().min(3).max(10),
    }).required()
 }