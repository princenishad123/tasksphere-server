import Project from "../models/project.model.js";
import Sprint from "../models/sprint.schema.js";
import Task from "../models/task.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

export const dashboardAnalys = asyncHandler(async (req, res) => {
    const { id: projectId } = req.params;
const id = new mongoose.Types.ObjectId(projectId);
 
    
    
       // Check if project exists
    const projectExists = await Project.findById(id);
    if (!projectExists) {
        throw new ApiError(404, "Project not found");
    }

    // Execute all analytics queries in parallel
    const [
        totalSprints,
        totalTasks,
        tasksByStatus,
        tasksByPriority,
        sprintsWithStats,
        tasksWithoutSprints,
        overdueSprints
    ] = await Promise.all([
        // Total sprints in project
        Sprint.countDocuments({ project: id }),

        // Total tasks in project
        Task.countDocuments({ project: id }),

        // Tasks grouped by status - CORRECTED AGGREGATION
        Task.aggregate([
            { $match: { project: id } },
            { 
                $group: { 
                    _id: null,
                    todo: { 
                        $sum: { 
                            $cond: [{ $eq: ["$status", "todo"] }, 1, 0] 
                        } 
                    },
                    inProgress: { 
                        $sum: { 
                            $cond: [{ $eq: ["$status", "In progress"] }, 1, 0] 
                        } 
                    },
                    inReview: { 
                        $sum: { 
                            $cond: [{ $eq: ["$status", "In review"] }, 1, 0] 
                        } 
                    },
                    completed: { 
                        $sum: { 
                            $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] 
                        } 
                    }
                } 
            }
        ]),

        // Tasks grouped by priority
        Task.aggregate([
            { $match: { project: id } },
            { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]),

        // Sprints with task statistics
        Sprint.aggregate([
            { $match: { project: id } },
            {
                $lookup: {
                    from: "tasks",
                    localField: "_id",
                    foreignField: "sprint",
                    as: "tasks"
                }
            },
            {
                $project: {
                    name: 1,
                    dueDate: 1,
                    totalTasks: { $size: "$tasks" },
                    completedTasks: {
                        $size: {
                            $filter: {
                                input: "$tasks",
                                as: "task",
                                cond: { $eq: ["$$task.status", "Completed"] }
                            }
                        }
                    },
                    inProgressTasks: {
                        $size: {
                            $filter: {
                                input: "$tasks",
                                as: "task",
                                cond: { $eq: ["$$task.status", "In progress"] }
                            }
                        }
                    },
                    inReviewTasks: {
                        $size: {
                            $filter: {
                                input: "$tasks",
                                as: "task",
                                cond: { $eq: ["$$task.status", "In review"] }
                            }
                        }
                    },
                    todoTasks: {
                        $size: {
                            $filter: {
                                input: "$tasks",
                                as: "task",
                                cond: { $eq: ["$$task.status", "todo"] }
                            }
                        }
                    }
                }
            }
        ]),

        // Tasks not assigned to any sprint
        Task.countDocuments({ project: id, sprint: { $exists: false } }),

        // Overdue sprints
        Sprint.countDocuments({ 
            project: id, 
            dueDate: { $lt: new Date() } 
        })
    ]);

    // Extract status counts from the aggregation result
    const statusCounts = tasksByStatus[0] || {
        todo: 0,
        inProgress: 0,
        inReview: 0,
        completed: 0
    };

    // Transform tasksByPriority into a more usable format
    const priorityStats = tasksByPriority.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
    }, {});

    // Prepare the response object
    const projectAnalytics = {
        overview: {
            totalSprints,
            totalTasks,
            tasksWithoutSprints,
            overdueSprints,
            completionPercentage: totalTasks > 0
                ? Math.round((statusCounts.completed / totalTasks) * 100)
                : 0
        },
        taskStatus: {
            completed: statusCounts.completed,
            inProgress: statusCounts.inProgress,
            inReview: statusCounts.inReview,
            todo: statusCounts.todo
        },
        taskPriority: priorityStats,
       
    };




    return res.status(200).json(new ApiResponse(200,projectAnalytics,"Fetched analytics"))
});