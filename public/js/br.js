// ==================== BATTLE ROYALE (تا ۲۰ نفر) | XENOVA ====================
let brActive = false;
let brPlayers = [];
let brBullets = [];
let brItems = [];
let brConfig = { total: 8, humans: 1, online: false };
let brLastItemSpawn = 0;
let brLastBotCast = 0;

const BR_COLORS = ['#ff416c','#2193b0','#00ff88','#ffcc00','#ff00ff','#00ffff','#ff9500','#8a2be2','#ffff00','#00ff00','#ff69b4','#00ffaa','#ff5555','#55aaff','#aaff55','#ffaa00','#aa55ff','#55ffaa','#ff55aa','#aaaaff'];

// ---------- ابزار سازگار با هر دو نسخه ----------
function brEnv() {
    if (typeof GameState !== 'undefined' && GameState && GameState.canvas)
        return { cv: GameState.canvas, cx: GameState.ctx, obs: GameState.currentObstacles, keys: GameState.keys };
    return { cv: canvas, cx: ctx, obs: currentObstacles, keys: keys };
}
function brMakePlayer(id, x, y, color, isHuman, name) {
    return { id, x, y, radius: 14, color, isHuman, name: name || ('🤖 ' + id),
        hp: 100, maxHp: 100, angle: Math.random() * 6.28, kills: 0, deaths: 0, alive: true,
        lastShoot: 0, cooldown: 420, speed: 2.8, damage: 12, bulletSpeed: 7,
        hitFlash: 0, moveAngle: Math.random() * 6.28, think: 0 };
}
function brValidSpot(env, list) {
    for (let t = 0; t < 60; t++) {
        const x = 40 + Math.random() * (env.cv.width - 80);
        const y = 40 + Math.random() * (env.cv.height - 80);
        let ok = true;
        for (const o of env.obs) if (circleRectCollision(x, y, 20, o)) { ok = false; break; }
        if (ok) for (const p of list) if (Math.hypot(p.x - x, p.y - y) < 70) { ok = false; break; }
        if (ok) return { x, y };
    }
    return { x: 60, y: 60 };
}

// ---------- شروع ----------
function openBrSetup() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('br-setup').style.display = 'flex';
}
function brCloseSetup() {
    document.getElementById('br-setup').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}
function brGoOnline() {
    window.pendingMaxPlayers = parseInt(document.getElementById('br-count').value, 10) || 8;
    document.getElementById('br-setup').style.display = 'none';
    showOnlineMenu(); // بعد ساخت/ورود اتاق، سرور بازی رو شروع می‌کنه
}
function brStartLocal(humans) {
    const total = Math.max(2, parseInt(document.getElementById('br-count').value, 10) || 8);
    const env = brEnv();
    brConfig = { total, humans, online: false };
    brPlayers = [];
    // انسان‌ها
    const s1 = brValidSpot(env, brPlayers);
    brPlayers.push(brMakePlayer(1, s1.x, s1.y, (typeof GameState !== 'undefined' && GameState.p1Color) || p1Color, true, 'تو'));
    if (humans === 2) {
        const s2 = brValidSpot(env, brPlayers);
        brPlayers.push(brMakePlayer(2, s2.x, s2.y, (typeof GameState !== 'undefined' && GameState.p2Color) || p2Color, true, 'بازیکن ۲'));
    }
    // ربات‌ها
    for (let i = brPlayers.length; i < total; i++) {
        const s = brValidSpot(env, brPlayers);
        brPlayers.push(brMakePlayer(i + 1, s.x, s.y, BR_COLORS[i % BR_COLORS.length], false));
    }
    brBegin();
}
function startBattleRoyaleOnline(playersList) {
    const env = brEnv();
    brConfig = { total: playersList.length, humans: 1, online: true };
    brPlayers = [];
    playersList.forEach(pl => {
        const isMe = pl.id === myPlayerId;
        const s = isMe ? { x: 60, y: env.cv.height / 2 } : brValidSpot(env, brPlayers);
        const p = brMakePlayer(pl.id, s.x, s.y, pl.color, isMe, pl.name);
        if (isMe) p.name = 'تو';
        brPlayers.push(p);
    });
    brBegin();
}
function brBegin() {
    GameState.gameStarted = true;
    brBullets = []; brItems = [];
    brActive = true;
    document.getElementById('br-setup').style.display = 'none';
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('waiting-room') && (document.getElementById('waiting-room').style.display = 'none');
    document.getElementById('br-over').style.display = 'none';
    document.getElementById('br-hud').style.display = 'flex';
    if (typeof loadMap === 'function' && !brConfig.online) loadMap((typeof GameState !== 'undefined' && GameState.selectedMap) || selectedMap);
}
function brToMenu() {
    GameState.gameStarted = false;
    brActive = false;
    document.getElementById('br-over').style.display = 'none';
    document.getElementById('br-hud').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}
function brRestart() {
    document.getElementById('br-over').style.display = 'none';
    if (brConfig.online) return brToMenu(); // آنلاین = برگرد به لابی
    brStartLocal(brConfig.humans);
}

// ---------- شلیک و آسیب ----------
function brShoot(p) {
    const now = Date.now();
    if (now - p.lastShoot < p.cooldown || !p.alive) return;
    p.lastShoot = now;
    brBullets.push({ x: p.x + Math.cos(p.angle) * 20, y: p.y + Math.sin(p.angle) * 20,
        vx: Math.cos(p.angle) * p.bulletSpeed, vy: Math.sin(p.angle) * p.bulletSpeed, ownerId: p.id, color: p.color });
    if (brConfig.online && socket && (p.isHuman || (isHost && !p.isHuman)))
        socket.emit('game:event', { type: 'br_shoot', playerId: p.id, angle: p.angle });
}
function brDamage(victim, dmg, killerId, fromRemote) {
    if (!victim.alive) return;
    victim.hp -= dmg;
    victim.hitFlash = Date.now() + 150;
    if (brConfig.online && socket && !fromRemote && !victim.isHuman === false) {} // noop
    if (victim.hp <= 0) {
        victim.alive = false; victim.deaths++;
        const killer = brPlayers.find(x => x.id === killerId);
        if (killer) killer.kills++;
        if (typeof spawnParticle === 'function') for (let i = 0; i < 20; i++) spawnParticle(victim.x, victim.y, victim.color, 'explosion');
        if (typeof addFloatingText === 'function') addFloatingText(victim.x, victim.y - 20, '💀 ' + victim.name, '#ff416c');
        if (brConfig.online && socket && !fromRemote) socket.emit('game:event', { type: 'br_kill', targetId: victim.id, killerId });
        brCheckWinner();
    }
}
function brCheckWinner() {
    const alive = brPlayers.filter(p => p.alive);
    if (alive.length === 1) brEnd(alive[0]);
    else if (alive.length === 0) brEnd(null);
}
function brEnd(winner) {
    brActive = false;
    document.getElementById('br-hud').style.display = 'none';
    const me = brPlayers.find(p => p.isHuman);
    document.getElementById('br-winner-text').innerText = winner ? (winner.isHuman ? ' تو بردی!' : winner.name + ' برد!') : '🤝 مساوی!';
    document.getElementById('br-winner-text').style.color = winner ? winner.color : '#66fcf1';
    const top = brPlayers.slice().sort((a, b) => b.kills - a.kills).slice(0, 4);
    document.getElementById('br-final-stats').innerHTML = top.map(p =>
        `<div class="stat-box"><div class="stat-value" style="color:${p.color}">${p.kills}</div><div class="stat-label">${p.name}${p.alive ? ' 🏆' : ''}</div></div>`
    ).join('') + (me ? `<div class="stat-box"><div class="stat-value">${me.kills}</div><div class="stat-label">تو (رتبه ${brPlayers.filter(p => p.kills > me.kills).length + 1})</div></div>` : '');
    document.getElementById('br-over').style.display = 'flex';
}

