import { asynchandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"// ye {ApiError} humse tab likhte h jab wo apni file mein export aise hua h export{ApiError} agar uske aage defualt laga h to wo aise import nahi hoga                   
import { User } from "../models/user.model.js";//ye bhi iske pass bhi default nhi likha hua tha isiliye aise import kiye!!!
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { decode } from "jsonwebtoken";
//ONE THING ALSO TO NOTE KI JAB BHI FIND ONE YA KUCH BHI QUERY LIKHTE HUE JO User HUMNE CAPITAL MEIN LIKHA H WO USER HOGA RATHER THAN IT user USE HOGA !!!!!


const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false })    
        return {accessToken,refreshToken}




    } catch (error) {
        throw new ApiError(500,"Internal server error something went wrong while generating, access and refresh token")
        
    }
}





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


const loginUser= asynchandler(async(req,res)=>{
//username/email
//find the user 
//password check  
//token dena padega access ya refresh 
//send cookie 

    const {username,email,password}=req.body
    if (!username||!email){
        throw new ApiError(404,"Username or email is required")
    }
    //User.findOne({username}) aise user find kar sakte but only on the basis of username
    const user= await User.findOne({
        $or:[{username},{email}]   //ye jo $or sign ye mongodb ka aggregation h matlab ye use karke hum ya to username ya email ke basis pe user ko find kar skate h 
    })
    if(!user){
        throw new ApiError(404,"User not found")
    }
 
    const isPasswordValid = await user.ispasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user Credentials")
    }
    
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).
     select("-password -refreshToken")

     const options={
        httpOnly:true,
        secure:true
     }
     return res.status(200).cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(
            200,{
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in Successfully "
        )
     )

})

const logoutUser=asynchandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            }   
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
     }
     return res.status(200).clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json (new ApiResponse(200,{},"User logged out successfully"))

})


const refreshAccessToken= asynchandler(async(req,res) =>
    {
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
    
        )
    
        const user =await User.findById(decodedToken?._id)
        if (!user){
            throw new ApiError(401,"Invalid refresh token")
        }
        if (incomingRefreshToken !==user?.refreshToken){
            throw new ApiError(401,"Refresh Token expired or used")
        }
    
        const options ={
            httpOnly: true,
            secure: true 
        }
    
       const {accessToken,newrefreshToken}= await generateAccessAndRefreshToken(user._id)
        .status
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newrefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message|| "Invalid refersh token"    )
    }

})

export {registerUser,loginUser,logoutUser,refreshAccessToken}     