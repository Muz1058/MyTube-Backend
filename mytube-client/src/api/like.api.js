import axiosInstance from './axiosInstance';
import { apiRequest } from './apiHandler';

export const toggleVideoLike = (videoId) =>
  apiRequest(() =>
    axiosInstance.post(`/api/v1/likes/toggle/v/${videoId}`)
  );

export const toggleCommentLike = (commentId) =>
  apiRequest(() =>
    axiosInstance.post(`/api/v1/likes/toggle/c/${commentId}`)
  );

export const toggleTweetLike = (tweetId) =>
  apiRequest(() =>
    axiosInstance.post(`/api/v1/likes/toggle/t/${tweetId}`)
  );

export const getLikedVideos = () =>
  apiRequest(() => axiosInstance.get('/api/v1/likes/videos'));
