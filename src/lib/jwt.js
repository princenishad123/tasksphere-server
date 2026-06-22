import jwt from "jsonwebtoken";
import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"

const generateAccessToken = ({name,email,username,_id}) => {
    return jwt.sign({ name, email, username, _id}, process.env.JWT_ACCESS_TOKEN, { expiresIn: "1d" });
}

const generateRefreshToken = async ({ _id }) => {
    const user = await User.findById({ _id }).select("-password");
    if (!user) throw new ApiError(400, "user not found to generate jwt");
    const refreshToken = jwt.sign({userId:user._id},process.env.JWT_REFRESH_TOKEN,{expiresIn:"10d"})

    user.refreshToken = refreshToken;
    await user.save();

    return refreshToken;
}

const inviteMember = (projectId,email) => {
    return jwt.sign({projectId,email},process.env.JWT_EMAIL_SECRET,{expiresIn:"5d"})
}

const verifyJwtToken = (token) => {
    return jwt.verify(token,process.env.JWT_EMAIL_SECRET)
}

export { generateAccessToken, generateRefreshToken, inviteMember,verifyJwtToken};