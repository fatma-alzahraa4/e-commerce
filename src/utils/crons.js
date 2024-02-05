import { scheduleJob } from "node-schedule"
import { couponModel } from './../../DB/models/coupon.model.js';
import moment from "moment";

export const changeCouponStatusCron = ()=>{
    scheduleJob('* * /23 * * *',async function ()
    {
        const validCoupons = await couponModel.find({status:'valid'})
        for (const coupon of validCoupons) {
            if(moment(coupon.toDate).isBefore(moment())){
                coupon.status = 'expired'
            }
            await coupon.save()
        }
        console.log('cron is running');
    })
}