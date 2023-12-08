const verifyAdmin=async (req,res,next)=>{
    if(req.session.adminlogged){
        next()
    }else{
        res.redirect('/admin')
    }
}

const existingAdmin=async(req,res,next)=>{
    if(req.session.adminlogged){
        res.redirect('/admin/manageUser')
    }else{
        next()
    }
}


module.exports={
    verifyAdmin,
    existingAdmin
}