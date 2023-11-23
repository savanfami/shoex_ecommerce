const user = require('../model/userSchema')
const bcrypt = require('bcrypt')
const sendOTP = require('../controller/otpcontroller')
const session = require('express-session')
const OTP = require('../model/otpSchema')
const sendOtp = require('../controller/otpcontroller')
const category = require('../model/categorySchema')
//get for user home not logged in
const home = (req, res) => {
    res.render('./user/home')
}

//get for user login
const tologin = (req, res) => {
    res.render('./user/userlogin', { message: false })
}


//get for user signup
const toSignup = (req, res) => {
    res.render('./user/usersignup', { message: false })
}

//get for userhomepage when logged in
const toUserHome = async (req, res) => {
    const categoryData=await category.find({status:true}).limit(3)
    res.render('./user/userHome',{categoryData})
}


//post for usersignup
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body
        // console.log(req.body);
        const userExist = await user.findOne({ email: email })

        if (userExist) {
            res.render('./user/usersignup', { message: 'email already exists' })
        } else {

            const hashedPassword = await bcrypt.hash(password, 10)

            const newUser = await user.create({
                username: name,
                email: email,
                password: hashedPassword
            })
            req.session.data=newUser
            req.session.username = req.body.name
            req.session.email = req.body.email
            req.session.userlogged = true
            req.session.signOtp = true
            res.redirect('/user/otpSending')
        }
    } catch (error) {
        console.error(error);
    }
}



const toOtp = (req, res) => {
    if (req.session.signOtp || req.session.forgot) {
        res.render('./user/otp', { title: "OTP" })
    } else {
        res.redirect('./user/logout')
    }
}

const otpSender = async (req, res) => {
    if (req.session.signOtp || req.session.forgot) {
        try {
            console.log(req.session.email);
            console.log("otp route");
            const email = req.session.email
            console.log(email);
            const otpsending=await sendOTP(email)
            console.log("session before verifiying otp");

            res.status(200).redirect('/user/toOtp')
        } catch (err) {
            console.log(err);
            req.session.err = "sorry cant send otp"
           

            if (req.session.forgot) {
                res.redirect('/user/forgetpass')
            }
            res.redirect('/user/tosignup')
        }
    }
}


//post for otp confirmation


const otpConformation = async (req, res) => {
    console.log("otp confiming................");
    
        console.log("this otp confirmation");
   
        try {
            const data = req.session.data;
            console.log(req.session.data);
            const Otp = await OTP.findOne({ email: data.email })
            console.log(Otp.expireAt);
            if (Date.now() > Otp.expireAt) {
                await OTP.deleteOne({ email });
            } else {
                const hashed = Otp.otp
                
                const { code, email } = req.body
                console.log(code,'---------------',hashed);
                req.session.email = data.email;
                console.log(req.session.email)
                if (hashed == code) {
                    const result = await user.insertMany([data])
                    req.session.logged = true;
                    console.log(result);
                    req.session.signotp = false
      
                    res.redirect("/user/home")

                }
                else {
                    req.session.err = "Invalid OTP"
                    console.log("erro 1");
                    res.render("./user/otp", { err: "invalid OTP" })
                }
            }


        } catch (err) {
            console.log(err);
            console.log("error 2" + err);
            res.render("./user/otp")
        }
    }


//to forgot password

// const toForgotPassword = (req, res) => {
//     req.session.forgot = true
//     res.render('./user/forgetPassword')
// }


//post for forgot password

// const forgotPass = async (req, res) => {
//     try {
//         console.log(req.body);
//         const check = await user.findOne({ email: req.body.email })
//         req.session.email = check.email

//         if (check) {
//             console.log("good to go:", check);
//             const userdata = {
//                 email: check.email,
//                 userName: check.userName,
//                 _id: check._id,
//             }
//             const email = req.body.email
//             console.log("Email::: ", email);
//             req.session.userdata = userdata;
//             req.session.email = email
//             console.log("Sessiosiiii: ", req.session.email)
//             res.redirect("/user/otp-senting")
//         }
//         else {
//             console.log(check);
//             req.session.err = "no email found"
//             res.redirect("/user/forget-pass");
//         }
//     } catch (err) {
//         console.log(err);
//         req.session.err = "no email found"
//         res.redirect("/user/forget-pass")
//     }

// }

//get for resend otp 

// const resendOtp = async (req, res) => {
//     if (req.session.signOtp || req.session.forgot) {
//         try {
//             const email = req.session.email;
//             const createdOtp = await sendOtp(email)
//             res.session.email = email
//         } catch (err) {
//             console.log(err);
//             req.session.err = "cant sent otp"
//         }
//     } else {

//     }
// }


// post for userlogin

const userLogin = async (req, res) => {
    try {
        const check = await user.findOne({ email: req.body.email })
        if (check) {
            const isMatch = await bcrypt.compare(req.body.password, check.password)
            // console.log("--------------------");
            if (isMatch) {
                if (check.status == true) {
                    req.session.username = req.body.name
                    req.session.userlogged = true
                    req.session.email = req.body.email
                    // console.log(".......gg..............");
                    res.redirect('/user/home')
                } else {
                    res.render('./user/userlogin', { message: "sorry user is blocked" })
                }
            } else {
                res.render('./user/userlogin', { message: "Invalid password" })
            }
        }
    } catch (error) {
        console.log(error);

    }

}

//route for user logout

const logout = (req, res) => {
    res.redirect('/')
}








module.exports = {
    home,
    tologin,
    toSignup,
    signup,
    toUserHome,
    userLogin,
    logout,
    toOtp,
    otpSender,
    otpConformation
    // toForgotPassword,
    // forgotPass,
    // resendOtp
}