const { ObjectId } = require('mongodb')
const cart=require('../model/cartSchema')
const user=require('../model/userSchema')
const { count } = require('console')
const order = require('../model/orderSchema');


const getCartCount=async(req,res,userId)=>{
    try{
       
         let count=0
        const userData=await user.findOne({email:userId})
        const cartData=await cart.findOne({userId:new ObjectId(userData._id)})
        if(cartData){
            count=cartData.products.length
            return count
        }
       
    }catch(err){
        console.error(err)
    }
}   

const totalAmount=async(user)=>{

    const totalAmount =await cart.aggregate([
        {
            $match:{userId:user}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{
                item:'$products.productId',
                quantity:'$products.quantity'
            }

        },
        {
            $lookup:{
                from:'products',
                localField:'item',
                foreignField:'_id',
                as:'cartItems'
            }
        },
        {
            $project:{
                item:1,
                quantity:1,
                product:{$arrayElemAt:['$cartItems',0]}
            }
        },
        {
            $group:{
                _id:null,
                total:{$sum:{$multiply:['$quantity','$product.price']}}
            }
        }
    ])
    return totalAmount

}

const cartProductData = async (user)=>{
 const cartData=await cart.aggregate([
    {
        $match: { userId: new ObjectId(user) }
    }, {
        $unwind: '$products'
    },
    {
        $project: {
            item: '$products.productId',
            quantity: '$products.quantity',
            size: '$products.size'
        }
    },
    {
        $lookup:
        {
            from: 'products',
            localField: 'item',
            foreignField: '_id',
            as: 'cartItems'
        }
    },
    {
        $project: {
            item: 1,
            quantity: 1,
            size: 1,
            product: { $arrayElemAt: ['$cartItems', 0] }
        }
    }
    
])
return cartData
}


const priceofEachitem=async(user)=>{

    const EachAmount =await cart.aggregate([
        {
            $match:{userId:user}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{
                item:'$products.productId',
                quantity:'$products.quantity',
                size:'$products.size'
            }

        },
        {
            $lookup:{
                from:'products',
                localField:'item',
                foreignField:'_id',
                as:'cartItems'
            }
        },
        {
            $project:{
                item:1,
                quantity:1,
                size:1,
                product:{$arrayElemAt:['$cartItems',0]}
            }
        },
        {
            $project:{
                total:{$sum:{$multiply:['$quantity','$product.price']}}
            }
        }
    ])
    return EachAmount
}







module.exports={
    getCartCount,
    totalAmount,
    priceofEachitem,
    cartProductData
} 