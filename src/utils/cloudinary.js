import {v2 as cloudinary} from "cloudinary";
import fs from "fs"      //inbuilt hota h node js ke saath aata h file system mein different actions ke liye kaam aata h read/write etc.
 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadonCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null 
        //upload file on cloudinary 
        const response =await cloudinary.uploader.upload
        (localFilePath,{
            resource_type:"auto"
        })
        console.log("file has been uploaded on cloudinary",response);
        return response ;
    
    }
    catch(error){
        fs.unlinkSync(localFilePath)
        return null;
    }

}
export {uploadonCloudinary};