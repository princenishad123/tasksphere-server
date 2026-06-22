
    import mongoose from "mongoose";
    import {config} from "dotenv";
config(); // .env file se DB_URI fetch karega

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed!", error);
    process.exit(1);
  }
};

export default connectDB;
    