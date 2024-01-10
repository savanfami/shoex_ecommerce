const { ObjectId } = require('mongodb');
const cart = require('../model/cartSchema')
const productUpload = require('../model/productSchema')
const users = require('../model/userSchema')
const helpers = require('../controller/helpers')
const order = require('../model/orderSchema');
const orders=require('../model/orderSchema')
const product = require('../model/productSchema');
const Razorpay=require('../service/Razorpay')
const path = require('path')
const fs = require('fs')
const crypto=require('crypto')
const { generateInvoice } = require('../service/easyinvoice');
const { default: mongoose } = require('mongoose');
require('dotenv').config()



const orderConfirmation = async (req, res) => {
    const cartcount = await helpers.getCartCount(req, res, req.session.email)
    res.render('./user/orderConfirmation', { cartcount })

}

const placeOrder = async (req, res,next) => {
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
            paymentStatus:"pending",
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
        // console.log("minusdd");
        if (paymentMethod == "COD") {
            console.log("payment is cod");
            res.json({
                codSuccess: true,
                message: "order Success"
            })

        }else if(paymentMethod=="Online"){
            console.log("payment is online");
            const order = {
                amount: totalAmount * 100, 
                currency: 'INR', 
                receipt: saveOrder._id,
                payment_capture: 1, 
            }
            await Razorpay.createOrder(order)
            .then((createdOrder)=>{
                res.json({online:true,createdOrder})
            })
            .catch((err)=>{
                console.log(err,"error happend in razorpay");
            })
        }

    } catch (err) {
        console.error(err)
        next(err)
    }
}


const verifyPayment=async(req,res,next)=>{

    try{
        const{order,payment}=req.body
        let hmac=crypto.createHmac('sha256',process.env.KEY_SECRET)
        hmac.update(req.body.payment.razorpay_order_id+"|"+req.body.payment.razorpay_payment_id)
        hmac=hmac.digest('hex')
        if(hmac===req.body.payment.razorpay_signature){
           const orderId=new mongoose.Types.ObjectId(order['createdOrder']['receipt'])
        
        const updateOrder=await orders.findByIdAndUpdate(orderId,{
            paymentMethod:"Online",
            paymentStatus:"Paid"

        })
        res.json({success:true})
    }else{

         res.json({ success: false, message: "Payment verification failed" });    }
    }catch(err){
        console.log(err);
        next(err)
    }
}

const toOrderlisting = async (req, res) => {
    try {
        const page=parseInt(req.query.page)||1
        const count=await product.find().count()
        const pagesize=5 
        const totaldata=Math.ceil(count/pagesize)
        const skip=(page-1)*pagesize
        const cartcount = await helpers.getCartCount(req, res, req.session.email)
        const userData = await users.findOne({ email: req.session.email })
        const userId = userData._id
        const orderDetails = await order.find({ userId }).populate('items.productId').sort({ orderDate: -1 }).skip(skip).limit(pagesize)
        res.render('./user/orderlisting', { cartcount, orderDetails,page,count:totaldata })
    } catch (error) {
        console.error(error)
    }
}


const orderDetails = async (req, res) => {
    try {
        const userData = await users.findOne({ email: req.session.email })
        const orderId = req.params.id
        const orderData = await order.find({ _id: orderId }).populate('items.productId')
        const cartcount = await helpers.getCartCount(req, res, req.session.email)

        res.render('./user/orderDetails', { orderData, userData, cartcount })

    } catch (error) {
        console.error(error)
    }
}

const usercancelOrder = async (req, res,next) => {
    try {
        const id = req.params.orderId
        const orderData = await order.findById(id)
        console.log(orderData);
        if (orderData.status !== 'Order Delivered') {
            orderData.status = 'Cancelled'
            if(orderData.paymentMethod==='Online'){
                const userData=await users.findOne({email:req.session.email})
                console.log(userData,"4444444444444444444");
                userData.wallet.balanceAmount+=orderData.totalPrice
                userData.wallet.transactions.push({
                    amount:orderData.totalPrice,
                    transactionType:'credit',
                    timestamp:new Date(),
                    description:'Order cancellation refund'
                })
                console.log("amount creditt to wallelt");
                await userData.save()
            }
            await orderData.save()
            for (const item of orderData.items) {
                if (item.productId) {
                    const productData = await product.findById(item.productId)
                    if (productData) {
                        const variant = productData.variant.find((v) => v.size === item.size)
                        if (variant) {
                            variant.quantity += item.quantity
                            await productData.save()
                        }
                    }
                }
            }
            res.json({ success: true, message: "order has been cancelled" })

        } else {
            res.json({ success: false, message: "Cannot cancell the Delivered Order" })
        }
    } catch (err) {
       next(err)
    }
}


const cancelOneOrder = async (req, res) => {
    try {
        const { orderId, itemId } = req.body;
        const itemid = itemId.trim();



        const result = await order.updateOne(
            { _id: orderId, 'items._id': itemid },
            { $set: { 'items.$.status': 'rejected' } }
        );


        if (result.nModified === 0) {
            return res.json({ message: "Order item not found or already canceled" });
        }

        const orderData = await order.findById(orderId);
        if (!orderData) {
            return res.json({ message: "Order not found" });
        }

        const cancelledItem = orderData.items.find(item => item._id.toString() === itemid);
        if (cancelledItem.status === 'rejected') {
            const adjustamount = cancelledItem.price * cancelledItem.quantity
            const taxtotalAmount = (Math.round(adjustamount * 18 / 100))
           
            const updatedTotalPrice = (orderData.totalPrice - (adjustamount + taxtotalAmount))
            await order.findByIdAndUpdate(
                orderId,
                { $set: { totalPrice: updatedTotalPrice } },
                { new: true }
            );
        }

        const size = orderData.items.find(item => item._id.toString() === itemid).size;
        const quantity = orderData.items.find(item => item._id.toString() === itemid).quantity;
        const productId = orderData.items.find(item => item._id.toString() === itemid).productId;

        await product.findOneAndUpdate(
            { _id: productId, 'variant.size': size },
            { $inc: { 'variant.$.quantity': quantity } }
        );

        res.json({ success: true, message: "One item canceled successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

//generate Invoice

const generateInvoices = async (req, res) => {
    try {
        const { orderId } = req.body
        const orderData = await helpers.orderDataforInvoice(orderId)
        if (orderData) {
            const invoice = await generateInvoice(orderData)
            res.json({ success: true, message: 'Invoice generated successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to generate the invoice' });
        }
    } catch (err) {
        console.error(err)
    }
}




const downloadInvoice = async (req, res) => {
    try {
        const id = req.params.orderId
        const filePath = path.join(__dirname, '../public/pdf', `${id}.pdf`);
        res.download(filePath, `shoexinvoice.pdf`)
        await fs.promises.unlink(filePath)
    } catch (error) {
        console.error('Error in downloading the invoice:', error);
        res.status(500).json({ success: false, message: 'Error in downloading the invoice' });
    }
}





module.exports = {
    placeOrder,
    orderConfirmation,
    toOrderlisting,
    orderDetails,
    usercancelOrder,
    cancelOneOrder,
    downloadInvoice,
    generateInvoices,
    verifyPayment
}