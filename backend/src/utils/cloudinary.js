import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file uploded succefully

    await fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    await fs.unlinkSync(localFilePath); // remove the lacally save temp file as the upload operation get failed
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
    const response = await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
      },
      function (error, result) {
        console.log(result, error);
      }
    );

    return response;
  } catch (error) {
    throw new ApiError(500, "Cloudinary deletion failed: " + error.message);
  }
};

export { uploadOnCloudinary, deleteSingleAssetfromCloudinary };
