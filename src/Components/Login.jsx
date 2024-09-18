import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserAlt, FaLock, FaEye, FaEyeSlash, FaUsers, FaBook } from 'react-icons/fa'; 
import { toast } from 'react-toastify';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


import { useAuth } from '../context/AuthContext'; // Đảm bảo đường dẫn này chính xác

function Login() {
  const navigate = useNavigate();
  const { setUserRole } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('https://back-end-production.onrender.com/api/login', {
        username,
        password,
      });

      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem('token', token);

        const decodedToken = jwtDecode(token);
        console.log('Decoded token:', decodedToken);
        const role = decodedToken.user.role;
        console.log('Extracted role:', role);
        localStorage.setItem('role', role);  
        setUserRole(role);

        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login Error:', error); 
      toast.error('Sai tên đăng nhập hoặc mật khẩu!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-500 to-blue-700">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800">Đăng nhập tài khoản của bạn</h2>
        
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative">
            <FaUserAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
              placeholder="Tên đăng nhập"
            />
          </div>
          
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
              placeholder="Mật khẩu"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button 
            type="submit" 
            className="w-full py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Đăng nhập
          </button>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</a>
          </div>
        </form>

        <div className="flex justify-center space-x-4">
          <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
            <FaUsers className="mr-2" />
            Nhóm hỗ trợ
          </a>
          <a href="#" className="flex items-center text-sm text-blue-600 hover:underline">
            <FaBook className="mr-2" />
            Tài liệu hướng dẫn
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;