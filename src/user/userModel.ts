import mongoose from "mongoose";
import { IUser } from "./userTypes";

const userSchema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
