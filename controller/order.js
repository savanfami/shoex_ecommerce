const { ObjectId } = require('mongodb');
const cart = require('../model/cartSchema')
const productUpload = require('../model/productSchema')
const users = require('../model/userSchema')
const helpers = require('../controller/helpers')
const order = require('../model/orderSchema');
const product = require('../model/productSchema');




const orderConfirmation = async (req, res) => {
    const cartcount = await helpers.getCartCount(req, res, req.session.email)
    res.render('./user/orderConfirmation', { cartcount })

}

const placeOrder = async (req, res) => {
    try {
        const user = await users.findOne({ email: req.session.email })
        const userId = user._id
        const selectedAddressId = req.body.address

        const paymentMethod = req.body.paymentMethod
        const cartData = await cart.findOne({ userId })

        const products = await helpers.cartProductData(userId)
        const totalAmount = req.session.totalAmount
        const selectedAddress = user.address.find((x) => x._id == selectedAddressId)
        if (!selectedAddress) {
            res.status(400).json({ success: false, message: "selected address not found" })
        }

        const orderDate = new Date();
        const arrivingDate = new Date(orderDate);
        arrivingDate.setDate(orderDate.getDate() + 4);

        const items = []

        for (let i = 0; i < products.length; i++) {
            const product = products[i].product
            const item = {
                price: product.price,
                productId: products[i].item,
                size: products[i].size,
                quantity: products[i].quantity
            }
            items.push(item)
        }
        const newOrder = new order({
            userId,
            items,
            paymentMethod,
            address: {
                name: selectedAddress.name,
                address: selectedAddress.address,
                city: selectedAddress.city,
                state: selectedAddress.state,
                pincode: selectedAddress.pincode,
                phone: selectedAddress.phone
            },
            totalPrice: totalAmount,
            orderDate,
            arrivingDate
        })

        console.log("order saved");

        const saveOrder = await newOrder.save()

        if (saveOrder) {
            await cart.findOneAndDelete({ userId })

            for (const item of products) {
                const productId = item.item
                const size = item.size
                const purchasedQuantity = item.quantity
                const result = await productUpload.updateOne(
                    { _id: productId, 'variant.size': size },
                    { $inc: { 'variant.$.quantity': -purchasedQuantity } }
                );

            }

        }
        console.log("minusdd");
        if (paymentMethod == "COD") {
            console.log("payment is cod");
            res.json({
                codSuccess: true,
                message: "order Success"
            })

        }
    
    } catch (err) {
        console.error(err)
    }
}


const toOrderlisting=async(req,res)=>{
    try{
        const cartcount = await helpers.getCartCount(req, res, req.session.email)
        const userData=await users.findOne({email:req.session.email})
        const userId=userData._id
        const orderDetails = await order.find().populate('items.productId').sort({orderDate:-1})
        res.render('./user/orderlisting',{cartcount,orderDetails})
    }catch(error){
        console.error(error)
    }
}


const orderDetails=async (req,res)=>{
    try{
        const userData=await users.findOne({email:req.session.email})
        const orderId=req.params.id
        const orderData=await order.find({_id:orderId}).populate('items.productId')
        const cartcount = await helpers.getCartCount(req, res, req.session.email)
        res.render('./user/orderDetails',{orderData,userData,cartcount})

    }catch(error){
        console.error(error)
    }
}

module.exports = {
    placeOrder,
    orderConfirmation,
    toOrderlisting,
    orderDetails
}