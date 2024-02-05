import { Router } from "express";
const router = Router()
import * as pc from './product.controller.js'
import { multerCloudFunction } from "../../services/multerCloudinary.js";
import { allowedExtensions } from "../../utils/allowedEtensions.js";
import { asyncHandler } from "../../utils/errorHandeling.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as pvalidators from './product.validation.js'
import { isAuth } from './../../middlewares/auth.js';
import { productApisRoles } from "./product.endPoints.js";
router.post('/add',isAuth(productApisRoles.ADD_PRODUCT),multerCloudFunction(allowedExtensions.Image).array('images',3),validationCoreFunction(pvalidators.addProductSchema),asyncHandler(pc.addProduct),pc.addProduct)
router.put('/update',isAuth(productApisRoles.UPDATE_PRODUCT),multerCloudFunction(allowedExtensions.Image).array('images',3),validationCoreFunction(pvalidators.updateProductSchema),asyncHandler(pc.updateProduct),pc.updateProduct)
router.delete('/delete',isAuth(productApisRoles.DELETE_PRODUCT),validationCoreFunction(pvalidators.deleteProductSchema),asyncHandler(pc.deleteProduct),pc.deleteProduct)
router.get('/get',isAuth(productApisRoles.GET_ALL_PRODUCTS),validationCoreFunction(pvalidators.getProductsSchema),asyncHandler(pc.getProducts),pc.getProducts)
router.get('/search',isAuth(productApisRoles.GET_PRODUCT_BY_TITLE),validationCoreFunction(pvalidators.getProductByTitleSchema),asyncHandler(pc.getProductsByTitle),pc.getProductsByTitle)
router.get('/list',isAuth(productApisRoles.LIST_PRODUCTS),asyncHandler(pc.listProducts),pc.listProducts)

export default router