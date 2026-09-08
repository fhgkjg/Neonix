// ==================== SKIN SHOP v2 — متصل به حساب (XENOVA) ====================
const SKINS = {
    trail: [
        { id: 'default', name: 'کلاسیک', price: 0 },
        { id: 'fire', name: 'آتش 🔥', price: 100 },
        { id: 'ice', name: 'یخ ❄️', price: 100 },
        { id: 'rainbow', name: 'رنگین‌کمان 🌈', price: 150 },
        { id: 'ghost', name: 'شبح 👻', price: 200 },
        { id: 'star', name: 'ستاره ⭐', price: 250 }
    ],
    bullet: [
        { id: 'default', name: 'کلاسیک', price: 0 },
        { id: 'pixel', name: 'پیکسلی 🟩', price: 100 },
        { id: 'laser', name: 'لیزری ⚡', price: 120 },
        { id: 'plasma', name: 'پلاسما 🔮', price: 150 },
        { id: 'shuriken', name: 'شوریکن 🌟', price: 200 }
    ],
    death: [
        { id: 'default', name: 'کلاسیک', price: 0 },
        { id: 'confetti', name: 'کاغذرنگی 🎊', price: 120 },
        { id: 'nova', name: 'نوا 💫', price: 150 },
        { id: 'fireworks', name: 'آتش‌بازی 🎆', price: 250 },
        { id: 'blackhole', name: 'سیاهچاله 🌀', price: 300 }
    ]
};

// ---------- حساب یا مهمان (با کش) ----------
let _eqCache = null, _ownCache = null;
function skProfile() { return (typeof currentProfile === 'function') ? currentProfile() : null; }
function skLogged() { const p = skProfile(); return !!(p && typeof isServerProfile === 'function' && isServerProfile()); }
function defOwned() { return { trail: ['default'], bullet: ['default'], death: ['default'] }; }
function defEq() { return { trail: 'default', bullet: 'default', death: 'default' }; }
function clearSkinCache() { _eqCache = null; _ownCache = null; }

function getWallet() {
    const p = skProfile();
    if (p && typeof p.wallet === 'number') return p.wallet;
    return parseInt(localStorage.getItem('neonix_wallet') || '0', 10);
}
function setWallet(v) {
    localStorage.setItem('neonix_wallet', String(v));
    const p = skProfile();
    if (p) { p.wallet = v; skSave(p); }
}
function getOwned() {
    if (_ownCache) return _ownCache;
    const p = skProfile();
    if (p && p.skins) { _ownCache = p.skins; return _ownCache; }
    try { _ownCache = JSON.parse(localStorage.getItem('neonix_skins')) || defOwned(); } catch (e) { _ownCache = defOwned(); }
    return _ownCache;
}
function setOwned(o) {
    _ownCache = o;
    localStorage.setItem('neonix_skins', JSON.stringify(o));
    const p = skProfile(); if (p) { p.skins = o; skSave(p); }
}
function getEquipped() {
    if (_eqCache) return _eqCache;
    const p = skProfile();
    if (p && p.skinsEq) { _eqCache = p.skinsEq; return _eqCache; }
    try { _eqCache = JSON.parse(localStorage.getItem('neonix_equipped')) || defEq(); } catch (e) { _eqCache = defEq(); }
    return _eqCache;
}
function setEquipped(q) {
    _eqCache = q;
    localStorage.setItem('neonix_equipped', JSON.stringify(q));
    const p = skProfile(); if (p) { p.skinsEq = q; skSave(p); }
}
function skSave(p) {
    if (typeof setCache === 'function') setCache(p);
    if (typeof socket !== 'undefined' && socket && socket.id && typeof getToken === 'function' && getToken()) {
        socket.emit('profile:save', { token: getToken(), wallet: p.wallet, skins: p.skins, skinsEq: p.skinsEq, stats: p.stats, xp: p.xp, level: p.level });
    }
}
function addWallet(n) { setWallet(getWallet() + n); renderSkinShop(); }
function skP(id) {
    if (typeof GameState !== 'undefined' && GameState && GameState.p1) return id === 1 ? GameState.p1 : GameState.p2;
    return id === 1 ? p1 : p2;
}

