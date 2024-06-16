import mongoose from "mongoose";
import { config } from "../config/config";
import { DB_NAME } from "../constant";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Database connected successfully.");
        });

        mongoose.connection.on("error", (err) => {
            console.log("Error in connecting to database.", err);
        });
        await mongoose.connect(`${config.databaseUrl}/${DB_NAME}`);
    } catch (err) {
        console.error("Failed to connect to database!", err);
        process.exit(1);
    }
};

export default connectDB;
