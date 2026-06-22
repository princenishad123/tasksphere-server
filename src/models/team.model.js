import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String }, // Optional team description
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Team creator
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of team members
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }], // Associated projects
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;
