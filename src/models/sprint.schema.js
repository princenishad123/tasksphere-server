import mongoose from "mongoose";

const SprintSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: [100, 'Sprint name cannot exceed 100 characters']
    },
    project: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Project", 
      required: true 
    },
    dueDate: { 
      type: String,
      required: true
    },
    tasks: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Task" 
    }],
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
  },
  { 
    timestamps: true 
  }
);

// Add compound index
SprintSchema.index({ project: 1, dueDate: 1 });

// Create the model
const Sprint = mongoose.model("Sprint", SprintSchema);

export default Sprint;