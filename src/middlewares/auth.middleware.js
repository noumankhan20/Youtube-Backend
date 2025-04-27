import { ApiError } from "../utils/ApiError.js"
import { asynchandler } from "../utils/asynchandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
export const verifyJWT=asynchandler(async(req,_,next)=>{  //ye req ,_,next kyuki req,res,next tha aur yaha res kuch kaam nhi aarha tha isisliye code ki readability badhane _ likha h 
   try {
     const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
     if (!token){
         throw new ApiError(401,"Unauthorized request ")
     }
     const decodedToken=jwt.verify(token,process.env.ACCESS_SECRET_TOKEN)
     const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if (!user){
         throw new ApiError(401, "Invalid access Token")
     }
     req.user=user;
     next()
   } catch (error) {
        throw new ApiError(401,error?.message ||"Invalid access Token")
    
   }



})