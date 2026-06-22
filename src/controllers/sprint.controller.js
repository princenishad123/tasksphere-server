import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Sprint from "../models/sprint.schema.js";
import mongoose from "mongoose";

export const createSprint = asyncHandler(async (req, res) => {
    let {project, name, dueDate } = req.body;
    const createdBy = req.user._id;
    if (!name) throw new ApiError(400, "Please enter sprint name");
    if (!dueDate) throw new ApiError(400, "Select date");
    name = `${name} - (${dueDate})`
    const newSprint = new Sprint({name, dueDate, project, createdBy});
    await newSprint.save();

    if(!newSprint) throw new ApiError(400,"failed to create sprint")

    return res.status(200).json(new ApiResponse(200,newSprint,"Sprint created "))

})

export const updateSprint = asyncHandler(async (req, res) => {
    const { sprintId } = req.params;
    if (!sprintId) throw new ApiError(400, "Sprint missing");
    const { name, date:dueDate } = req.body;
    const sprint = await Sprint.findByIdAndUpdate({_id:sprintId},{name,dueDate},{new:true})
    
    res.status(200).json(new ApiResponse(200,sprint,"sprint update"))
})

export const findSprint = asyncHandler(async (req,res) => {
    const { project } = req.params;


  const projectId = new mongoose.Types.ObjectId(project); // Ensure ObjectId

const sprints = await Sprint.aggregate([
  { $match: { project: projectId } }, // ✅ Filter by project ID

  // 🔍 Fetch Sprint Creator Details
  {
    $lookup: {
      from: "users",
      localField: "createdBy",
      foreignField: "_id",
      as: "createdBy",
    },
  },
  { $unwind: "$createdBy" }, // ✅ Convert createdBy array to object

  {
    $group: {
      _id: "$project", // ✅ Group by project (to avoid duplication)
      project: { $first: "$project" }, // ✅ Store project only once
      sprints: {
        $push: {
          _id: "$_id",
          name: "$name",
          dueDate: "$dueDate",
          createdAt: "$createdAt",
          createdBy: {
            _id: "$createdBy._id",
            name: "$createdBy.name",
            email: "$createdBy.email",
          },
        },
      },
    },
  },

  // 🔍 Fetch Project Details (including members)
  {
    $lookup: {
      from: "projects",
      localField: "project",
      foreignField: "_id",
      as: "project",
    },
  },
  { $unwind: "$project" }, // ✅ Convert project array to object

  // 🔍 Fetch Project Members Details
  {
    $lookup: {
      from: "users",
      localField: "project.members", // ✅ Fetch members using project.members IDs
      foreignField: "_id",
      as: "members",
    },
  },

  // 🔍 Select only required fields for project members
  {
    $project: {
      _id: 0,
      project: {
        _id: "$project._id",
        name: "$project.name",
        description: "$project.description",
        logo: "$project.logo",
      },
      members: {
        $map: {
          input: "$members",
          as: "member",
          in: {
            _id: "$$member._id", // User ID
            name: "$$member.name", // User Name
            email: "$$member.email", // User Email
            username: "$$member.username", // User Username
            avatar: "$$member.avatar", // User Avatar
          },
        },
      },
      sprints: 1, // ✅ Include sprints
    },
  },
]);



    if (!sprints) throw new ApiError(404, "No Sprints")
    
    return res.status(200).json(new ApiResponse(200,sprints[0],"sprints fetched"))
  
})

export const deleteSprint = asyncHandler(async (req,res) => {
    const { id } = req.params;
    
    const sprints = await Sprint.findByIdAndDelete({_id:id})

    if (!sprints) throw new ApiError(404, "No Sprints")
    
    res.status(200).json(new ApiResponse(200,sprints,"sprints deleted"))
  
})

