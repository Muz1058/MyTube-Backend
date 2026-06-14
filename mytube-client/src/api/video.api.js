import axiosInstance from './axiosInstance';
import { apiRequest, multipartHeaders } from './apiHandler';

export const getAllVideos = ({
  page,
  limit,
  query,
  sortBy,
  sortType,
  userId,
} = {}) =>
  apiRequest(() =>
    axiosInstance.get('/api/v1/videos', {
      params: { page, limit, query, sortBy, sortType, userId },
    })
  );

export const uploadVideo = (formData, config = {}) =>
  apiRequest(() =>
    axiosInstance.post('/api/v1/videos', formData, {
      headers: multipartHeaders,
      ...config,
    })
  );

export const getVideoById = (videoId) =>
  apiRequest(() => axiosInstance.get(`/api/v1/videos/${videoId}`));

export const updateVideo = (videoId, formData) =>
  apiRequest(() =>
    axiosInstance.patch(`/api/v1/videos/${videoId}`, formData, {
      headers: multipartHeaders,
    })
  );

export const deleteVideo = (videoId) =>
  apiRequest(() => axiosInstance.delete(`/api/v1/videos/${videoId}`));

export const togglePublish = (videoId) =>
  apiRequest(() =>
    axiosInstance.patch(`/api/v1/videos/toggle/publish/${videoId}`)
  );
