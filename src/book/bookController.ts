import { NextFunction, Request, Response } from "express";
import {
    deleteImageFromCloudinary,
    deletePdfFromCloudinary,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;
    const bookId = req.params.bookId;

    try {
        //: Check book present in DB or not
        const book = await Book.findOne({ _id: bookId });
        if (!book) {
            return next(createHttpError(404, "Book not found!"));
        }

        //: Check Access
        const _req = req as AuthRequest;
        if (book.author.toString() !== _req.userId) {
            return next(
                createHttpError(
                    403,
                    "Unauthorized access! You can not update others book."
                )
            );
        }

        //: Given type to req.files
        const files = req.files as {
            [fieldName: string]: Express.Multer.File[];
        };

        //? Handle coverImage
        let coverImageCloudUrl = "";
        if (
            files &&
            Array.isArray(files.coverImage) &&
            files.coverImage.length > 0
        ) {
            // mimetype = "images/png" => But we need only "png". Thats why we split the string
            const coverImageMimeType = files.coverImage[0].mimetype
                .split("/")
                .at(-1);
            const coverImageFileName = files.coverImage[0].filename;
            const coverImageFilePath = files.coverImage[0].path;

            //: Upload coverImage on cloudinary
            const uploadCoverImageResult = await uploadImageOnCloudinary(
                coverImageFilePath,
                coverImageFileName as string,
                coverImageMimeType as string
            );

            if (!uploadCoverImageResult) {
                return next(
                    createHttpError(500, "Error while uploading the file!")
                );
            }

            coverImageCloudUrl = uploadCoverImageResult?.secure_url;

            //: Delete existing coverImage from cloudinary
            //? Handle coverImage
            const coverImageFileSplit = book.coverImage.split("/");
            const coverImagePublicId =
                coverImageFileSplit.at(-2) +
                "/" +
                coverImageFileSplit.at(-1)?.split(".").at(-2);

            await deleteImageFromCloudinary(coverImagePublicId);
        }

        //? Handle book pdf file
        let bookPdfCloudUrl = "";
        if (files && Array.isArray(files.file) && files.file.length > 0) {
            const bookFileName = files.file[0].filename;
            const bookFilePath = files.file[0].path;

            //: Upload pdf book on cloudinary
            const uploadPdfBookResult = await uploadPdfOnCloudinary(
                bookFilePath,
                bookFileName as string,
                "pdf"
            );

            if (!uploadPdfBookResult) {
                return next(
                    createHttpError(500, "Error while uploading the file!")
                );
            }

            bookPdfCloudUrl = uploadPdfBookResult.secure_url;

            //: Delete existing book pdf from cloudinary
            //? Handle book pdf file
            const bookPdfFileSplit = book.file.split("/");
            const bookPdfPublicId =
                bookPdfFileSplit.at(-2) + "/" + bookPdfFileSplit.at(-1);

            await deletePdfFromCloudinary(bookPdfPublicId);
        }

        const updatedBook = await Book.findByIdAndUpdate(
            { _id: bookId },
            {
                title: title,
                genre: genre,
                coverImage: coverImageCloudUrl
                    ? coverImageCloudUrl
                    : book.coverImage,
                file: bookPdfCloudUrl ? bookPdfCloudUrl : book.file,
            },
            { new: true }
        );

        res.status(200).json({
            data: updatedBook,
            message: "Book updated successfully.",
        });
    } catch (err) {
        return next(createHttpError(500, "Error While updateing the book!"));
    }
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // TODO: Add pagination
        const books = await Book.find();
        if (!books) {
            return next(createHttpError(400, "No book exists!"));
        }

        res.status(200).json(books);
    } catch (err) {
        return next(createHttpError(500, "Error while getting books!"));
    }
};

const getSingleBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const bookId = req.params.bookId;

    try {
        const book = await Book.findOne({ _id: bookId });
        if (!book) {
            return next(createHttpError(404, "Book not found!"));
        }

        res.status(200).json(book);
    } catch (err) {
        return next(createHttpError(500, "Error while getting book!"));
    }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;

    try {
        //: Check book is present or not
        const book = await Book.findOne({ _id: bookId });
        if (!book) {
            return next(createHttpError(404, "Book not found!"));
        }

        //: Check Access
        const _req = req as AuthRequest;
        if (book.author.toString() !== _req.userId) {
            return next(
                createHttpError(
                    403,
                    "Unauthorized access! You can not delete others book."
                )
            );
        }

        //: Now we have to delete files from Cloudinary
        // For deleting files from cloudinary we have to provide publicId of asset.
        // publicId => book-covers/otob0ocrvsrz3ymr90c3
        // Url => https://res.cloudinary.com/drqredubp/image/upload/v1718822912/book-covers/otob0ocrvsrz3ymr90c3.png
        //? Handle coverImage
        const coverImageFileSplit = book.coverImage.split("/");
        const coverImagePublicId =
            coverImageFileSplit.at(-2) +
            "/" +
            coverImageFileSplit.at(-1)?.split(".").at(-2);
        // console.log("coverImagePublicId: ", coverImagePublicId);

        //? Handle book pdf file
        const bookPdfFileSplit = book.file.split("/");
        const bookPdfPublicId =
            bookPdfFileSplit.at(-2) + "/" + bookPdfFileSplit.at(-1);
        // console.log("bookPdfPublicId: ", bookPdfPublicId);

        //: Delete CoverImage and Book pdf from cloudinary
        await deleteImageFromCloudinary(coverImagePublicId);
        await deletePdfFromCloudinary(bookPdfPublicId);

        //: Delete book entry from DB
        await Book.deleteOne({ _id: bookId });

        res.sendStatus(204); // 204 for no response
    } catch (err) {
        return next(createHttpError(500, "Error while delete the book!"));
    }
};

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
