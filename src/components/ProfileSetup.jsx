import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfileSetup() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('private');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <div style={{ padding: '20px' }}>טוען...</div>;
  if (!user) return <Navigate to="/login" />;
  if (profile) return <Navigate to="/" />;   // כבר יש כרטיס פרופיל

  const isBusiness = accountType === 'business';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('יש להזין שם מלא');
      return;
    }

    setSubmitting(true);

    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: user.email,
        accountType,
        companyName: isBusiness ? companyName.trim() : '',
        website: isBusiness ? website.trim() : '',
        phone: phone.trim()
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(`שמירת הפרופיל נכשלה (${err.code || err.message})`);
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', direction: 'rtl', textAlign: 'right' }}>
      <h2>יצירת כרטיס פרופיל</h2>
      <p style={{ color: '#555' }}>לפני שמתחילים לפרסם או לאסוף, ספר לנו מי אתה.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>שם מלא: *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        </div>

        <div>
          <label>סוג חשבון: *</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
            <label>
              <input type="radio" checked={accountType === 'private'} onChange={() => setAccountType('private')} /> פרטי
            </label>
            <label>
              <input type="radio" checked={isBusiness} onChange={() => setAccountType('business')} /> עסק / עמותה
            </label>
          </div>
        </div>

        {isBusiness && (
          <>
            <div>
              <label>שם החברה (לא חובה):</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label>אתר החברה (לא חובה):</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." style={inputStyle} />
            </div>
          </>
        )}

        <div>
          <label>טלפון ליצירת קשר (לא חובה):</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        </div>

        {error && <p style={{ color: '#c00', margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {submitting ? 'שומר...' : 'שמור והמשך'}
        </button>
      </form>
    </div>
  );
}
