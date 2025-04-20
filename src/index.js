// require ('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js"//ye define nhi kiya tha to error fek rha tha isi file ki 22 line wala refernece app is not deifned karke 

dotenv.config({
    path: './.env'
})

connectDB()

.then(()=>{
    app.on("error",(error)=>{
        console.log("ErrR:",error);
        throw error
        
    })
    app.listen(process.env.PORT || 8000,() => {
        console.log(`Server is running at port :${process.env.PORT}`);
        
    })
})
.catch((err)=>{
    console.log("MONGO DB Connection Failed !!!",err);
    
})