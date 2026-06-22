import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
import cron from "node-cron";
import axios from "axios";
import bodyParser from "body-parser";
import connectDB from "./db/db.js"
import errorHandler from "./utils/errorHandler.js";
import authRouter from "./routes/auth.route.js";
import projectRouter from "./routes/project.route.js";
import sprintRouter from "./routes/sprint.route.js";
import taskRouter from "./routes/task.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
// Load environment variables
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cookieParser())
app.use(express.json({limit:"16kb"}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin:process.env.NODE_ENV === "production" ? "https://tasksphere-p5e5.vercel.app" : "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials:true
}));


// Sample Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status:"running",
    message: "Server is running",
    timestamp: new Date(),
  });
});

app.use("/api/v1/auth", authRouter)
app.use("/api/v1", projectRouter)
app.use("/api/v1",sprintRouter)
app.use("/api/v1/task",taskRouter)
app.use("/api/v1",dashboardRouter)


cron.schedule("*/12 * * * *", async () => {
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/health`);

  } catch (error) {
    console.error("Ping Failed:", error);
  }
});

app.use(errorHandler)

// Start Server
app.listen(PORT, async () => {
  await connectDB();
  console.log("Server running on 5000"); 
});

