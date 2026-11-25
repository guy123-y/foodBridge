import React, { useState } from 'react';
import { collection, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddressInput from './AddressInput';

export default function PostForm() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [isFresh, setIsFresh] = useState(true);
  const [pickupAddress, setPickupAddress] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [pickupDetails, setPickupDetails] = useState('');
  const [pickupUntil, setPickupUntil] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (title.trim() === '' || pickupAddress.trim() === '') {
      setError('יש למלא תיאור וכתובת איסוף');
      return;
    }

    if (Number(quantity) < 1) {
      setError('הכמות חייבת להיות לפחות מנה אחת');
      return;
    }

    // האיסוף אפשרי עד סוף היום שנבחר
    const deadline = new Date(`${pickupUntil}T23:59:00`);
    if (deadline <= new Date()) {
      setError('מועד האיסוף חייב להיות בעתיד');
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "food_posts"), {
        ownerId: user.uid,
        ownerName: profile.name,
        title: title.trim(),
        quantity: Number(quantity),
        isFresh,
        pickupAddress: `${pickupAddress.trim()} ${buildingNumber.trim()}`.trim(),
        pickupDetails: pickupDetails.trim(),
        pickupUntil: Timestamp.fromDate(deadline),
        status: 'available',
        claimedBy: null,
        claimedByName: null,
        claimedAt: null,
        createdAt: serverTimestamp()
      });

      navigate('/my-posts');
    } catch (err) {
      console.error(err);
      setError(`הוספת הפרסום נכשלה, נסה שוב (${err.code || err.message})`);
    } finally {
      setSubmitting(false);
    }
  }

  // כפתור בחירה בסגנון "גלולה" - ירוק כשהוא נבחר
  function choiceStyle(selected) {
    return {
      flex: 1, padding: '8px', borderRadius: '20px', cursor: 'pointer',
      border: selected ? '2px solid #4CAF50' : '1px solid #ccc',
      background: selected ? '#e8f5e9' : 'white',
      fontWeight: selected ? 'bold' : 'normal'
    };
  }

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', direction: 'rtl', textAlign: 'right' }}>
      <h2>פרסום מזון חדש</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>מה מוסרים? </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="למשל: כריכים וקרואסונים"
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label>כמות (מנות): </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label>מצב המזון: </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <button type="button" onClick={() => setIsFresh(true)} style={choiceStyle(isFresh)}>
              🥗 טרי (הוכן היום)
            </button>
            <button type="button" onClick={() => setIsFresh(false)} style={choiceStyle(!isFresh)}>
              לא טרי (מימים קודמים)
            </button>
          </div>
        </div>

        <div>
          <label>כתובת איסוף: </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 3 }}>
              <AddressInput value={pickupAddress} onChange={setPickupAddress} />
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={buildingNumber}
              onChange={(e) => setBuildingNumber(e.target.value)}
              placeholder="מס' בניין"
              aria-label="מספר בניין"
              required
              style={{ flex: 1, minWidth: 0, padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label>פרטים על מקום האיסוף <span style={{ color: '#888' }}>(לא חובה)</span>: </label>
          <textarea
            value={pickupDetails}
            onChange={(e) => setPickupDetails(e.target.value)}
            placeholder="למשל: קומה 2, דירה 5, לצלצל בפעמון / להשאיר ליד הדלת"
            rows={3}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <div>
          <label>אפשר לאסוף עד תאריך: </label>
          <input
            type="date"
            min={new Date().toLocaleDateString('en-CA')}
            value={pickupUntil}
            onChange={(e) => setPickupUntil(e.target.value)}
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
          {submitting ? 'שומר...' : 'פרסם'}
        </button>
      </form>
    </div>
  );
}
