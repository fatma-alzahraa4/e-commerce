import { couponModel } from "../../../DB/models/coupon.model.js"
import { orderModel } from "../../../DB/models/order.model.js";
import { isCouponValid } from "../../utils/couponValidation.js"
import { productModel } from './../../../DB/models/product.model.js';
import { cartModel } from './../../../DB/models/cart.model.js';
import { nanoid } from "nanoid";
import createInvoice from "../../utils/pdfkit.js";
import { sendEmailService } from "../../services/sendEmail.js";
import { qrCodeFunction } from "../../utils/qrCode.js";
import { paymentFunction } from './../../utils/stripe.js';
import { generateToken, verifyToken } from './../../utils/tokenFunction.js';
import Stripe from "stripe";

export const createOrder = async(req,res,next)=>{
    const userId = req.authUser._id
    const{
        productId,
    quantity,
    address,
    phoneNumbers,
    paymentMethod,
    couponCode,
    }=req.body


    //check coupon valid
    if(couponCode){
        const coupon = await couponModel.findOne({couponCode}).select('couponAmount isPercentage isFixedAmount couponAssginedToUsers')
        const isValidCouponResult = await isCouponValid({couponCode,userId,next})
        if(isValidCouponResult!== true){
            return next(new Error(isValidCouponResult.msg,{cause:400}))
        }
        req.coupon = coupon
    }


    //product check
    let products = []
    const isProductValid = await productModel.findOne({
        _id:productId,
        stock:{$gte:quantity}
    })
    if(!isProductValid){
        return next(new Error('invalid product check the quantity',{cause:400}))
    }
    const productObj = {
        productId,
        quantity,
        title:isProductValid.title,
        price:isProductValid.afterPrice,
        finalPrice:isProductValid.afterPrice*quantity
    }
    products.push(productObj)


    // subTotal
    const subTotal = productObj.finalPrice


    // paidAmount
    let paidAmount = 0
    if(req.coupon?.isPercentage){
        paidAmount = subTotal*(1-((req.coupon.couponAmount||0)/100))
    }
    else if(req.coupon?.isFixedAmount){
        paidAmount = subTotal-req.coupon.couponAmount||0
    }
    else{
        paidAmount = subTotal
    }

    //paid method and order status
    let orderStatus;
    paymentMethod=='cash'?(orderStatus='placed'):(orderStatus='pending')
    
    //============================================add to db===========================================================
    const orderObj = {
        userId,
        products,
        subTotal,
        paidAmount,
        address,
        phoneNumbers,
        orderStatus,
        paymentMethod,
        couponId:req.coupon?._id

    }
    const order = await orderModel.create(orderObj);
    let orderSession
    if(order){
        //==========================================stripe payment==========================================================
        if(order.paymentMethod=='card'){
            if(req.coupon){
                const stripe =  new Stripe(process.env.STRIPE_SECRET_KEY)
                let coupon
                if(req.coupon.isPercentage){
                    coupon = await stripe.coupons.create({
                        percent_off:req.coupon.couponAmount
                    })
                }
                if(req.coupon.isFixedAmount){
                    coupon = await stripe.coupons.create({
                        amount_off:req.coupon.couponAmount*100,
                        currency:'EGP'
                    })
                }
                req.couponId = coupon.id
            }
            const token = generateToken({payload:{order:{orderId:order._id}},signature:process.env.ORDER_TOKEN,expiresIn:'1h'})
            orderSession = await paymentFunction({
                payment_method_types:['card'],
                mode:'payment',
                customer_email:req.authUser.email,
                metadata:{orderId:order._id.toString()},
                success_url:`${req.protocol}://${req.headers.host}/order/successOrder?token=${token}`,
                cancel_url:`${req.protocol}://${req.headers.host}/order/cancelOrder?token=${token}`,
                line_items:order.products.map((ele)=>{
                    return{
                        price_data:{
                            currency:'EGP',
                            product_data:{
                                name:ele.title
                            },
                            unit_amount:ele.price*100
                        },
                        quantity:ele.quantity
                    }
                }),
                discounts:req.couponId?[{coupon:req.couponId}]:[]
            })
        }


        // increase usageCount for coupon usage
        if(req.coupon){
            for (const user of req.coupon.couponAssginedToUsers) {
                if(user.userId.toString() == userId.toString() ){
                    user.usageCount +=1
                }
            }
            await req.coupon.save()
        }
        
        // decrease product's stock by order's product quantity
        await productModel.findByIdAndUpdate(productId,
            {
            $inc:{stock:-parseInt(quantity)}
        })


        //====================================order qr code=================================================
        const orderQr =await qrCodeFunction({data:{orderId:order._id,products:order.products,}})


        //====================================create Invoice=================================================
        const orderCode = `${req.authUser.userName}_${nanoid(3)}`
        const orderInvoice = {
            orderCode,
            date:order.createdAt,
            items:order.products,
            subTotal:order.subTotal,
            paidAmount:order.paidAmount,
            shipping:{
                name:req.authUser.userName,
                address:order.address,
                city:'Cairo',
                state:'Cairo',
                country:'Egypt'
            }
        }
        await createInvoice(orderInvoice,`${orderCode}.pdf`)
        // await sendEmailService(
        //     {
        //         to:req.authUser.email,
        //         subject:'order Confirmation',
        //         message:'<h1>find your invoice pdf below</h1>',
        //         attachments:[
        //             {
        //                 path:`Files/${orderCode}.pdf`
        //             }
        //         ]
        //     }
        // )
        return res.status(201).json({message:'Done',order,sessionUrl:orderSession.url})
    }
    return next(new Error('failed',{cause:400}))
}