// 🎁 مهاجرت یک‌باره
function migrateWallet() {
    if (localStorage.getItem('neonix_wallet_migrated')) return;
    const p = skProfile();
    if (!p || !skLogged()) return;
    localStorage.setItem('neonix_wallet_migrated', '1');
    const statsCoins = (p.stats && p.stats.coins) || 0;
    if (getWallet() === 0 && statsCoins > 0) {
        const bonus = Math.floor(statsCoins / 2);
        addWallet(bonus);
        shopMsg('🎁 مهاجرت کامل شد: +' + bonus + ' سکه از آمارت!');
    }
}

function shopMsg(t) { const el = document.getElementById('skin-msg'); if (el) { el.innerText = t; setTimeout(() => { el.innerText = ''; }, 2500); } }
function goProfile() {
    const mm = document.getElementById('main-menu'); if (mm) mm.style.display = 'flex';
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const btn = document.getElementById('profile-tab-btn'); if (btn) btn.classList.add('active');
    const tc = document.getElementById('tab-profile'); if (tc) tc.classList.add('active');
}

function buySkin(cat, id) {
    if (!skLogged()) { shopMsg('🔒 برای خرید اسکین اول وارد حساب شو!'); setTimeout(goProfile, 1200); return; }
    const item = SKINS[cat].find(s => s.id === id);
    const owned = getOwned();
    if (owned[cat].includes(id)) return;
    if (getWallet() < item.price) { shopMsg('❌ سکه کافی نیست! برو بازی کن 😄'); return; }
    setWallet(getWallet() - item.price);
    owned[cat].push(id); setOwned(owned);
    shopMsg('✅ خرید شد: ' + item.name);
    renderSkinShop();
}
function equipSkin(cat, id) {
    const owned = getOwned();
    if (!owned[cat].includes(id)) return;
    const q = getEquipped(); q[cat] = id; setEquipped(q);
    renderSkinShop();
}

// ---------- استایل‌های رسم ----------
function starPath(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const o = (i * 72 - 90) * Math.PI / 180, n = ((i * 72 + 36) - 90) * Math.PI / 180;
        ctx.lineTo(x + Math.cos(o) * r, y + Math.sin(o) * r);
        ctx.lineTo(x + Math.cos(n) * r / 2, y + Math.sin(n) * r / 2);
    }
    ctx.closePath();
}
function trailStyle(ctx, x, y, r, id, color) {
    ctx.save();
    if (id === 'fire') { ctx.fillStyle = Math.random() < .5 ? '#ff6600' : '#ffcc00'; ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(x, y, r * (0.8 + Math.random() * 0.4), 0, 6.29); ctx.fill(); }
    else if (id === 'ice') { ctx.fillStyle = '#a0e7ff'; ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 8; ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4); }
    else if (id === 'rainbow') { ctx.fillStyle = 'hsl(' + ((Date.now() / 4 + x * 6) % 360) + ',100%,60%)'; ctx.shadowBlur = 6; ctx.shadowColor = ctx.fillStyle; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill(); }
    else if (id === 'ghost') { ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y - r * 0.3, r * 0.8, 0, 6.29); ctx.fill(); }
    else if (id === 'star') { ctx.fillStyle = '#ffd700'; ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 6; starPath(ctx, x, y, r); ctx.fill(); }
    else { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill(); }
    ctx.restore();
}
function bulletStyle(ctx, x, y, id, color) {
    ctx.save();
    ctx.shadowBlur = 10; ctx.shadowColor = color;
    if (id === 'laser') { ctx.translate(x, y); ctx.fillStyle = color; ctx.fillRect(-9, -2, 18, 4); ctx.fillStyle = '#fff'; ctx.fillRect(3, -1, 6, 2); }
    else if (id === 'plasma') { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.29); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.29); ctx.stroke(); }
    else if (id === 'shuriken') { ctx.translate(x, y); ctx.rotate(Date.now() / 60); ctx.fillStyle = color; ctx.beginPath(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8); ctx.lineTo(Math.cos(a + Math.PI / 4) * 3, Math.sin(a + Math.PI / 4) * 3); } ctx.closePath(); ctx.fill(); }
    else if (id === 'pixel') { ctx.fillStyle = color; ctx.fillRect(x - 4, y - 4, 8, 8); ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, y - 1, 3, 3); }
    else { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.29); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 2, 0, 6.29); ctx.fill(); }
    ctx.restore();
}
function spawnSkinDeathEffect(x, y, color) {
    const id = getEquipped().death;
    const arr = (typeof GameArrays !== 'undefined' && GameArrays.particles) ? GameArrays.particles : (typeof particles !== 'undefined' ? particles : null);
    const rip = (typeof spawnRipple === 'function') ? spawnRipple : null;
    const P = (typeof spawnParticle === 'function') ? spawnParticle : null;
    if (id === 'nova') { if (rip) { rip(x, y, color); rip(x, y, '#ffffff'); } if (P) for (let i = 0; i < 15; i++) P(x, y, '#ffffff', 'sparkle'); }
    else if (id === 'confetti') { const cols = ['#ff416c', '#ffcc00', '#00ff88', '#00ffff', '#ff00ff']; if (P) for (let i = 0; i < 40; i++) P(x, y, cols[i % 5], 'explosion'); }
    else if (id === 'blackhole') { if (rip) rip(x, y, '#8a2be2'); if (arr) for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283, d = 40 + Math.random() * 30; arr.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: -Math.cos(a) * 4, vy: -Math.sin(a) * 4, life: 1, color: '#8a2be2', size: 4, type: 'normal' }); } }
    else if (id === 'fireworks') { const cols = ['#ffcc00', '#ff416c', '#00ffff']; if (P) for (let b = 0; b < 3; b++) for (let i = 0; i < 15; i++) P(x + (Math.random() - .5) * 70, y + (Math.random() - .5) * 70, cols[b], 'explosion'); }
    else { if (P) for (let i = 0; i < 30; i++) P(x, y, color, 'explosion'); }
}
function drawSkinTrail(ctx, p) {
    const id = getEquipped().trail;
    const n = p.trail.length;
    for (let i = 0; i < n; i++) {
        const t = p.trail[i];
        ctx.save();
        ctx.globalAlpha = (i / n) * 0.5;
        trailStyle(ctx, t.x, t.y, p.radius * (i / n), id, p.color);
        ctx.restore();
    }
}
function drawSkinBullet(ctx, b) { bulletStyle(ctx, b.x, b.y, getEquipped().bullet, b.color); }

