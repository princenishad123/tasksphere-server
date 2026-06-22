import asyncHander from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import Task from "../models/task.model.js"

export const createTask = asyncHander(async (req, res) => {
    const { title, description, priority, assignedTo, project,sprint } = req.body;
    const createdBy = req.user._id
    if (!title || !project) throw new ApiError(400, "Title and project are required.");

    const newTask = new Task({
      title,
      description,
      priority,
      assignedTo,
      project,
      createdBy,
      sprint,
    });

    await newTask.save();

    res.status(201).json(new ApiResponse(200,newTask,"Task created"));
  
})

export const getTask = asyncHander(async (req, res) => {
  const { sprint } = res.params;

  if (!sprint) throw new ApiError(400, "Task not found");

  const tasks = await Task.find({ sprint });
  if (!tasks) throw new ApiError(400, "No tasks");

  return res.status(200).json(new ApiResponse(200,tasks,"Task fetched"))
})

export const updateTask = asyncHander(async (req, res) => {
  const { task } = req.params;
  const {status,priority,title} = req.body;


  const updateField = {};

  if(priority !== undefined) updateField.priority = priority
  if(status !== undefined) updateField.status = status
  if (title !== undefined) updateField.title = title

  const updatedTask = await Task.updateOne({_id:task},updateField,{new:true})
  
  res.status(200).json(new ApiResponse(200,updatedTask,"Task has been update"))
  
})

export const deleteTask = asyncHander(async (req, res) => {
  const { task } = req.params;


  const deleted = Task.findByIdAndDelete({_id:task})
  
  res.status(200).json(new ApiResponse(200,deleted,"Task has been delete"))
  
})



export const getTaskBySprint = asyncHander(async (req, res) => {
  const { sprint } = req.params;

  if (!sprint) throw new ApiError(400, "Task not found");

  const tasks = await Task.find({ sprint })
  .populate("assignedTo", "name email avatar")  // Replace with actual user fields
  .populate("createdBy", "name email avatar");
  if (!tasks) throw new ApiError(400, "No tasks");

  return res.status(200).json(new ApiResponse(200,tasks,"Task fetched"))
})
