import { asynchandler } from "../utils/asynchandler.js";



const registerUser= asynchandler(async (req,res)=>{
    return res.status(200).json({
        message:"ok kya baat hai gandu programmer bangaya "
    })
})



export {registerUser}