import { Router } from "express";
const router = Router()
import * as cc from './category.controller.js'
import { multerCloudFunction } from './../../services/multerCloudinary.js';
import { allowedExtensions } from "../../utils/allowedEtensions.js";
import { asyncHandler } from './../../utils/errorHandeling.js';
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as cvalidators from './category.validation.js'
import subCategoryRouter from '../subCategory/subCategory.router.js'
import { isAuth } from './../../middlewares/auth.js';
import { categoryApisRoles } from "./categor.endPoints.js";
router.use('/:categoryId',subCategoryRouter)
router.post('/createCtegory',isAuth(categoryApisRoles.CREATE_CATEGORY),multerCloudFunction(allowedExtensions.Image).single('categoryImage'),validationCoreFunction(cvalidators.createCategorySchema),asyncHandler(cc.createCategory),cc.createCategory)
router.put('/updateCtegory',isAuth(categoryApisRoles.UPDATE_CATEGORY),multerCloudFunction(allowedExtensions.Image).single('categoryImage'),validationCoreFunction(cvalidators.updateCategorySchema),asyncHandler(cc.updateCategory),cc.updateCategory)
router.get('/getCategories',isAuth(categoryApisRoles.GET_ALL_CATEGORIES),asyncHandler(cc.getAllCategories),cc.getAllCategories)
router.delete('/delete/:categoryId',isAuth(categoryApisRoles.DELETE_CATEGORY),validationCoreFunction(cvalidators.deleteCategorySchema),asyncHandler(cc.deleteCategory),cc.deleteCategory)


export default router;