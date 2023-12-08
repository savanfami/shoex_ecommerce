const express=require('express')
const app=express()
const userRouter=require('./router/userRouter')
const adminRouter=require('./router/adminRouter')
const path=require('path')
require('dotenv').config()
const bodyParser=require('body-parser')
connectDB=require('./config/connection')
const session=require('express-session')
const{v4:uuidv4}=require('uuid')
const morgan=require("morgan")
const nocache=require('nocache')
const flash=require('connect-flash')

app.use(nocache())
const PORT=process.env.PORT



app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use(session({
    secret:uuidv4(),
    saveUninitialized:true,
    resave:true,
    // cookie:{
    //     httpOnly:true,
    //     maxAge:360000
    // }
}))
app.use(flash())
app.use(morgan("tiny"))
//static files serving
app.use(express.static('public'))
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'));







app.use('/',userRouter)
app.use('/admin',adminRouter)

app.listen(PORT, () => {
    console.log(`server start running at http://localhost:${PORT}`)
});