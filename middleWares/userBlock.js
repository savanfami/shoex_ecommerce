const user=require('../model/userSchema')

const checkBlock=async (req,res,next)=>{
    const check=await user.findOne({email:req.session.email})
        if(check.status==false){
            console.log("user blocked cannot access");
            req.session.destroy('/')
            res.redirect("/")
        }else{
            next()
        }

}
module.exports=checkBlock




