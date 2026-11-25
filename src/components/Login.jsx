import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';
import { useNavigate, Link } from 'react-router-dom';
import { usernameToEmail } from '../utils';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('שם משתמש או סיסמה שגויים');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', direction: 'rtl', textAlign: 'right' }}>
      <h2>התחברות</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>שם משתמש: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label>סיסמה: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {error && <p style={{ color: '#c00', margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {submitting ? 'מתחבר...' : 'התחבר'}
        </button>
      </form>

      <p>
        אין לך חשבון? <Link to="/register" style={{ color: '#0066cc' }}>להרשמה</Link>
      </p>
    </div>
  );
}
