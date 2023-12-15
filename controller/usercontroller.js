const user = require('../model/userSchema')
const bcrypt = require('bcrypt')
const sendOTP = require('../controller/otpcontroller')
const OTP = require('../model/otpSchema')
const category = require('../model/categorySchema')
const generateOTP = require('../util/otpgenerator')
const sendMail = require('../util/mail')
const product = require('../model/productSchema')
const { error } = require('console')
//get for user home not logged in
const home = async (req, res) => {
    try{
    const categoryData = await category.find({ status: true }).limit(3)
    const productData = await product.find({ status: true }).limit(4)
    res.render('./user/home', { categoryData, productData })
    }catch(err){
        console.log(err);
    }
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
    try{
    const categoryData = await category.find({ status: true }).limit(3)
    const productData = await product.find({ status: true }).limit(4)
    res.render('./user/userHome', { categoryData, productData, })
}catch(err){
    console.log(err);
}
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
            const newUser = ({
                username: name,
                email: email,
                password: hashedPassword
            })

            req.session.data = newUser
            req.session.username = req.body.name
            req.session.email = req.body.email
            req.session.signOtp = true
            res.redirect('/user/otpSending')
        }
    } catch (error) {
        console.error(error);
    }
}


//get for otp page

const toOtp = (req, res) => {
    try{
    if (req.session.signOtp || req.session.forgot) {
        res.render('./user/otp', { title: "OTP" })
    } else {
        res.redirect('./user/logout')
    }
}catch(err){
    console.log(err);
}}

// otp sending

const otpSender = async (req, res) => {
   try{
    if (req.session.signOtp || req.session.forgot) {
        try {
            const email = req.session.email
            // console.log(email);
            const otpsending = await sendOTP(email)
            // console.log("session before verifiying otp");

            res.status(200).redirect('/user/toOtp')
        } catch (err) {
            console.log(err);
            req.session.err = "sorry cant send otp"
        }
    }
}catch(err){
    console.log(err);
}}

const resendOtp = async (req, res) => {
    try {
        const { email } = req.session.data
        const newOtp = await generateOTP()

        await OTP.updateOne({ email }, { $set: { otp: newOtp } })
        // console.log("resend");
        await sendOTP(email)
    } catch (err) {
        console.log(err);
    }
}


//post for otp confirmation


const otpConformation = async (req, res) => {
    try {
        const data = req.session.data;
        const Otp = await OTP.findOne({ email: data.email })
        // console.log(Otp.expireAt);
        if (Date.now() > Otp.expireAt) {
            await OTP.deleteOne({ email });
        } else {
            const hashedOtp = Otp.otp
            const userEnteredOtp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
            const compareOtp = await bcrypt.compare(userEnteredOtp, hashedOtp)
            req.session.email = data.email;
            // console.log(req.session.email)
            if (compareOtp) {
                const newUser = await user.create([data])
                req.session.userlogged = true;
                // console.log(result);
                req.session.signOtp = false
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
                    res.render('./user/userlogin', { message: "sorry user is blocked " })
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
    try{
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/')
        }
    })
}catch(err){
    console.log(err);
}}




// GET FOR PRODUCT DETAILS

const getProductDetails = async (req, res) => {
    try {
        const id = req.params.id
        const productData = await product.findOne({ _id: id })
        const relatedData = await product.find({ brand: productData.brand, category: productData.category }).limit(4)
        const RelatedDatas = relatedData.filter(item => item._id.toString() !== productData._id.toString());
        res.render('./user/productDetails', { productData, RelatedDatas })

    } catch (err) {
        console.log(err);
    }

}

const getProductDetailshome = async (req, res) => {
    try {
        const id = req.params.id
        const productData = await product.findOne({ _id: id })
        const relatedData = await product.find({ brand: productData.brand, category: productData.category }).limit(4)
        const RelatedDatas = relatedData.filter(item => item._id.toString() !== productData._id.toString());
        res.render('./user/productDetails', { productData, RelatedDatas })

    } catch (err) {
        console.log(err);
    }

}


//get for view all Product

const viewallProduct=async (req,res)=>{
  try{
    const productData=await product.find({status:true}).limit(16)
    res.render('./user/viewallProduct',{productData})
}catch(err){
    console.log(err);
}}

const viewallProducthome=async (req,res)=>{
  try{
    const productData=await product.find({status:true}).limit(16)
    res.render('./user/viewallProduct',{productData})
}catch(err){
    console.log(err);
}}























//<-----------------------------------------UserProfile--------------------------------------------------------->//
//to user profile

