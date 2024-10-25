import React, { useState, useEffect } from 'react';
import { FaUserEdit, FaLock, FaPhone, FaUser } from 'react-icons/fa';

const Profile = () => {
  // Kiểm tra và tải thông tin từ localStorage khi component được mount
  const getInitialProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return {
      avatar: 'https://via.placeholder.com/150', // Placeholder cho avatar
      name: 'John Doe',
      username: 'johndoe',
      password: 'password123',
      phone: '+84 123456789',
    };
  };

  const [profile, setProfile] = useState(getInitialProfile); // Khởi tạo state từ localStorage hoặc giá trị mặc định

  // Hàm xử lý thay đổi thông tin người dùng
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  // Hàm xử lý khi người dùng chọn ảnh avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prevProfile) => ({
          ...prevProfile,
          avatar: reader.result, // Cập nhật ảnh avatar mới từ FileReader
        }));
      };
      reader.readAsDataURL(file); // Đọc file ảnh dưới dạng URL base64
    }
  };

  // Hàm lưu thông tin vào localStorage
  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    alert('Thông tin đã được lưu !');
  };

  useEffect(() => {
    // Khi component được mount hoặc khi state profile thay đổi, lưu vào localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 bg-cyan-700 shadow-lg rounded-lg">
      {/* Ảnh đại diện */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <img
            src={profile.avatar}
            alt="Avatar"
            className="rounded-full w-32 h-32 object-cover border-2 border-green-500"
          />
          {/* Nút để chỉnh sửa avatar */}
          <label className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full text-white cursor-pointer">
            <FaUserEdit />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden bg-transparent" // Ẩn input file
            />
          </label>
        </div>
        <h2 className="text-xl font-semibold text-white mt-4">{profile.name}</h2>
      </div>

      {/* Form thông tin cá nhân */}
      <div className="mt-6 space-y-4">
        {/* Tên */}
        <div className="flex items-center bg-transparent space-x-3">
          <FaUser className="text-teal-900" />
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full p-2 border text-white border-gray-700 bg-transparent rounded-md focus:ring focus:ring-green-200"
            placeholder="Họ tên"
          />
        </div>

        {/* Username */}
        <div className="flex items-center space-x-3">
          <FaUser className="text-teal-900" />
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleChange}
            className="w-full p-2 border text-white border-gray-700 bg-transparent  rounded-md focus:ring focus:ring-green-200"
            placeholder="Tên đăng nhập"
          />
        </div>

        {/* Mật khẩu */}
        <div className="flex items-center space-x-3">
          <FaLock className="text-teal-900" />
          <input
            type="password"
            name="password"
            value={profile.password}
            onChange={handleChange}
            className="w-full p-2 border text-white border-gray-700 bg-transparent rounded-md focus:ring focus:ring-green-200"
            placeholder="Mật khẩu"
          />
        </div>

        {/* Số điện thoại */}
        <div className="flex items-center space-x-3">
          <FaPhone className="text-teal-900" />
          <input
            type="text"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="w-full p-2 border text-white border-gray-700 bg-transparent rounded-md focus:ring focus:ring-green-200"
            placeholder="Số điện thoại"
          />
        </div>
      </div>

      {/* Nút lưu */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSave}
          className="bg-cyan-700  text-white py-2 px-6 rounded-md shadow-md hover:bg-teal-600 transition"
        >
          Lưu Thay Đổi
        </button>
      </div>
    </div>
  );
};

export default Profile;
