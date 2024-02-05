import { dbConnection } from "../../DB/connection.js"
import { globalResponse } from "./errorHandeling.js"
import * as routers from '../modules/index.routes.js'
import { changeCouponStatusCron } from "./crons.js"
import cors from 'cors'
export const initiateApp = (app,express)=>{
    const port = process.env.PORT||3000
    app.use(express.json())
    dbConnection()
    app.use(cors())
    app.use('/category',routers.categoryRoutes)
    app.use('/subCategory',routers.subCategoryRoutes)
    app.use('/brand',routers.brandRoutes)
    app.use('/product',routers.productRoutes)
    app.use('/coupon',routers.couponRoutes)
    app.use('/auth',routers.authRoutes)
    app.use('/cart',routers.cartRoutes)
    app.use('/order',routers.orderRoutes)

    changeCouponStatusCron()
app.all('*',(req,res,next)=>{
    res.status(404).json({message:'404 not found URL'})
})
app.use(globalResponse)
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}
