import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";

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

export { uploadImageOnCloudinary, uploadPdfOnCloudinary };
// export default cloudinary;
