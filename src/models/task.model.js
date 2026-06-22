import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "In progress", "In review", "Completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "low",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assigned user
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }, // Task belongs to a project

    createdBy: {
      type: mongoose.Schema.Types.ObjectId, ref: "User" 
    },
    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Sprint"
    }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
