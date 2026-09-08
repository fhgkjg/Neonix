// ==================== NEONIX | XENOVA — TACTICAL AI v6 «UNBEATABLE» ====================
// سطح impossible حالا = اجرای کامل (Perfect Execution): بدون تقلب، بدون اشتباه
// همه قدرت از مهارته: جاخالی قطعی، نشونه‌گیری صفرخطا، کنترل فاصله، اقتصاد بهینه

let botBrain = null;
const SEE = 750;

const BOT_DIFFS = {
    easy:       { think: 300, react: 280, turn: 0.16, lockNeed: 0.55, errMult: 0.060, predictQ: 0.25, patternUse: 0.10, dodgeIQ: 0.25, multiDodge: 0.00, soundIQ: 0.20, coverIQ: 0.20, posIQ: 0.30, flankIQ: 0.05, adaptRate: 0.20, mistakes: 0.50, burstCtrl: 0.40, moveTurn: 0.10, aimWhileMove: 0.30, hear: 0.40 },
    medium:     { think: 220, react: 190, turn: 0.22, lockNeed: 0.40, errMult: 0.035, predictQ: 0.50, patternUse: 0.30, dodgeIQ: 0.45, multiDodge: 0.30, soundIQ: 0.40, coverIQ: 0.45, posIQ: 0.50, flankIQ: 0.20, adaptRate: 0.45, mistakes: 0.28, burstCtrl: 0.60, moveTurn: 0.14, aimWhileMove: 0.50, hear: 0.60 },
    hard:       { think: 160, react: 120, turn: 0.30, lockNeed: 0.28, errMult: 0.020, predictQ: 0.72, patternUse: 0.55, dodgeIQ: 0.68, multiDodge: 0.60, soundIQ: 0.60, coverIQ: 0.70, posIQ: 0.72, flankIQ: 0.45, adaptRate: 0.70, mistakes: 0.14, burstCtrl: 0.80, moveTurn: 0.18, aimWhileMove: 0.72, hear: 0.80 },
    insane:     { think: 120, react: 70,  turn: 0.38, lockNeed: 0.18, errMult: 0.010, predictQ: 0.88, patternUse: 0.78, dodgeIQ: 0.85, multiDodge: 0.85, soundIQ: 0.80, coverIQ: 0.86, posIQ: 0.88, flankIQ: 0.70, adaptRate: 0.88, mistakes: 0.06, burstCtrl: 0.92, moveTurn: 0.22, aimWhileMove: 0.88, hear: 0.92 },
    impossible: { think: 60,  react: 0,   turn: 0.60, lockNeed: 0.00, errMult: 0.000, predictQ: 1.00, patternUse: 1.00, dodgeIQ: 1.00, multiDodge: 1.00, soundIQ: 1.00, coverIQ: 1.00, posIQ: 1.00, flankIQ: 1.00, adaptRate: 1.00, mistakes: 0.00, burstCtrl: 1.00, moveTurn: 0.30, aimWhileMove: 1.00, hear: 1.00, perfect: true }
};

const BOT_LEVELS = [
    { key: 'easy',   emoji: '😈', color: '#00ff88', desc: '«آسان»؟ فقط یه دروغه!' },
    { key: 'medium', emoji: '💀', color: '#ffcc00', desc: 'شروع درد واقعی' },
    { key: 'hard',   emoji: '🔥', color: '#ff9500', desc: 'بلیط یک‌طرفه به جهنم' },
    { key: 'insane', emoji: '🤯', color: '#ff416c', desc: 'چالش منصفانه برای پروها' },
    { key: 'impossible', emoji: '👑', color: '#8a2be2', desc: 'غیرقابل شکست — تسلیم شو!' }
];
function showBotSetup() { document.getElementById('main-menu').style.display = 'none'; document.getElementById('bot-setup').style.display = 'flex'; updateBotSlider(); }
function closeBotSetup() { document.getElementById('bot-setup').style.display = 'none'; document.getElementById('main-menu').style.display = 'flex'; }
function updateBotSlider() {
    const v = parseInt(document.getElementById('bot-diff-slider').value, 10) || 0;
    const L = BOT_LEVELS[v];
    document.getElementById('bot-diff-emoji').innerText = L.emoji;
    document.getElementById('bot-diff-name').innerText = (typeof t === 'function') ? t('mode.' + L.key) : L.key;
    document.getElementById('bot-diff-name').style.color = L.color;
    document.getElementById('bot-diff-desc').innerText = L.desc;
    document.getElementById('bot-diff-slider').style.accentColor = L.color;
}
function startBotGame() {
    const v = parseInt(document.getElementById('bot-diff-slider').value, 10) || 0;
    GameState.botDifficulty = BOT_LEVELS[v].key;
    document.getElementById('bot-setup').style.display = 'none';
    startGame('bot');
}

