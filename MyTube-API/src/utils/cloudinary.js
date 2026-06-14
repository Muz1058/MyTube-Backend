import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});
const safeUnlink = (filePath) => {
  try {
    const normalized = path.resolve(filePath);
    if (normalized && fs.existsSync(normalized)) {
      fs.unlinkSync(normalized);
    }
  } catch (err) {
    console.warn("Could not delete temp file:", filePath, err.message);
  }
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const normalizedPath = path.resolve(localFilePath);

    const response = await cloudinary.uploader.upload(normalizedPath, {
      resource_type: "auto",
    });

    safeUnlink(normalizedPath);

    return response;
  } catch (error) {
    safeUnlink(localFilePath);
    console.error("Cloudinary upload failed:", error.message);
    return null;
  }
};

const deleteSingleAssetfromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  if (!publicId || !resourceType) {
    throw new ApiError(500, "Something went wrong while deleting the asset");
  }

  try {
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return response;
  } catch (error) {
    throw new ApiError(500, "Cloudinary deletion failed: " + error.message);
  }
};


export { uploadOnCloudinary, deleteSingleAssetfromCloudinary };
