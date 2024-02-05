import { Schema, model } from "mongoose";

export const categorySchema = new Schema(
    {
    name:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    image:{
        secure_url:{
            type:String,
            required:true
        },
        public_id:{
            type:String,
            required:true
        },
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true 
    },
    updatedBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    customId:String
},
{
    toObject:{virtuals:true},
    toJSON:{virtuals:true},
    timestamps:true
})
categorySchema.virtual('subcategories',{
    ref:'SubCategory',
    localField:'_id',
    foreignField:'categoryId'
})
export const categoryModel = model('Category',categorySchema)