import { Types } from "mongoose"
import joi from 'joi'


const validationIdSchema = (value,helper)=>
{
  return Types.ObjectId.isValid(value)?true:helper.message('invalid id')
}

export const generalFields = {
  email: joi
    .string()
    .email({ tlds: { allow: ['com', 'net', 'org'] } })
    .required(),
  password: joi
    .string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .messages({
      'string.pattern.base': 'Password regex fail',
    })
    .required(),
    _id : joi.string().custom(validationIdSchema).required(),
    phoneNumbers: joi
    .string()
    .regex(/^01[0125][0-9]{8}$/).required()
}




const reqMethods = ['body', 'query', 'params', 'headers', 'file', 'files']


export const validationCoreFunction = (schema) => {
  return (req, res, next) => {
    // req
    const validationErrorArr = []
    for (const key of reqMethods) {
      if (schema[key]) {
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false,  // 3ashan validate bt5rog mn first error
        }) 
        // error
        if (validationResult.error) {
          validationErrorArr.push(validationResult.error.details)
        }
      }
    }

    if (validationErrorArr.length) {
      // return res
      //   .status(400)
      //   .json({ message: 'Validation Error', Errors: validationErrorArr })

      // if i want to return error in new Error
      req.validationErrorArr = validationErrorArr;
      return next(new Error('',{cause:400}))

    }
    next()
  }
}