import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
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
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(401,"Cannot fetch video ID")
    }

    const myContent=req.body.content
    console.log("Content ::",myContent)
    

    if(!myContent|| myContent.trim() === ""){
        throw new ApiError(401,"comment content is required")
    }
    const owner=req.user?._id;

    if(!owner){
        throw new ApiError(401,"user data is required")
    }

    const comment=await Comment.create({
        content:myContent,
        video: videoId,
        owner
    })

    if(!comment){
        throw new ApiError(500,"Something went wrong while adding comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,comment,"Comment added successfully"))


})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params;

    if(!commentId){
        throw new ApiError(401,"Somthing went wrong while fetching comment")
    }

    const myContent=req.body.content

    if(!myContent||myContent.trim()===""){
        throw new ApiError(401,"Comment content is required")
    }

    const updateComment=await Comment.findByIdAndUpdate(
        commentId,
        {
            content:myContent
        },
        {
            new:true
        }
    )

    if(!updateComment){
        throw new ApiError(500,"Something went wrong while updating content")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updateComment,"Comment updated successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params

    if(!commentId){
        throw new ApiError(401,"Somthing went wrong while fetching comment")
    }

    const deleteComment=await Comment.findByIdAndDelete(commentId)
     if(!deleteComment){
        throw new ApiError(500,"Something went wrong while deleting content")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,deleteComment,"Comment deleted successfully"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }