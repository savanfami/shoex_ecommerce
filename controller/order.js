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
        const grandTotal=req.session.grandtotal
        const cartData = await cart.findOne({ userId })

        const products = await helpers.cartProductData(userId)
        let totalAmount=null
        if(grandTotal==null){
            totalAmount=req.session.totalAmount
        }else{
            totalAmount=grandTotal
        }
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
                // price: product.price,
                productId: products[i].item,
                size: products[i].size,
                quantity: products[i].quantity
            }
            if ('discountAmount' in product && product.discountAmount !== null) {
                item.price = product.discountAmount;
            } else {
                item.price = product.price; 
            }
        
            items.push(item)
        }
        console.log(totalAmount,"toootal amount");
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

        console.log(newOrder,"order saved");

        const saveOrder = await newOrder.save()

        req.session.discountedAmount = undefined;
        req.session.grandtotal = undefined;
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
        }else if(paymentMethod==='wallet'){
            console.log("payment method is wallet");
            const totalPrice=totalAmount
            user.wallet.balanceAmount-=totalPrice
            user.wallet.transactions.push({
                amount:totalPrice,
                description:'Order Payment',
                transactionType:'debit',
                timestamp:new Date()
            })
            user.save()
            newOrder.paymentStatus='Paid',
            newOrder.paymentMethod='Wallet'
            await newOrder.save()   
            console.log("wallet payment success");
            res.json({walletSuccess:true,message:"Order Success"})
            

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
        if (orderData.status !== 'Order Delivered') {
            orderData.status = 'Cancelled',
            orderData.reason=req.body.cancellationReason
            if(orderData.paymentMethod==='Online'||orderData.paymentMethod==='Wallet'){
                const userData=await users.findOne({email:req.session.email})
               
                userData.wallet.balanceAmount+=orderData.totalPrice
                userData.wallet.transactions.push({
                    amount:orderData.totalPrice,
                    transactionType:'credit',
                    timestamp:new Date(),
                    description:'Order cancellation refund'
                })
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
            { $set: { 'items.$.status': 'order cancelled' } }
        );

  

        if (result.nModified === 0) {
            return res.json({ message: "Order item not found or already canceled" });
        }

        const orderData = await order.findById(orderId);
        const userData=await users.findOne({email:req.session.email})
   
        if(orderData)
        if (!orderData) {
            return res.json({ message: "Order not found" });
        }

        const cancelledItem = orderData.items.find(item => item._id.toString() === itemid);
        const fullamt = cancelledItem.price * cancelledItem.quantity
        const gst=(Math.round(fullamt*18)/100)
        const gstPrice=fullamt+gst
        if (cancelledItem.status === 'order cancelled') {
            if(orderData.paymentStatus==='Paid'||orderData.paymentMethod==='Wallet'){
                userData.wallet.balanceAmount+=gstPrice
                userData.wallet.transactions.push({ 
                    amount:gstPrice,
                    transactionType:'credit',
                    timestamp:new Date(),
                    description:'Order cancellation refund'
                })
                await userData.save()
            }
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


const returnOrder=async(req,res)=>{
    try{

        const { itemId, orderId,returnReason } = req.body;
   
        const itemid=itemId.trim()
        const update = await order.updateOne(
            { _id: orderId, 'items._id': itemid },
            { $set: { 'items.$.status': 'return requested','items.$.Returnreason':returnReason } }
        );
        if(update){
            console.log("updted successfully",update);
            res.json({success:true,message:"return requested successfully"})
        }else{
            res.json({success:false,message:"failed to return order"})
        }
    
    }catch(err){
        console.error(err)
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
    verifyPayment,
    returnOrder
}