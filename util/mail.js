const nodemailer=require('nodemailer')
const crypto = require('crypto');
require('dotenv').config()
const{AUTH_EMAIL,AUTH_PASS}=process.env


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:AUTH_EMAIL,
        pass:AUTH_PASS}
    
  });


  
module.exports={
  
}

