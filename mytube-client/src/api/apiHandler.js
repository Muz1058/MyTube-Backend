import toast from 'react-hot-toast';

export const apiRequest = async (requestFn, { silent = false } = {}) => {
  try {
    const response = await requestFn();
    return response.data.data;
  } catch (error) {
    if (!silent) {
      const message = error.response?.data?.message ?? 'Something went wrong';
      toast.error(message);
    }
    throw error;
  }
};

export const multipartHeaders = {
  'Content-Type': 'multipart/form-data',
};
