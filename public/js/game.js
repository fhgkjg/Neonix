function handleInput() {
    if (GameState.gameOver || GameState.gamePaused) return;

    if (onlineMode) {
        const me = myPlayerId === 1 ? GameState.p1 : GameState.p2;
        let dx = 0, dy = 0;
        if (GameState.keys['KeyW'] || GameState.keys['ArrowUp']) dy -= 1;
        if (GameState.keys['KeyS'] || GameState.keys['ArrowDown']) dy += 1;
        if (GameState.keys['KeyA'] || GameState.keys['ArrowLeft']) dx -= 1;
        if (GameState.keys['KeyD'] || GameState.keys['ArrowRight']) dx += 1;
        if (dx !== 0 || dy !== 0) me.move(dx, dy);
        if (GameState.keys['Space'] || GameState.keys['Enter'] || GameState.keys['NumpadEnter']) me.shoot();
        return;
    }

    let p1dx = 0, p1dy = 0;
    if (GameState.keys['KeyW']) p1dy -= 1;
    if (GameState.keys['KeyS']) p1dy += 1;
    if (GameState.keys['KeyA']) p1dx -= 1;
    if (GameState.keys['KeyD']) p1dx += 1;
    if (p1dx !== 0 || p1dy !== 0) GameState.p1.move(p1dx, p1dy);
    if (GameState.keys['Space']) GameState.p1.shoot();

    if (GameState.gameMode === 'pvp') {
        let p2dx = 0, p2dy = 0;
        if (GameState.keys['ArrowUp']) p2dy -= 1;
        if (GameState.keys['ArrowDown']) p2dy += 1;
        if (GameState.keys['ArrowLeft']) p2dx -= 1;
        if (GameState.keys['ArrowRight']) p2dx += 1;
        if (p2dx !== 0 || p2dy !== 0) GameState.p2.move(p2dx, p2dy);
        if (GameState.keys['Enter'] || GameState.keys['NumpadEnter']) GameState.p2.shoot();
    } else {
        updateBot();
    }
}

