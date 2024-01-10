const Razorpay=require('razorpay')
require('dotenv').config()


 const createOrder=(order)=>{
    var instance = new Razorpay({ key_id:process.env.KEY_ID,key_secret:process.env.KEY_SECRET })
    return new Promise((resolve,reject)=>{

        var orderss={
            amount:order.amount,
            currency:order.currency,
            receipt:order.receipt
        }
        instance.orders.create(orderss,function(err,order){
            resolve(order)
        })

    })    
   

}

module.exports={
    createOrder
}