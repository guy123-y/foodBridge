import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.js';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDay, formatDate, isExpired, toDate } from '../utils';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPosts() {
      try {
        const snap = await getDocs(
          query(collection(db, "food_posts"), where("status", "==", "available"))
        );

        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(post => !isExpired(post));

        list.sort((a, b) => toDate(a.pickupUntil) - toDate(b.pickupUntil));
        setPosts(list);
      } catch (err) {
        console.error(err);
        setError('שגיאה בטעינת הפרסומים');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', direction: 'rtl', textAlign: 'right' }}>טוען פרסומים...</div>;
  }

  return (
    <div style={{ padding: '20px', direction: 'rtl', textAlign: 'right' }}>
      <h1>פרסומי מזון זמינים</h1>

      {error && <p style={{ color: '#c00' }}>{error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              border: '1px solid #ccc',
              padding: '15px',
              borderRadius: '8px',
              width: '240px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <h3>{post.title}</h3>
              <p><strong>כמות:</strong> {post.quantity} מנות</p>
              {post.isFresh !== undefined && (
                <p><strong>מצב:</strong> {post.isFresh ? '🥗 טרי' : 'לא טרי'}</p>
              )}
              <p><strong>מפרסם:</strong> {post.ownerName}</p>
              <p><strong>כתובת:</strong> {post.pickupAddress}</p>
              {post.pickupDetails && <p><strong>פרטים:</strong> {post.pickupDetails}</p>}
              <p><strong>איסוף עד:</strong> {formatDay(post.pickupUntil)}</p>
            </div>

            {post.ownerId !== user?.uid && (
              <Link to={`/post/${post.id}`} style={{ color: '#0066cc', textDecoration: 'none', display: 'block', marginTop: '10px' }}>
                לפרטים ובקשת איסוף ←
              </Link>
            )}
          </div>
        ))}
      </div>

      {posts.length === 0 && !error && (
        <p style={{ marginTop: '20px', color: '#666' }}>
          אין כרגע פרסומי מזון זמינים.
        </p>
      )}
    </div>
  );
}
