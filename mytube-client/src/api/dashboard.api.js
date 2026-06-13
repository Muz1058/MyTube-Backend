import axiosInstance from './axiosInstance';
import { apiRequest } from './apiHandler';

export const getChannelStats = () =>
  apiRequest(() => axiosInstance.get('/api/v1/dashboard/stats'));

export const getChannelVideos = () =>
  apiRequest(() => axiosInstance.get('/api/v1/dashboard/videos'));
