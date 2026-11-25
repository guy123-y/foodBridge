import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { emailToUsername } from '../utils';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const linkStyle = { textDecoration: 'none', fontWeight: 'bold', color: '#333' };
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '15px 20px',
      background: '#f4f4f4',
      marginBottom: '20px',
      direction: 'rtl',
      textAlign: 'right'
    }}>
      <span style={{ fontWeight: 'bold', color: '#0066cc' }}>FoodBridge</span>

      {user ? (
        <>
          {/* הקישורים מופיעים רק אחרי שנוצר כרטיס פרופיל */}
          {profile && (
            <>
              <Link to="/" style={linkStyle}>פרסומים זמינים</Link>
              <Link to="/post/new" style={linkStyle}>פרסום חדש</Link>
              <Link to="/my-posts" style={linkStyle}>הפרסומים שלי</Link>
              <Link to="/my-pickups" style={linkStyle}>האיסופים שלי</Link>
            </>
          )}

          <span style={{ marginRight: 'auto', color: '#555' }}>
            {profile ? profile.name : emailToUsername(user.email)}
          </span>

          <button
            onClick={handleLogout}
            style={{ padding: '6px 12px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: 'white', color: '#333' }}
          >
            התנתק
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={linkStyle}>התחברות</Link>
          <Link to="/register" style={linkStyle}>הרשמה</Link>
        </>
      )}
    </nav>
  );
}
