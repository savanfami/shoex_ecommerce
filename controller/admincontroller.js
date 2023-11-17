

const adminLogin=(req,res)=>{
    res.render('./admin/adminlogin')
}


const sidebar=(req,res)=>{
    console.log("..........");
    res.render('./admin/home')
}

module.exports={
    adminLogin,
    sidebar
}