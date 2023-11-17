const mongoose=require('mongoose')
require('dotenv').config()


mongoose.connect(process.env.MONGO_URL,{
    useNewurlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("db connected");
}).catch((err)=>{
    console.log("not connected",err);
})