import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import { generateAccessToken, generateRefreshToken } from "../lib/jwt.js";
import jwt, { decode } from "jsonwebtoken";
import { cloudinary } from "../lib/cloudinary.config.js";
import { upload} from "../middlewares/upload.js"
import { transporter } from "../utils/transporter.js"
import { get } from "mongoose";
import Project from "../models/project.model.js";
dotenv.config()
export const createUser = asyncHandler(async (req, res) => {
    const { username, name, email, password } = req.body;

    if (!username) throw new ApiError(400,"Please enter username");
    if (!name) throw new ApiError(400, "Please enter name !");
    if (!email) throw new ApiError(400,"Please enter username","username");
    if (!password) throw new ApiError(400, "Please enter password !");
    if(password.length < 6)throw new ApiError(400,"Password must be 6 charectors")

    const existingEmail = await User.findOne({email});
    if (existingEmail) throw new ApiError(302, "Email already registered");
    const existingUsername = await User.findOne({username});
    if (existingUsername) throw new ApiError(302, "Username already taken");


    // verify user
    const verificationCode = jwt.sign({ username, name, email, password }, process.env.JWT_EMAIL_SECRET, {expiresIn:"10m"})
    
    const link = `${process.env.CLIENT_URL}/verify-email?token=${verificationCode}`
    
    const mailOptions = {
        from: process.env.EMAIL_SEND_USER,
        to: email,
        subject: "Verify Your email",
        html:`<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; 
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); text-align: center;">
            <img src="${process.env.CLIENT_URL}/logo.svg"
                 alt="Logo" style="width: 80px; margin-bottom: 20px;">
            <h2 style="color: #333;">Email Verification</h2>
            <p style="color: #666; font-size: 16px;">Thank you for registering! 
               Please click the button below to verify your email. Valid for 10 Minutes</p>
            <a href="${link}" 
               style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; 
                      background: #007bff; text-decoration: none; border-radius: 5px; font-weight: bold; 
                      margin-top: 20px;">Verify Email</a>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">If you didn't request this, you can ignore this email.</p>
        </div>
    </div>`
    }

    try {
       
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new ApiError(400,"Something went wrong...")
            }

            res.status(200).json(new ApiResponse(200,`Verification link sended to ${email}`))
        })
    } catch (error) {
        throw new ApiError(400,"server error",)
    }
 
})

export const verifyEmail = asyncHandler(async (req, res) => {
    
  
    const { token } = req.query;

    if (!token) throw new ApiError(400, "Invalid Link");
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    if (!decoded) throw new ApiError(400, "Expired");
    
    const user = await User.insertOne({ username: decoded.username.toLowerCase(), email:decoded.email, password:decoded.password, name:decoded.name });

    user.password = null
    res.status(200).json(new ApiResponse(200, user, "Email Verified You can Login now", true));

    if(!user)throw new ApiError(500,'internal server error try again',false)

})

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
 
    if (!email) throw new ApiError(400, "Please enter email !");
    if (!password) throw new ApiError(400, "Please enter password !");
    const existUser = await User.findOne({ $or: [{ email: email }, { username: email }] });

    if (!existUser) throw new ApiError("404", "Invalid Email/Username or password");

    const isPasswordMatched = await bcrypt.compare(password,existUser.password)

    if (!isPasswordMatched) throw new ApiError("404", "Invalid Email/Username or password");
    
    const accessToken =  generateAccessToken(existUser);
    const refreshToken = await generateRefreshToken({_id:existUser._id})

    existUser.password = null;
    existUser.refreshToken = null
  const options = {
    httpOnly: true,   // JavaScript access disable
    secure: true,     // HTTPS required
    sameSite: "none", // Cross-site cookies allow karega
};
    
    res.status(200)
            .cookie('accessToken',accessToken,options)
            .cookie('refreshToken', refreshToken, options)
            .json(new ApiResponse(200,existUser,"Login success"))
})

export const logOut = asyncHandler(async (req,res) => {
    User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 }
    });

  const options = {
    httpOnly: true,   // JavaScript access disable
    secure: true,     // HTTPS required
    sameSite: "none", // Cross-site cookies allow karega
};

    res.status(200)
    .clearCookie("accessToken",options)
        .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,null,"Logout success"))
}, { new: true })

export const refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies["refreshToken"];
    if (!refreshToken) throw new ApiError(404, "Unauthotized User");

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

    if (!decoded) throw new ApiError(400, "Invalid User");

       const user = User.findById(decoded._id).select('-password');
    if (!user) throw new ApiError(400, "Invalid refresh token");

    if (user.refreshToken !== refreshToken) throw new ApiError(400, "refresh token expired");

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user._id);

const options = {
    httpOnly: true,   // JavaScript access disable
    secure: true,     // HTTPS required
    sameSite: "none", // Cross-site cookies allow karega
};

    res.status(200)
    .cookie('accessToken',newAccessToken,options)
        .cookie('refreshToken', newRefreshToken, options)
    .json(new ApiResponse(200,{accessToken:newAccessToken},"Token Refreshed"))
    
})

export const checkAuth = asyncHandler(async (req,res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken")
    if (!user) throw new ApiError(404, "User not found");
    res.status(200).json(new ApiResponse(200,user,"user fetched"))
})


export const updateProfilePicture =asyncHandler(async (req, res) => {
    const _id = req.user._id;
    const user = await User.findOne(_id).select('-password -refreshToken');

    if (!user) throw new ApiError(404, "user not found")
    
    if (user.avatar) {
        let public_id = user.avatar.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`profile_pictures/${public_id}`)
        }
        
         if (!req.file) throw new ApiError(400, "No file uploaded");
       
        const newUser = await User.findByIdAndUpdate(_id,{avatar:req.file.path},{new:true}).select("-password -refreshToken")

        res.status(200).json(new ApiResponse(200, newUser,"profile picture uploaded",true));
})














 