function update() {
    if (GameState.gameOver || GameState.gamePaused) return;
    handleInput();
    if (onlineMode) sendInput();

    // Update power-ups expiry
    [GameState.p1, GameState.p2].forEach(p => {
        if (p.shieldActive && Date.now() > p.shieldExpiry) p.shieldActive = false;
        if (p.invisibility > 0 && Date.now() > p.invisibility) p.invisibility = 0;
        if (p.tripleShot > 0 && Date.now() > p.tripleShot) p.tripleShot = 0;
        if (p.rapidFire > 0 && Date.now() > p.rapidFire) p.rapidFire = 0;
        if (p.speedBoost > 0 && Date.now() > p.speedBoost) { p.speedBoost = 0; p.speed = p.baseSpeed; }
        if (p.freeze > 0 && Date.now() > p.freeze) p.freeze = 0;
    });

    // Bullets
    for (let i = GameArrays.bullets.length - 1; i >= 0; i--) {
        let b = GameArrays.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        if (GameState.fxLevel === 'high') {
            GameArrays.trails.push({ x: b.x, y: b.y, color: b.color, life: 0.5 });
        }
        if (b.x < 0 || b.x > CONFIG.CANVAS_WIDTH || b.y < 0 || b.y > CONFIG.CANVAS_HEIGHT) {
            GameArrays.bullets.splice(i, 1);
            continue;
        }
        let hitObstacle = false;
        for (let obs of GameState.currentObstacles) {
            if (circleRectCollision(b.x, b.y, 4, obs)) {
                GameArrays.bullets.splice(i, 1);
                hitObstacle = true;
                for (let j = 0; j < 3; j++) spawnParticle(b.x, b.y, b.color, 'sparkle');
                break;
            }
        }
        if (hitObstacle) continue;

        // Star hit
        let hitStar = false;
        for (let j = GameArrays.stars.length - 1; j >= 0; j--) {
            let s = GameArrays.stars[j];
            if (Math.hypot(b.x - s.x, b.y - s.y) < s.radius + 8) {
                let nearest = null, minDist = 80;
                [GameState.p1, GameState.p2].forEach(t => {
                    let d = Math.hypot(t.x - s.x, t.y - s.y);
                    if (d <= minDist) { minDist = d; nearest = t; }
                });
                if (nearest) {
                    nearest.hp = Math.min(nearest.maxHp, nearest.hp + 15);
                    addFloatingText(nearest.x, nearest.y - 20, `+15 ${t('fx.heal')}`, "#00ff00"); // 👈 ترجمه
                    playSound('heal');
                }
                spawnRipple(s.x, s.y, '#00ff00');
                GameArrays.stars.splice(j, 1);
                GameArrays.bullets.splice(i, 1);
                hitStar = true;
                break;
            }
        }
        if (hitStar) continue;

        // Bullet vs Player
        let target = (b.ownerId === 1) ? GameState.p2 : GameState.p1;
        let shooter = (b.ownerId === 1) ? GameState.p1 : GameState.p2;
        if (circleRectCollision(b.x, b.y, 4, { x: target.x - target.radius, y: target.y - target.radius, w: target.radius * 2, h: target.radius * 2 })) {
            shooter.shotsHit++;
            const isDead = target.takeDamage(b.damage, shooter.id);
            if (isDead) {
                shooter.score += 1;
                shooter.kills++;
                target.deaths++;
                shooter.addXP(50);
                shooter.coins += 25;
                const now = Date.now();
                if (now - shooter.lastKillTime < 5000) shooter.killStreak++;
                else shooter.killStreak = 1;
                shooter.lastKillTime = now;
                const streakText = getStreakText(shooter.killStreak);
                if (streakText) showStreak(streakText);
                playSound('kill');
                addFloatingText(shooter.x, shooter.y - 20, "+1 🏆", "#ffd700");
                for (let k = 0; k < 30; k++) spawnParticle(target.x, target.y, target.color, 'explosion');
                if (shooter.score >= CONFIG.WINNING_SCORE) endGame(shooter.id);
                else target.reset(false);
            }
            GameArrays.bullets.splice(i, 1);
            updateUI();
        }
    }

    // Grenades
    for (let i = GameArrays.grenades.length - 1; i >= 0; i--) {
        let g = GameArrays.grenades[i];
        g.x += g.vx;
        g.y += g.vy;
        g.vx *= 0.95;
        g.vy *= 0.95;
        if (g.x < 10 || g.x > CONFIG.CANVAS_WIDTH - 10) g.vx *= -0.8;
        if (g.y < 10 || g.y > CONFIG.CANVAS_HEIGHT - 10) g.vy *= -0.8;
        for (let obs of GameState.currentObstacles) {
            if (circleRectCollision(g.x, g.y, 6, obs)) { g.vx *= -0.8; g.vy *= -0.8; }
        }
        if (Date.now() >= g.timer) {
            GameArrays.explosions.push({ x: g.x, y: g.y, radius: 0, maxRadius: 80, alpha: 1, color: '#ff6600' });
            [GameState.p1, GameState.p2].forEach(player => {
                if (player.id !== g.ownerId) {
                    const dist = Math.hypot(player.x - g.x, player.y - g.y);
                    if (dist < 80) {
                        const damage = Math.floor(40 * (1 - dist / 80));
                        player.takeDamage(damage, g.ownerId);
                        if (player.hp <= 0) {
                            const shooter = g.ownerId === 1 ? GameState.p1 : GameState.p2;
                            shooter.score++; shooter.kills++; player.deaths++;
                            if (shooter.score >= CONFIG.WINNING_SCORE) endGame(shooter.id);
                            else player.reset(false);
                        }
                    }
                }
            });
            playSound('explode');
            spawnScreenShake(15);
            for (let k = 0; k < 20; k++) spawnParticle(g.x, g.y, '#ff6600', 'explosion');
            GameArrays.grenades.splice(i, 1);
        }
    }

    // Explosions
    for (let i = GameArrays.explosions.length - 1; i >= 0; i--) {
        let e = GameArrays.explosions[i];
        e.radius += 5;
        e.alpha -= 0.05;
        if (e.alpha <= 0) GameArrays.explosions.splice(i, 1);
    }

    // Cleanup shaken items
    [GameArrays.coins, GameArrays.shields, GameArrays.powerups].forEach(arr => {
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i].shakeTime > 0 && Date.now() > arr[i].shakeTime) arr.splice(i, 1);
        }
    });

    // Coins Collection
    for (let i = GameArrays.coins.length - 1; i >= 0; i--) {
        let c = GameArrays.coins[i];
        if (checkCircleCollision(GameState.p1, c)) {
            GameState.p1.coins += 15;
            GameState.p1.addXP(5);
            addFloatingText(GameState.p1.x, GameState.p1.y - 20, `+15 💰`, "#f1c40f");
            playSound('pickup');
            GameArrays.coins.splice(i, 1);
            updateUI();
        } else if (checkCircleCollision(GameState.p2, c)) {
            GameState.p2.coins += 15;
            GameState.p2.addXP(5);
            addFloatingText(GameState.p2.x, GameState.p2.y - 20, `+15 💰`, "#f1c40f");
            playSound('pickup');
            GameArrays.coins.splice(i, 1);
            updateUI();
        }
    }

    // Stars Collection
    for (let i = GameArrays.stars.length - 1; i >= 0; i--) {
        let s = GameArrays.stars[i];
        if (checkCircleCollision(GameState.p1, s)) {
            GameState.p1.hp = Math.min(GameState.p1.maxHp, GameState.p1.hp + 30);
            addFloatingText(GameState.p1.x, GameState.p1.y - 20, `+30 ❤️`, "#00ff00");
            playSound('heal');
            GameArrays.stars.splice(i, 1);
            updateUI();
        } else if (checkCircleCollision(GameState.p2, s)) {
            GameState.p2.hp = Math.min(GameState.p2.maxHp, GameState.p2.hp + 30);
            addFloatingText(GameState.p2.x, GameState.p2.y - 20, `+30 ❤️`, "#00ff00");
            playSound('heal');
            GameArrays.stars.splice(i, 1);
            updateUI();
        }
    }

    // Shields Collection
    for (let i = GameArrays.shields.length - 1; i >= 0; i--) {
        let sh = GameArrays.shields[i];
        if (checkCircleCollision(GameState.p1, sh)) {
            GameState.p1.shieldActive = true;
            GameState.p1.shieldExpiry = Date.now() + 5000;
            addFloatingText(GameState.p1.x, GameState.p1.y - 20, t('fx.shield'), "#8a2be2"); // 👈 ترجمه
            playSound('shield');
            GameArrays.shields.splice(i, 1);
        } else if (checkCircleCollision(GameState.p2, sh)) {
            GameState.p2.shieldActive = true;
            GameState.p2.shieldExpiry = Date.now() + 5000;
            addFloatingText(GameState.p2.x, GameState.p2.y - 20, t('fx.shield'), "#8a2be2"); // 👈 ترجمه
            playSound('shield');
            GameArrays.shields.splice(i, 1);
        }
    }

    // Power-ups Collection
    for (let i = GameArrays.powerups.length - 1; i >= 0; i--) {
        let pu = GameArrays.powerups[i];
        const applyPowerup = (player) => {
            switch(pu.type) {
                case 'speed':
                    player.speedBoost = Date.now() + 8000;
                    player.speed = player.baseSpeed * 1.8;
                    addFloatingText(player.x, player.y - 20, t('fx.speed'), "#ffff00"); // 👈 ترجمه
                    break;
                case 'triple':
                    player.tripleShot = Date.now() + 10000;
                    addFloatingText(player.x, player.y - 20, t('fx.triple'), "#ff00ff"); // 👈 ترجمه
                    break;
                case 'rapid':
                    player.rapidFire = Date.now() + 7000;
                    addFloatingText(player.x, player.y - 20, t('fx.rapid'), "#ff6600"); // 👈 ترجمه
                    break;
                case 'invis':
                    player.invisibility = Date.now() + 5000;
                    addFloatingText(player.x, player.y - 20, t('fx.invisible'), "#ffffff"); // 👈 ترجمه
                    break;
            }
            playSound('pickup');
            player.addXP(20);
        };
        if (checkCircleCollision(GameState.p1, pu)) {
            applyPowerup(GameState.p1);
            GameArrays.powerups.splice(i, 1);
        } else if (checkCircleCollision(GameState.p2, pu)) {
            applyPowerup(GameState.p2);
            GameArrays.powerups.splice(i, 1);
        }
    }

    // Particles
    for (let i = GameArrays.particles.length - 1; i >= 0; i--) {
        let p = GameArrays.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= 0.02;
        if (p.life <= 0) GameArrays.particles.splice(i, 1);
    }

    for (let i = GameArrays.trails.length - 1; i >= 0; i--) {
        GameArrays.trails[i].life -= 0.05;
        if (GameArrays.trails[i].life <= 0) GameArrays.trails.splice(i, 1);
    }

    for (let i = GameArrays.ripples.length - 1; i >= 0; i--) {
        let r = GameArrays.ripples[i];
        r.radius += 1.5;
        r.alpha -= 0.05;
        if (r.alpha <= 0) GameArrays.ripples.splice(i, 1);
    }

    // Cooldown bars
    const now = Date.now();
    const p1 = GameState.p1, p2 = GameState.p2;
    document.getElementById('p1-dash-cd').style.width = Math.min(100, ((now - p1.lastDashTime) / p1.dashCooldown) * 100) + '%';
    document.getElementById('p1-grenade-cd').style.width = Math.min(100, ((now - p1.lastGrenadeTime) / p1.grenadeCooldown) * 100) + '%';
    document.getElementById('p2-dash-cd').style.width = Math.min(100, ((now - p2.lastDashTime) / p2.dashCooldown) * 100) + '%';
    document.getElementById('p2-grenade-cd').style.width = Math.min(100, ((now - p2.lastGrenadeTime) / p2.grenadeCooldown) * 100) + '%';

    if (GameState.screenShake > 0) GameState.screenShake *= 0.85;
    if (GameState.screenShake < 0.1) GameState.screenShake = 0;
}

