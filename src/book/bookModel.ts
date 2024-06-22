import mongoose from "mongoose";
import { IBook } from "./bookTypes";
import { User } from "../user/userModel";

const bookSchema = new mongoose.Schema<IBook>(
    {
        title: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: User,
        },
        genre: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
            required: true,
        },
        file: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const Book = mongoose.model<IBook>("Book", bookSchema);
