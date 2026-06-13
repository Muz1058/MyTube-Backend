import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if (
    !name ||
    name.trim() === "" ||
    !description ||
    description.trim() === ""
  ) {
    throw new ApiError(401, "playlist name and description required");
  }
  const owner = req.user?._id;

  if (!owner) {
    throw new ApiError(401, "playlist owner required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner,
  });

  if (!playlist) {
    throw new ApiError(501, "Something went wrong while creating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) {
    throw new ApiError(400, "Cannot fetch user id");
  }

  const userPlaylist = await Playlist.find({ owner: userId });

  if (!userPlaylist) {
    throw new ApiError(500, "Something went wrong while loading tweets");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylist,
        "User Playtlists fetched successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "Cannot fetch playlist");
  }

  const playlist = await Playlist.findById(playlistId)

  if (!playlist) {
    throw new ApiError(500, "Something went wrong while loading playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "User Playlist fetched successfully"
      )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
    if (!playlistId||!videoId) {
    throw new ApiError(400, "Cannot fetch playlist");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
       $addToSet: {video:videoId}
    },
    {
        new:true
    }
  )

  if (!playlist) {
    throw new ApiError(500, "Something went wrong while adding playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "video added to Playlist successfully"
      )
    );  
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

   if (!playlistId||!videoId) {
    throw new ApiError(400, "Cannot fetch playlist and video details");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
       $pull: {video:videoId}
    },
    {
        new:true
    }
  )

  if (!playlist) {
    throw new ApiError(500, "Something went wrong while deleting video from playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "video remove from Playlist successfully"
      )
    );  

});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "Cannot fetch playlist");
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId)

  if (!playlist) {
    throw new ApiError(500, "Something went wrong while deleting playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Playlist deleted successfully"
      )
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  
  //TODO: update playlist

  if (!playlistId) {
    throw new ApiError(400, "Cannot fetch playlist");
  }
  const { name, description } = req.body;
 if (
    !name ||
    name.trim() === "" ||
    !description ||
    description.trim() === ""
  ) {
    throw new ApiError(401, "playlist name and description required");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
        name,
        description
    },
    {new:true}
   )

  if (!playlist) {
    throw new ApiError(500, "Something went wrong while loading playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Playlist updated successfully"
      )
    );

});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
