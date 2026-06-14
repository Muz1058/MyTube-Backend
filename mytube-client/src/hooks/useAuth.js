import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../api/auth.api';
import {
  loginUserThunk,
  logoutUserThunk,
  fetchCurrentUserThunk,
  setLoading,
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  const login = useCallback(
    async (credentials) => {
      const resultAction = await dispatch(loginUserThunk(credentials));
      if (loginUserThunk.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload || 'Login failed');
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (formData, config = {}) => {
      dispatch(setLoading(true));
      try {
        const data = await registerUser(formData, config);
        return data;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    await dispatch(logoutUserThunk());
  }, [dispatch]);

  const fetchCurrentUser = useCallback(async () => {
    const resultAction = await dispatch(fetchCurrentUserThunk());
    if (fetchCurrentUserThunk.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      return null;
    }
  }, [dispatch]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    signOut,
    fetchCurrentUser,
  };
};
