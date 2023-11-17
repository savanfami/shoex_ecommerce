function generateOTP() {
  
    const otp = Math.floor(1000 + Math.random() * 9000);
  
    return otp.toString(); 
  }
  

//   const otp = generateOTP();
//   console.log(`Generated OTP: ${otp}`);
  