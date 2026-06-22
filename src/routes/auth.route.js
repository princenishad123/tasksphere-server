import { Router } from "express";
import { checkAuth, createUser,loginUser, logOut, updateProfilePicture, verifyEmail } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/upload.js";
const authRouter = Router();



authRouter.route("/sign-up").post(createUser);
authRouter.route("/verify-email").post(verifyEmail);
authRouter.route("/login").post(loginUser);
authRouter.route("/logout").post(verifyJwt,logOut)
authRouter.route("/me").get(verifyJwt,checkAuth)

authRouter.route("/upload-avatar").put(verifyJwt,upload.single("profilePicture"),updateProfilePicture)



export default authRouter;