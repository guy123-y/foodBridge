import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDay, formatDate, isExpired, statusLabels, statusColors, makePickupCode } from '../utils';
import PickupCode from './PickupCode';

export default function PostDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  async function loadPost() {
    try {
      const snap = await getDoc(doc(db, "food_posts", id));

      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() });
      } else {
        setError('הפרסום לא נמצא');
      }
    } catch (err) {
      console.error(err);
      setError('שגיאה בטעינת הפרסום');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPost();
  }, [id]);

  // מריץ פעולה, מציג שגיאה אם נכשלה, ובסוף טוען מחדש את הפרסום
  async function runAction(action, errorMessage) {
    setError('');
    setWorking(true);

    try {
      await action();
    } catch (err) {
      console.error(err);
      setError(errorMessage);
    } finally {
      await loadPost();
      setWorking(false);
    }
  }

  // אוסף מבקש לאסוף - הבקשה ממתינה לאישור המפרסם
  function handleRequest() {
    runAction(
      () => updateDoc(doc(db, "food_posts", id), {
        status: 'requested',
        claimedBy: user.uid,
        claimedByName: profile.name,
        claimedAt: serverTimestamp()
      }),
      'לא ניתן לבקש את הפרסום. ייתכן שמישהו אחר כבר ביקש אותו או שהמועד חלף.'
    );
  }

  // המפרסם מאשר: הסטטוס משתנה ונוצר קוד איסוף סודי - שתי הפעולות יחד
  function handleApprove() {
    runAction(async () => {
      const batch = writeBatch(db);
      batch.update(doc(db, "food_posts", id), { status: 'approved' });
      batch.set(doc(db, "food_posts", id, "secret", "code"), { code: makePickupCode() });
      await batch.commit();
    }, 'האישור נכשל, נסה שוב');
  }

  // המפרסם דוחה: הפרסום חוזר להיות זמין לכולם
  function handleReject() {
    runAction(
      () => updateDoc(doc(db, "food_posts", id), {
        status: 'available',
        claimedBy: null,
        claimedByName: null,
        claimedAt: null
      }),
      'הדחייה נכשלה, נסה שוב'
    );
  }

  function handleComplete() {
    runAction(
      () => updateDoc(doc(db, "food_posts", id), { status: 'completed' }),
      'העדכון נכשל, נסה שוב'
    );
  }

  if (loading) {
    return <div style={{ padding: '20px', direction: 'rtl', textAlign: 'right' }}>טוען פרטים...</div>;
  }

  if (!post) {
    return (
      <div style={{ padding: '20px', direction: 'rtl', textAlign: 'right' }}>
        <p style={{ color: '#c00' }}>{error || 'הפרסום לא נמצא'}</p>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>← חזרה לרשימה</Link>
      </div>
    );
  }

  const expired = isExpired(post);
  const isOwner = post.ownerId === user.uid;
  const isCollector = post.claimedBy === user.uid;

  const canRequest = !isOwner && post.status === 'available' && !expired;
  const canApprove = isOwner && post.status === 'requested';
  const showCode = (isOwner || isCollector) && (post.status === 'approved' || post.status === 'completed');
  const canComplete = isOwner && post.status === 'approved';

  const buttonStyle = { padding: '10px 20px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' };

  return (
    <div style={{ maxWidth: '550px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', direction: 'rtl', textAlign: 'right' }}>
      <h2>{post.title}</h2>

      <p>
        <strong>סטטוס: </strong>
        <span style={{ background: statusColors[post.status], color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '0.9em' }}>
          {statusLabels[post.status]}
        </span>
      </p>

      <p><strong>כמות:</strong> {post.quantity} מנות</p>
      {post.isFresh !== undefined && (
        <p><strong>מצב:</strong> {post.isFresh ? '🥗 טרי' : 'לא טרי'}</p>
      )}
      <p><strong>מפרסם:</strong> {post.ownerName}</p>
      <p><strong>כתובת איסוף:</strong> {post.pickupAddress}</p>
      {post.pickupDetails && <p><strong>פרטים על מקום האיסוף:</strong> {post.pickupDetails}</p>}
      <p><strong>אפשר לאסוף עד:</strong> {formatDay(post.pickupUntil)}</p>

      {post.claimedByName && (isOwner || isCollector) && (
        <p><strong>אוסף:</strong> {post.claimedByName}</p>
      )}

      {isCollector && post.status === 'requested' && (
        <p style={{ color: '#a66d00' }}>הבקשה שלך נשלחה וממתינה לאישור המפרסם.</p>
      )}

      {showCode && <PickupCode postId={post.id} />}

      {expired && post.status === 'available' && (
        <p style={{ color: '#c00' }}>מועד האיסוף של הפרסום הזה חלף.</p>
      )}

      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {canRequest && (
        <button onClick={handleRequest} disabled={working} style={{ ...buttonStyle, backgroundColor: '#4CAF50' }}>
          {working ? 'שולח...' : 'בקש לאסוף'}
        </button>
      )}

      {canApprove && (
        <>
          <button onClick={handleApprove} disabled={working} style={{ ...buttonStyle, backgroundColor: '#4CAF50' }}>
            אשר את {post.claimedByName}
          </button>
          <button onClick={handleReject} disabled={working} style={{ ...buttonStyle, backgroundColor: '#c00' }}>
            דחה
          </button>
        </>
      )}

      {canComplete && (
        <button onClick={handleComplete} disabled={working} style={{ ...buttonStyle, backgroundColor: '#0066cc' }}>
          {working ? 'מעדכן...' : 'סמן שהאיסוף הושלם'}
        </button>
      )}

      <br />
      <Link to="/" style={{ display: 'inline-block', marginTop: '15px', textDecoration: 'none', color: '#0066cc' }}>
        ← חזרה לרשימה
      </Link>
    </div>
  );
}
