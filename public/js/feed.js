const LOCAL_LOST_KEY  = 'lostItems';
const LOCAL_FOUND_KEY = 'foundItems';
const ENGAGE_KEY      = 'feedEngagement';

function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}
const currentUser = getCurrentUser();
 
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

/* ── Render stats ── */
function renderStats() {
  const total    = allPosts.length;
  const resolved = allPosts.filter(p => p.status === 'Returned' || p.status === 'Matched').length;
  const matched  = getTopMatches().length;
  const active   = total - resolved;
  document.getElementById('statTotal').textContent    = total;
  document.getElementById('statResolved').textContent = resolved;
  document.getElementById('statMatched').textContent  = matched;
  document.getElementById('statActive').textContent   = active;
}
 
/* ── Build single post card HTML ── */
function buildPostCard(post) {
  const eng   = getEngagement();
  const pe    = eng[post.id] || { upvotes: 0, downvotes: 0, voted: null, comments: [] };
  const allComments = [...(DEMO_COMMENTS[post.id] || []), ...pe.comments];
  const avatarClass = post.type === 'found' ? 'post-avatar found-avatar' : 'post-avatar';
  const badgeClass  = post.type === 'found' ? 'type-badge found' : 'type-badge lost';
  const badgeLabel  = post.type === 'found' ? 'Found' : 'Lost';
  const dateLabel   = post.type === 'found' ? '📅 Found' : '📅 Lost';
  const dateVal     = post.date || '';
  const isVotedUp   = pe.voted === 'up'   ? 'voted' : '';
  const isVotedDown = pe.voted === 'down' ? 'voted' : '';
 
  const commentsHtml = allComments.map(c => `
    <div class="comment-item">
      <div class="comment-avatar">${escapeHtml(c.initials)}</div>
      <div class="comment-bubble">
        <div class="comment-name">${escapeHtml(c.name)}</div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      </div>
    </div>
  `).join('');
 
  return `
    <div class="post-card" id="post-${escapeHtml(post.id)}">
      <div class="post-inner">
        <div class="${avatarClass}">${escapeHtml(post.poster.initials)}</div>
        <div class="post-body">
          <div class="post-header">
            <span class="post-name">${escapeHtml(post.poster.name)}</span>
            <span class="post-handle">@${escapeHtml(post.poster.handle)}</span>
            <span class="${badgeClass}">${badgeLabel}</span>
            <span class="post-time">${timeAgo(post.createdAt || post.date)}</span>
          </div>
          <div class="post-title">${escapeHtml(post.title)}</div>
          <div class="post-meta">📍 ${escapeHtml(post.location)} &nbsp;·&nbsp; ${dateLabel} ${escapeHtml(dateVal)}</div>
          <div class="post-desc">${escapeHtml(post.description)}</div>
          <div class="engage-row">
            <button class="engage-btn vote-up ${isVotedUp}"
              onclick="handleVote('${escapeHtml(post.id)}', 'up')"
              aria-label="Upvote">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              <span id="up-${escapeHtml(post.id)}">${pe.upvotes}</span>
            </button>
            <button class="engage-btn vote-down ${isVotedDown}"
              onclick="handleVote('${escapeHtml(post.id)}', 'down')"
              aria-label="Downvote">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
              <span id="dn-${escapeHtml(post.id)}">${pe.downvotes}</span>
            </button>
            <button class="engage-btn comment-btn"
              onclick="toggleComments('${escapeHtml(post.id)}')"
              aria-label="Comments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span id="cc-${escapeHtml(post.id)}">${allComments.length}</span>
            </button>
            <button class="engage-btn"
              onclick="handleShare('${escapeHtml(post.id)}', this)"
              aria-label="Share">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share
            </button>
            <div class="engage-spacer"></div>
            <button class="msg-btn"
              onclick="handleMessage('${escapeHtml(post.poster.name)}')"
              aria-label="Message ${escapeHtml(post.poster.name)}">
              Message ${escapeHtml(post.poster.name.split(' ')[0])}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="comments-area" id="comments-${escapeHtml(post.id)}">
      ${commentsHtml}
      <div class="comment-input-row">
        <div class="comment-avatar" style="background:var(--espresso-3)">You</div>
        <input
          class="comment-input"
          placeholder="${getUser() ? 'Add a comment…' : 'Login to comment…'}"
          ${getUser() ? '' : 'readonly'}
          onkeydown="handleCommentKey(event, '${escapeHtml(post.id)}')"
        />
        <button class="comment-submit"
          onclick="submitComment('${escapeHtml(post.id)}')">Post</button>
      </div>
    </div>
  `;
}
 
/* ── Render the feed ── */
function renderFeed() {
  const list = document.getElementById('feedList');
  const emptyEl = document.getElementById('feedEmpty');
 
  const visible = allPosts.filter(post => {
    const matchesFilter =
      activeFilter === 'all' ||
      post.type === activeFilter;
 
    const matchesSearch = !searchTerm ||
      [post.title, post.category, post.location, post.description]
        .join(' ').toLowerCase().includes(searchTerm);
 
    return matchesFilter && matchesSearch;
  });
 
  if (!visible.length) {
    list.innerHTML = '';
    emptyEl.classList.remove('hide');
    return;
  }
 
  emptyEl.classList.add('hide');
  list.innerHTML = visible.map(buildPostCard).join('');
}
 
