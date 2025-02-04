import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaLock, FaEye, FaUnlock, FaPlus, FaEyeSlash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { message } from 'antd';
import DynamicFormModal from '../../Components/Modal/DynamicFormModal';
import * as yup from 'yup';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [plainTextPasswords, setPlainTextPasswords] = useState({});

  const currentRole = localStorage.getItem('role');
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        setUsers(response.data);
  
        // Tạo map chứa plainTextPassword
        const passwordsMap = response.data.reduce((acc, user) => {
          acc[user._id] = user.plainTextPassword || '*****';
          return acc;
        }, {});
        setPlainTextPasswords(passwordsMap);
      } catch (error) {
        toast.error('Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);
  

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };
  const checkDuplicate = (data) => {
    let duplicateFields = {};
    
    users.forEach(user => {
      if (user._id !== (selectedUser?._id || '')) { // Loại trừ user đang chỉnh sửa
        if (user.employeeId === data.employeeId) {
          duplicateFields.employeeId = true;
        }
        if (user.email === data.email) {
          duplicateFields.email = true;
        }
        if (user.username === data.username) {
          duplicateFields.username = true;
        }
      }
    });
  
    return duplicateFields;
  };
  
 
  const handleSave = async (data) => {
    const duplicates = checkDuplicate(data);
    const duplicateFields = [];
  
    // Thêm các trường bị trùng vào danh sách
    if (duplicates.employeeId) duplicateFields.push('Mã nhân viên');
    if (duplicates.email) duplicateFields.push('Email');
    if (duplicates.username) duplicateFields.push('Tên đăng nhập');
  
    // Nếu có bất kỳ trường nào bị trùng, hiển thị thông báo
    if (duplicateFields.length > 0) {
      const fields = duplicateFields.join(', ');
      message.warning(`${fields} đã tồn tại!`);
      return;
    }
  
    try {
      const { password, role, ...userData } = data;
      userData.role = role;
  
      if (password && password !== plainTextPasswords[selectedUser?._id]) {
        userData.plainTextPassword = password;
        userData.password = password; // Hash the password before saving to the database
      } else if (selectedUser) {
        userData.password = selectedUser.password; // Use the existing hashed password
      }
  
      userData.isAdmin = role === 'Admin';
  
      if (!selectedUser) {
        userData.locked = false;
      }
  
      let response;
      if (selectedUser) {
        response = await axios.put(`${apiUrl}/users/${selectedUser._id}`, userData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(users.map(user => user._id === selectedUser._id ? { ...user, ...response.data } : user));
        message.success('User updated successfully');
      } else {
        response = await axios.post(`${apiUrl}/users`, userData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers([...users, response.data]);
        message.success('User created successfully');
      }
  
      setPlainTextPasswords(prev => ({
        ...prev,
        [selectedUser ? selectedUser._id : response.data._id]: password,
      }));
    } catch (error) {
      message.error('Failed to save user');
    }
    setIsModalOpen(false);
    setSelectedUser(null);
  };
    
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${apiUrl}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(users.filter(user => user._id !== id));
      message.success('User deleted successfully');
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const handleToggleLockUser = async (id) => {
    try {
      const response = await axios.put(`${apiUrl}/users/${id}/lock`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(users.map(user => (user._id === id ? { ...user, locked: response.data.locked } : user)));
      message.success(response.data.locked ? 'User locked' : 'User unlocked');
    } catch (error) {
      message.error('Failed to toggle lock status');
    }
  };
  
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswordMap(prevMap => ({
      ...prevMap,
      [userId]: !prevMap[userId],
    }));
    setShowPassword(prev => !prev);
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
            <th className="py-3 px-4 text-left">Mật khẩu</th>
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
                <td className="py-3 px-4 relative">
                  {showPasswordMap[user._id] ? plainTextPasswords[user._id] : '*****'}
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(user._id)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                    title="Hiển thị/Mật khẩu"
                  >
                    {showPasswordMap[user._id] ? <FaEye />:<FaEyeSlash />  }
                  </button>
                </td>
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
                    {user.locked ?  <FaLock />:<FaUnlock /> }
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
    setShowPassword(false); // Đảm bảo mật khẩu bị ẩn khi modal đóng
  }}
  onSave={handleSave}
  formFields={[
    { name: 'employeeId', label: 'Mã Nhân Viên', type: 'text', validation: yup.string().required('Mã nhân viên là bắt buộc'), disabled: !!selectedUser },
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
      options: ['Sản xuất', 'Kỹ thuật', 'Chất lượng', 'Kho', 'Admin', 'CNVH'],
      validation: yup.string().required('Vai trò là bắt buộc')
    }
  ]}
  contentLabel={selectedUser ? 'Chỉnh sửa tài khoản' : 'Thêm mới tài khoản'}
  initialData={
    selectedUser
      ? { ...selectedUser, password: plainTextPasswords[selectedUser._id] } // Dùng plainTextPassword nếu chỉnh sửa
      : { employeeId: '', username: '', name: '', email: '', password: '', role: '' }
  }
/>





      <ToastContainer />
    </div>
  );
};

export default UserManagement;
