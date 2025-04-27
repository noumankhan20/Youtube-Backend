import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt" ;
import jwt from "jsonwebtoken";
const userSchema=new mongoose.Schema({

    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    
    avatar:{
        type:String,//cloudinary url
        required:true
    },
    coverImage:{
        type:String,
    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
],
    password:{
        type:String,
        required:[true,'Password is required'],
    },
    refreshtoken:{
        type:String,
    }
},
    {
    timestamps:true  //timestamps humesha second argument rehta h matlab ye updar ke model alag create honge fir timestamps alag se create hoga 
    }
)

userSchema.pre("save",async function(next) {
    if(!this.isModified("password")) return next ();

    this.password= await bcrypt.hash(this.password,11)//chai aur code ne 10 has lagaye h maine 11
    next()
} )

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken= function(){//yaha  pehle async lagaya tha fucntion ke phele to error de diya access token should be a string
    //kyuki async lagane se cheezein promise ban jaati h aur json ko promise nhi samjhta aur upar se mein controller mein maine string call kiya tha !!! (accha error tha maja aaagya)
   return jwt.sign({
    _id:this._id,
    email:this.email,
    username:this.username,
    fullname:this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken= function(){
    return jwt.sign({
        _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema)