import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.js';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDay, formatDate, toDate, statusLabels, statusColors } from '../utils';
import PickupCode from './PickupCode';

// mode="posts"   -> הפרסומים שלי (מה שאני פרסמתי)
// mode="pickups" -> האיסופים שלי (מה שביקשתי לאסוף)
export default function MyPosts({ mode }) {
  const { user } = useAuth();
  const isPostsPage = mode === 'posts';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError('');

      try {
        const field = isPostsPage ? "ownerId" : "claimedBy";
        const snap = await getDocs(
          query(collection(db, "food_posts"), where(field, "==", user.uid))
        );

        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => toDate(b.pickupUntil) - toDate(a.pickupUntil));
        setPosts(list);
      } catch (err) {
        console.error(err);
        setError('שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [user.uid, isPostsPage]);

  if (loading) {
    return <div style={{ padding: '20px', direction: 'rtl', textAlign: 'right' }}>טוען...</div>;
  }

  return (
    <div style={{ padding: '20px', direction: 'rtl', textAlign: 'right' }}>
      <h1>{isPostsPage ? 'הפרסומים שלי' : 'האיסופים שלי'}</h1>

      {error && <p style={{ color: '#c00' }}>{error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              border: post.status === 'requested' && isPostsPage ? '2px solid #f0ad4e' : '1px solid #ccc',
              padding: '15px',
              borderRadius: '8px',
              width: '240px'
            }}
          >
            <h3>{post.title}</h3>
            <p>
              <span style={{ background: statusColors[post.status], color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '0.9em' }}>
                {statusLabels[post.status]}
              </span>
            </p>
            <p><strong>כמות:</strong> {post.quantity} מנות</p>
            <p><strong>כתובת:</strong> {post.pickupAddress}</p>
            {post.pickupDetails && <p><strong>פרטים:</strong> {post.pickupDetails}</p>}
            <p><strong>איסוף עד:</strong> {formatDay(post.pickupUntil)}</p>

            {isPostsPage && post.claimedByName && (
              <p><strong>אוסף:</strong> {post.claimedByName}</p>
            )}
            {!isPostsPage && (
              <p><strong>מפרסם:</strong> {post.ownerName}</p>
            )}

            {isPostsPage && post.status === 'requested' && (
              <p style={{ color: '#a66d00', fontWeight: 'bold' }}>יש בקשת איסוף שממתינה לאישורך</p>
            )}

            {post.status === 'approved' && <PickupCode postId={post.id} />}

            <Link to={`/post/${post.id}`} style={{ color: '#0066cc', textDecoration: 'none', display: 'block', marginTop: '10px' }}>
              {isPostsPage ? 'לפרטים ולניהול ←' : 'לפרטים ←'}
            </Link>
          </div>
        ))}
      </div>

      {posts.length === 0 && !error && (
        <p style={{ marginTop: '20px', color: '#666' }}>
          {isPostsPage ? 'עוד לא פרסמת מזון.' : 'עוד לא ביקשת לאסוף פרסומים.'}
        </p>
      )}
    </div>
  );
}
