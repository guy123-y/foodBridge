export const statusLabels = {
  available: 'זמין',
  requested: 'ממתין לאישור המפרסם',
  approved: 'אושר לאיסוף',
  completed: 'נאסף'
};

export const statusColors = {
  available: '#4CAF50',
  requested: '#f0ad4e',
  approved: '#0066cc',
  completed: '#888'
};

export function toDate(value) {
  if (!value) return null;
  return value.toDate ? value.toDate() : new Date(value);
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return '-';
  return date.toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
}

export function formatDay(value) {
  const date = toDate(value);
  if (!date) return '-';
  return date.toLocaleDateString('he-IL');
}

export function isExpired(post) {
  const date = toDate(post.pickupUntil);
  return !date || date < new Date();
}

// מחזיר הודעת שגיאה אם הסיסמה לא תקינה, או מחרוזת ריקה אם הכול בסדר
export function checkPassword(password) {
  if (password.length < 8) return 'הסיסמה חייבת להכיל לפחות 8 תווים';
  if (!/[A-Z]/.test(password)) return 'הסיסמה חייבת להכיל לפחות אות גדולה אחת באנגלית (A-Z)';
  if (!/[^A-Za-z0-9]/.test(password)) return 'הסיסמה חייבת להכיל לפחות סימן אחד (כמו ! @ # $)';
  return '';
}

// קוד איסוף בן 4 ספרות
export function makePickupCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}


// Firebase Auth דורש אימייל, לכן שם המשתמש הופך לכתובת פנימית (המשתמש לא רואה אותה)
const USERNAME_DOMAIN = 'foodbridge.app';

export function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@${USERNAME_DOMAIN}`;
}

export function emailToUsername(email) {
  return (email || '').replace(`@${USERNAME_DOMAIN}`, '');
}

// מחזיר הודעת שגיאה אם שם המשתמש לא תקין, או מחרוזת ריקה אם הכול בסדר
export function checkUsername(username) {
  const u = username.trim();
  if (u.length < 3) return 'שם המשתמש חייב להכיל לפחות 3 תווים';
  if (!/^[A-Za-z0-9_.-]+$/.test(u)) return 'שם המשתמש יכול להכיל רק אותיות באנגלית, ספרות, וסימנים _ . -';
  return '';
}
