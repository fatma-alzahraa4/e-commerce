import Joi from "joi"
import { generalFields } from "../../middlewares/validation.js"
export const createCoupnSchema = {
    body:Joi.object({
        couponCode:Joi.string().min(3).max(55).required(),
        isPercentage:Joi.boolean().valid(true,false).optional(),
        isFixedAmount:Joi.boolean().valid(true,false).optional(),
        couponAmount:Joi.alternatives().conditional('isPercentage',{
            is:true,then:Joi.number().positive().min(1).max(100).required()
        }),
        
        fromDate:Joi.date().greater(Date.now()-(24*60*60*1000)).required(),
        toDate:Joi.date().greater(Joi.ref('fromDate')).required(),
        couponAssginedToUsers:Joi.array().items().required()
    }).required()
}
export const updateCoupnSchema = {
    body:Joi.object({
        fromDate:Joi.date().greater(Date.now()-(24*60*60*1000)).required(),
        toDate:Joi.date().greater(Joi.ref('fromDate')).required()
    }).required(),
    query:Joi.object({
        _id:generalFields._id
    }).required().options({presence:"required"})
}
export const deleteCoupnSchema = {
    query:Joi.object({
        _id:generalFields._id
    }).required().options({presence:"required"})
}