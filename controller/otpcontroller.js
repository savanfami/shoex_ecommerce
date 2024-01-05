const { error } = require('console')
const OTP=require('../model/otpSchema')
const mail=require('../util/mail') 
const generateOTP = require('../util/otpgenerator')
const {AUTH_MAIL}=process.env
const bcrypt=require('bcrypt')
const email=require('../controller/usercontroller')

const sendOtp=async (email)=>{
    try {
    if(!email){
        throw error("provide the email")
    }
    await OTP.deleteOne({email})

    const generatedOTP=await generateOTP()

    const hashedOtp= await bcrypt.hash(generatedOTP,10)

    const mailOptions={
        from:AUTH_MAIL,
        to:email,
        subject:"Verify the email using this otp",
        html:`<p>Hello user use the this otp to verify your email to continue </p> <p style="color:tomato;font-size:25px;letter-spacing:2px;">
        <b>${generatedOTP}</b></p><p>OTP will expire in<b> 10 minute(s)</b>.</p>`
    }
    await mail(mailOptions)

    function addMinutesToDate(date, minutes) {
        return new Date(date.getTime() + minutes * 60000); 
      }

      const currentDate=new Date()
      const newDate = addMinutesToDate(currentDate, 10);
      const newdOtp=await new OTP({
        email,
        otp:hashedOtp,
        otpAdded:Date.now(),
        expireAt:newDate
      })
      const createdOtp=await newdOtp.save()
      console.log("otp is",createdOtp);
      return createdOtp;

    } catch (error) {
        console.log(error);
    }
}






module.exports=sendOtp