import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(401,"cannot fetch video detilas")
    }

    const userId = req.user?._id; 
    if (!userId) {
        throw new ApiError(401, "User must be logged in to like a video");
    }

    const existingLike =await Like.findOne(
        {video:videoId,likedBy:userId}
    )

   if (existingLike) {
        const toggleLike=await Like.findByIdAndDelete(existingLike._id);

        if(!toggleLike){
            throw new ApiError(500,"Something went wrong while disliking video")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, toggleLike, "Video unliked successfully"));
    } else {
        const newLike = await Like.create({
            video: videoId,
            likedBy: userId
        });

         if(!newLike){
            throw new ApiError(500,"Something went wrong while adding video like")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Video liked successfully"));
    }


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

     if(!commentId){
        throw new ApiError(401,"cannot fetch comment detilas")
    }

    const userId = req.user?._id; 
    if (!userId) {
        throw new ApiError(401, "User must be logged in to like a video");
    }

    const existingLike =await Like.findOne(
        {comment:commentId,likedBy:userId}
    )

   if (existingLike) {
        const toggleComment=await Like.findByIdAndDelete(existingLike._id);

        if(!toggleComment){
            throw new ApiError(500,"Something went wrong while disliking comment")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, toggleComment, "Comment unliked successfully"));
    } else {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: userId
        });

         if(!newLike){
            throw new ApiError(500,"Something went wrong while adding comment like")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Comment liked successfully"));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        throw new ApiError(401,"cannot fetch video detilas")
    }

    const userId = req.user?._id; // assuming you have authentication middleware
    if (!userId) {
        throw new ApiError(401, "User must be logged in to like a video");
    }



    const existingLike =await Like.findOne(
        {tweet:tweetId,likedBy:userId}
    )

   if (existingLike) {
        const toggleLike=await Like.findByIdAndDelete(existingLike._id);

        if(!toggleLike){
            throw new ApiError(500,"Something went wrong while disliking tweet")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, toggleLike, "Tweet unliked successfully"));
    } else {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: userId
        });

         if(!newLike){
            throw new ApiError(500,"Something went wrong while adding tweet like")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, newLike, "Tweet liked successfully"));
    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const userId=req.user?._id;
      if (!userId) {
        throw new ApiError(401, "User must be logged in to view liked videos");
    }

    const likedVideos=await Like.find({
        likedBy:userId,
        video:{$ne:null}
    })
    .populate("video") 
    .sort({ createdAt: -1 });

    if(!likedVideos){
        throw new ApiError(500,"Something went wrong while fetchig videos")
    }

     return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}