/* ── Tab handling ── */
function setTab(btn) {
  document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = btn.dataset.filter;
  renderFeed();
}
 
/* ── Search handling ── */
function handleSearch() {
  searchTerm = document.getElementById('feedSearch').value.trim().toLowerCase();
  renderFeed();
}
 
/* ── Vote handling ── */
function handleVote(postId, direction) {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
 
  const eng = getEngagement();
  const pe  = eng[postId] || { upvotes: 0, downvotes: 0, voted: null, comments: [] };
 
  if (pe.voted === direction) {
    /* undo vote */
    if (direction === 'up') pe.upvotes   = Math.max(0, pe.upvotes - 1);
    else                    pe.downvotes = Math.max(0, pe.downvotes - 1);
    pe.voted = null;
  } else {
    /* switch vote or new vote */
    if (pe.voted === 'up')   pe.upvotes   = Math.max(0, pe.upvotes - 1);
    if (pe.voted === 'down') pe.downvotes = Math.max(0, pe.downvotes - 1);
    if (direction === 'up') pe.upvotes++;
    else                    pe.downvotes++;
    pe.voted = direction;
  }
 
  eng[postId] = pe;
  saveEngagement(eng);
 
  /* update DOM without full re-render */
  const upEl = document.getElementById('up-' + postId);
  const dnEl = document.getElementById('dn-' + postId);
  if (upEl) upEl.textContent = pe.upvotes;
  if (dnEl) dnEl.textContent = pe.downvotes;
 
  const card = document.getElementById('post-' + postId);
  if (card) {
    card.querySelector('.vote-up') ?.classList.toggle('voted', pe.voted === 'up');
    card.querySelector('.vote-down')?.classList.toggle('voted', pe.voted === 'down');
  }
}
 
/* ── Comment handling ── */
function toggleComments(postId) {
  const area = document.getElementById('comments-' + postId);
  if (!area) return;
  area.classList.toggle('open');
  if (area.classList.contains('open')) {
    const input = area.querySelector('.comment-input');
    if (input && !input.readOnly) input.focus();
  }
}
 
function handleCommentKey(e, postId) {
  if (e.key === 'Enter') submitComment(postId);
}
 
function submitComment(postId) {
  const user = getUser();
  if (!user) { window.location.href = 'login.html'; return; }
 
  const area  = document.getElementById('comments-' + postId);
  if (!area) return;
  const input = area.querySelector('.comment-input');
  const text  = input.value.trim();
  if (!text) return;
 
  /* Save to localStorage */
  const eng = getEngagement();
  const pe  = eng[postId] || { upvotes: 0, downvotes: 0, voted: null, comments: [] };
  const newComment = {
    initials: (user.name || 'U').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2),
    name: user.name || 'You',
    text
  };
  pe.comments.push(newComment);
  eng[postId] = pe;
  saveEngagement(eng);
 
  /* Inject into DOM */
  const inputRow = area.querySelector('.comment-input-row');
  const commentEl = document.createElement('div');
  commentEl.className = 'comment-item';
  commentEl.innerHTML = `
    <div class="comment-avatar">${escapeHtml(newComment.initials)}</div>
    <div class="comment-bubble">
      <div class="comment-name">${escapeHtml(newComment.name)}</div>
      <div class="comment-text">${escapeHtml(newComment.text)}</div>
    </div>
  `;
  area.insertBefore(commentEl, inputRow);
  input.value = '';
 
  /* Update comment count */
  const countEl = document.getElementById('cc-' + postId);
  if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
}
 
/* ── Share handling ── */
function handleShare(postId, btn) {
  const url = window.location.origin + window.location.pathname + '?post=' + postId;
  navigator.clipboard.writeText(url).catch(() => {});
  const orig = btn.innerHTML;
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
      <polyline points="20 6 9 17 4 12"/>
    </svg> Copied!`;
  setTimeout(() => { btn.innerHTML = orig; }, 1800);
}
 
/* ── Message button ── */
function handleMessage(name) {
  if (!getUser()) {
    window.location.href = 'login.html';
    return;
  }
  window.location.href = 'chat.html';
}
 
/* ── Nav rendering ── */
function renderNav() {
  const user   = getUser();
  const navEl  = document.getElementById('navLinks');
  const guestCta  = document.getElementById('guestCta');
  const loggedCta = document.getElementById('loggedCta');
 
  if (user) {
    navEl.innerHTML = `
      <a href="main.html"      class="nav-text-link">Main Page</a>
      <a href="notifications.html" class="nav-text-link">Notifications</a>
      <a href="dashboard.html" class="btn btn-ghost-light">My Dashboard</a>
    `;
    guestCta ?.classList.add('hide');
    loggedCta?.classList.remove('hide');
  } else {
    navEl.innerHTML = `
      <a href="login.html"    class="btn btn-ghost-light">Login</a>
      <a href="register.html" class="btn btn-gold">Sign Up</a>
    `;
    guestCta ?.classList.remove('hide');
    loggedCta?.classList.add('hide');
  }
}
 
/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  renderNav();
  renderFeed();
  renderMatches();
  renderStats();
});
