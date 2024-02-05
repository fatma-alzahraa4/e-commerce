import { userModel } from "../../../DB/models/user.model.js"
import { sendEmailService } from "../../services/sendEmail.js"
import { generateToken, verifyToken } from "../../utils/tokenFunction.js"
import pkg from 'bcrypt'
import { customAlphabet } from 'nanoid';
import { OAuth2Client } from 'google-auth-library'
const nanoId = customAlphabet('abcdefghijklmnopqrstuvwxyz123456890',5)
//============================================signUp==============================================
export const signUp =async (req,res,next)=>{
    const {
        userName,
        role,
        phone,
        email,
        password,
        age,
        gender,
        address,
    } = req.body
    // is email duplicate
    const isEmailDuplicate  =await userModel.findOne({email})
    if(isEmailDuplicate){
        return next(new Error('email is already exist',{cause:400}))
    }
    //hash password
    const hashedPassword = pkg.hashSync(password,+process.env.SALT_ROUNDS)
    //token to confirm email
    const token = generateToken({
        payload:{email},
        signature:process.env.CONFIRMATION_EMAIL_TOKEN,
        expiresIn:'1h'
    })
    // const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirm/${token}`
    // const isEmailSent = sendEmailService(
    //     {to: email,
    //     subject:'Confirmation Email',
    //     message:`<a href=${confirmationLink}>click to confirm</a>`,})
    // if(!isEmailSent){
    //     return next(new Error('fail to send email',{cause:400}))
    // }
    const userObj = {
        userName,
        password:hashedPassword,
        role,
        phone,
        email,
        age,
        gender,
        address,
    }
    const savedUser = await userModel.create(userObj)
    res.status(200).json({message:'Done',savedUser})
}

//=========================================confirm Email==========================================

export const confirmEmail  =async (req,res,next)=>{
    const {token} = req.params
    const decoded = verifyToken({
        token,
        signature:process.env.CONFIRMATION_EMAIL_TOKEN
    })
    const user = await userModel.findOneAndUpdate({email:decoded?.email,isConfirmed:false},{isConfirmed:true},{new:true})
    if(!user){
        return next(new Error('eamil is already confirmed',{cause:400}))
    }
    res.status(200).json({message:'Confirmation Done',savedUser})
}

//============================================signIn==============================================

export const signIn = async (req,res,next)=>{
    const{email,password} = req.body
    const user = await userModel.findOne({email})
    if(!user ){
        return next(new Error('invalid login credentials',{cause:400}))
    }
    const isPassMatch  =pkg.compareSync(password,user.password)
    if(!isPassMatch){
        return next(new Error('invalid login credentials',{cause:400}))
    }
    const token  =generateToken({
        payload:{
        email,
        _id:user._id,
        role:user.role
    },
        signature:process.env.LOGIN_SIGNATURE,
        expiresIn:'3h'
        
    })
    const updatedUser = await userModel.findOneAndUpdate({email},{token,status:'Online'},{new:true})
    if(!updatedUser){
        return next(new Error('failed to login',{cause:400}))
    }
    
    res.status(200).json({message:'Done',updatedUser})
}

//==========================================forget password========================================

export const forgetPassword = async (req,res,next)=>{
    const {email}  =req.body
    const user = await userModel.findOne({email})
    if(!user){
        return next(new Error('invalid email',{cause:400}))
    }
    const code = nanoId()
    const hashedCode = pkg.hashSync(code,+process.env.SALT_ROUNDS)
    const token  = generateToken({
        payload:{email,sentCode:hashedCode},
        signature:process.env.RESET_TOKEN,
        expiresIn:'1h'
    })
    const resetLink = `${req.protocol}://${req.headers.host}/auth/reset/${token}`
    const isEmailSent = sendEmailService({
        to:email,
        subject:'reset Password',
        message:`<a href = ${resetLink}>click to reset your password</a>`
    })
    if(!isEmailSent){
        return next(new Error('failed to send reset email',{cause:400}))
    }
    const updatedUser = await userModel.findOneAndUpdate({email},{forgetCode:hashedCode},{new:true})
    res.status(200).json({message:'Done',updatedUser})
}

//==========================================reset password==========================================

export const resetPassword = async (req,res,next)=>{
    const {token}  =req.params
    const decoded = verifyToken({token,signature:process.env.RESET_TOKEN})
    const user = await userModel.findOne({
        email:decoded?.email,
        forgetCode:decoded?.sentCode
    })
    if(!user) {
        return next(new Error('you already reset your password',{cause:400}))
    }
    const {newPassword} = req.body
    const hashedPassword = pkj.hashSync(newPassword,+process.env.SALT_ROUNDS)

    user.password = hashedPassword
    user.forgetCode = null
    const resetedUser = await user.save()
    res.status(200).json({message:'Done',resetedUser})
    

}

//===========================================login with google account=============================

export const logInWithGmail = async (req,res,next)=>{
    const client = new OAuth2Client()
  const { idToken } = req.body
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    })
    const payload=await verify()
    return payload
}
const  { email_verified, email, name } = ticket.getPayload()
if(!email_verified){
    return next(new Error('invalid email', { cause: 400 }))
}
const user  = await userModel.findOne({
    email, provider: 'GOOGLE'
})
//=======================sign in=====================================
if(user){
const token  =generateToken({
    payload:{
    email,
    _id:user._id,
    role:user.role
},
    signature:process.env.LOGIN_SIGNATURE,
    expiresIn:'3h'
    
})
const updatedUser = await userModel.findOneAndUpdate({email},{token,status:'Online'},{new:true})
if(!updatedUser){
    return next(new Error('failed to login',{cause:400}))
}

res.status(200).json({message:'login done',updatedUser})
}
    // const userid=payload['sub']
   
//=======================sign up=====================================
const userObj = {
    userName: name,
    email,
    password: nanoId(6),
    provider: 'GOOGLE',
    isConfirmed: true,
    phoneNumber: ' ',
    role: 'User',
}
const newUser = await userModel.create(userObj)
const token = generateToken({
    payload: {
      email: newUser.email,
      _id: newUser._id,
      role: newUser.role,
    },
    signature: process.env.SIGN_IN_TOKEN_SECRET,
    expiresIn: '1h',
  })
  newUser.token = token
  await newUser.save()
  newUser.status = 'Online'
return res.status(200).json({message:"verified",payload})
}