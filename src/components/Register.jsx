import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';
import { useNavigate, Link } from 'react-router-dom';
import { checkPassword, checkUsername, usernameToEmail } from '../utils';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const usernameError = checkUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    const passwordError = checkPassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setSubmitting(true);

    try {
      await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
      // אחרי ההרשמה ממשיכים ליצירת כרטיס הפרופיל
      navigate('/profile');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('שם המשתמש הזה תפוס');
      } else {
        setError('ההרשמה נכשלה, נסה שוב');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', direction: 'rtl', textAlign: 'right' }}>
      <h2>הרשמה</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>שם משתמש: </label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required style={inputStyle} />
        </div>

        <div>
          <label>סיסמה: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <small style={{ color: '#666' }}>לפחות 8 תווים, אות גדולה אחת באנגלית וסימן אחד (כמו ! @ #)</small>
        </div>

        <div>
          <label>אימות סיסמה: </label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} />
        </div>

        {error && <p style={{ color: '#c00', margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {submitting ? 'נרשם...' : 'הירשם'}
        </button>
      </form>

      <p>
        כבר יש לך חשבון? <Link to="/login" style={{ color: '#0066cc' }}>להתחברות</Link>
      </p>
    </div>
  );
}
