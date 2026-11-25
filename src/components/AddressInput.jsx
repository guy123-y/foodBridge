import React, { useState, useEffect } from 'react';

// השלמה אוטומטית לכתובות דרך Photon (מבוסס OpenStreetMap).
// lang=default מחזיר את השם המקומי - בישראל זה עברית.
// bbox מגביל את התוצאות לאזור ישראל.
const PHOTON_URL = 'https://photon.komoot.io/api/?limit=5&lang=default&bbox=34.2,29.4,35.95,33.4&q=';

function formatAddress(p) {
  // בלי מספר בניין - הוא מוזן בשדה נפרד
  const street = p.street || '';
  const parts = [p.name, street, p.city].filter(Boolean);
  return [...new Set(parts)].join(', ');
}

export default function AddressInput({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;

    // מחכים שהמשתמש יפסיק להקליד לרגע לפני שפונים לשרת
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(PHOTON_URL + encodeURIComponent(value));
        const data = await res.json();
        const list = [...new Set(data.features.map(f => formatAddress(f.properties)))];
        if (!cancelled) setSuggestions(list);
      } catch (err) {
        console.error(err);
        if (!cancelled) setSuggestions([]);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, open]);

  function handleSelect(address) {
    onChange(address);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onBlur={() => setOpen(false)}
        placeholder="התחל להקליד כתובת..."
        autoComplete="off"
        required
        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
      />

      {open && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute', top: '100%', right: 0, left: 0, zIndex: 10,
          listStyle: 'none', margin: 0, padding: 0,
          background: 'white', border: '1px solid #ccc', borderRadius: '4px'
        }}>
          {suggestions.map((address) => (
            <li
              key={address}
              // onMouseDown ולא onClick - כדי שהבחירה תתפוס לפני שהשדה מאבד פוקוס
              onMouseDown={(e) => { e.preventDefault(); handleSelect(address); }}
              style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            >
              {address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
