const user = require('../model/userSchema')
const bcrypt = require('bcrypt')

//get for user home not logged in
const home=(req, res)=>{
    res.render('./user/home')
}

//get for user login
const tologin=(req, res)=>{
    res.render('./user/userlogin', { message: false })
}


//get for user signup
const toSignup=(req, res)=>{
    res.render('./user/usersignup', { message: false })
}

//get for userhomepage when logged in
const toUserHome=(req, res)=>{
    res.render('./user/userHome')
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
            req.session.username = req.body.name
            req.session.email = req.body.email
            req.session.userlogged = true
            res.redirect('/user/home')
        }
    } catch (error) {
        console.error(error);
    }
}

// post for userlogin

const userLogin = async (req, res) => {
    try {
        const check = await user.findOne({ email: req.body.email })
        if (check) {
            const isMatch = await bcrypt.compare(req.body.password, check.password)
            console.log("--------------------");
            if (isMatch) {
                if (check.status == true) {
                    req.session.username = req.body.name
                    req.session.userlogged = true
                    req.session.email = req.body.email
                    console.log(".....................");
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

const logout=(req,res)=>{
    res.redirect('/')
}








module.exports = {
    home,
    tologin,
    toSignup,
    signup,
    toUserHome,
    userLogin,
    logout

}