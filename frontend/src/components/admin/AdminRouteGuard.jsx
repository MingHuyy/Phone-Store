import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

function AdminRouteGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get('http://localhost:1111/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        
        if (response.data && response.data.roles) {
          if (response.data.roles.split(',').includes('ADMIN')) {
            setIsAdmin(true);
          } else {
            console.log('Người dùng không có quyền ADMIN');
          }
        } else {
          console.log('Không tìm thấy thông tin về vai trò');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra quyền admin:', error);
        if (error.response) {
          console.error('Phản hồi lỗi:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('Không nhận được phản hồi:', error.request);
        } else {
          console.error('Lỗi cấu hình:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Đang tải...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default AdminRouteGuard; 