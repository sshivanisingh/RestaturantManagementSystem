import dotenv from "dotenv";
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    console.log("MONGODB Connected Successfully!");

    // One-time cleanup: drop stale unique indexes left over from old schemas.
    const dropStaleIndex = async (collection, indexName) => {
      try {
        await connection.connection.collection(collection).dropIndex(indexName);

        console.log(`Dropped stale index ${collection}.${indexName}`);
      } catch (error) {
        // Index doesn't exist — that's okay.
        if (error?.codeName !== "IndexNotFound" && error?.code !== 27) {
          console.warn(
            `Could not drop ${collection}.${indexName}:`,
            error.message,
          );
        }
      }
    };

    await dropStaleIndex("inventories", "menuItemId_1");
    await dropStaleIndex("users", "phone_1");

    return connection;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error(error);

    throw new ApiError(500, "Database connection failed", [], error.stack);
  }
};

export default connectDB;
