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

        return response;
    } catch (err) {
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

        return response;
    } catch (err) {
        console.log("Error while uploading pdf on cloudinary", err);
        return null;
    }
};

export { uploadImageOnCloudinary, uploadPdfOnCloudinary };
// export default cloudinary;
