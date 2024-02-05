import { Router } from "express";
const router = Router()
import * as oc from './order.controller.js'
import { isAuth } from './../../middlewares/auth.js';
import { asyncHandler } from './../../utils/errorHandeling.js';
import { orderApisRoles } from "./order.endPoints.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as oValidators from './order.validation.js'
router.post('/create',isAuth(orderApisRoles.CREATE_ORDER),validationCoreFunction(oValidators.createOrderSchema),asyncHandler(oc.createOrder),oc.createOrder)
router.post('/cartToOrder',isAuth(orderApisRoles.CART_TO_ORDER),asyncHandler(oc.cartToOrder),oc.cartToOrder)
router.get('/successOrder',asyncHandler(oc.successPayment),oc.successPayment)
router.get('/cancelOrder',asyncHandler(oc.cancelPayment),oc.cancelPayment)

export default router