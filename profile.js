// ==================== PROFILE SYSTEM v2 (☁️ Server Sync + 💾 Local Fallback) ====================
const PROFILE_DB_KEY = 'neonix_users';
const PROFILE_SESSION_KEY = 'neonix_session';
const TOKEN_KEY = 'neonix_token';
const CACHE_KEY = 'neonix_profile';
let matchStartTime = Date.now();

// ---------- ابزار ----------
function loadUsers() { try { return JSON.parse(localStorage.getItem(PROFILE_DB_KEY)) || {}; } catch (e) { return {}; } }
function saveUsers(u) { localStorage.setItem(PROFILE_DB_KEY, JSON.stringify(u)); }
function hashPass(p) {
    const s = 'NEONIX::' + p + '::XENOVA';
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return 'h' + String(h);
}
function serverReady() { return !!(typeof socket !== 'undefined' && socket && socket.id); }
function emptyStats() { return { games: 0, wins: 0, kills: 0, deaths: 0, coins: 0, bestStreak: 0, playTime: 0 }; }

// ---------- نشست (Session) ----------
function getSession() { return localStorage.getItem(PROFILE_SESSION_KEY); }
function setSession(v) { if (v) localStorage.setItem(PROFILE_SESSION_KEY, v); else localStorage.removeItem(PROFILE_SESSION_KEY); }
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(v) { if (v) localStorage.setItem(TOKEN_KEY, v); else localStorage.removeItem(TOKEN_KEY); }
function getCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (e) { return null; } }
function setCache(p) { if (p) localStorage.setItem(CACHE_KEY, JSON.stringify(p)); else localStorage.removeItem(CACHE_KEY); }
function isServerProfile() { return !!getToken(); }

function currentProfile() {
    if (isServerProfile()) return getCache();      // ☁️ حالت آنلاین
    const s = getSession();                        // 💾 حالت آفلاین
    if (!s) return null;
    return loadUsers()[s] || null;
}

function profileMessage(type, msg) {
    const el = document.getElementById('auth-message');
    if (!el) return;
    el.className = 'auth-message ' + type;
    el.innerText = msg;
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}

function toggleAuth(which) {
    document.getElementById('auth-login').style.display = which === 'login' ? 'block' : 'none';
    document.getElementById('auth-register').style.display = which === 'register' ? 'block' : 'none';
}

// ---------- ثبت‌نام ----------
function doRegister() {
    const username = (document.getElementById('reg-username').value || '').trim();
    const pass = document.getElementById('reg-password').value;
    const pass2 = document.getElementById('reg-password2').value;
    if (username.length < 3) return profileMessage('error', '❌ نام کاربری حداقل ۳ کاراکتر');
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return profileMessage('error', '❌ فقط حروف انگلیسی، عدد و _');
    if (pass.length < 6) return profileMessage('error', '❌ رمز حداقل ۶ کاراکتر');
    if (pass !== pass2) return profileMessage('error', '❌ تکرار رمز مطابقت نداره');
    const color = localStorage.getItem('p1Color') || '#ff416c';
    const shape = localStorage.getItem('playerShape') || 'circle';

    if (serverReady()) {
        // ☁️ ثبت‌نام روی سرور مرکزی
        socket.emit('profile:register', { username: username, pass: hashPass(pass), color: color, shape: shape }, (res) => {
            if (res.success) {
                setToken(res.token); setCache(res.profile); setSession(null);
                profileMessage('success', '✅ پروفایل ساخته شد! (☁️ سینک با سرور)');
                renderProfileTab();
            } else profileMessage('error', '❌ ' + res.error);
        });
    } else {
        // 💾 ثبت‌نام محلی
        const users = loadUsers();
        const key = username.toLowerCase();
        if (users[key]) return profileMessage('error', '❌ این نام کاربری قبلاً ثبت شده');
        users[key] = { username: username, pass: hashPass(pass), color: color, shape: shape, createdAt: Date.now(), level: 1, xp: 0, stats: emptyStats() };
        saveUsers(users);
        setSession(key); setToken(null); setCache(null);
        profileMessage('success', '✅ پروفایل ساخته شد! (💾 فقط این دستگاه)');
        renderProfileTab();
    }
}

// ---------- ورود ----------
function doLogin() {
    const username = (document.getElementById('login-username').value || '').trim();
    const pass = document.getElementById('login-password').value;
    if (!username || !pass) return profileMessage('error', '❌ نام کاربری و رمز رو وارد کن');

    if (serverReady()) {
        socket.emit('profile:login', { username: username, pass: hashPass(pass) }, (res) => {
            if (res.success) {
                setToken(res.token); setCache(res.profile); setSession(null);
                profileMessage('success', '✅ خوش اومدی ' + res.profile.username + '! (☁️)');
                renderProfileTab();
            } else {
                // اگه سرور نشناخت، شایدم محلیه
                localLogin(username, pass);
            }
        });
    } else {
        localLogin(username, pass);
    }
}
function localLogin(username, pass) {
    const users = loadUsers();
    const key = username.toLowerCase();
    const u = users[key];
    if (!u) return profileMessage('error', '❌ کاربری با این نام پیدا نشد');
    if (u.pass !== hashPass(pass)) return profileMessage('error', '❌ رمز عبور اشتباهه');
    setSession(key); setToken(null); setCache(null);
    profileMessage('success', '✅ خوش اومدی ' + u.username + '! (💾)');
    renderProfileTab();
}

