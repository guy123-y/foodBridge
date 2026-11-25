import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

// מציג את קוד האיסוף. הקוד שמור במסמך נפרד שרק המפרסם והאוסף המאושר יכולים לקרוא
export default function PickupCode({ postId }) {
  const [code, setCode] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'food_posts', postId, 'secret', 'code'))
      .then(snap => setCode(snap.exists() ? snap.data().code : ''))
      .catch(err => console.error(err));
  }, [postId]);

  if (!code) return null;

  return (
    <p style={{ background: '#eef5ff', border: '1px dashed #0066cc', padding: '8px', borderRadius: '6px' }}>
      <strong>קוד איסוף:</strong>{' '}
      <span style={{ fontSize: '1.4em', letterSpacing: '4px', fontWeight: 'bold' }}>{code}</span>
      <br />
      <small style={{ color: '#555' }}>האוסף מציג את הקוד למפרסם בזמן האיסוף</small>
    </p>
  );
}
