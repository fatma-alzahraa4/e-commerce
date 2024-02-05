import { couponModel } from "../../../DB/models/coupon.model.js"
import { userModel } from '../../../DB/models/user.model.js';

export const createCoupon = async(req,res,next)=>{
    const {_id} = req.authUser
    const {couponCode,couponAmount,isPercentage,isFixedAmount,fromDate,toDate,couponAssginedToUsers} = req.body
    // check coupon if it's duplicate
    const isCouponDuplicated = await couponModel.findOne({couponCode})
    if(isCouponDuplicated){
        return next(new Error('duplicate coupon',{cause:400}))
    }
    if(isFixedAmount===isPercentage){
        return next(new Error('select if the coupon is percentage or fixed amount',{cause:400}))
    }
    let userIdArr =[]
    for (const user of couponAssginedToUsers) {
        userIdArr.push(user.userId)
    }
    const userCheck = await userModel.find({_id:{$in:userIdArr}})
    if(userIdArr.length!==userCheck.length){
        return next(new Error('invalid user ids',{cause:400}))
    }
    const couponObj = {
        couponCode,
        couponAmount,
        isPercentage,
        isFixedAmount,
        fromDate,
        toDate,
        couponAssginedToUsers,
        createdBy:_id
    }
    const coupon = await couponModel.create(couponObj)
    if(!coupon){
        return next(new Error('failed',{cause:400}))
    }
    res.status(201).json({message:'Done',coupon})
}

export const deleteCoupon = async(req,res,next)=>{
    const{_id} = req.query
    const userId = req.authUser._id
    const coupon  = await couponModel.findOneAndDelete({_id,createdBy:userId})
    if(!coupon){
        return next(new Error('fail to delete',{cause:400}))
    }
    res.status(200).json({message:'Done'})

}

export const updateCoupon = async (req,res,next)=>{
    const userId = req.authUser._id
    const {_id} = req.query
    const {fromDate,toDate} = req.body
    const coupon = await couponModel.findOne({_id,createdBy:userId})
    if(!coupon){
        return next(new Error('invalid coupon id',{cause:400}))
    }
    if(fromDate){
        coupon.fromDate = fromDate
    }
    if(toDate){
        coupon.toDate = toDate
    }
    coupon.updatedBy=userId
    await coupon.save()
    return res.status(200).json({message:"Done",coupon})
  }