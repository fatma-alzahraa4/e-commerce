import { cartModel } from '../../../DB/models/cart.model.js';
import { productModel } from './../../../DB/models/product.model.js';
export const addTocart=async (req,res,next)=>{
    const userId  =req.authUser._id;
    const{productId,quantity}  =req.body
    const productCheck  =await productModel.findOne({
        _id:productId,
        stock:{$gte:quantity}
    })
    if(!productCheck){
        return next(new Error('inavlid product please check the quantity',{cause:400}))
    }
    const userCart  =await cartModel.findOne({userId}).lean()
    if(userCart){
        let productExists  =false
        for (const product of userCart.products) {
            if(product.productId == productId){
                productExists  =true
                product.quantity = quantity
            }
        }
        if(!productExists){
            userCart.products.push({productId,quantity})
        }
        //subTotal
        let subTotal = 0
        for (const product of userCart.products) {
            const productExists  =await productModel.findById(product.productId)
            subTotal += (productExists?.afterPrice*product.quantity)||0
        }
        const DBcart = await cartModel.findOneAndUpdate({userId},{
            products:userCart.products,
            subTotal
        },{new:true})
        return res.status(200).json({message:"Done",DBcart})
    }
    const cartObj = {
        userId,
        products:[{productId,quantity}],
        subTotal:productCheck.afterPrice*quantity
    }
    const newCart = await cartModel.create(cartObj)
    res.status(201).json({message:'Done',newCart})
}

export const deletFromCart = async(req,res,next)=>{
    const userId = req.authUser._id
    const{productId} = req.query
    const product = await productModel.findById(productId)
    if(!product){
        return next(new Error('inavlid product id ',{cause:400}))
    }
    const userCart = await cartModel.findOne({
        userId,
        'products.productId':productId,
    })
    if(!userCart){
        return next(new Error('no products in cart',{cause:400}))
    }
    const newCart = userCart.products.filter((product) =>product.productId!=productId)
    const cartAfterDelete  =await cartModel.findOneAndUpdate({userId,'products.productId':productId},{products:newCart},{new:true})
    res.json({message:"Done",cartAfterDelete})

}