function resetBotBrain() {
    botBrain = {
        state: 'seek', moveAngle: Math.random() * 6.28, desiredMove: Math.PI, faceAngle: Math.PI,
        strafeDir: Math.random() < .5 ? 1 : -1,
        nextThink: 0, nextStrafe: 0, nextPath: 0, nextStuck: 0, nextAbility: 0, nextLearn: 0,
        path: [], pathIdx: 0,
        lastX: 0, lastY: 0, stuckCount: 0, detourUntil: 0, detourAngle: 0,
        foeLX: 0, foeLY: 0, foeVX: 0, foeVY: 0, prevDist: 0, prevFrameDist: 0,
        lastSeen: 0, lastKnown: null, firstSeen: 0, reactUntil: 0,
        shotsInBurst: 0, coolUntil: 0,
        dodgeUntil: 0, dodgeAngle: 0, dodgeCd: 0,
        seekCover: false, coverAngle: null,
        soundDir: 0, soundTime: 0, heardCount: 0,
        distractUntil: 0, distractAngle: 0, hesitateUntil: 0,
        aim: { angle: Math.PI, lock: 0, surprise: 0, seenAt: 0, lastDesired: null },
        model: { strafeHist: [0, 0], dodgeSide: [0, 0], retreat: 0.3, aggression: 0.5, routeHeat: {}, lastHeat: 0, adapt: 0 }
    };
}

