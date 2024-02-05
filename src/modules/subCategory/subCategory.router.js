import { Router } from "express";
const router = Router({mergeParams:true})
import * as sc from './subCategory.controller.js'
import { multerCloudFunction } from "../../services/multerCloudinary.js";
import { allowedExtensions } from "../../utils/allowedEtensions.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as scvalidators from './subCategory.validation.js'
import { asyncHandler } from "../../utils/errorHandeling.js";
import { isAuth } from './../../middlewares/auth.js';
import { subCategoryApisRoles } from "./subCategory.endPoints.js";
router.post('/createSubCategory/:categoryId',isAuth(subCategoryApisRoles.CREATE_SUBCATEGORY),multerCloudFunction(allowedExtensions.Image).single('subCategoryImage'),validationCoreFunction(scvalidators.createSubCategorySchema),asyncHandler(sc.createSubCategory),sc.createSubCategory)
router.patch('/updateSubCategory',isAuth(subCategoryApisRoles.UPDATE_SUBCATEGORY),multerCloudFunction(allowedExtensions.Image).single('subCategoryImage'),validationCoreFunction(scvalidators.updateSubCategorySchema),asyncHandler(sc.updateSubCategory),sc.updateSubCategory)
router.delete('/deleteSubCategory/:subCategoryId',isAuth(subCategoryApisRoles.DELETE_SUBCATEGORY),multerCloudFunction(allowedExtensions.Image).single('subCategoryImage'),validationCoreFunction(scvalidators.deleteSubCategorySchema),asyncHandler(sc.deleteSubCategory),sc.deleteSubCategory)
router.get('/getSubCategories',isAuth(subCategoryApisRoles.GET_ALL_SUBCATEGORIES),asyncHandler(sc.getAllSubCategories),sc.getAllSubCategories)

export default router;