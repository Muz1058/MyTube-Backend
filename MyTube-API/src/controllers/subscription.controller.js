import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
     const userId = req.user?._id; 

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (!userId) {
        throw new ApiError(401, "User must be logged in to subscribe");
    }

    if (userId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    });

    if (existingSubscription) {
       const toggle= await Subscription.findByIdAndDelete(existingSubscription._id);

       if(!toggle){
        throw new ApiError(500,"Some thing went wrong while loading subscription details")
       }
        return res
            .status(200)
            .json(new ApiResponse(200, toggle, "Unsubscribed successfully"));
    } else {
   
        
        const newSubscription = await Subscription.create({
            subscriber: userId,
            channel: channelId
        });
        if(!newSubscription){
        throw new ApiError(500,"Some thing went wrong while loading subscription details")
       }
        return res
            .status(200)
            .json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if(!channelId){
        throw new ApiError(401,"Cannot get channel details")
    }

 const result = await Subscription.aggregate([
    { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
    {
        $lookup: {
            from: "users", // Collection name for User model
            localField: "subscriber",
            foreignField: "_id",
            as: "subscriberDetails"
        }
    },
    { $unwind: "$subscriberDetails" },
    {
        $project: {
            "subscriberDetails.password": 0,
            "subscriberDetails.refreshToken": 0,
            "subscriberDetails.__v": 0
        }
    },
    {
        $group: {
            _id: null,
            subscribers: { $push: "$subscriberDetails" },
            totalCount: { $sum: 1 }
        }
    }
]);

    if (!result.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, { subscribers: [], totalCount: 0 }, "No subscribers found"));
    }

    const { subscribers, totalCount } = result[0];

    return res
        .status(200)
        .json(new ApiResponse(200, { subscribers, totalCount }, "Subscribers fetched successfully"));
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        throw new ApiError(400, "Subscriber ID is required");
    }

    
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "name username avatar") 
        .lean();

    
    const channels = subscriptions.map(sub => sub.channel);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                totalChannels: channels.length,
                channels
            },
            "Subscribed channels fetched successfully"
        )
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}