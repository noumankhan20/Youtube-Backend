import { asynchandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"// ye {ApiError} humse tab likhte h jab wo apni file mein export aise hua h export{ApiError} agar uske aage defualt laga h to wo aise import nahi hoga                   
import { User } from "../models/user.model.js";//ye bhi iske pass bhi default nhi likha hua tha isiliye aise import kiye!!!
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser= asynchandler(async (req,res)=>{
   //get details from the frontend
   //validation - not empty (ki forntend se jo data aarha wo empty to nhi)
   //check if user already exists :username,email
   //check for images,chek for avatar
   //upload them on cloudinary ,avatar
   //create user object -db mein entry hui h ya nhi create karna h user ki entry 
   //remove password and refresh token field from response (hash password lagaya h na to user ke pass wo nhi jaana chahiye)
   //check user create hua h ya nhi
   //return res 



   const {fullname,email,password,username} =req.body
   console.log("email:",email);
//   if (fullname === "") {
//     throw new ApiError (400,"fullname is required")
//   }  aise ek ek karke sabko if else mein daalkr validation le sakte h par agar jayda data ho to ye acchi approach nhi h 
    if (
        [fullname,email,password,username].some((field) => 
        field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    const existedUser= await User.findOne({
        $or:[{username},{email}]
        
    })
    console.log(existedUser);
    if(existedUser){
        throw new ApiError(409,"username and email already exists")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;//yahan pehle maine fiels likh diya tha to coverimage "" aise pass ho rha tha db main 
    
    let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage)&&
        req.files.coverImage.length>0){
            coverImageLocalPath=req.files.coverImage[0].
            path
        }

    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
   const avatar= await uploadonCloudinary(avatarLocalPath)
   const coverImage=await  uploadonCloudinary(coverImageLocalPath)

  
    

   if(!avatar){
    throw new ApiError(400,"Avatar is required")
   }
   const user= await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url|| "",
    username:username.toLowerCase(),
    email,
    password,
   })

    const createdUser=   await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
})



export {registerUser}