import { Router } from "express";
import { dashboardAnalys } from "../controllers/dashboard.conroller.js";
const dashboardRouter = Router();

dashboardRouter.route("/dashboard-status/:id").get(dashboardAnalys)


export default dashboardRouter;