// ---------- هوش ربات ----------
function brBotThink(b, env) {
    let best = null, bd = 1e18;
    for (const o of brPlayers) if (o.alive && o.id !== b.id) {
        const d = (o.x - b.x) ** 2 + (o.y - b.y) ** 2;
        if (d < bd) { bd = d; best = o; }
    }
    const ang = best ? Math.atan2(best.y - b.y, best.x - b.x) : b.moveAngle;
    const offs = [0, .5, -.5, 1, -1, 1.6, -1.6, 2.2, -2.2, 3.14];
    for (const off of offs) {
        const a = ang + off; let clear = true;
        for (let d = 12; d <= 42; d += 15) {
            const tx = b.x + Math.cos(a) * d, ty = b.y + Math.sin(a) * d;
            if (tx < 16 || tx > env.cv.width - 16 || ty < 16 || ty > env.cv.height - 16) { clear = false; break; }
            for (const o of env.obs) if (circleRectCollision(tx, ty, 16, o)) { clear = false; break; }
            if (!clear) break;
        }
        if (clear) { b.moveAngle = a; break; }
    }
    if (best && bd < 160000 && typeof isLineOfSightClear === 'function' && isLineOfSightClear(b.x, b.y, best.x, best.y)) {
        b.angle = ang + (Math.random() - .5) * .18;
        brShoot(b);
    }
}
function brMove(p, dx, dy, env) {
    let nx = p.x + dx * p.speed, ny = p.y + dy * p.speed;
    if (nx < 16 || nx > env.cv.width - 16) nx = p.x;
    if (ny < 16 || ny > env.cv.height - 16) ny = p.y;
    for (const o of env.obs) {
        if (circleRectCollision(nx, p.y, p.radius, o)) nx = p.x;
        if (circleRectCollision(p.x, ny, p.radius, o)) ny = p.y;
    }
    p.x = nx; p.y = ny;
    if (dx || dy) p.angle = Math.atan2(dy, dx);
}

