import { NextFunction, Request, Response } from "express";
import {
    uploadImageOnCloudinary,
    uploadPdfOnCloudinary,
} from "../config/cloudinary";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
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

    res.json({ msg: "OK" });
};

export { createBook };