const touserProfile = async (req, res) => {
    try {
        const userData = await user.findOne({ email: req.session.email })
        res.render('./user/userProfile', { userData })
    } catch (err) {
        console.log(err);
    }
}

//post edit userProfile
const usereditProfile = async (req, res) => {
    try {
        const id = req.params.id
        const userData = await user.findOne({ _id: id })
        const updateUser = await userData.updateOne({ username: req.body.name })
        res.redirect('/user-profile')
    } catch (err) {
        console.log(err);
    }
}

//get for manageAddress

const manageAddress = async (req, res) => {
    try {
        const addressData = await user.findOne({ email: req.session.email })
        // console.log(addressData);
        const message = req.flash('success')
        res.render('./user/manageAddress', { addressData, message })
    } catch (err) {
        console.log(err);
    }
}

//post for addAddress

const addAddress = async (req, res) => {
    try {
        const { name, address, city, state, pincode, phone } = req.body
        let email = req.session.email
        const addressData = {
            name,
            address,
            city,
            state,
            pincode,
            phone
        }
        const users = await user.findOne({ email })
        if (users.address.length >= 3) {
            // console.log(users.address.length,"dddddddddddddddddddddddddddddddddddddddddddddd");
            req.flash("success", "Max Address limit reached!!! please edit or delete existing Address")
            res.redirect('/user-manageAddress')
        } else {
            users.address.push(addressData)
            await users.save()
           
            

            // console.log("address addred succesfulllllly");
            res.redirect('/user-manageAddress')
        }
    } catch (err) {
        console.log(err);
    }
}

//post for edit address
const editAddress = async (req, res) => {
    try {
        const id = req.params.id
        const addressData = {
            name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            phone: req.body.phone
        }
        // console.log(addressData,id,"uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");
        const users = await user.findOneAndUpdate(
            { 'address._id': id },
            { $set: { 'address.$': addressData } },
            { new: true }
        )
        if (users) {
            // console.log("updated successfully");
            res.redirect('/user-manageAddress')
        }
    } catch (err) {
        console.log(err);
    }
}


//post for delete address

const deleteAddress = async (req, res) => {
    try {
        const id = req.params.id
        const email = req.session.email
        const userFind = await user.findOne({ email })
        if (!userFind) {
            return res.status(404).json({ message: "no user found" })
        }
        const deletAddress = await user.updateOne({ email },
            {
                $pull: { 'address': { _id: id } }
            })
        res.status(200).json({ success: true, message: 'Address deleted successfully' })

    } catch (error) {
        console.error("error deleting address".error)
        res.status('500').json({ message: "Unable to delete address" })
    }
}

//post for update profile Image

const editprofileImage = async (req, res) => {
    try {
        if (req.file) {
            const updatedUser = await user.findOneAndUpdate(
                { email: req.session.email },
                { profilePhoto: req.file.filename },
                { new: true }
            )
            if (updatedUser) {
                
                res.status(200).json({ message: "profile photo updated successfully" })
            } else {
                res.status(400).json({ error: "user not found" })
            }
        } else {
            res.status(400).json({ error: "no file was uploaded" })
        }
    } catch (err) {
        console.error('error', err)
        res.status(500).json({ error: "internal server error" })
    }

}

//post for change password

const changePassword=async(req,res)=>{
    try{
        const email=req.session.email
        // console.log(email,"sedsssionnnnnnnnnnnnemaiilllllllllllllllllllllll");
        const check=await user.findOne({email})
        console.log("userrrr",check);
        // console.log(req.body.oldPassword,"dddddddddddddddddddddddddddddddddddd");
        // console.log(req.body.newPassword,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        if(check){
            const checkPassword=await bcrypt.compare(req.body.oldPassword,check.password)
            // console.log("password is matched",checkPassword);

        if(checkPassword){
            const hashpassword=await bcrypt.hash(req.body.newPassword,10)
            const updateUser=await user.updateOne({email},{$set:{password:hashpassword}})
            // console.log(updateUser,"updated userrrrrrrrrrrrrrrrrrrrrrrr");
            return res.json({success:true})
        }else{
            return res.json({success:false,error:"Old password is Wrong"})
        }
    }
    }catch(error){
        console.log(error);
    }
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
    otpConformation,
    resendOtp,
    getProductDetails,
    touserProfile,
    usereditProfile,
    manageAddress,
    addAddress,
    editAddress,
    deleteAddress,
    editprofileImage,
    viewallProduct,
    viewallProducthome,
    getProductDetailshome,
    changePassword
    // toForgotPassword,
    // forgotPass,
}