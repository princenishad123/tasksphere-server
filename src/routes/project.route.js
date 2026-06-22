import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import { acceptInvite, createProject, getMemberProfile, getProject, inviteMemberInProject, updateProject } from "../controllers/project.controller.js";
import { upload } from "../middlewares/upload.js";

const projectRouter = Router();

projectRouter.route('/create-project').post(verifyJwt,upload.single("logo"), createProject);
projectRouter.route('/invite-member').post(verifyJwt, inviteMemberInProject);
projectRouter.route('/accept').post(verifyJwt, acceptInvite);
projectRouter.route('/update/:projectId').post(verifyJwt, updateProject);
projectRouter.route('/projects').get(verifyJwt, getProject);
projectRouter.route('/members').get(verifyJwt, getMemberProfile);



export default projectRouter;