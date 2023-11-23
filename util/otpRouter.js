const express=require('express')
const router=express.Router();
const {sendOTP}=require('../controller/otpcontroller')


router.get("/",async (req,res)=>{
    try{
        const email=req.session.data.Email
        const createdOtp=await sendOTP({email})
        res.status(200).render("./user/otp")
    }catch(err){
        throw(err);
    }
    
})

module.exports=router