// ---------- حلقه اصلی BR ----------
function brUpdate() {
    if (!brActive) return;
    if (typeof gameOver !== 'undefined' && gameOver) return;
    const paused = (typeof GameState !== 'undefined' && GameState.gamePaused) || (typeof gamePaused !== 'undefined' && gamePaused);
    if (paused) return;
    const env = brEnv();
    const now = Date.now();

    // کنترل انسان‌ها
    for (const p of brPlayers) {
        if (!p.alive || !p.isHuman) continue;
        let dx = 0, dy = 0;
        if (p.id === 1) {
            if (env.keys['KeyW']) dy -= 1; if (env.keys['KeyS']) dy += 1;
            if (env.keys['KeyA']) dx -= 1; if (env.keys['KeyD']) dx += 1;
            if (dx || dy) brMove(p, dx, dy, env);
            if (env.keys['Space']) brShoot(p);
        } else {
            if (env.keys['ArrowUp']) dy -= 1; if (env.keys['ArrowDown']) dy += 1;
            if (env.keys['ArrowLeft']) dx -= 1; if (env.keys['ArrowRight']) dx += 1;
            if (dx || dy) brMove(p, dx, dy, env);
            if (env.keys['Enter']) brShoot(p);
        }
    }
    // ربات‌ها
    for (const p of brPlayers) {
        if (!p.alive || p.isHuman) continue;
        if (now > p.think) { p.think = now + 200 + Math.random() * 150; brBotThink(p, env); }
        brMove(p, Math.cos(p.moveAngle), Math.sin(p.moveAngle), env);
    }
    // آنلاین: ارسال input خودم + پخش input ربات‌ها توسط هاست
    if (brConfig.online && socket) {
        const me = brPlayers.find(p => p.isHuman);
        if (me && now - (brUpdate._ls || 0) > 80) {
            brUpdate._ls = now;
            socket.emit('game:input', { playerId: me.id, x: me.x, y: me.y, angle: me.angle, hp: me.hp });
        }
        if (isHost && now - brLastBotCast > 100) {
            brLastBotCast = now;
            for (const b of brPlayers) if (!b.isHuman && b.alive)
                socket.emit('game:input', { playerId: b.id, x: b.x, y: b.y, angle: b.angle, hp: b.hp });
        }
    }
    // تیرها
    for (let i = brBullets.length - 1; i >= 0; i--) {
        const b = brBullets[i];
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0 || b.x > env.cv.width || b.y < 0 || b.y > env.cv.height) { brBullets.splice(i, 1); continue; }
        let hit = false;
        for (const o of env.obs) if (circleRectCollision(b.x, b.y, 4, o)) { hit = true; break; }
        if (hit) { brBullets.splice(i, 1); continue; }
        for (const p of brPlayers) {
            if (!p.alive || p.id === b.ownerId) continue;
            if (Math.hypot(p.x - b.x, p.y - b.y) < p.radius + 4) {
                const isLocalShooter = (() => { const s = brPlayers.find(x => x.id === b.ownerId); return s && s.isHuman; })();
                if (!brConfig.online || isLocalShooter || b._remote) {
                    brDamage(p, 12, b.ownerId, false);
                    if (brConfig.online && socket) socket.emit('game:event', { type: 'br_damage', targetId: p.id, damage: 12, killerId: b.ownerId });
                }
                brBullets.splice(i, 1);
                hit = true; break;
            }
        }
        if (hit) continue;
    }
    // آیتم درمان
    if (now - brLastItemSpawn > 8000 && brItems.length < 5) {
        brLastItemSpawn = now;
        const s = brValidSpot(env, []);
        brItems.push({ x: s.x, y: s.y, radius: 10 });
    }
    for (let i = brItems.length - 1; i >= 0; i--) {
        const it = brItems[i];
        for (const p of brPlayers) if (p.alive && Math.hypot(p.x - it.x, p.y - it.y) < p.radius + it.radius) {
            p.hp = Math.min(p.maxHp, p.hp + 30);
            if (typeof addFloatingText === 'function') addFloatingText(p.x, p.y - 20, '+30 ❤️', '#00ff00');
            brItems.splice(i, 1); break;
        }
    }
    // HUD
    const me = brPlayers.find(p => p.isHuman);
    document.getElementById('br-alive').innerText = brPlayers.filter(p => p.alive).length;
    if (me) {
        document.getElementById('br-kills').innerText = me.kills;
        document.getElementById('br-hp').innerText = Math.max(0, Math.round(me.hp));
    }
}

