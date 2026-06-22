import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { transporter } from "../utils/transporter.js";

export const sendEmails = asyncHandler(async (res,email,data) => {
        
    const mailOptions = {
        from: process.env.EMAIL_SEND_USER,
        to: email,
        subject: "Verify Your email",
        html:data
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