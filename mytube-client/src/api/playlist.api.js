import axiosInstance from './axiosInstance';
import { apiRequest } from './apiHandler';

export const createPlaylist = ({ name, description }) =>
  apiRequest(() =>
    axiosInstance.post('/api/v1/playlist', { name, description })
  );

export const getPlaylistById = (playlistId) =>
  apiRequest(() => axiosInstance.get(`/api/v1/playlist/${playlistId}`));

export const updatePlaylist = (playlistId, { name, description }) =>
  apiRequest(() =>
    axiosInstance.patch(`/api/v1/playlist/${playlistId}`, { name, description })
  );

export const deletePlaylist = (playlistId) =>
  apiRequest(() => axiosInstance.delete(`/api/v1/playlist/${playlistId}`));

export const addVideoToPlaylist = (videoId, playlistId) =>
  apiRequest(() =>
    axiosInstance.patch(`/api/v1/playlist/add/${videoId}/${playlistId}`)
  );

export const removeVideoFromPlaylist = (videoId, playlistId) =>
  apiRequest(() =>
    axiosInstance.patch(`/api/v1/playlist/remove/${videoId}/${playlistId}`)
  );

export const getUserPlaylists = (userId) =>
  apiRequest(() => axiosInstance.get(`/api/v1/playlist/user/${userId}`));
