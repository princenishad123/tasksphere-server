import Project from "../models/project.model.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js";
import { inviteMember, verifyJwtToken } from "../lib/jwt.js";
import { transporter } from "../utils/transporter.js";
import User from "../models/user.model.js";

// create a project
export const createProject = asyncHandler(async (req, res) => {
   
    const { name, description } = req.body;
  
    if (!name) throw new ApiError(400, "Name is required !");
    if (!description) throw new ApiError(400, "Description is required !");
    if (!req.file) throw new ApiError(400, "Please add comapny logo");
    const { _id } = req.user;
   
    const logo = req.file.path;
    const project = await Project.create({ name, description, createdBy: _id ,logo});
    if (!project) throw new ApiError(400, "Fail to create project")
    
    res.status(200).json(new ApiResponse(200, project, "Project Created"))
});

export const getProject = asyncHandler(async (req, res) => {
    const userId = req.user._id
     const projects = await Project.find({
      $or: [{ members: userId }, { createdBy: userId }]
     });
    
    if (!projects) throw new ApiError(404, "Projects");

    res.status(200).json(new ApiResponse(200,projects,"projects fetched"))
})



export const updateProject = asyncHandler(async (req, res) => {
    const { name, status, description } = req.body;
    const { projectId } = req.params;
    if (!projectId) throw new ApiError(400, "Invalid Project")
    
    const updateField = {};

    if (name !== undefined) updateField.name = name;
    if (status !== undefined) updateField.status = status;
    if (description !== undefined) updateField.description = description;
   

    const project = await Project.findByIdAndUpdate({_id:projectId},updateField,{new:true})
    if (!project) throw new ApiError(400, "Fail to update project")
    
    res.status(200).json(new ApiResponse(200, project, "Project update"))
});

// invite member
export const inviteMemberInProject = asyncHandler(async (req,res) => {
    const { projectId, email } = req.body;

    if (!email) throw new ApiError(400, "Please enter email")
    
    const project = await Project.findById({_id:projectId})
     const {username} = req.user
    const inviteToken = inviteMember(projectId, email);

    const inviteLink = `${process.env.CLIENT_URL}/invite?token=${inviteToken}`
   const mailOptions = {
        from: process.env.EMAIL_SEND_USER,
        to: email,
        subject: `[] @${username} has invited you to join the ${project.name} `,
        html:`<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; 
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); text-align: center;">
            <img src="${project.logo || "https://cdn-icons-png.flaticon.com/512/732/732200.png"}" 
                 alt="Logo" style="width: 80px; margin-bottom: 20px;">
            <h2 style="color: #333;">Invitation</h2>
            <p style="color: #666; font-size: 16px;">
               Please click the button below to accept invite. Valid for 5 Days</p>
            <a href="${inviteLink}" 
               style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; 
                      background: #007bff; text-decoration: none; border-radius: 5px; font-weight: bold; 
                      margin-top: 20px;">Accept Invite</a>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">If you not Interested You can ignore this mail.</p>
        </div>
    </div>`
    }

     try {
       
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new ApiError(400,"Something went wrong...")
            }

            res.status(200).json(new ApiResponse(200,`Invite has been sent ${email}`))
        })
    } catch (error) {
        throw new ApiError(400,"server error",)
    }
  
    
})
// accept Invite and verify
export const acceptInvite = asyncHandler(async (req, res) => {
    const { token } = req.query;
   
    if (!token) throw new ApiError(400, "Invalid or missing invitation link");

    // Decode and verify token
    const decoded = verifyJwtToken(token);
    if (!decoded) throw new ApiError(400, "Invitation link has expired or is invalid");

    // Ensure user is logged in
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Unauthorized. Please log in to accept the invitation");

    // Find the project
    const project = await Project.findById(decoded.projectId);
    if (!project) throw new ApiError(404, "Project not found");

    // Check if the user is already a member
    const isAlreadyMember = project.members.some(member => member._id.toString() === userId.toString());
    if (isAlreadyMember) throw new ApiError(400, "You are already a member of this project");

    // Add the user to the project's members array
    project.members.push({ _id: userId}); // Assuming each member is an object
    await project.save();

    res.status(200).json(new ApiResponse(200, project, "You have successfully joined the project"));
});


export const getMemberProfile = asyncHandler(async (req, res) => {
    const { projectId } = req.params;


if (!projectId) throw new ApiError(400, "Please provide Projects ID")
const members = await ProjectModel.findById(projectId).populate("members");
    
    if (!members) throw new ApiError(404, "members not found")
    
    return res.status(200).json(new ApiResponse(200, members, "members fetched", true));
    
    })






