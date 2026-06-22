import { Router } from "express"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import { createTask, getTaskBySprint, updateTask } from "../controllers/task.controller.js";

const taskRouter = Router();

taskRouter.route("/create-task").post(verifyJwt,createTask);
taskRouter.route("/update/:task").put(verifyJwt,updateTask);
taskRouter.route("/get-tasks/:sprint").post(verifyJwt,updateTask);
taskRouter.route("/tasks/:sprint").get(verifyJwt,getTaskBySprint);

export default taskRouter