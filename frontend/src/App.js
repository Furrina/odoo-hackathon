import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import BrowseUsers from './components/BrowseUsers';
import UserDetail from './components/UserDetail';
import MySwaps from './components/MySwaps';
import AdminDashboard from './components/AdminDashboard';
import AdminAccess from './components/AdminAccess';
import Debug from './components/Debug';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="container text-center mt-20">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="container text-center mt-20">Loading...</div>;
  }
  
  return user && user.role === 'admin' ? children : <Navigate to="/admin-access" />;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/browse" element={<BrowseUsers />} />
            <Route path="/user/:id" element={<UserDetail />} />
            <Route path="/my-swaps" element={<PrivateRoute><MySwaps /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin-access" element={<PrivateRoute><AdminAccess /></PrivateRoute>} />
            <Route path="/debug" element={<Debug />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 