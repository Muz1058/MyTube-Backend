import axiosInstance from './axiosInstance';
import { apiRequest, multipartHeaders } from './apiHandler';

export const registerUser = (formData, config = {}) =>
  apiRequest(() =>
    axiosInstance.post('/api/v1/users/register', formData, {
      headers: multipartHeaders,
      ...config,
    })
  );

export const loginUser = ({ email, username, password }) =>
  apiRequest(() =>
    axiosInstance.post('/api/v1/users/login', { email, username, password })
  );

export const logoutUser = () =>
  apiRequest(() => axiosInstance.post('/api/v1/users/logout'));

export const refreshToken = () =>
  apiRequest(() => axiosInstance.post('/api/v1/users/refresh-token'));

export const getCurrentUser = () =>
  apiRequest(() => axiosInstance.get('/api/v1/users/current-user'), { silent: true });

export const updateAccountDetails = ({ fullName, email }) =>
  apiRequest(() =>
    axiosInstance.patch('/api/v1/users/update-account', { fullName, email })
  );

export const updateAvatar = (formData) =>
  apiRequest(() =>
    axiosInstance.patch('/api/v1/users/avatar', formData, {
      headers: multipartHeaders,
    })
  );

export const updateCoverImage = (formData) =>
  apiRequest(() =>
    axiosInstance.patch('/api/v1/users/cover-image', formData, {
      headers: multipartHeaders,
    })
  );

export const getChannelProfile = (username) =>
  apiRequest(() => axiosInstance.get(`/api/v1/users/c/${username}`));

export const getWatchHistory = () =>
  apiRequest(() => axiosInstance.get('/api/v1/users/history'));
