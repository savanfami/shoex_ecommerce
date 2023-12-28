const verifyAdmin=async (req,res,next)=>{
    try{
    if(req.session.adminlogged){
        next()
    }else{
        res.redirect('/admin')
    }
    }catch(err){
        console.error(err,"error verifiying admin")
    }
}

const existingAdmin=async(req,res,next)=>{
    try{
        if(req.session.adminlogged){
            res.redirect('/admin/manageUser')
        }else{
            next()
        }

    }catch(err){
        console.error('failed to verify existing admin',err)
    }
}


module.exports={
    verifyAdmin,
    existingAdmin
}