function draw() {
    const ctx = GameState.ctx;
    ctx.save();
    if (GameState.screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * GameState.screenShake, (Math.random() - 0.5) * GameState.screenShake);
    }

    ctx.fillStyle = MAPS[GameState.selectedMap]?.bgColor || '#0a0a0a';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    ctx.strokeStyle = 'rgba(69,162,158,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CONFIG.CANVAS_WIDTH; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CONFIG.CANVAS_HEIGHT); ctx.stroke(); }
    for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CONFIG.CANVAS_WIDTH, y); ctx.stroke(); }

    ctx.shadowBlur = 8;
    ctx.shadowColor = '#45a29e';
    ctx.fillStyle = '#1f2833';
    ctx.strokeStyle = '#45a29e';
    ctx.lineWidth = 2;
    for (let obs of GameState.currentObstacles) {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = 'rgba(102,252,241,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(obs.x + 4, obs.y + 4, obs.w - 8, obs.h - 8);
        ctx.strokeStyle = '#45a29e';
        ctx.lineWidth = 2;
    }

    for (let r of GameArrays.ripples) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.alpha;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    for (let t of GameArrays.trails) {
        ctx.globalAlpha = t.life;
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 3 * t.life, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (let p of GameArrays.particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Coins
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f1c40f';
    for (let c of GameArrays.coins) {
        let dx = c.shakeTime > Date.now() ? c.shakeX : 0;
        let dy = c.shakeTime > Date.now() ? c.shakeY : 0;
        ctx.save();
        ctx.translate(c.x + dx, c.y + dy);
        ctx.rotate(Date.now() / 200);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-c.radius, -c.radius / 3, c.radius * 2, c.radius * 2 / 3);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1;
        ctx.strokeRect(-c.radius, -c.radius / 3, c.radius * 2, c.radius * 2 / 3);
        ctx.restore();
    }

    ctx.shadowColor = '#00ff00';
    for (let s of GameArrays.stars) {
        let dx = s.shakeTime > Date.now() ? s.shakeX : 0;
        let dy = s.shakeTime > Date.now() ? s.shakeY : 0;
        ctx.save();
        ctx.translate(s.x + dx, s.y + dy);
        ctx.rotate(Date.now() / 500);
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * s.radius,
                -Math.sin((18 + i * 72) * Math.PI / 180) * s.radius);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (s.radius / 2),
                -Math.sin((54 + i * 72) * Math.PI / 180) * (s.radius / 2));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    for (let b of GameArrays.bullets) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    GameState.p1.draw();
    GameState.p2.draw();

    ctx.restore();

    if (GameState.showMinimap) drawMinimap();
}

