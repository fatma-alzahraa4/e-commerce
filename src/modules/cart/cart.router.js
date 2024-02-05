import { Router } from "express";
import { asyncHandler } from './../../utils/errorHandeling.js';
import * as cc from './cart.controller.js'
import { isAuth } from "../../middlewares/auth.js";
import { cartApisRoles } from "./cart.endPoints.js";
import * as cv from './cart.validation.js'
import { validationCoreFunction } from "../../middlewares/validation.js";
const router  =Router();
router.post('/add',isAuth(cartApisRoles.ADD_TO_CART),validationCoreFunction(cv.addToCartSchema),asyncHandler(cc.addTocart),cc.addTocart)
router.delete('/delete',isAuth(cartApisRoles.DELETE_FROM_CART),validationCoreFunction(cv.deleteFromCartSchema),asyncHandler(cc.deletFromCart),cc.deletFromCart)

export default router