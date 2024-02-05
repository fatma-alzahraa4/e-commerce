import { Schema, model } from "mongoose";

export const couponSchema = new Schema(
    {
        couponCode:{
            type:String,
            required:true,
            unique:true,
            lowecase:true
        },
        couponAmount:{
            type:Number,
            required:true,
            default:1,
            min:1,
            max:100
        },
        isPercentage:{
            type:Boolean,
            default:false
        },
        isFixedAmount:{
            type:Boolean,
            default:false
        },
        status:{
            type:String,
            enum:['valid', 'expired'],
            default:'valid'
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true, 
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        couponAssginedToUsers:[{
            userId:{ 
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
              },
            maxUsage:{
                type:Number,
                default:1,
                required:true    
            },
            usageCount:{
              type:Number,
              default:0,
          }
        }],
        fromDate: {
            type: String,
            required: true,
        },
        toDate: {
            type: String,
            required: true,
        },
    
},
{
    timestamps:true
})

export const couponModel = model('Coupon',couponSchema)