function drawMinimap() {
    const scale = GameState.minimap.width / CONFIG.CANVAS_WIDTH;
    const scaleY = GameState.minimap.height / CONFIG.CANVAS_HEIGHT;
    const mctx = GameState.mctx;
    mctx.clearRect(0, 0, GameState.minimap.width, GameState.minimap.height);
    mctx.fillStyle = 'rgba(11,12,16,0.8)';
    mctx.fillRect(0, 0, GameState.minimap.width, GameState.minimap.height);
    mctx.fillStyle = '#45a29e';
    for (let obs of GameState.currentObstacles) {
        mctx.fillRect(obs.x * scale, obs.y * scaleY, obs.w * scale, obs.h * scaleY);
    }
    mctx.fillStyle = GameState.p1.color;
    mctx.beginPath();
    mctx.arc(GameState.p1.x * scale, GameState.p1.y * scaleY, 4, 0, Math.PI * 2);
    mctx.fill();
    mctx.fillStyle = GameState.p2.color;
    mctx.beginPath();
    mctx.arc(GameState.p2.x * scale, GameState.p2.y * scaleY, 4, 0, Math.PI * 2);
    mctx.fill();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function startGame(mode) {
    initAudio();
    GameState.gameMode = mode;
    if (mode === 'bot') {
        GameState.botDifficulty = document.getElementById('bot-diff-select').value;
        // 👇 ترجمه نام ربات
        const diffNames = {
            easy: t('mode.easy'),
            medium: t('mode.medium'),
            hard: t('mode.hard'),
            insane: t('mode.insane')
        };
        document.getElementById('p2-name').innerText = `${t('game.bot')} (${diffNames[GameState.botDifficulty] || GameState.botDifficulty})`;
        document.getElementById('p2-shop').style.display = 'none';
    } else {
        document.getElementById('p2-name').innerText = t('game.player2'); // 👈 ترجمه
    }
    document.getElementById('main-menu').style.display = 'none';
    loadMap(GameState.selectedMap);
    resetGame();
}

function endGame(winnerId) {
    GameState.gameOver = true;
    const shooter = winnerId === 1 ? GameState.p1 : GameState.p2;
    
    // 👇 ترجمه نام برنده
    let name;
    if (winnerId === 1) name = t('game.player1');
    else if (GameState.gameMode === 'bot') name = t('game.bot');
    else name = t('game.player2');
    
    document.getElementById('winner-text').innerText = `${name} ${t('game.winner')}`;
    document.getElementById('winner-text').style.color = shooter.color;
    
    const statsHTML = `
        <div class="stat-box"><div class="stat-value">${GameState.p1.kills}</div><div class="stat-label">${t('game.player1')}</div></div>
        <div class="stat-box"><div class="stat-value">${GameState.p2.kills}</div><div class="stat-label">${t('game.player2')}</div></div>
        <div class="stat-box"><div class="stat-value">Lv.${GameState.p1.level}</div><div class="stat-label">Lv P1</div></div>
        <div class="stat-box"><div class="stat-value">Lv.${GameState.p2.level}</div><div class="stat-label">Lv P2</div></div>
    `;
    document.getElementById('final-stats').innerHTML = statsHTML;
    document.getElementById('game-over').style.display = 'flex';
    
    saveToLeaderboard({
        winner: name,
        score: shooter.score,
        kills: shooter.kills,
        map: MAPS[GameState.selectedMap].name,
        date: new Date().toLocaleDateString('fa-IR')
    });
}

function togglePause() {
    if (GameState.gameOver) return;
    GameState.gamePaused = !GameState.gamePaused;
    document.getElementById('pause-menu').style.display = GameState.gamePaused ? 'flex' : 'none';
}
function resumeGame() {
    GameState.gamePaused = false;
    document.getElementById('pause-menu').style.display = 'none';
}
function restartGame() {
    document.getElementById('pause-menu').style.display = 'none';
    GameState.gamePaused = false;
    loadMap(GameState.selectedMap);
    resetGame();
}
function returnToMenu() {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('pause-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
    GameState.gameOver = false;
    GameState.gamePaused = false;
}
function resetGame() {
    GameState.gameOver = false;
    GameState.p1 = new Player(1, 60, CONFIG.CANVAS_HEIGHT / 2, GameState.p1Color);
    GameState.p2 = new Player(2, CONFIG.CANVAS_WIDTH - 60, CONFIG.CANVAS_HEIGHT / 2, GameState.p2Color);
    GameState.p2.angle = Math.PI;
    GameArrays.bullets = [];
    GameArrays.grenades = [];
    GameArrays.explosions = [];
    GameArrays.coins = [];
    GameArrays.stars = [];
    GameArrays.shields = [];
    GameArrays.mines = [];
    GameArrays.particles = [];
    GameArrays.powerups = [];
    GameArrays.trails = [];
    GameArrays.ripples = [];
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('p1-shop').style.display = 'none';
    document.getElementById('p2-shop').style.display = 'none';
    for (let i = 0; i < 3; i++) spawnItem('coin');
    spawnItem('star');
    updateUI();
}