import axiosInstance from './axiosInstance';
import { apiRequest } from './apiHandler';

export const getVideoComments = (videoId, { page, limit } = {}) =>
  apiRequest(() =>
    axiosInstance.get(`/api/v1/comments/${videoId}`, {
      params: { page, limit },
    })
  );

export const addComment = (videoId, content) =>
  apiRequest(() =>
    axiosInstance.post(`/api/v1/comments/${videoId}`, { content })
  );

export const updateComment = (commentId, content) =>
  apiRequest(() =>
    axiosInstance.patch(`/api/v1/comments/c/${commentId}`, { content })
  );

export const deleteComment = (commentId) =>
  apiRequest(() =>
    axiosInstance.delete(`/api/v1/comments/c/${commentId}`)
  );
