import axios from 'axios';
import { toast } from 'react-toastify';

export const useApi = () => {
  const request = async (url, method, data = null) => {
    try {
      const response = await axios({ url, method, data });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error; // Rethrow for component-specific handling if needed
    }
  };

  const handleError = (error) => {
    if (!error.response) {
      toast.error('Lỗi kết nối. Kiểm tra lại mạng của bạn.');
    } else {
      const { status } = error.response;
      if (status === 400) toast.error('Thông tin đăng nhập không hợp lệ.');
      else if (status === 401) toast.error('Sai tên đăng nhập hoặc mật khẩu.');
      else if (status === 500) toast.error('Lỗi máy chủ. Thử lại sau.');
      else toast.error('Đã xảy ra lỗi không xác định.');
    }
  };

  return { request };
};
