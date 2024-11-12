import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';  // Layout cho các role khác
import MainLayout2 from '../layouts/MainLayout2'; // Layout dành riêng cho CNVH
import Dashboard1 from '../pages/Dasboard/Dashboard1'; // Desktop view
import Dashboard2 from '../pages/Dasboard/Dashboard2'; // Mobile view dành cho CNVH
import Login from '../Components/Login'; // Trang Login
import UserManagement from '../pages/Admin/UserManagement'; // Admin page
import DeviceReport from '../pages/Equiment/Report/DeviceReport';
import AreasManagement from '../pages/Equiment/Management/AreasManagement'; // Import Areas Management page
import MachineWorkScheduleList from '../pages/Equiment/Management/MachineWorkScheduleList'; // Import Machine Work Schedule
import ErrorReportCatalog from '../pages/ErrorReportCatalog/ErrorReportCatalog'; // Import Error Report
import WorkShiftCatalog from '../Components/Shifr/WorkShiftCatalog'; // Import Work Shift Catalog
import EmployeeCatalog from '../Components/Employee/EmployeeCatalog'; // Import Employee Catalog
import AvailableRate from '../pages/Equiment/AvailableRate/AvailableRate'; // Import Available Rate
import DeviceAnalysis from '../pages/Equiment/Management/Analysis/DeviceAnalysis';
import DeviceManagement from '../pages/Equiment/Management/DeviceManagement';
import ResponeIssue from '../pages/CNVH/ResponeIssue';
import ResponeSubmbit from '../pages/CNVH/ResponeSubmbit';
import Profile  from '../pages/Profile/Profile'
import { useAuth } from '../context/AuthContext';  // Import AuthContext
import DashboardTienAreas from '../pages/Dasboard/DashboardTienAreas';
import DashboardPhayAreas from '../pages/Dasboard/DashboardPhayAreas';
import MachineActionAnalysis from '../pages/Equiment/Management/Analysis/MachineActionAnalysis';
import OEEAnalysis from '../pages/Equiment/Management/Analysis/OEEAnalysis';
import Dashboard3 from '../pages/Dasboard/Dashboard3';

// Protected Route component sử dụng AuthContext để xác thực
const ProtectedRoute = ({ children, requiredRole }) => {
  const { userRole, logout } = useAuth();
  
  if (!userRole) {
    // Chưa đăng nhập, điều hướng đến trang login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && requiredRole !== userRole) {
    // Role không khớp, điều hướng đến trang dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRouter = () => {
  const { userRole, setUserRole } = useAuth();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role) {
      setUserRole(role); // Cập nhật userRole khi ứng dụng load
    }
  }, [setUserRole]);

  return (
    <Router>
      <Routes>
        {/* Route cho trang đăng nhập */}
        <Route path="/login" element={<Login />} />
        <Route path="/display1" element={<DashboardTienAreas />} />
        <Route path="/display2" element={<DashboardPhayAreas />} />
        <Route path="/display3" element={<Dashboard3 />} />
        
        {/* Route dành riêng cho CNVH */}
        <Route
          path="/dashboard/mobile"
          element={
            <ProtectedRoute requiredRole="CNVH">
              <MainLayout2>
                <Dashboard2 />
              </MainLayout2>
            </ProtectedRoute>
          }
        />

        {/* Route mặc định cho các role khác */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard1 />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes: Chỉ Admin có quyền truy cập */}
        <Route
          path="/admin/userlist"
          element={
            <ProtectedRoute requiredRole="Admin">
              <MainLayout>
                <UserManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Route cho CNVH: Respone Issue */}
        <Route
          path="/dashboard/mobile/issue"
          element={
            <ProtectedRoute requiredRole="CNVH">
              <MainLayout2>
                <ResponeIssue />
              </MainLayout2>
            </ProtectedRoute>
          }
        />

        {/* Route cho CNVH: Respone Submit */}
        <Route
          path="/dashboard/mobile/issue/respone"
          element={
            <ProtectedRoute requiredRole="CNVH">
              <MainLayout2>
                <ResponeSubmbit />
              </MainLayout2>
            </ProtectedRoute>
          }
        />

        {/* Các route khác */}
        <Route
          path="/importdata/devivce"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DeviceManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/importdata/areas"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AreasManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/importdata/issue"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ErrorReportCatalog />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/importdata/shift"
          element={
            <ProtectedRoute>
              <MainLayout>
                <WorkShiftCatalog />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/importdata/employee"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EmployeeCatalog />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/QCS/availablerate"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AvailableRate />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/QCS/schedule"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MachineWorkScheduleList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/QCS/analysis"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MachineActionAnalysis />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/QCS/analysis/oee"
          element={
            <ProtectedRoute>
              <MainLayout>
                <OEEAnalysis />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/QCS/analysis/downtime"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DeviceAnalysis />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/QCS/reports"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DeviceReport />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
