const verifyUser=(req,res,next)=>{
    if(req.session.userlogged){
        next()
    }else{
        res.redirect('/')
    }
}


const existingUser=(req,res,next)=>{
    if(req.session.userlogged){
        console.log("user auth checking");
        res.redirect("/user/home")
    }else{
        next()
    }
}


module.exports={
    verifyUser,
    existingUser
}