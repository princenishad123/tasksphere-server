import mongoose from "mongoose";
import bcrypt from "bcrypt"
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String }, // Profile image URL
    role: {
      type: String,
      enum: ["admin", "manager", "developer", "tester", "user"],
      default: "user",
    },
    skills: [], // Teams user belongs to
   
   
    isVerified: { type: Boolean, default: false }, // Email verification
    refreshToken: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save",async function (next) {
  if (!this.isModified("password")) return next();
  this.password =await bcrypt.hash(this.password, 10);
  next();
})

const User = mongoose.model("User", userSchema);
export default User;
  