// ---------- پیش‌نمایش ----------
function deathPreview(ctx, x, y, id, color) {
    if (id === 'nova') { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 6, 0, 6.29); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 6.29); ctx.stroke(); }
    else if (id === 'confetti') { const cols = ['#ff416c', '#ffcc00', '#00ff88', '#00ffff', '#ff00ff']; for (let i = 0; i < 12; i++) { ctx.fillStyle = cols[i % 5]; ctx.fillRect(x + Math.cos(i) * (4 + (i % 3) * 4) - 2, y + Math.sin(i * 2) * (4 + (i % 4) * 3) - 2, 4, 4); } }
    else if (id === 'blackhole') { ctx.fillStyle = '#8a2be2'; ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.29); ctx.fill(); ctx.strokeStyle = '#8a2be2'; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); ctx.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7); ctx.stroke(); } }
    else if (id === 'fireworks') { const cols = ['#ffcc00', '#ff416c', '#00ffff']; for (let b = 0; b < 3; b++) { ctx.fillStyle = cols[b]; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + b; ctx.beginPath(); ctx.arc(x + Math.cos(a) * (6 + b * 4) + (b - 1) * 8, y + Math.sin(a) * (6 + b * 4) - b * 4, 2, 0, 6.29); ctx.fill(); } } }
    else { ctx.fillStyle = color; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 8, y + Math.sin(a) * 8, 2.5, 0, 6.29); ctx.fill(); } }
}
function drawSkinPreview(ctx, cat, id) {
    ctx.clearRect(0, 0, 70, 40);
    ctx.fillStyle = '#0b0c10'; ctx.fillRect(0, 0, 70, 40);
    if (cat === 'trail') { for (let i = 0; i < 5; i++) { const f = i / 5; ctx.save(); ctx.globalAlpha = 0.2 + f * 0.8; trailStyle(ctx, 12 + i * 11, 20, 3 + f * 6, id, '#66fcf1'); ctx.restore(); } }
    else if (cat === 'bullet') bulletStyle(ctx, 35, 20, id, '#66fcf1');
    else { ctx.save(); deathPreview(ctx, 35, 20, id, '#ff416c'); ctx.restore(); }
}

