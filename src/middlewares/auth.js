import { userModel } from '../../DB/models/user.model.js'
import {verifyToken } from '../utils/tokenFunction.js'
export const isAuth= (Roles) => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers
      if (!authorization) {
        return next(new Error('Please login first', { cause: 400 }))
      }

      if (!authorization.startsWith('ecomm__')) {
        return next(new Error('invalid token prefix', { cause: 400 }))
      }

      const splitedToken = authorization.split(' ')[1]

        const decodedData = verifyToken({
          token: splitedToken,
          signature: process.env.LOGIN_SIGNATURE,
        })
        const findUser = await userModel.findById(
          decodedData._id,
          'email userName role',
        )
        if (!findUser) {
          return next(new Error('Please SignUp', { cause: 400 }))
        }
        if(!Roles.includes(findUser.role)){
          return next(new Error('UnAuthorized to access this api', { cause: 400 }))
        }
        req.authUser = findUser
        next()
      
    }
    catch (error) {
        console.log(error)
        next(new Error('catch error in auth', { cause: 500 }))
  }
}
}
