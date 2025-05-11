import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import FindMyHall from './pages/FindMyHall';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AnnouncementList from './pages/AnnouncementList';
import AdminPanel from './pages/admin/AdminPanel';
import FeedbackForm from './pages/FeedbackForm';
import FeedbackPanel from './pages/admin/FeedbackPanel';
import BuildingForm from './pages/admin/BuildingForm';
import HallForm from './pages/admin/HallForm';
import VoiceToText from './pages/VoiceToText';
import HallSearch from './pages/HallSearch';
import UserManagement from './pages/UserManagement';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            {/* Default route - redirects to FindMyHall */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <FindMyHall />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/findmyhall" 
              element={
                <ProtectedRoute>
                  <FindMyHall />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/announcement" 
              element={
                <ProtectedRoute>
                  <AnnouncementList />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/adminpanel" 
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/feedbackform" 
              element={
                <ProtectedRoute>
                  <FeedbackForm />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/feedbackpanel" 
              element={
                <ProtectedRoute>
                  <FeedbackPanel />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/building" 
              element={
                <ProtectedRoute>
                  <BuildingForm />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/hall" 
              element={
                <ProtectedRoute>
                  <HallForm />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/voice" 
              element={
                <ProtectedRoute>
                  <VoiceToText />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/hall-search" 
              element={
                <ProtectedRoute>
                  <HallSearch />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/usermanagement" 
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
