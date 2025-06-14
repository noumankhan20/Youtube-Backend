import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()
router.route('/register').post(
    upload.fields([
        {
            name:"avatar",//forntend se bhi yahi aana chahiye communicate hona chahiye
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:3
        }
    ]),
    registerUser)

router.route('/login').post(loginUser)


//secured routes 
router.route('/logout').post(verifyJWT,logoutUser)

router.route('/refresh-token').pos 
export default router   