function doLogout() {
    setSession(null); setToken(null); setCache(null);
    renderProfileTab();
}

// ---------- رندر پروفایل ----------
function renderProfileTab() {
    const out = document.getElementById('profile-logged-out');
    const inn = document.getElementById('profile-logged-in');
    const tabBtn = document.getElementById('profile-tab-btn');
    if (!out || !inn) return;
    const p = currentProfile();
    if (!p) {
        out.style.display = 'block';
        inn.style.display = 'none';
        if (tabBtn) tabBtn.innerText = '👤 پروفایل';
        return;
    }
    out.style.display = 'none';
    inn.style.display = 'block';
    const syncBadge = isServerProfile() ? ' ☁️' : ' 💾';
    if (tabBtn) tabBtn.innerText = '👤 ' + p.username;
    document.getElementById('profile-username').innerText = p.username + syncBadge;
    document.getElementById('profile-level').innerText = 'Lv.' + p.level;
    document.getElementById('profile-xp').style.width = Math.min(100, (p.xp / (p.level * 100)) * 100) + '%';
    const av = document.getElementById('profile-avatar');
    if (av && typeof drawShape === 'function') {
        const c = av.getContext('2d');
        c.clearRect(0, 0, 80, 80);
        drawShape(c, 40, 40, 26, p.shape || 'circle', p.color || '#66fcf1');
    }
    const s = p.stats || {};
    const winRate = s.games ? Math.round((s.wins / s.games) * 100) : 0;
    const kd = s.deaths ? (s.kills / s.deaths).toFixed(1) : s.kills;
    const mins = Math.floor((s.playTime || 0) / 60);
    document.getElementById('profile-stats').innerHTML = `
        <div class="pstat"><div class="v">${s.games || 0}</div><div class="l">بازی‌ها</div></div>
        <div class="pstat"><div class="v">${s.wins || 0}</div><div class="l">بردها</div></div>
        <div class="pstat"><div class="v">${winRate}%</div><div class="l">درصد برد</div></div>
        <div class="pstat"><div class="v">${kd}</div><div class="l">K/D</div></div>
        <div class="pstat"><div class="v">${s.kills || 0}</div><div class="l">کشته‌ها</div></div>
        <div class="pstat"><div class="v">${s.deaths || 0}</div><div class="l">مرگ‌ها</div></div>
        <div class="pstat"><div class="v">${s.coins || 0}</div><div class="l">سکه کل</div></div>
        <div class="pstat"><div class="v">${s.bestStreak || 0}</div><div class="l">بهترین استریک</div></div>
        <div class="pstat"><div class="v">${mins}</div><div class="l">دقیقه بازی</div></div>
        <div class="pstat"><div class="v">${new Date(p.createdAt).toLocaleDateString('fa-IR')}</div><div class="l">عضویت</div></div>
    `;
}

// ---------- ذخیره آمار بعد از هر بازی ----------
function updateProfileStats(winnerId) {
    const p = currentProfile();
    if (!p) return; // مهمان = ذخیره نمیشه
    let myId = 1;
    if (typeof onlineMode !== 'undefined' && onlineMode && myPlayerId) myId = myPlayerId;
    const P1 = (typeof GameState !== 'undefined' && GameState.p1) ? GameState.p1 : p1;
    const P2 = (typeof GameState !== 'undefined' && GameState.p2) ? GameState.p2 : p2;
    const me = myId === 1 ? P1 : P2;
    const s = p.stats;
    s.games++;
    if (winnerId === myId) s.wins++;
    s.kills += me.kills;
    s.deaths += me.deaths;
    s.coins += me.coins;
    s.bestStreak = Math.max(s.bestStreak || 0, me.killStreak || 0);
    s.playTime += Math.round((Date.now() - matchStartTime) / 1000);
    p.xp = (p.xp || 0) + me.kills * 10 + (winnerId === myId ? 50 : 10);
    while (p.xp >= p.level * 100) { p.xp -= p.level * 100; p.level++; }

    if (isServerProfile()) {
        setCache(p); // آپدیت کش
        if (serverReady()) {
            socket.emit('profile:save', { token: getToken(), stats: s, xp: p.xp, level: p.level }, (res) => {
                if (res && res.success) setCache(res.profile);
            });
        }
    } else {
        const users = loadUsers();
        users[p.username.toLowerCase()] = p;
        saveUsers(users);
    }
    renderProfileTab();
}

// ---------- اسم آنلاین ----------
function getMyName() {
    const p = currentProfile();
    if (p) return p.username;
    let n = localStorage.getItem('nickname') || '';
    if (!n) { n = 'Player' + Math.floor(Math.random() * 9999); localStorage.setItem('nickname', n); }
    return n;
}

// ---------- هوک به بازی ----------
const _origEndGame = endGame;
endGame = function (winnerId) { updateProfileStats(winnerId); _origEndGame(winnerId); };
const _origStartGame = startGame;
startGame = function (mode) { matchStartTime = Date.now(); _origStartGame(mode); };
if (typeof startOnlineGame === 'function') {
    const _origStartOnline = startOnlineGame;
    startOnlineGame = function (players) { matchStartTime = Date.now(); _origStartOnline(players); };
}

// ---------- اتصال زودهنگام به سرور (برای سینک پروفایل) ----------
if (typeof socket === 'undefined' || !socket) {
    if (typeof connectToServer === 'function') connectToServer();
}

renderProfileTab();