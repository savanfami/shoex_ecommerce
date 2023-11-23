const verifyAdmin=async (req,res,next)=>{
    if(req.session.adminlogged){
        next()
    }else{
        res.redirect('/')
    }
}

module.exports={
    verifyAdmin
}