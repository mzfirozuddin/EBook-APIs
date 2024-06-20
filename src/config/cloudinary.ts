import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";
import createHttpError from "http-errors";

// Configuration
cloudinary.config({
    cloud_name: config.cloudinaryCloud,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
});

const uploadImageOnCloudinary = async (
    filePath: string,
    fileName: string,
    fileMimeType: string
) => {
    try {
        if (!filePath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: fileMimeType,
        });

        // Delete file from local
        await fs.promises.unlink(filePath);

        return response;
    } catch (err) {
        // Delete file from local if there is any issue when uploading
        fs.unlinkSync(filePath);

        console.log("Error while uploading image on cloudinary", err);
        return null;
    }
};

const uploadPdfOnCloudinary = async (
    filePath: string,
    fileName: string,
    fileMimeType: string
) => {
    try {
        if (!filePath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "raw",
            filename_override: fileName,
            folder: "book-pdfs",
            format: fileMimeType,
        });

        // Delete file from local
        await fs.promises.unlink(filePath);

        return response;
    } catch (err) {
        // Delete file from local
        fs.unlinkSync(filePath);

        console.log("Error while uploading pdf on cloudinary", err);
        return null;
    }
};

const deleteImageFromCloudinary = async (imagePublicId: string) => {
    try {
        if (!imagePublicId) {
            const error = createHttpError(404, "Image public Id is required!");
            throw error;
        }

        await cloudinary.uploader.destroy(imagePublicId);
    } catch (err) {
        console.log("Error while deleting image from cloudinary", err);
        const error = createHttpError(
            500,
            "Error while deleting image from cloudinary!"
        );
        throw error;
    }
};

const deletePdfFromCloudinary = async (pdfPublicId: string) => {
    try {
        if (!pdfPublicId) {
            const error = createHttpError(404, "Pdf public Id is required!");
            throw error;
        }

        await cloudinary.uploader.destroy(pdfPublicId, {
            resource_type: "raw",
        });
    } catch (err) {
        console.log("Error while deleting pdf from cloudinary", err);
        const error = createHttpError(
            500,
            "Error while deleting pdf from cloudinary!"
        );
        throw error;
    }
};

export {
    uploadImageOnCloudinary,
    uploadPdfOnCloudinary,
    deleteImageFromCloudinary,
    deletePdfFromCloudinary,
};
// export default cloudinary;
