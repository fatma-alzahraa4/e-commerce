import { Router } from "express";
const router = Router()
import * as uc from './auth.controller.js'
import { asyncHandler } from './../../utils/errorHandeling.js';
router.post('/signUp',asyncHandler(uc.signUp),uc.signUp)
router.get('/confirm/:token',asyncHandler(uc.confirmEmail),uc.confirmEmail)
router.post('/signIn',asyncHandler(uc.signIn),uc.signIn)
router.get('/forget',asyncHandler(uc.forgetPassword),uc.forgetPassword)
router.post('/reset',asyncHandler(uc.resetPassword),uc.resetPassword)
router.post('/loginWithGmail',asyncHandler(uc.logInWithGmail),uc.logInWithGmail)

export default router;