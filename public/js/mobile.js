// ==================== MOBILE SUPPORT v3 (XENOVA) ====================
const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || location.search.includes('touch=1');
let joyDx = 0, joyDy = 0, joyActive = false, shootHeld = false, autoAim = true;

function mGetP(id) {
    if (typeof GameState !== 'undefined' && GameState && GameState.p1) return id === 1 ? GameState.p1 : GameState.p2;
    return id === 1 ? p1 : p2;
}
function mMe() {
    if (typeof onlineMode !== 'undefined' && onlineMode && typeof myPlayerId !== 'undefined' && myPlayerId) return mGetP(myPlayerId);
    return mGetP(1);
}
function mEnemy() { const me = mMe(); return me.id === 1 ? mGetP(2) : mGetP(1); }
function mMode() {
    if (typeof GameState !== 'undefined' && GameState && GameState.gameMode) return GameState.gameMode;
    if (typeof gameMode !== 'undefined') return gameMode;
    return 'pvp';
}
function mStopped() {
    if (typeof GameState !== 'undefined' && GameState && (GameState.gameOver || GameState.gamePaused)) return true;
    if (typeof gameOver !== 'undefined' && gameOver) return true;
    if (typeof gamePaused !== 'undefined' && gamePaused) return true;
    return false;
}

// ---------- رویداد یکپارچه: Pointer یا Touch (گوشی قدیمی) ----------
function evPoint(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}
function bindHold(el, down, up) {
    if (!el) return;
    const d = (e) => { e.preventDefault(); if (down) down(); };
    const u = () => { if (up) up(); };
    if (window.PointerEvent) {
        el.addEventListener('pointerdown', d);
        el.addEventListener('pointerup', u);
        el.addEventListener('pointercancel', u);
    } else {
        el.addEventListener('touchstart', d, { passive: false });
        el.addEventListener('touchend', u);
        el.addEventListener('touchcancel', u);
    }
    el.addEventListener('contextmenu', (e) => e.preventDefault());
}

if (isMobile) {
    document.body.classList.add('is-mobile');

    // ---------- جوی‌استیک ----------
    const zone = document.getElementById('joy-zone');
    const knob = document.getElementById('joy-knob');
    if (zone && knob) {
        const handleJoy = (pt) => {
            const r = zone.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height * 0.6;
            let dx = pt.x - cx, dy = pt.y - cy;
            const max = 45;
            const d = Math.hypot(dx, dy);
            if (d > max) { dx = dx / d * max; dy = dy / d * max; }
            knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
            joyDx = dx / max; joyDy = dy / max;
            if (Math.hypot(joyDx, joyDy) < 0.15) { joyDx = 0; joyDy = 0; }
        };
        const joyEnd = () => { joyActive = false; joyDx = 0; joyDy = 0; knob.style.transform = 'translate(0,0)'; };
        if (window.PointerEvent) {
            zone.addEventListener('pointerdown', (e) => { joyActive = true; try { zone.setPointerCapture(e.pointerId); } catch (_) {} handleJoy(evPoint(e)); e.preventDefault(); });
            zone.addEventListener('pointermove', (e) => { if (joyActive) handleJoy(evPoint(e)); });
            zone.addEventListener('pointerup', joyEnd);
            zone.addEventListener('pointercancel', joyEnd);
        } else {
            zone.addEventListener('touchstart', (e) => { joyActive = true; handleJoy(evPoint(e)); e.preventDefault(); }, { passive: false });
            zone.addEventListener('touchmove', (e) => { if (joyActive) { handleJoy(evPoint(e)); e.preventDefault(); } }, { passive: false });
            zone.addEventListener('touchend', joyEnd);
            zone.addEventListener('touchcancel', joyEnd);
        }
    }

    // ---------- دکمه‌ها ----------
    bindHold(document.getElementById('btn-shoot'), () => { shootHeld = true; }, () => { shootHeld = false; });
    bindHold(document.getElementById('btn-dash'), () => mMe().dash());
    bindHold(document.getElementById('btn-grenade'), () => mMe().throwGrenade());
    bindHold(document.getElementById('btn-aim'), () => {
        autoAim = !autoAim;
        const b = document.getElementById('btn-aim');
        if (b) b.style.opacity = autoAim ? '1' : '.4';
    });
    bindHold(document.getElementById('btn-shop'), () => {
        const me = mMe();
        me.shopOpen = !me.shopOpen;
        const shopEl = document.getElementById(me.id === 1 ? 'p1-shop' : 'p2-shop');
        if (shopEl) shopEl.style.display = me.shopOpen ? 'block' : 'none';
    });

    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('dblclick', (e) => e.preventDefault());
}

// ---------- هوک input (امن نسبت به ترتیب اسکریپت‌ها) ----------
function installMobileInputHook() {
    if (typeof handleInput !== 'function' || handleInput._mobileHooked) return;
    const _orig = handleInput;
    handleInput = function () {
        if (!isMobile) return _orig();
        if (mStopped()) return;
        if (!(typeof onlineMode !== 'undefined' && onlineMode) && mMode() === 'bot' && typeof updateBot === 'function') updateBot();
        const me = mMe();
        if (autoAim && shootHeld) {
            const en = mEnemy();
            if (en) me.angle = Math.atan2(en.y - me.y, en.x - me.x);
        }
        if (joyDx !== 0 || joyDy !== 0) me.move(joyDx, joyDy);
        if (shootHeld) me.shoot();
    };
    handleInput._mobileHooked = true;
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installMobileInputHook);
else installMobileInputHook();

// ---------- Auto-Fit canvas ----------
function fitGameToScreen() {
    const cv = document.getElementById('gameCanvas');
    if (!cv) return;
    const hud = document.getElementById('ui-container');
    const hudH = (hud && hud.offsetParent !== null) ? hud.offsetHeight : 0;
    const pad = 8;
    const availW = Math.max(180, window.innerWidth - pad * 2);
    const availH = Math.max(120, window.innerHeight - hudH - pad * 2);
    const aspect = 1000 / 600;
    let w = availW, h = w / aspect;
    if (h > availH) { h = availH; w = h * aspect; }
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    const gc = document.getElementById('game-container');
    if (gc) { gc.style.width = w + 'px'; gc.style.height = h + 'px'; }
}
window.addEventListener('resize', fitGameToScreen);
window.addEventListener('orientationchange', () => setTimeout(fitGameToScreen, 150));
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fitGameToScreen);
else fitGameToScreen();

// ---------- متن شناور روی canvas ----------
function addFloatingText(x, y, text, color) {
    GameArrays.floatTexts.push({ x: x, y: y, text: text, color: color, life: 1 });
}