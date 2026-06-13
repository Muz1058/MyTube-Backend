import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  videos: [],
  currentVideo: null,
  isLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setVideos: (state, action) => {
      state.videos = action.payload;
      state.isLoading = false;
    },
    appendVideos: (state, action) => {
      state.videos = [...state.videos, ...action.payload];
      state.isLoading = false;
    },
    setCurrentVideo: (state, action) => {
      state.currentVideo = action.payload;
      state.isLoading = false;
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
    setVideoLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetVideos: (state) => {
      state.videos = [];
      state.currentVideo = null;
      state.pagination = initialState.pagination;
    },
  },
});

export const {
  setVideos,
  appendVideos,
  setCurrentVideo,
  clearCurrentVideo,
  setVideoLoading,
  setPagination,
  resetVideos,
} = videoSlice.actions;
export default videoSlice.reducer;