export const cartToOrder = async (req,res,next)=>{
    const userId = req.authUser._id
    const { cartId } = req.query
    const { address, phoneNumbers, paymentMethod, couponCode } = req.body
  
    const cart = await cartModel.findById(cartId)
    if (!cart || !cart.products.length) {
      return next(new Error('please fill your cart first', { cause: 400 }))
    }
  
    // ======================== coupon check ================
    if (couponCode) {
      const coupon = await couponModel
        .findOne({ couponCode })
        .select('isPercentage isFixedAmount couponAmount couponAssginedToUsers')
      const isCouponValidResult = await isCouponValid({
        couponCode,
        userId,
        next,
      })
      if (isCouponValidResult !== true) {
        return isCouponValidResult
      }
      req.coupon = coupon
    }
  
    let subTotal = cart.subTotal
    //====================== paid Amount =================
    let paidAmount = 0
    if (req.coupon?.isPercentage) {
      paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100)
    } else if (req.coupon?.isFixedAmount) {
      paidAmount = subTotal - req.coupon.couponAmount
    } else {
      paidAmount = subTotal
    }
  
    //======================= paymentMethod  + orderStatus ==================
    let orderStatus
    paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')
    let orderProduct = []
    for (const product of cart.products) {
      const productExist = await productModel.findById(product.productId)
      orderProduct.push({
        productId: product.productId,
        quantity: product.quantity,
        title: productExist.title,
        price: productExist.priceAfterDiscount,
        finalPrice: productExist.priceAfterDiscount * product.quantity,
      })
    }
  
    const orderObject = {
      userId,
      products: orderProduct,
      address,
      phoneNumbers,
      orderStatus,
      paymentMethod,
      subTotal,
      paidAmount,
      couponId: req.coupon?._id,
    }
    const orderDB = await orderModel.create(orderObject)
    if (orderDB) {
      // increase usageCount for coupon usage
      if (req.coupon) {
        for (const user of req.coupon.couponAssginedToUsers) {
          if (user.userId.toString() == userId.toString()) {
            user.usageCount += 1
          }
        }
        await req.coupon.save()
      }
  
      // decrease product's stock by order's product quantity
      for (const product of cart.products) {
        await productModel.findOneAndUpdate(
          { _id: product.productId },
          {
            $inc: { stock: -parseInt(product.quantity) },
          },
        )
      }
  
      //TODO: remove product from userCart if exist
      cart.products = []
      await cart.save()
  
      return res.status(201).json({ message: 'Done', orderDB, cart })
    }
    return next(new Error('fail to create your order', { cause: 400 }))
    

}
//=======================================success payment=================================================
export const successPayment = async (req,res,next)=>{
    const{token} = req.query
    const decodedData = verifyToken({token,signature:process.env.ORDER_TOKEN})
    console.log(decodedData);
    const order = await orderModel.findOne({
        _id:decodedData.order.orderId,
        orderStatus:"pending"
    })
    if(!order){
        return next(new Error("invalid order id-_-",{cause:400}))
    }
    order.orderStatus = 'confirmed'
    await order.save()
    return res.status(200).json({message:"your order is confirmed",order})
}

//=======================================cancel payment=================================================
export const cancelPayment = async (req,res,next)=>{
    const{token} = req.query
    const decodedData = verifyToken({token,signature:process.env.ORDER_TOKEN})
    const order = await orderModel.findOne({
        _id:decodedData.order.orderId,
    })
    if(!order){
        return next(new Error("invalid order id-_-",{cause:400}))
    }
    //======================================1-order Status = canceled======================================
    order.orderStatus = 'canceled'
    await order.save()
    //=====================================2-delete order==================================================
    // await orderModel.findByIdAndDelete(decodedData.order.orderId)

    //======================================undo product stock decrement & coupon usage increment
    for (const product of order.products) {
        await productModel.findByIdAndUpdate(product.productId,{
            $inc:{stock:parseInt(product.quantity)}
        })
        
    }
    if(order.couponId){
        const coupon = await couponModel.findById(order.couponId)
        if(!coupon){
            return next(new Error('this coupon is inavalid',{cause:400}))
        }
        coupon.couponAssginedToUsers.map((ele)=>{
            if(ele.userId.toString()==order.userId.toString()){
                ele.usageCount-=1
            }
        })
        await coupon.save()
    }
    return res.status(200).json({message:"your order is canceled",order})
}

