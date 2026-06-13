import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const content=req.body.content;
    if(!content){
        throw new ApiError(401,"tweet content required")
    }

    const tweet= await Tweet.create({
        content,
        owner:req.user?._id
    })

    if(!tweet){
        throw new ApiError(500,"something went wrong while adding tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet added successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params;

    if(!userId){
        throw new ApiError(400,"Cannot fetch user id")
    }

    const userTweet= await Tweet.find(
        {owner:userId}
    )

    if(!userTweet){
        throw new ApiError(500,"Something went wrong while loading tweets")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,userTweet,"User tweets fetched successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const {tweetId}=req.params;
    if(!tweetId){
        throw new ApiError(401,"tweet not found")
    }

    const content=req.body.content
     if(!content){
        throw new ApiError(401,"tweet content required")
    }

    
    const updatedTweet= await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content
        },
        {new:true}
    )

    if(!updatedTweet){
        throw new ApiError(500,"something went wrong while updating tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedTweet.content,"Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId}=req.params;
    if(!tweetId){
        throw new ApiError(401,"tweet not found")
    }

    
    
    const deletedTweet= await Tweet.findByIdAndDelete(tweetId)

    if(!deletedTweet){
        throw new ApiError(500,"something went wrong while deleting tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,deletedTweet,"Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}