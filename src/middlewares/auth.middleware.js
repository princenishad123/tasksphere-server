import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
export const verifyJwt = asyncHandler(async(req,res,next) => {
    
    const token = req.cookies["accessToken"];
    if (!token) throw new ApiError(400, "Please Login");

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    if (!decoded) throw new ApiError(400, "Token Expired");
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) throw new ApiError(400, "Invalid user");

    req.user = user;
    next()
})

export const verifyAdmin = asyncHandler(async(req,res,next) => {
    
    const token = req.cookies["accessToken"];
    if (!token) throw new ApiError(400, "Please Login");

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    if (!decoded) throw new ApiError(400, "Token Expired");
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) throw new ApiError(400, "Invalid user");
    if(!user.role === "admin") throw new ApiError(400, "Access Denied");

    req.user = user;
    next()
})