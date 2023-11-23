const { use } = require("../router/adminRouter");
const user=require('../model/userSchema')
const category=require('../model/categorySchema')

const credentials={
    email:"shoexoff@gmail.com",
    password:"shoex123"
}

//get of admin login
const toadminLogin=(req,res)=>{
    res.render('./admin/adminlogin')
}

//post of admin login

const adminLogin=(req,res)=>{
    // console.log(req.body);
    if(req.body.email==credentials.email&& req.body.password==credentials.password){
        req.session.email=req.body.email;
        req.session.adminlogged=true;
        req.session.password=req.body.password
        res.render('./admin/adminDash')
    }else{
        res.render('./admin/adminlogin',{message:"incorrect username or password"})
    }
}


//get for usermanagement

const usermanagement=async (req,res)=>{
    var i=0
    const userData=await user.find().sort({username:1,email:1,status:1})
    res.render('./admin/userManagement',{userData,i})
}

//post method for userblock
const userBlock=async(req,res)=>{
    const id=req.params.id
    const block=await user.updateOne({_id:id},{$set:{status:false}})
     return res.redirect('/admin/manageUser')
}

//post method for userblock
const unBlock=async(req,res)=>{
    const id=req.params.id
    const block=await user.updateOne({_id:id},{$set:{status:true}})
    return res.redirect('/admin/manageUser')
}

//post method for categoryblock
const blockCategory=async(req,res)=>{
    const id=req.params.id
    const block=await category.updateOne({_id:id},{$set:{status:false}})
    return res.redirect('/admin/manageCategory')
}

//post method for categoryblock
const UnblockCategory=async(req,res)=>{
    const id=req.params.id
    const block=await category.updateOne({_id:id},{$set:{status:true}})
    return res.redirect('/admin/manageCategory')
}

module.exports={
    toadminLogin,
    usermanagement,
    adminLogin,
    userBlock,
    unBlock,
    blockCategory,
    UnblockCategory
    
}