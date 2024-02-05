import { Router } from 'express'
const router = Router()
import * as bc from './brand.controller.js'
import {asyncHandler } from '../../utils/errorHandeling.js'
import { multerCloudFunction } from '../../services/multerCloudinary.js'
import { allowedExtensions } from '../../utils/allowedEtensions.js'
import { isAuth } from './../../middlewares/auth.js';
import { brandApisRoles } from './brand.endPoints.js'
import { validationCoreFunction } from '../../middlewares/validation.js'
import * as bv from './brand.validation.js'

// TODO: api validation
router.post(
  '/add',isAuth(brandApisRoles.ADD_BRAND),
  multerCloudFunction(allowedExtensions.Image).single('logo'),
  validationCoreFunction(bv.addBrandSchema),asyncHandler(bc.addBrand),bc.addBrand
)

router.delete(
  '/delete',isAuth(brandApisRoles.ADD_BRAND),
  validationCoreFunction(bv.deleteBrandSchema),asyncHandler(bc.deleteBrand),bc.deleteBrand
)
router.get(
  '/get',isAuth(brandApisRoles.ADD_BRAND),
  asyncHandler(bc.getAllBrands),bc.getAllBrands
)
router.patch(
  '/update',isAuth(brandApisRoles.ADD_BRAND),
  multerCloudFunction(allowedExtensions.Image).single('logo'),
  validationCoreFunction(bv.updateBrandSchema),asyncHandler(bc.updateBrand),bc.updateBrand
)
export default router
