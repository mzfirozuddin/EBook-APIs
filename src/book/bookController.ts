import { NextFunction, Request, Response } from "express";
import {
    uploadImageOnCloudinary,
    uploadPdfOnCloudinary,
} from "../config/cloudinary";
import createHttpError from "http-errors";
import { Book } from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;

    // console.log("Files", req.files);
    //: Given type to req.files
    const files = req.files as { [fieldName: string]: Express.Multer.File[] };

    //: we have to make coverImageMimeType, fileName, filePath if file exist
    //? Handle coverImage
    let coverImageMimeType;
    let coverImageFileName;
    let coverImageFilePath;
    if (
        files &&
        Array.isArray(files.coverImage) &&
        files.coverImage.length > 0
    ) {
        // mimetype = "images/png" => But we need only "png". Thats why we split the string
        coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
        coverImageFileName = files.coverImage[0].filename;
        coverImageFilePath = files.coverImage[0].path;
    }

    if (!coverImageFilePath) {
        return next(createHttpError(400, "Book CoverImage is required!"));
    }

    //? Handle book pdf file
    let bookFileName;
    let bookFilePath;
    if (files && Array.isArray(files.file) && files.file.length > 0) {
        bookFileName = files.file[0].filename;
        bookFilePath = files.file[0].path;
    }

    if (!bookFilePath) {
        return next(createHttpError(400, "Book pdf is required!"));
    }

    //: Upload coverImage on cloudinary
    const uploadCoverImageResult = await uploadImageOnCloudinary(
        coverImageFilePath,
        coverImageFileName as string,
        coverImageMimeType as string
    );

    if (!uploadCoverImageResult) {
        return next(createHttpError(500, "Error while uploading the file!"));
    }

    //: Upload pdf book on cloudinary
    const uploadPdfBookResult = await uploadPdfOnCloudinary(
        bookFilePath,
        bookFileName as string,
        "pdf"
    );

    if (!uploadPdfBookResult) {
        return next(createHttpError(500, "Error while uploading the file!"));
    }

    // console.log("uploadCoverImageResult", uploadCoverImageResult);
    // console.log("uploadPdfBookResult", uploadPdfBookResult);

    // @ts-ignore
    // console.log("userId: ", req.userId);

    const _req = req as AuthRequest;
    try {
        //: Create book entry in DB
        const newBook = await Book.create({
            title,
            genre,
            author: _req.userId,
            coverImage: uploadCoverImageResult.secure_url,
            file: uploadPdfBookResult.secure_url,
        });

        res.status(201).json({
            id: newBook._id,
            msg: "Book created successfully.",
        });
    } catch (err) {
        return next(
            createHttpError(500, "Error while create book entry in DB!")
        );
    }
};

export { createBook };