// ---------- رندر فروشگاه ----------
function renderSkinShop() {
    const box = document.getElementById('skin-shop');
    if (!box) return;
    const w = document.getElementById('wallet-bar');
    if (w) w.innerText = '💰 موجودی: ' + getWallet() + ' سکه';
    const banner = document.getElementById('skin-login-banner');
    if (banner) banner.style.display = skLogged() ? 'none' : 'block';
    const owned = getOwned(), eq = getEquipped();
    const cats = { trail: '🌀 دنباله حرکت', bullet: '🔫 پوسته تیر', death: '💥 افکت مرگ' };
    let html = '';
    for (const cat in cats) {
        html += '<div class="skin-section"><h3>' + cats[cat] + '</h3><div class="skin-grid">';
        for (const s of SKINS[cat]) {
            const has = owned[cat].includes(s.id), isEq = eq[cat] === s.id;
            html += '<div class="skin-card' + (isEq ? ' equipped' : '') + '">';
            html += '<canvas id="skp-' + cat + '-' + s.id + '" width="70" height="40"></canvas>';
            html += '<div class="skin-name">' + s.name + '</div>';
            if (isEq) html += '<button class="skin-btn owned">✓ فعال</button>';
            else if (has) html += '<button class="skin-btn equip" onclick="equipSkin(\'' + cat + '\',\'' + s.id + '\')">فعال کن</button>';
            else html += '<button class="skin-btn buy" onclick="buySkin(\'' + cat + '\',\'' + s.id + '\')">🛒 ' + s.price + ' 💰</button>';
            html += '</div>';
        }
        html += '</div></div>';
    }
    box.innerHTML = html;
    for (const cat in cats) for (const s of SKINS[cat]) {
        const cv = document.getElementById('skp-' + cat + '-' + s.id);
        if (cv) drawSkinPreview(cv.getContext('2d'), cat, s.id);
    }
}

// ---------- هوک پرداخت یک‌باره ----------
let _walletPaid = false;
function payWalletOnce() {
    if (_walletPaid) return 0;
    _walletPaid = true;
    let gain = 0;
    if (typeof onlineMode !== 'undefined' && onlineMode) {
        const me = skP(typeof myPlayerId !== 'undefined' ? myPlayerId : 1);
        gain = me.kills * 5 + Math.floor(me.coins / 2);
    } else if (typeof GameState !== 'undefined' && GameState.gameMode === 'bot') {
        const me = skP(1);
        gain = me.kills * 5 + Math.floor(me.coins / 2);
    } else {
        const a = skP(1), b = skP(2);
        gain = (a.kills + b.kills) * 5 + Math.floor((a.coins + b.coins) / 2);
    }
    if (gain > 0) addWallet(gain);
    return gain;
}
if (typeof endGame === 'function') {
    const _eg = endGame;
    endGame = function (w) { payWalletOnce(); return _eg(w); };
}
function _resetWalletFlag() { _walletPaid = false; }
if (typeof startGame === 'function') { const _sg = startGame; startGame = function (m) { _resetWalletFlag(); return _sg(m); }; }
if (typeof resetGame === 'function') { const _rg = resetGame; resetGame = function () { _resetWalletFlag(); return _rg(); }; }

// ---------- هوک‌ها ----------
if (typeof switchTab === 'function') {
    const _origST = switchTab;
    switchTab = function (tab) { _origST(tab); if (tab === 'shop') renderSkinShop(); };
}

window.addEventListener('load', () => {
    if (typeof renderProfileTab === 'function') {
        const _rpt = renderProfileTab;
        renderProfileTab = function () {
            clearSkinCache();
            _rpt();
            const box = document.getElementById('profile-stats');
            if (box && skProfile()) {
                const d = document.createElement('div');
                d.className = 'pstat';
                d.innerHTML = '<div class="v" style="color:#ffd700">' + getWallet() + '</div><div class="l">💰 کیف پول اسکین</div>';
                box.appendChild(d);
            }
            migrateWallet();
            renderSkinShop();
        };
    }
    renderSkinShop();
});