import axiosInstance from './axiosInstance';
import { apiRequest } from './apiHandler';

export const createTweet = (content) =>
  apiRequest(() => axiosInstance.post('/api/v1/tweets', { content }));

export const getUserTweets = (userId) =>
  apiRequest(() => axiosInstance.get(`/api/v1/tweets/user/${userId}`));

export const updateTweet = (tweetId, content) =>
  apiRequest(() =>
    axiosInstance.patch(`/api/v1/tweets/${tweetId}`, { content })
  );

export const deleteTweet = (tweetId) =>
  apiRequest(() => axiosInstance.delete(`/api/v1/tweets/${tweetId}`));
