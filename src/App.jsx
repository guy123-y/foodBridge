import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import ProfileSetup from './components/ProfileSetup';
import Home from './components/Home';
import PostForm from './components/PostForm';
import PostDetails from './components/PostDetails';
import MyPosts from './components/MyPosts';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfileSetup />} />

          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/post/new" element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
          <Route path="/post/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
          <Route path="/my-posts" element={<ProtectedRoute><MyPosts mode="posts" /></ProtectedRoute>} />
          <Route path="/my-pickups" element={<ProtectedRoute><MyPosts mode="pickups" /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