function bNorm(a) { while (a > Math.PI) a -= 6.28318; while (a < -Math.PI) a += 6.28318; return a; }
function bClamp(v, l, h) { return Math.max(l, Math.min(h, v)); }
function bDist(ax, ay, bx, by) { return Math.hypot(bx - ax, by - ay); }
function bRayClear(x, y, angle, dist, radius) {
    const obs = GameState.currentObstacles, W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
    for (let d = 6; d <= dist; d += 6) {
        const px = x + Math.cos(angle) * d, py = y + Math.sin(angle) * d;
        if (px < radius || px > W - radius || py < radius || py > H - radius) return false;
        for (let i = 0; i < obs.length; i++) if (circleRectCollision(px, py, radius, obs[i])) return false;
    }
    return true;
}
function bSteerAround(x, y, desired) {
    const offs = [0, 0.35, -0.35, 0.7, -0.7, 1.1, -1.1, 1.5, -1.5, 2.0, -2.0, 2.5, -2.5, Math.PI];
    for (const o of offs) { const a = desired + o; if (bRayClear(x, y, a, 60, 14)) return a; }
    return desired + Math.PI;
}
function bHearShots(me, foe, D, now) {
    let count = 0;
    for (const b of GameArrays.bullets) if (b.ownerId === foe.id) count++;
    if (count > botBrain.heardCount) {
        if (!isLineOfSightClear(me.x, me.y, foe.x, foe.y)) {
            botBrain.soundDir = Math.atan2(foe.y - me.y, foe.x - me.x) + (Math.random() - .5) * (1 - D.hear) * 1.4;
            botBrain.soundTime = now;
        }
    }
    botBrain.heardCount = count;
}
function bLearnPlayer(me, foe, D, now, los, dist) {
    const m = botBrain.model;
    if (los) {
        const toFoe = Math.atan2(foe.y - me.y, foe.x - me.x);
        const cross = Math.cos(toFoe) * botBrain.foeVY - Math.sin(toFoe) * botBrain.foeVX;
        const sp = Math.hypot(botBrain.foeVX, botBrain.foeVY);
        if (sp > 1.2) {
            if (cross > 0.5) { m.strafeHist[0]++; m.strafeHist[1] = Math.max(0, m.strafeHist[1] - 0.5); }
            else if (cross < -0.5) { m.strafeHist[1]++; m.strafeHist[0] = Math.max(0, m.strafeHist[0] - 0.5); }
        }
        if (now - m.lastHeat > 400) {
            m.lastHeat = now;
            const key = Math.floor(foe.x / 100) + ',' + Math.floor(foe.y / 100);
            m.routeHeat[key] = (m.routeHeat[key] || 0) + 1;
        }
        if (botBrain.prevDist) {
            if (dist > botBrain.prevDist + 2) m.retreat = Math.min(1, m.retreat + 0.03 * D.adaptRate);
            else if (dist < botBrain.prevDist - 2) { m.retreat = Math.max(0, m.retreat - 0.03 * D.adaptRate); m.aggression = Math.min(1, m.aggression + 0.02); }
        }
        botBrain.prevDist = dist;
        botBrain.lastSeen = now;
        botBrain.lastKnown = { x: foe.x, y: foe.y };
    }
    if (now - botBrain.nextLearn > 2000) { botBrain.nextLearn = now; m.strafeHist[0] *= 0.9; m.strafeHist[1] *= 0.9; }
}
function bPredictAim(me, foe, D) {
    const bs = Math.max(4, me.bulletSpeed);
    const m = botBrain.model;
    const total = m.strafeHist[0] + m.strafeHist[1] + 1;
    const bias = ((m.strafeHist[0] - m.strafeHist[1]) / total) * D.patternUse;
    let tx = foe.x, ty = foe.y;
    const vx = botBrain.foeVX, vy = botBrain.foeVY;
    const sp = Math.hypot(vx, vy) || 1;
    const px = -vy / sp, py = vx / sp;
    for (let i = 0; i < 3; i++) {
        const tt = bDist(me.x, me.y, tx, ty) / bs;
        tx = foe.x + (vx + px * bias * sp * 0.8) * tt * D.predictQ;
        ty = foe.y + (vy + py * bias * sp * 0.8) * tt * D.predictQ;
    }
    return Math.atan2(ty - me.y, tx - me.x);
}
function bAimUpdate(me, foe, D, now, los, dist) {
    const a = botBrain.aim;
    if (los && dist < SEE) {
        const desired = bPredictAim(me, foe, D);
        const maneuver = a.lastDesired === null ? 0 : Math.abs(bNorm(desired - a.lastDesired));
        a.lastDesired = desired;
        a.surprise = D.perfect ? 0 : bClamp(a.surprise + maneuver * 6 - 0.04, 0, 1); // 👑 کامل: هرگز غافلگیر نمی‌شه
        const effTurn = D.turn * (1 - a.surprise * 0.55);
        a.angle += bClamp(bNorm(desired - a.angle), -effTurn, effTurn);
        const off = Math.abs(bNorm(desired - a.angle));
        a.lock += ((bClamp(1 - off / 0.6, 0, 1) * (1 - a.surprise * 0.6)) - a.lock) * 0.2;
        a.seenAt = now;
    } else { a.lock = Math.max(0, a.lock - 0.15); a.surprise = 0; a.lastDesired = null; }
}
// 👑 شلیک کامل: صفر خطا، فقط وقتی LOS
function bFireControl(me, foe, D, now, los, dist) {
    if (D.perfect) {
        if (los && dist < SEE && now > botBrain.coolUntil) {
            const sv = me.angle; me.angle = botBrain.aim.angle; me.shoot(); me.angle = sv;
            botBrain.shotsInBurst++;
            if (botBrain.shotsInBurst >= 6) { botBrain.shotsInBurst = 0; botBrain.coolUntil = now + 90; }
        }
        return;
    }
    const a = botBrain.aim;
    if (!los || dist > SEE || now < botBrain.reactUntil || now < botBrain.hesitateUntil) return;
    const moving = Math.hypot(me.vx, me.vy) > 2;
    const needLock = D.lockNeed + (moving ? (1 - D.aimWhileMove) * 0.5 : 0);
    if (a.lock < needLock || now < botBrain.coolUntil) return;
    const err = D.errMult * (1 + a.surprise * 2) * (moving ? (2 - D.aimWhileMove) : 1);
    const sv = me.angle;
    me.angle = a.angle + (Math.random() - .5) * err;
    me.shoot();
    me.angle = sv;
    const toFoe = Math.atan2(foe.y - me.y, foe.x - me.x);
    const cross = Math.cos(toFoe) * botBrain.foeVY - Math.sin(toFoe) * botBrain.foeVX;
    if (Math.hypot(botBrain.foeVX, botBrain.foeVY) > 2) { if (cross > 0.5) botBrain.model.dodgeSide[0]++; else if (cross < -0.5) botBrain.model.dodgeSide[1]++; }
    botBrain.shotsInBurst++;
    if (botBrain.shotsInBurst >= 2 + Math.round(D.burstCtrl * 4)) { botBrain.shotsInBurst = 0; botBrain.coolUntil = now + 120 + (1 - D.burstCtrl) * 250 + Math.random() * 180; }
}
function bThreats(me) {
    const list = [];
    for (const b of GameArrays.bullets) {
        if (b.ownerId === me.id) continue;
        const bs = Math.hypot(b.vx, b.vy) || 1;
        const rx = me.x - b.x, ry = me.y - b.y;
        const along = (rx * b.vx + ry * b.vy) / bs;
        if (along < 0 || along > 420) continue;
        const lat = (rx * -b.vy + ry * b.vx) / bs;
        const hitR = me.radius + 5;
        if (Math.abs(lat) >= hitR) continue;
        const tF = along / bs;
        if (tF > 40) continue;
        list.push({ t: tF, lat, vx: b.vx, vy: b.vy, bs });
    }
    return list;
}
// 👑 جاخالی کامل: قطعی، چندتیره، با دش رفلکسی
function bDodgeControl(me, D, now) {
    if (D.perfect) {
        for (const g of GameArrays.grenades) {
            if (g.ownerId !== me.id && bDist(me.x, me.y, g.x, g.y) < 130 && g.timer - now < 900) {
                botBrain.dodgeUntil = now + 250;
                botBrain.dodgeAngle = Math.atan2(me.y - g.y, me.x - g.x);
                return;
            }
        }
    } else {
        let gd = null;
        for (const g of GameArrays.grenades) if (g.ownerId !== me.id && bDist(me.x, me.y, g.x, g.y) < 95 && g.timer - now < 700) gd = g;
        if (gd) { botBrain.dodgeUntil = now + 300; botBrain.dodgeAngle = Math.atan2(me.y - gd.y, me.x - gd.x); return; }
    }
    const threats = bThreats(me);
    if (!threats.length) return;
    const worst = threats[0];
    const reactF = D.perfect ? 1 : (D.react / 16.7) + 2;
    if (worst.t < reactF || now < botBrain.dodgeCd) return;
    botBrain.dodgeCd = D.perfect ? now + 50 : now + 300;
    if (!D.perfect && Math.random() > D.dodgeIQ) return;
    let bestA = null, bestScore = -1e9;
    for (const s of [1, -1]) {
        const dirA = Math.atan2((-worst.vy / worst.bs) * s, (worst.vx / worst.bs) * s);
        let score = bRayClear(me.x, me.y, dirA, 60, 14) ? 50 : -100;
        for (const th of threats) {
            const thA = Math.atan2((-th.vy / th.bs) * s, (th.vx / th.bs) * s);
            if (Math.abs(bNorm(thA - dirA)) < 1) score += 10;
        }
        if (!D.perfect) score += Math.random() * 5;
        if (score > bestScore) { bestScore = score; bestA = dirA; }
    }
    if (bestA !== null && bestScore > 0) {
        botBrain.dodgeUntil = now + (D.perfect ? 110 : 170);
        botBrain.dodgeAngle = bestA;
        if (D.perfect && worst.t < 9 && now - me.lastDashTime >= me.dashCooldown) {
            const sv = me.angle; me.angle = bestA; me.dash(); me.angle = sv;
        }
    }
}
function bCoverAngle(me, foe) {
    const base = Math.atan2(foe.y - me.y, foe.x - me.x);
    for (const o of [Math.PI / 2, -Math.PI / 2, Math.PI]) {
        const a = base + o;
        if (!bRayClear(me.x, me.y, a, 80, 14)) continue;
        const sx = me.x + Math.cos(a) * 80, sy = me.y + Math.sin(a) * 80;
        if (!isLineOfSightClear(sx, sy, foe.x, foe.y)) return a;
    }
    return null;
}
let bGrid = null, bGridKey = '';
function bGetGrid() {
    const key = GameState.selectedMap + ':' + GameState.currentObstacles.length;
    if (bGrid && bGridKey === key) return bGrid;
    const cell = 25;
    const cols = Math.ceil(CONFIG.CANVAS_WIDTH / cell), rows = Math.ceil(CONFIG.CANVAS_HEIGHT / cell);
    const blocked = new Uint8Array(cols * rows);
    const obs = GameState.currentObstacles;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const cx = c * cell + cell / 2, cy = r * cell + cell / 2;
        for (let i = 0; i < obs.length; i++) if (circleRectCollision(cx, cy, 16, obs[i])) { blocked[r * cols + c] = 1; break; }
    }
    bGrid = { cell, cols, rows, blocked }; bGridKey = key;
    return bGrid;
}
function bFindPath(x1, y1, x2, y2) {
    const g = bGetGrid();
    const cellOf = (x, y) => ({ c: bClamp(Math.floor(x / g.cell), 0, g.cols - 1), r: bClamp(Math.floor(y / g.cell), 0, g.rows - 1) });
    const s = cellOf(x1, y1); let e = cellOf(x2, y2);
    if (g.blocked[e.r * g.cols + e.c]) {
        let f = null;
        for (let rad = 1; rad <= 4 && !f; rad++) for (let dr = -rad; dr <= rad && !f; dr++) for (let dc = -rad; dc <= rad && !f; dc++) {
            const r = e.r + dr, c = e.c + dc;
            if (r >= 0 && c >= 0 && r < g.rows && c < g.cols && !g.blocked[r * g.cols + c]) f = { r, c };
        }
        if (!f) return []; e = f;
    }
    const cols = g.cols, rows = g.rows, si = s.r * cols + s.c, ei = e.r * cols + e.c;
    if (si === ei) return [{ x: x2, y: y2 }];
    const gS = new Float32Array(cols * rows).fill(Infinity), fS = new Float32Array(cols * rows).fill(Infinity);
    const came = new Int32Array(cols * rows).fill(-1), closed = new Uint8Array(cols * rows);
    const open = [si];
    const h = i => Math.max(Math.abs(((i / cols) | 0) - e.r), Math.abs((i % cols) - e.c));
    gS[si] = 0; fS[si] = h(si);
    let guard = 0;
    while (open.length && guard++ < 2500) {
        let bi = 0; for (let i = 1; i < open.length; i++) if (fS[open[i]] < fS[open[bi]]) bi = i;
        const cur = open.splice(bi, 1)[0];
        if (cur === ei) {
            const pts = []; let n = cur;
            while (n !== -1) { pts.push({ x: (n % cols) * g.cell + g.cell / 2, y: ((n / cols) | 0) * g.cell + g.cell / 2 }); n = came[n]; }
            pts.reverse();
            const out = [pts[0]]; let i = 0;
            while (i < pts.length - 1) {
                let j = pts.length - 1;
                while (j > i + 1 && !bRayClear(pts[i].x, pts[i].y, Math.atan2(pts[j].y - pts[i].y, pts[j].x - pts[i].x), bDist(pts[i].x, pts[i].y, pts[j].x, pts[j].y), 12)) j--;
                out.push(pts[j]); i = j;
            }
            return out;
        }
        closed[cur] = 1;
        const cr = (cur / cols) | 0, cc = cur % cols;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const r = cr + dr, c = cc + dc;
            if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
            const ni = r * cols + c;
            if (g.blocked[ni] || closed[ni]) continue;
            if (dr && dc && (g.blocked[cr * cols + c] || g.blocked[r * cols + cc])) continue;
            const tent = gS[cur] + ((dr && dc) ? 1.414 : 1);
            if (tent < gS[ni]) { gS[ni] = tent; came[ni] = cur; fS[ni] = tent + h(ni); if (open.indexOf(ni) === -1) open.push(ni); }
        }
    }
    return [];
}
function bNearestItem(me, kinds) {
    let best = null, bd = Infinity;
    for (const kind of kinds) {
        const arr = kind === 'coin' ? GameArrays.coins : kind === 'star' ? GameArrays.stars : kind === 'shield' ? GameArrays.shields : GameArrays.powerups;
        for (const it of arr) { const d = bDist(me.x, me.y, it.x, it.y); if (d < bd) { bd = d; best = it; } }
    }
    return best ? { item: best, dist: bd } : null;
}
// 👑 اقتصاد کامل: همیشه ضدِ نیاز
function bSmartBuy(me, foe) {
    const c = me.coins, now = Date.now();
    const D = BOT_DIFFS[GameState.botDifficulty] || BOT_DIFFS.medium;
    if (D.perfect) {
        if (me.hp < 80 && c >= 60) return buyUpgrade(2, 3);
        if (!me.shieldActive && c >= 120 && (foe.tripleShot > now || foe.rapidFire > now || me.hp < 90)) return buyUpgrade(2, 5);
        if (me.damage < 30 && c >= 40) return buyUpgrade(2, 0);
        if (me.bulletSpeed < 13 && c >= 100) return buyUpgrade(2, 2);
        if (c >= 50) return buyUpgrade(2, 1);
        return;
    }
    const hitRate = me.shotsFired > 6 ? me.shotsHit / me.shotsFired : 0.5;
    let pick = null;
    if (me.hp < 50 && c >= 60) pick = 3;
    else if (!me.shieldActive && c >= 120 && (foe.tripleShot > now || foe.rapidFire > now || me.hp < me.maxHp * 0.5)) pick = 5;
    else if (hitRate < 0.35 && me.tripleShot < now && c >= 150) pick = 4;
    else if (hitRate < 0.55 && c >= 100) pick = 2;
    else if (foe.baseSpeed > me.baseSpeed + 0.2 && c >= 50) pick = 1;
    else if (foe.maxHp > me.maxHp + 10 && c >= 40) pick = 0;
    else if (hitRate > 0.6 && c >= 40) pick = 0;
    else if (c >= 200) pick = 2;
    if (pick !== null) buyUpgrade(2, pick);
}
function bDecide(me, foe, D, now, los, dist) {
    const m = botBrain.model;
    const myP = (me.shieldActive ? 1 : 0) + (me.tripleShot > now ? 1 : 0) + me.hp / 100;
    const foeP = (foe.shieldActive ? 1 : 0) + (foe.tripleShot > now ? 1 : 0) + foe.hp / 100;
    const coverNear = botBrain.coverAngle !== null;
    const S = {};
    S.attack = los ? 40 + (myP >= foeP ? 30 : 12) + (dist < 300 ? 10 : 0) + botBrain.aim.lock * 20 : 0;
    S.kite = los && (foe.tripleShot > now || foe.rapidFire > now) && dist < 260 ? 60 : (los && dist < 120 && me.hp < foe.hp ? 40 : 0);
    S.retreat = me.hp < 35 ? 95 - me.hp : (me.hp < 55 && foeP > myP + 0.5 ? 35 : 0);
    S.reposition = los && !coverNear && foeP > myP ? 32 : (los && botBrain.aim.surprise > 0.6 ? 36 : 0);
    S.flank = (!los && m.retreat > 0.55 ? 48 : 0) + (los && dist > 350 && Math.random() < D.flankIQ * 0.35 ? 30 : 0);
    S.hold = now < botBrain.coolUntil && coverNear ? 48 : 0;
    const healNeed = me.hp < 70;
    const loot = bNearestItem(me, healNeed ? ['star', 'shield'] : ['shield', 'coin']);
    S.loot = loot && (healNeed ? 72 : (loot.dist < 200 && (!los || dist > 300) ? 30 : 0));
    S.seek = !los ? 30 + (now - botBrain.soundTime < 2500 ? 22 : 0) : 5;
    if (!D.perfect && Math.random() < D.mistakes * 0.4) for (const k in S) S[k] *= 0.7 + Math.random() * 0.6;
    let best = 'seek', bv = -1;
    for (const k in S) if (S[k] > bv) { bv = S[k]; best = k; }
    return best;
}
function bFlankTarget(me, foe, D) {
    const m = botBrain.model;
    let hot = null, hv = 0;
    for (const k in m.routeHeat) if (m.routeHeat[k] > hv) { hv = m.routeHeat[k]; hot = k; }
    if (hot && hv > 3 && Math.random() < D.flankIQ) {
        const p = hot.split(',');
        return { x: (+p[0]) * 100 + 50, y: (+p[1]) * 100 + 50 };
    }
    const side = m.strafeHist[0] >= m.strafeHist[1] ? -1 : 1;
    const a = Math.atan2(foe.y - me.y, foe.x - me.x) + (Math.PI / 2.5) * side;
    return { x: foe.x + Math.cos(a) * 180, y: foe.y + Math.sin(a) * 180 };
}
function bThink(me, foe, D, now) {
    const dist = bDist(me.x, me.y, foe.x, foe.y);
    const los = isLineOfSightClear(me.x, me.y, foe.x, foe.y);
    const dt = Math.max(50, now - (botBrain.lastSeen || now - 300));
    if (los) {
        botBrain.foeVX = ((foe.x - botBrain.foeLX) / dt) * 16;
        botBrain.foeVY = ((foe.y - botBrain.foeLY) / dt) * 16;
    }
    botBrain.foeLX = foe.x; botBrain.foeLY = foe.y;
    bLearnPlayer(me, foe, D, now, los, dist);
    bHearShots(me, foe, D, now);
    botBrain.coverAngle = bCoverAngle(me, foe);
    const act = bDecide(me, foe, D, now, los, dist);
    botBrain.state = act;
    const angTo = Math.atan2(foe.y - me.y, foe.x - me.x);

    if (act === 'attack') {
        if (D.perfect) {
            // 👑 کنترل فاصله کامل: Kill Zone بین ۲۰۰ تا ۳۲۰
            if (dist < 200) botBrain.desiredMove = angTo + Math.PI;
            else if (dist > 320) botBrain.desiredMove = angTo;
            else botBrain.desiredMove = angTo + (Math.PI / 2) * botBrain.strafeDir;
        } else if (dist > 260) botBrain.desiredMove = angTo;
        else if (dist < 110) botBrain.desiredMove = angTo + Math.PI;
        else botBrain.desiredMove = angTo + (Math.PI / 2) * botBrain.strafeDir;
        botBrain.path = [];
    } else if (act === 'kite') { botBrain.desiredMove = angTo + Math.PI + (Math.PI / 3) * botBrain.strafeDir; botBrain.path = []; }
    else if (act === 'retreat') {
        const star = bNearestItem(me, ['star']);
        botBrain.desiredMove = (star && star.dist < 280) ? Math.atan2(star.item.y - me.y, star.item.x - me.x) : angTo + Math.PI + (Math.random() - .5) * .6;
        botBrain.path = [];
    } else if (act === 'reposition') { botBrain.desiredMove = botBrain.coverAngle !== null ? botBrain.coverAngle : angTo + (Math.PI / 2) * botBrain.strafeDir; botBrain.path = []; }
    else if (act === 'flank') {
        const ft = bFlankTarget(me, foe, D);
        if (now >= botBrain.nextPath) { botBrain.nextPath = now + 700; botBrain.path = bFindPath(me.x, me.y, ft.x, ft.y); botBrain.pathIdx = 1; }
        botBrain.desiredMove = angTo;
    } else if (act === 'hold') { botBrain.desiredMove = botBrain.coverAngle !== null ? botBrain.coverAngle : angTo + (Math.PI / 2) * botBrain.strafeDir * 0.4; botBrain.path = []; }
    else if (act === 'loot') {
        const loot = bNearestItem(me, me.hp < 70 ? ['star', 'shield', 'coin'] : ['shield', 'coin']);
        if (loot) {
            botBrain.desiredMove = Math.atan2(loot.item.y - me.y, loot.item.x - me.x);
            if (!isLineOfSightClear(me.x, me.y, loot.item.x, loot.item.y) && now >= botBrain.nextPath) { botBrain.nextPath = now + 600; botBrain.path = bFindPath(me.x, me.y, loot.item.x, loot.item.y); botBrain.pathIdx = 1; }
        } else botBrain.desiredMove = angTo;
    } else {
        if (botBrain.lastKnown && now - botBrain.lastSeen < 4000) {
            botBrain.desiredMove = Math.atan2(botBrain.lastKnown.y - me.y, botBrain.lastKnown.x - me.x);
            if (now >= botBrain.nextPath) { botBrain.nextPath = now + 700; botBrain.path = bFindPath(me.x, me.y, botBrain.lastKnown.x, botBrain.lastKnown.y); botBrain.pathIdx = 1; }
        } else if (now - botBrain.soundTime < 2500) { botBrain.desiredMove = botBrain.soundDir; botBrain.path = []; }
        else botBrain.desiredMove = angTo;
    }

    if (now >= botBrain.nextStuck) {
        const moved = bDist(me.x, me.y, botBrain.lastX, botBrain.lastY);
        if (moved < 6) {
            botBrain.stuckCount++;
            if (botBrain.stuckCount >= 2) { botBrain.detourUntil = now + 500; botBrain.detourAngle = botBrain.moveAngle + (Math.random() < .5 ? 1 : -1) * 1.4; botBrain.stuckCount = 0; botBrain.path = []; }
        } else botBrain.stuckCount = 0;
        botBrain.lastX = me.x; botBrain.lastY = me.y; botBrain.nextStuck = now + 350;
    }
    if (now < botBrain.detourUntil) botBrain.desiredMove = botBrain.detourAngle;
    if (now >= botBrain.nextStrafe) { botBrain.nextStrafe = now + 900 + Math.random() * 900; if (Math.random() < 0.4) botBrain.strafeDir *= -1; }
    if (!D.perfect) {
        if (Math.random() < D.mistakes * 0.12) { botBrain.distractUntil = now + 250 + Math.random() * 350; botBrain.distractAngle = Math.random() * 6.28; }
        if (Math.random() < D.mistakes * 0.08) botBrain.hesitateUntil = now + 150 + Math.random() * 250;
    }
    if (now >= botBrain.nextAbility) {
        botBrain.nextAbility = now + 400;
        // 👑 نارنجک به آخرین موقعیتِ قایم‌شدت (کمپ‌کشی)
        if (D.perfect && !los && botBrain.lastKnown && now - botBrain.lastSeen > 1200 && now - me.lastGrenadeTime >= me.grenadeCooldown) {
            const ga = Math.atan2(botBrain.lastKnown.y - me.y, botBrain.lastKnown.x - me.x);
            const sv = me.angle; me.angle = ga; me.throwGrenade(); me.angle = sv;
        } else if (los && dist > 120 && dist < 380 && now - me.lastGrenadeTime >= me.grenadeCooldown && Math.random() < 0.3 + D.posIQ * 0.7) {
            const lead = 8 * D.predictQ;
            const ga = Math.atan2((foe.y + botBrain.foeVY * lead) - me.y, (foe.x + botBrain.foeVX * lead) - me.x);
            const sv = me.angle; me.angle = ga; me.throwGrenade(); me.angle = sv;
        }
        if (now - me.lastDashTime >= me.dashCooldown) {
            if (me.hp < 25) me.dash();
            else if (act === 'flank' && Math.random() < D.posIQ * 0.3) me.dash();
        }
        if (Math.random() < 0.3 + D.adaptRate * 0.7) bSmartBuy(me, foe);
    }
}

