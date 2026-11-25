import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', direction: 'rtl', textAlign: 'right' }}>טוען...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // משתמש שעוד לא יצר כרטיס פרופיל - שולחים אותו ליצור אחד
  if (!profile) {
    return <Navigate to="/profile" />;
  }

  return children;
}
