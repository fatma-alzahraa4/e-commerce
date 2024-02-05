import { Schema, model } from 'mongoose';
import pkg from 'bcrypt'
import { systemRoles } from '../../src/utils/systemRoles.js';
const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    isConfirmed:{
        type:Boolean,
        required:true,
        default:false
    },
    role:{
        type:String,
        required:true,
        enum:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPERADMIN],
        default:systemRoles.USER
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    address:[{
        type:String,
        required:true,
    }],
    profilePicture:{
        secure_url:String,
        public_id:String
    },
    status:{
        type:String,
       enum:['Online','Offline'],
       default:'Offline'
    },
    gender:{
        type:String,
        enum:['male','female','not specified'],
       default:'not specified'
    },
    provider:{
        type:String,
        default:'System',
        enum:['System','GOOGLE','facebook']
    },
    age:Number,
    token:String,
    forgetCode:String

},{timestamps:true})
// userSchema.pre('save',function(next,hash){
//     this.password = pkg.hashSync(this.password,+process.env.SALT_ROUNDS)
//     next()
// })

export const userModel = model('User',userSchema)