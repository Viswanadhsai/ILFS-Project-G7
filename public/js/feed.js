const LOCAL_LOST_KEY  = 'lostItems';
const LOCAL_FOUND_KEY = 'foundItems';
const ENGAGE_KEY      = 'feedEngagement';
 
/* ── Demo seed data (mirrors dashboard.js / admin.js) ── */
const DEMO_LOST = [
  {
    id: 'demo-lost-1',
    title: 'Black Laptop Sleeve',
    category: 'Electronics',
    dateLost: '2026-05-03',
    location: 'Library study area',
    description: 'Black zip laptop sleeve with a charger pocket. Left it on the second floor near the windows. Has a small red sticker on the zipper.',
    status: 'Lost',
    poster: { name: 'Alex J.', initials: 'AJ', handle: 'alexj' },
    createdAt: '2026-05-03T09:15:00Z'
  },
  {
    id: 'demo-lost-2',
    title: 'Student ID Card',
    category: 'Documents',
    dateLost: '2026-05-02',
    location: 'Cafeteria',
    description: 'Lost my student ID in a clear plastic holder near the checkout. Name starts with P. Please message if found!',
    status: 'Lost',
    poster: { name: 'Priya R.', initials: 'PR', handle: 'priya_r' },
    createdAt: '2026-05-02T14:30:00Z'
  }
];
 
const DEMO_FOUND = [
  {
    id: 'demo-found-1',
    title: 'Blue Backpack',
    category: 'Bag',
    dateFound: '2026-05-04',
    location: 'Main library entrance',
    description: 'Blue backpack left near the entrance. Has a water bottle in the side pocket. Handed it in at the front desk — come collect with ID.',
    status: 'Found',
    poster: { name: 'Kim L.', initials: 'KL', handle: 'kimlee' },
    createdAt: '2026-05-04T11:00:00Z'
  },
  {
    id: 'demo-found-2',
    title: 'Car Keys',
    category: 'Keys',
    dateFound: '2026-05-01',
    location: 'Computer lab',
    description: 'Key ring with two silver keys and a black fob tag. Found on a desk near the back row. Handed to the lab supervisor.',
    status: 'Found',
    poster: { name: 'Dan O.', initials: 'DO', handle: 'dano_94' },
    createdAt: '2026-05-01T16:45:00Z'
  }
];
 
const DEMO_COMMENTS = {
  'demo-lost-1': [
    { initials: 'SM', name: 'Sarah M.', text: 'I think I saw something like this near the second-floor printer!' },
    { initials: 'JT', name: 'James T.', text: 'Was it a Targus brand sleeve? Found one yesterday.' }
  ],
  'demo-found-1': [
    { initials: 'RD', name: 'Riya D.', text: 'Thank you for handing it in! I will come by today.' }
  ]
};
 
/* ── State ── */
let allPosts    = [];
let activeFilter = 'all';
let searchTerm   = '';
 
/* ── Helpers ── */
function escapeHtml(v) {
  return String(v || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
 
function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  const days = Math.floor(diff / 86400);
  return days === 1 ? 'Yesterday' : days + 'd ago';
}
 
function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
}
 
function getEngagement() {
  try { return JSON.parse(localStorage.getItem(ENGAGE_KEY) || '{}'); }
  catch { return {}; }
}
 
function saveEngagement(data) {
  localStorage.setItem(ENGAGE_KEY, JSON.stringify(data));
}
 
/* ── Load all posts from localStorage + demo data ── */
function loadPosts() {
  const localLost  = JSON.parse(localStorage.getItem(LOCAL_LOST_KEY)  || '[]');
  const localFound = JSON.parse(localStorage.getItem(LOCAL_FOUND_KEY) || '[]');
 
  const lostPosts = [...localLost, ...DEMO_LOST].map(item => ({
    ...item,
    type: 'lost',
    date: item.dateLost,
    poster: item.poster || { name: 'Anonymous', initials: 'AN', handle: 'anon' }
  }));
 
  const foundPosts = [...localFound, ...DEMO_FOUND].map(item => ({
    ...item,
    type: 'found',
    date: item.dateFound,
    poster: item.poster || { name: 'Anonymous', initials: 'AN', handle: 'anon' }
  }));
 
  allPosts = [...lostPosts, ...foundPosts].sort(
    (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
  );
}
 
/* ── Matching algorithm (same logic as dashboard.js) ── */
function normaliseWords(value) {
  const stop = ['a','an','and','at','in','near','of','on','the','to','with'];
  return String(value || '').toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
    .filter(w => w.length > 2 && !stop.includes(w));
}
 
function getItemWords(item) {
  return normaliseWords([item.title, item.category, item.location, item.description].join(' '));
}
 
function countShared(a, b) {
  const bs = new Set(b);
  return new Set(a.filter(w => bs.has(w))).size;
}
 
function scoreMatch(lost, found) {
  let score = 0;
  const reasons = [];
  if (lost.category && lost.category === found.category) { score += 35; reasons.push('same category'); }
  const kw = countShared(getItemWords(lost), getItemWords(found));
  if (kw > 0) { score += Math.min(kw * 12, 36); reasons.push(kw + ' shared keyword' + (kw > 1 ? 's' : '')); }
  const lw = countShared(normaliseWords(lost.location), normaliseWords(found.location));
  if (lw > 0) { score += 18; reasons.push('similar location'); }
  const gap = lost.date && found.date
    ? Math.round((new Date(found.date) - new Date(lost.date)) / 86400000)
    : null;
  if (gap !== null && gap >= 0 && gap <= 14) { score += 11; reasons.push('date range fits'); }
  else if (gap !== null && gap < 0) score -= 20;
  return { lost, found, score: Math.max(0, Math.min(score, 100)), reasons };
}
 
function getTopMatches() {
  const lost  = allPosts.filter(p => p.type === 'lost'  && p.status !== 'Returned');
  const found = allPosts.filter(p => p.type === 'found' && p.status !== 'Returned');
  return lost.flatMap(l => found.map(f => scoreMatch(l, f)))
    .filter(m => m.score >= 45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}
 
/* ── Render sidebar matches ── */
function renderMatches() {
  const matches = getTopMatches();
  const el = document.getElementById('matchList');
  if (!matches.length) {
    el.innerHTML = '<p style="font-size:13px;color:var(--ink-soft);font-style:italic;">No strong matches yet.</p>';
    return;
  }
  el.innerHTML = matches.map(m => `
    <div class="match-item">
      <div class="match-pill">${m.score}% match</div>
      <div class="match-names">${escapeHtml(m.lost.title)} &harr; ${escapeHtml(m.found.title)}</div>
      <div class="match-reason">${escapeHtml(m.reasons.join(', '))}</div>
    </div>
  `).join('');
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  renderNav();
  renderFeed();
  renderMatches();
  renderStats();
})