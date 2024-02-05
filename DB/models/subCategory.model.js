import { Schema, model } from "mongoose";

export const subCategorySchema = new Schema({
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
        }
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
    categoryId:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    customId:String
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps:true
})
subCategorySchema.virtual('Brands',{
    ref:'Brand',
    localField:'_id',
    foreignField:'subCategoryId'
})

export const subCategoryModel = model('SubCategory',subCategorySchema)