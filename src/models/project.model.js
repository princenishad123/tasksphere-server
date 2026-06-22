import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    logo: { type: String },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    team: [ { type: mongoose.Schema.Types.ObjectId, ref: "Team" }], // Optional, if project is within a team
    members: [{
      type: mongoose.Schema.Types.ObjectId, ref: "User",
     

    },  
      ], // Project contributors
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
