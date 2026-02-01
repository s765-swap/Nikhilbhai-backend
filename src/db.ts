import mongoose from "mongoose";
import { config } from "./config";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongodbUri);
  // Keep it simple: rely on mongoose connection pooling.
}