// ---------- رسم BR ----------
function brDraw() {
    const env = brEnv();
    const cx = env.cx;
    cx.fillStyle = (typeof MAPS !== 'undefined' && MAPS[((typeof GameState !== 'undefined' && GameState.selectedMap) || selectedMap)]) ? MAPS[((typeof GameState !== 'undefined' && GameState.selectedMap) || selectedMap)].bgColor : '#0a0a0a';
    cx.fillRect(0, 0, env.cv.width, env.cv.height);
    cx.shadowBlur = 8; cx.shadowColor = '#45a29e'; cx.fillStyle = '#1f2833'; cx.strokeStyle = '#45a29e'; cx.lineWidth = 2;
    for (const o of env.obs) { cx.fillRect(o.x, o.y, o.w, o.h); cx.strokeRect(o.x, o.y, o.w, o.h); }
    cx.shadowBlur = 0;
    // آیتم‌ها
    for (const it of brItems) {
        cx.fillStyle = '#00ff00'; cx.shadowBlur = 10; cx.shadowColor = '#00ff00';
        cx.beginPath(); cx.arc(it.x, it.y, it.radius, 0, 6.29); cx.fill(); cx.shadowBlur = 0;
    }
    // تیرها
    for (const b of brBullets) {
        cx.fillStyle = b.color; cx.shadowBlur = 10; cx.shadowColor = b.color;
        cx.beginPath(); cx.arc(b.x, b.y, 4, 0, 6.29); cx.fill(); cx.shadowBlur = 0;
    }
    // بازیکن‌ها
    for (const p of brPlayers) {
        if (!p.alive) continue;
        cx.save(); cx.translate(p.x, p.y);
        cx.shadowBlur = 12; cx.shadowColor = p.color;
        cx.fillStyle = p.hitFlash > Date.now() ? '#fff' : p.color;
        cx.beginPath(); cx.arc(0, 0, p.radius, 0, 6.29); cx.fill();
        cx.shadowBlur = 0;
        cx.rotate(p.angle); cx.fillStyle = '#fff'; cx.fillRect(0, -2.5, p.radius + 8, 5); cx.rotate(-p.angle);
        // نوار جان + اسم
        cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(-16, -p.radius - 12, 32, 5);
        cx.fillStyle = p.isHuman ? '#00ff88' : '#ff416c'; cx.fillRect(-16, -p.radius - 12, 32 * Math.max(0, p.hp / p.maxHp), 5);
        cx.fillStyle = '#c5c6c7'; cx.font = '10px Segoe UI'; cx.textAlign = 'center';
        cx.fillText(p.name, 0, -p.radius - 16);
        cx.restore();
    }
}

// ---------- هوک آنلاین (بدون دستکاری online.js) ----------
function brRemoteInput(data) {
    let p = brPlayers.find(x => x.id === data.playerId);
    if (!p) {
        p = brMakePlayer(data.playerId, data.x, data.y, BR_COLORS[data.playerId % BR_COLORS.length], false, 'بازیکن ' + data.playerId);
        brPlayers.push(p);
    }
    p.x += (data.x - p.x) * 0.35; p.y += (data.y - p.y) * 0.35;
    p.angle = data.angle; p.hp = data.hp;
    if (data.hp <= 0 && p.alive) { p.alive = false; brCheckWinner(); }
}
function brGameEvent(ev) {
    if (ev.type === 'br_shoot') {
        const s = brPlayers.find(x => x.id === ev.playerId);
        if (s && s.alive) brBullets.push({ x: s.x + Math.cos(ev.angle) * 20, y: s.y + Math.sin(ev.angle) * 20, vx: Math.cos(ev.angle) * s.bulletSpeed, vy: Math.sin(ev.angle) * s.bulletSpeed, ownerId: s.id, color: s.color, _remote: true });
    } else if (ev.type === 'br_damage') {
        const v = brPlayers.find(x => x.id === ev.targetId);
        if (v && !v.isHuman) brDamage(v, ev.damage, ev.killerId, true);
        if (v && v.isHuman) brDamage(v, ev.damage, ev.killerId, true);
    } else if (ev.type === 'br_kill') {
        const v = brPlayers.find(x => x.id === ev.targetId);
        if (v && v.alive) {
            v.alive = false; v.deaths++;
            const k = brPlayers.find(x => x.id === ev.killerId); if (k) k.kills++;
            brCheckWinner();
        }
    }
}
if (typeof handleRemoteInput === 'function') {
    const _hri = handleRemoteInput;
    handleRemoteInput = function (data) { if (brActive && brConfig.online) return brRemoteInput(data); _hri(data); };
}
if (typeof handleGameEvent === 'function') {
    const _hge = handleGameEvent;
    handleGameEvent = function (ev) { if (brActive && brConfig.online) return brGameEvent(ev); _hge(ev); };
}

// ---------- هوک حلقه بازی ----------
const _brOrigUpdate = update;
update = function () { if (brActive) return brUpdate(); _brOrigUpdate(); };
const _brOrigDraw = draw;
draw = function () { if (brActive) return brDraw(); _brOrigDraw(); };