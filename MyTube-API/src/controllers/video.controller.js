import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteSingleAssetfromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"

const extractPublicId = (cloudinaryUrl) => {
  try {
    const parts = cloudinaryUrl.split("/upload/");
    if (parts.length < 2) return null;

    const pathWithVersion = parts[1]; // e.g., v1234567890/user-covers/cover_abc123.jpg
    const pathParts = pathWithVersion.split("/");
    pathParts.shift(); // remove "v1234567890"

    const filename = pathParts.pop(); // cover_abc123.jpg
    const fileWithoutExt = filename.split(".")[0]; // cover_abc123

    return [...pathParts, fileWithoutExt].join("/");
  } catch (err) {
    console.error("Failed to extract public_id:", err);
    return null;
  }
};
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const matchStage = {
        isPublished: true
    }

    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    const sortStage = {}
    sortStage[sortBy] = sortType === "asc" ? 1 : -1

    const videos = await Video.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, avatar: 1, fullName: 1 } }
                ]
            }
        },
        { $unwind: "$owner" },
        { $sort: sortStage },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description,isPublished=true} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title||!description){
        throw new ApiError("401","Vidoe title and description required")
    }

    //const videoLocalPath=req.file?.path;

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoLocalPath){
        throw new ApiError(401,"Video file required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(401,"Video file required")
    }

    const video=await uploadOnCloudinary(videoLocalPath)
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)

    if(!video){
        throw new ApiError(500,"Something went wrong while video uploading")
    }
    if(!thumbnail){
        throw new ApiError(500,"Something went wrong while thumbnail uploading")
    }

    const videoUrl=video.url;
    const duration=video.duration;
    const owner=req.user?._id;
    const thumbnailUrl=thumbnail.url;
    
    if(!owner){
      throw new ApiError(401,"unable to fetch user data")
    }

    const saveVideo= await Video.create({
        videoFile:videoUrl,
        thumbnail:thumbnailUrl,       
        title,
        description,
        duration,
        isPublished,
        owner}
    )

    if(!saveVideo){
        throw new ApiError(500,"Something went wrong while video uploading")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,saveVideo,"Video uploded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"Video ID required")
    }
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views: 1 }
        },
        { new: true }
    ).populate("owner", "username fullName avatar email");

    if(!video){
        throw new ApiError(404, "Video does not exist")
    }

    const likesCount = await Like.countDocuments({ video: videoId });
    const isLiked = req.user?._id ? (await Like.exists({ video: videoId, likedBy: req.user._id })) !== null : false;

    if (req.user?._id) {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $addToSet: { watchHistory: videoId }
            }
        );
    }

    const videoData = video.toObject();
    videoData.likesCount = likesCount;
    videoData.isLiked = isLiked;

    return res
    .status(200)
    .json(new ApiResponse(200, videoData, "Video fetched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!videoId){
        throw new ApiError(400,"VideoID not found")
    }

    const existingVideo = await Video.findById(videoId);
      if (!existingVideo) {
        throw new ApiError(404, "Video not found");
      }
      if (existingVideo.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
      }

    const { title, description,isPublished=true} = req.body

    if(!title||!description){
        throw new ApiError("401","Vidoe title and description required")
    }
    const videoBeforeUpdate=await Video.findById(videoId);
    const toBeDeletedThumbnailUrl=videoBeforeUpdate.thumbnail;

    const thumbnailLocalPath = req.file?.path;

    if(!thumbnailLocalPath){
        throw new ApiError(401,"old thumbnail file not found")
    }

    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(500,"Something went wrong while thumbnail uploading")
    }

    const thumbnailUrl=thumbnail.url;
    
    

    const updatedVideo= await Video.findByIdAndUpdate(
        videoId,
        {
        thumbnail:thumbnailUrl,       
        title,
        description,
        isPublished,
        },
        {
            new:true
        }
    )

    if(toBeDeletedThumbnailUrl){
        const response=await deleteSingleAssetfromCloudinary(extractPublicId(toBeDeletedThumbnailUrl),"image")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedVideo ,"Video updated successfully"))


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId){
        throw new ApiError(401,"Video ID not found")
    }
    const video = await Video.findById(videoId);
    if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

    const deleteVideo=await Video.findByIdAndDelete(videoId)

    if(!deleteVideo){
        throw new ApiError(501,"Something went wrong while video deletion")
    }

    await deleteSingleAssetfromCloudinary(extractPublicId(deleteVideo.videoFile),"video")
    await deleteSingleAssetfromCloudinary(extractPublicId(deleteVideo.thumbnail),"image")

    return res
    .status(200)
    .json(new ApiResponse(200,deleteVideo ,"Video deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID not found");
    }

    
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        [
            {
                $set: {
                    isPublished: { $not: "$isPublished" }
                }
            }
        ],
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Something went wrong while toggling publish status");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Publish status toggled successfully"));
});
export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}