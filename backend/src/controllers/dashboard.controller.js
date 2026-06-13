import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id; 
 // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
    const totalVideos = await Video.countDocuments({ owner: userId });

   
    const totalViewsData = await Video.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalViews = totalViewsData[0]?.totalViews || 0;

    
    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    
    const totalLikesData = await Like.aggregate([
    {
        $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "videoData"
        }
    },
    { $unwind: "$videoData" },
    { $match: { "videoData.owner": userId } },
    { $count: "totalLikes" }
]);
    const totalLikes = totalLikesData[0]?.totalLikes || 0;

    res.status(200).json(new ApiResponse(200, {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    }));
});


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.user?._id; 
    if (!channelId) {
        throw new ApiError(401, "Unauthorized - Channel not found");
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: channelId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    { $project: { username: 1, avatar: 1, email: 1 } }
                ]
            }
        },
        { $unwind: "$ownerDetails" },
        {
            $project: {
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                thumbnail: 1,
                owner: "$ownerDetails"
            }
        },
        { $sort: { createdAt: -1 } } 
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

export {
    getChannelStats, 
    getChannelVideos
    }