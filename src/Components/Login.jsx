import React, { useState } from 'react';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast,ToastContainer } from 'react-toastify';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import logo from '../../src/assets/image/logo.png' 
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { setUserRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl =import.meta.env.VITE_API_BASE_URL
  console.log(apiUrl)

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await axios.post(`${apiUrl}/login`, { username: email, password });
  
      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem('token', token);
  
        const decodedToken = jwtDecode(token);
        const role = decodedToken.user.role;
        localStorage.setItem('role', role);
        setUserRole(role);
  
        toast.success('Đăng nhập thành công!');
        navigate(role === 'CNVH' ? '/dashboard/mobile' : '/dashboard');
      }
    } catch (error) {
      // Check for various error cases and show appropriate messages
      if (!error.response) {
        // Network error
        toast.error('Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng của bạn!');
      } else if (error.response.status === 400) {
        // Bad request (invalid input)
        toast.error('Yêu cầu không hợp lệ. Vui lòng kiểm tra thông tin đăng nhập.');
      } else if (error.response.status === 401) {
        // Unauthorized (invalid credentials)
        toast.error('Sai tên đăng nhập hoặc mật khẩu!');
      } else if (error.response.status === 500) {
        // Server error
        toast.error('Lỗi máy chủ, vui lòng thử lại sau.');
      } else {
        // Other errors
        toast.error('Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
            <div 
                  className="lg:w-2/3 bg-cover bg-center  bg-no-repeat text-white flex flex-col justify-center items-center p-16"
                  style={{ backgroundImage: 'url(/src/assets/image/QCS.jpg)' }}  // Thay thế bằng đường dẫn ảnh của bạn
                >
                  
      </div>
      {/* Left section - Form */}
      <div className="lg:w-1/3 bg-gradient-to-r from-blue-100 to-blue-200  flex flex-col justify-center items-center px-8 py-4 shadow-lg">
        {/* Logo */}
        <div className="flex flex-rows items-center ">
          <img src={logo} alt="Logo" className="w-[480px] h-auto object-contain " />
          
        </div>
        <h2 className="text-2xl font-bold ml-2 text-blue-600 mb-8">DI.OEE</h2>

        
       
        
        <form onSubmit={handleLogin} className="w-full max-w-sm p-6 ">
          <div className="relative">
            <input
              type="text"
              placeholder="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-6 py-3 px-4 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 px-4  border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <span
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye />:<FaEyeSlash />  }
            </span>
          </div>

          <div className="flex justify-between items-center p-2 text-sm text-gray-600 mb-4 mt-4 ">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="text-blue-500 hover:underline">Quên mật khẩu?</a>
          </div>

          <button 
            type="submit" 
            className={`w-full py-3 text-white bg-blue-600 rounded-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={isLoading} 
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0"></path>
                </svg>
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>
      </div>
      
    
    </div>
  );
}

export default Login;
