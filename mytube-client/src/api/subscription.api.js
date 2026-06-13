import axiosInstance from './axiosInstance';
import { apiRequest } from './apiHandler';

export const toggleSubscription = (channelId) =>
  apiRequest(() =>
    axiosInstance.post(`/api/v1/subscriptions/c/${channelId}`)
  );

export const getChannelSubscribers = (channelId) =>
  apiRequest(() =>
    axiosInstance.get(`/api/v1/subscriptions/c/${channelId}`)
  );

export const getSubscribedChannels = (subscriberId) =>
  apiRequest(() =>
    axiosInstance.get(`/api/v1/subscriptions/u/${subscriberId}`)
  );
