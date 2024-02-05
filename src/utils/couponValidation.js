import { couponModel } from './../../DB/models/coupon.model.js';
import moment from 'moment';
export const isCouponValid  =async ({couponCode,userId,next})=>{
    const coupon = await couponModel.findOne({couponCode})
    if(!coupon){
        return {
            msg:"invalid coupon code"
        }
    }
    //expiration
    if(coupon.status == 'expired'||moment(new Date(coupon.toDate)).isBefore(moment())){
        return {
            msg:"coupon is expired"
        }
    }
    if(coupon.status == 'valid' && moment().isBefore(moment(new Date(coupon.fromDate)))){
        return {
            msg:"coupon didn't start yet"
        }
    }
    //user
    let assignedUser = []
    let exceedMaxUsage = false
    for (const user of coupon.couponAssginedToUsers) {
    assignedUser.push(user.userId.toString())
    if(userId.toString() == user.userId.toString())
        if(user.maxUsage<=user.usageCount){
            exceedMaxUsage = true
        } 
    }
    if(!assignedUser.includes(userId.toString())){
        return {
            notAssigned:true,
            msg:"this user is not assigned to this coupon"
        }
    }
    if(exceedMaxUsage){
        return{
            msg:"exceed the max usage for this coupon"
        }
    }
    return true

}