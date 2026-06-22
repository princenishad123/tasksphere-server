import { Router } from "express"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import { createSprint, deleteSprint, findSprint } from "../controllers/sprint.controller.js";
const sprintRouter = Router();

sprintRouter.route("/create-sprint").post(verifyJwt,createSprint)
sprintRouter.route("/sprints/:project").get(verifyJwt,findSprint)
sprintRouter.route("/delete/:id").get(verifyJwt,deleteSprint)

export default sprintRouter



