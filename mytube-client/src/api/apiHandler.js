import toast from 'react-hot-toast';

export const apiRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message ?? 'Something went wrong';
    toast.error(message);
    throw error;
  }
};

export const multipartHeaders = {
  'Content-Type': 'multipart/form-data',
};