function updateBot() {
    if (GameState.gameOver || GameState.gameMode !== 'bot' || GameState.gamePaused || !GameState.gameStarted) return;
    if (!botBrain) resetBotBrain();
    const D = BOT_DIFFS[GameState.botDifficulty] || BOT_DIFFS.medium;
    const me = GameState.p2, foe = GameState.p1;
    const now = Date.now();
    const dist = bDist(me.x, me.y, foe.x, foe.y);
    const los = isLineOfSightClear(me.x, me.y, foe.x, foe.y);

    // ⚖️ FAIR PLAY: آمار برابر؛ قدرت = اجرای کامل

    // 👑 ضدِ دشِ حمله‌ات: اگه یهویی نزدیک شدی، بلافاصله فرار می‌کنه
    if (D.perfect) {
        const dd = dist - (botBrain.prevFrameDist || dist);
        if (dd < -10 && dist < 230 && now - me.lastDashTime >= me.dashCooldown) {
            const away = Math.atan2(me.y - foe.y, me.x - foe.x);
            const sv = me.angle; me.angle = away; me.dash(); me.angle = sv;
        }
        botBrain.prevFrameDist = dist;
    }

    if (now >= botBrain.nextThink) { botBrain.nextThink = now + D.think + Math.random() * D.think * .4; bThink(me, foe, D, now); }

    if (los && !botBrain.firstSeen) botBrain.reactUntil = now + D.react;
    if (los) botBrain.firstSeen = now; else botBrain.firstSeen = 0;

    bAimUpdate(me, foe, D, now, los, dist);
    if (now < botBrain.distractUntil) botBrain.faceAngle += bNorm(botBrain.distractAngle - botBrain.faceAngle) * 0.1;
    else { botBrain.faceAngle = botBrain.aim.angle; bFireControl(me, foe, D, now, los, dist); }

    bDodgeControl(me, D, now);
    if (now < botBrain.dodgeUntil) {
        botBrain.moveAngle = botBrain.dodgeAngle;
    } else if (botBrain.path.length && botBrain.pathIdx < botBrain.path.length) {
        const wp = botBrain.path[botBrain.pathIdx];
        botBrain.moveAngle = Math.atan2(wp.y - me.y, wp.x - me.x);
        if (bDist(me.x, me.y, wp.x, wp.y) < 20) botBrain.pathIdx++;
    } else {
        botBrain.moveAngle += bClamp(bNorm(botBrain.desiredMove - botBrain.moveAngle), -D.moveTurn, D.moveTurn);
        if (!bRayClear(me.x, me.y, botBrain.moveAngle, 50, 14)) botBrain.moveAngle = bSteerAround(me.x, me.y, botBrain.moveAngle);
    }
    me.move(Math.cos(botBrain.moveAngle), Math.sin(botBrain.moveAngle));
    me.angle = botBrain.faceAngle;
}