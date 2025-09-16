// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CourseraAuth from './components/CourseraAuth';
import InstructorDashboard from './components/InstructorDashboard'; // ← Correct path
import authService from './services/authService';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const isAuth = authService.isAuthenticated();
    setIsAuthenticated(isAuth);
    
    if (isAuth) {
      const user = authService.getCurrentUser();
      setUserType(user?.user_type);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to = {userType === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'} /> : 
              <CourseraAuth />
          } 
        />

        <Route 
          path="/admindashboard" 
          element={
            // isAuthenticated && userType === 'admin' ? 
              <AdminDashboard /> // : 
              // <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/instructor/dashboard" 
          element={
            isAuthenticated && userType === 'instructor' ? 
              <InstructorDashboard /> : 
              <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/student/dashboard" 
          element={
            isAuthenticated && userType === 'student' ? 
              <StudentDashboard /> : 
              <Navigate to="/login" />
          } 
        />
        
        <Route 
          path="/" 
          element={
            <Navigate to={
              isAuthenticated ? 
                (userType === 'instructor' ? '/instructor/dashboard' : '/student/dashboard') : 
                '/login'
            } />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;