import jwt from 'jsonwebtoken'
//====================================generation===================================
export const generateToken=({
    payload = {},
    signature=process.env.DEFAULT_SIGNATURE,
    expiresIn='1d'
}={})=>{
    //check if payload is empty object
    if(!Object.keys(payload).length){
        return false
    }
    const token = jwt.sign(payload,signature,{expiresIn})
    return token;
}

//====================================verify=======================================
export const verifyToken = ({
    token = '',
    signature=process.env.DEFAULT_SIGNATURE
}={})=>{
    if(!token){
        return false
    }
    const data = jwt.verify(token,signature)
    return data
}
