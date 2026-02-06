import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ai_doubt_solver");
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error", error);
    process.exit(1);
  }
};

export default connectMongo;
