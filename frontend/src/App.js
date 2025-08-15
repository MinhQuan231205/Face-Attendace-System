import React, { useContext } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'; 
import './App.css';
import { AuthContext } from './context/AuthContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ClassDetailPage from './pages/ClassDetailPage'; 
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import AttendancePage from './pages/AttendancePage'; 
import ClassHistoryPage from './pages/ClassHistoryPage';
import SessionManagementPage from './pages/SessionManagementPage';
import SessionReportPage from './pages/SessionReportPage';

function App() {
  const { authState, logout } = useContext(AuthContext);
  const handleLogout = () => {
    logout();
  };

  return (
    <Router>
      <div>
        <nav className="navbar">
          <Link to="/" className="navbar-title">Hệ thống Điểm danh Khuôn mặt</Link>
          <div className="nav-links">
            {authState.user ? (
              <div className="user-menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="user-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="user-email">{authState.user.sub}</span>
                <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
              </div>
            ) : (
              <Link to="/login" className="nav-link">Đăng nhập</Link>
            )}
          </div>
        </nav>

        <div className="app-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />            
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute role="student">
                  <StudentDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
            path="/admin/classes/:classId" 
            element={
              <ProtectedRoute role="admin">
                <ClassDetailPage />
              </ProtectedRoute>
            }
            />
            <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboardPage />
              </ProtectedRoute>
            }
            />
            <Route 
            path="/teacher/session/:sessionId/attendance" 
            element={
              <ProtectedRoute role="teacher">
                <AttendancePage />
              </ProtectedRoute>
            } 
            />
            <Route 
            path="/teacher/class/:classId/history" 
            element={
                <ProtectedRoute role="teacher">
                    <ClassHistoryPage />
                </ProtectedRoute>
            } 
            />
            <Route 
            path="/teacher/class/:classId/sessions" 
            element={
              <ProtectedRoute role="teacher">
                <SessionManagementPage />
              </ProtectedRoute>
            } 
            />
            <Route 
            path="/teacher/session/:sessionId/report" 
            element={
              <ProtectedRoute role="teacher">
                <SessionReportPage />
              </ProtectedRoute>
            } 
            />
            
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;