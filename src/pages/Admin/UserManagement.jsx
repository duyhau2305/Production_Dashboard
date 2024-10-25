import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaLock, FaEye, FaUnlock, FaPlus } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicFormModal from '../../Components/Modal/DynamicFormModal';
import * as yup from 'yup';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const currentRole = localStorage.getItem('role'); // Lấy role hiện tại từ localStorage
  const apiUrl = import.meta.env.VITE_API_BASE_URL
  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        toast.error('Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  // Handle creating a new user
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // Save user (Create or Update)
  const handleSave = async (data) => {
    try {
      if (selectedUser) {
        await axios.put(`${apiUrl}/users/${selectedUser._id}`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUsers(users.map(user => (user._id === selectedUser._id ? { ...user, ...data } : user)));
        toast.success('User updated successfully');
      } else {
        const response = await axios.post(`${apiUrl}/users`, data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUsers([...users, response.data]);
        toast.success('User created successfully');
      }
    } catch (error) {
      toast.error('Failed to save user');
    }
    setIsModalOpen(false);
    setSelectedUser(null);
    setShowPassword(false);
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${apiUrl}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(users.filter(user => user._id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  // Toggle user lock status
  const handleToggleLockUser = async (id) => {
    try {
      const response = await axios.put(`${apiUrl}/users/${id}/lock`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(users.map(user => (user._id === id ? { ...user, locked: response.data.locked } : user)));
      toast.success(response.data.locked ? 'User locked' : 'User unlocked');
    } catch (error) {
      toast.error('Failed to toggle lock status');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản Lý Người Dùng</h1>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center hover:bg-blue-700"
          onClick={handleCreateUser}
        >
          <FaPlus className="mr-2" /> Tạo Tài Khoản
        </button>
      </div>

      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="py-3 px-4 text-left">Mã Nhân Viên</th>
            <th className="py-3 px-4 text-left">Tên đăng nhập</th>
            <th className="py-3 px-4 text-left">Tên</th>
            <th className="py-3 px-4 text-left">Email</th>
            <th className="py-3 px-4 text-left">Vai trò</th>
            <th className="py-3 px-4 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
                <td className="py-3 px-4">{user.employeeId}</td>
                <td className="py-3 px-4">{user.username}</td>
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.role}</td>
                <td className="py-3 px-4 flex justify-center">
                  <button
                    className="text-green-600 hover:text-green-800 mx-2"
                    title="Sửa"
                    onClick={() => handleEditUser(user)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 mx-2"
                    title="Xóa"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="text-gray-600 hover:text-gray-800 mx-2"
                    title={user.locked ? 'Mở khóa' : 'Khóa'}
                    onClick={() => handleToggleLockUser(user._id)}
                  >
                    {user.locked ? <FaUnlock /> : <FaLock />}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-3 px-4 text-center">Không có người dùng nào được tìm thấy.</td>
            </tr>
          )}
        </tbody>
      </table>

      <DynamicFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          setShowPassword(false); 
        }}
        onSave={handleSave}
        formFields={[
          { 
            name: 'employeeId', 
            label: 'Mã Nhân Viên', 
            type: 'text', 
            validation: yup.string().required('Mã nhân viên là bắt buộc'), 
            disabled: !!selectedUser 
          },
          { name: 'username', label: 'Tên đăng nhập', type: 'text', validation: yup.string().required('Tên tài khoản là bắt buộc') },
          { name: 'name', label: 'Tên', type: 'text', validation: yup.string().required('Tên nhân viên là bắt buộc') },
          { name: 'email', label: 'Email', type: 'email', validation: yup.string().email('Email không hợp lệ').required('Email là bắt buộc') },
          {
            name: 'password',
            label: 'Mật khẩu',
            type: showPassword ? 'text' : 'password', 
            validation: yup.string().required('Mật khẩu là bắt buộc'),
            extra: (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            )
          },
          {
            name: 'role',
            label: 'Vai trò',
            type: 'select',
            options: ['Sản xuất', 'Kỹ thuật', 'Chất lượng', 'Kho', 'Admin','CNVH'],
            validation: yup.string().required('Vai trò là bắt buộc')
          }
        ]}
        contentLabel={selectedUser ? 'Chỉnh sửa tài khoản' : 'Thêm mới tài khoản'}
        initialData={selectedUser || { employeeId: '', username: '', name: '', email: '', password: '', role: '' }}
      />

      <ToastContainer />
    </div>
  );
};

export default UserManagement;
