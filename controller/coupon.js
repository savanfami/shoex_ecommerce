const { ObjectId } = require('mongodb');
const coupons=require('../model/coupon')
const { default: mongoose } = require('mongoose');
require('dotenv').config()

const toCoupon=async(req,res)=>{
    try{
        const couponData=await coupons.find().sort()
        res.render('./admin/coupon',{couponData})

    }catch(err){
        console.error(err)
    }
}

const toaddCoupon=async(req,res,next)=>{
    try{ 
        res.render('./admin/addCoupon')

    }catch(err){
        console.error(err)
        nexr(err)
    }
}


//post for addcoupon

const addCoupon=async(req,res,next)=>{
    try{
        const {couponName,couponCode,minPurchaseAmount,discountAmount,startDate,endDate,discountType}=req.body
        const existingCoupon=await coupons.findOne({couponCode})
        if(existingCoupon){
            res.json(400).json({success:false,message:'Coupon with this code already exist'})
        }
        if (!couponName || !couponCode || isNaN(minPurchaseAmount) || isNaN(discountAmount) || !discountType || !startDate || !endDate ) {
  
            return res.status(400).json({ success: false, message: 'Invalid input. Please provide all required fields with valid values.' });
          }
        const coupon=new coupons({
            couponName,
            couponCode,
            minPurchaseAmount,
            discountAmount,
            couponType:discountType,
            startDate,
            endDate
        })
        await coupon.save()
        res.json({success:true,message:'Coupon Creatd successfully'})
    }catch(err){
        console.error(err)
        next(err)
    }
}

//to edicoupon

const editCoupon=async(req,res,next)=>{
    try{
        const couponId=req.params.id
        const couponData=await coupons.findById({_id:couponId})
        res.render('./admin/editCoupon',{couponData})

    }catch(err){
        console.error(err)
        next(err)
    }
}


//patch for editcoupon

const editdcoupon=async(req,res,next)=>{
    try{
        const {couponName,couponCode,minPurchaseAmount,discountAmount,startDate,endDate,discountType,couponId}=req.body
            const couponData=await coupons.findByIdAndUpdate({_id:couponId},{
                $set:{
                    couponName,
                    couponCode,
                    minPurchaseAmount,
                    discountAmount,
                    startDate,
                    couponType:discountType,
                    endDate
                }
            })
       res.json({success:true,message:"coupon updated successfully"})
    }catch(err){
        console.error(err)
        next(err)
    }
}


const deleteCoupon=async(req,res,next)=>{
    try{
        const couponId=req.params.id
        const couponData=await coupons.findByIdAndDelete({_id:couponId})
        res.json({success:true,message:"coupon deleted successfully"})
    }catch(err){
        console.error(err)
        next(err)
    }
}

module.exports={
    toCoupon,
    toaddCoupon,
    addCoupon,
    editCoupon,
    editdcoupon,
    deleteCoupon
}