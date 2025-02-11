const nodemailer = require("nodemailer");


let mailTransporter=nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:process.env.AUTH_MAIL||'',
        pass:process.env.AUTH_PASSWORD||'',
    }
})
mailTransporter.verify((error,success)=>{
    if(error){
        console.log(error);
    }else{
        // console.log("email ready");
        // console.log(success);
    }
})
const sendEmail=async (mailOptions)=>{
    try{
        await mailTransporter.sendMail(mailOptions)
        console.log("email sended");
        
        return;
    }catch(err){
        throw err;
    }
}

module.exports=sendEmail;