import { Router } from "express";
const router =  Router()
import * as cc from './coupon.controller.js'
import { asyncHandler } from './../../utils/errorHandeling.js';
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as cv from './coupon.validation.js'
import { isAuth } from "../../middlewares/auth.js";
import { couponApisRoles } from "./coupon.endPoints.js";
// ,validationCoreFunction(cv.createCoupnSchema)
router.post('/add',isAuth(couponApisRoles.CREATE_COUPON),validationCoreFunction(cv.createCoupnSchema),asyncHandler(cc.createCoupon),cc.createCoupon)
router.delete('/delete',isAuth(couponApisRoles.DELETE_COUPON),validationCoreFunction(cv.deleteCoupnSchema),asyncHandler(cc.deleteCoupon),cc.deleteCoupon)
router.patch('/update',isAuth(couponApisRoles.UPDATE_COUPON),validationCoreFunction(cv.updateCoupnSchema),asyncHandler(cc.updateCoupon),cc.updateCoupon)

export default router