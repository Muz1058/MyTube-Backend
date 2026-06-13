import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, logoutUser, getCurrentUser } from '../../api/auth.api';

// Async thunk for user login
export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await loginUser(credentials);
      return data; // returns { user, accessToken, refreshToken }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

// Async thunk for user logout
export const logoutUserThunk = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await logoutUser();
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Logout failed';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to fetch current authenticated user
export const fetchCurrentUserThunk = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return rejectWithValue('No token');
    }
    try {
      const user = await getCurrentUser(); // returns null on failure (no toast)
      if (!user) return rejectWithValue('Session expired');
      return user;
    } catch {
      return rejectWithValue('Failed to fetch current user');
    }
  }
);

const initialState = {
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: true, // starts as true per requirements
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Keep setCredentials and others for backward compatibility if needed
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem('accessToken', accessToken);
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem('accessToken');
    },
  },
  extraReducers: (builder) => {
    builder
      // loginUserThunk
      .addCase(loginUserThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        const { user, accessToken } = action.payload;
        state.user = user;
        state.accessToken = accessToken;
        state.isAuthenticated = true;
        state.isLoading = false;
        localStorage.setItem('accessToken', accessToken);
      })
      .addCase(loginUserThunk.rejected, (state) => {
        state.isLoading = false;
      })
      // logoutUserThunk
      .addCase(logoutUserThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        localStorage.removeItem('accessToken');
      })
      .addCase(logoutUserThunk.rejected, (state) => {
        // Clear locally anyway even if API request fails
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        localStorage.removeItem('accessToken');
      })
      // fetchCurrentUserThunk
      .addCase(fetchCurrentUserThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(fetchCurrentUserThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        localStorage.removeItem('accessToken');
      });
  },
});

export const { setCredentials, setUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
