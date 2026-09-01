function updateBot() {
    if (GameState.gameOver || GameState.gameMode !== 'bot' || GameState.gamePaused) return;

    const diffSettings = {
        easy: { aimError: 0.5, reactionTime: 500, intelligence: 0.3 },
        medium: { aimError: 0.2, reactionTime: 250, intelligence: 0.6 },
        hard: { aimError: 0.1, reactionTime: 100, intelligence: 0.9 },
        insane: { aimError: 0.02, reactionTime: 30, intelligence: 1.0 }
    };
    const diff = diffSettings[GameState.botDifficulty];
    const p2 = GameState.p2, p1 = GameState.p1;

    if (Math.random() < diff.intelligence) {
        if (p2.coins >= 150 && p2.tripleShot < Date.now()) { p2.coins -= 150; p2.tripleShot = Date.now() + 15000; }
        else if (p2.coins >= 120 && !p2.shieldActive) { p2.coins -= 120; p2.shieldActive = true; p2.shieldExpiry = Date.now() + 8000; }
        else if (p2.hp < 60 && p2.coins >= 60) { p2.coins -= 60; p2.hp = Math.min(p2.maxHp, p2.hp + 30); }
        else if (p2.coins >= 100) { p2.coins -= 100; p2.bulletSpeed += 2; }
        else if (p2.coins >= 50) { p2.coins -= 50; p2.speed += 0.5; }
        else if (p2.coins >= 40) { p2.coins -= 40; p2.damage += 5; }
    }

    let target = p1;
    let minDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    if (p2.hp < 40) {
        for (let s of GameArrays.stars) {
            let dist = Math.hypot(s.x - p2.x, s.y - p2.y);
            if (dist < minDistance) { target = s; minDistance = dist; }
        }
    } else {
        for (let pu of GameArrays.powerups) {
            let dist = Math.hypot(pu.x - p2.x, pu.y - p2.y);
            if (dist < 200) { target = pu; minDistance = dist; }
        }
        for (let c of GameArrays.coins) {
            let dist = Math.hypot(c.x - p2.x, c.y - p2.y);
            if (dist < minDistance && dist < 300) { target = c; minDistance = dist; }
        }
    }

    let angleToTarget = Math.atan2(target.y - p2.y, target.x - p2.x);
    let moveAngle = angleToTarget;
    let testAngles = [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.6, -1.6, 2.0, -2.0, 2.4, -2.4, 3.14];
    for (let offset of testAngles) {
        let testAngle = angleToTarget + offset;
        let clear = true;
        for (let d = 10; d <= 45; d += 10) {
            let tx = p2.x + Math.cos(testAngle) * d;
            let ty = p2.y + Math.sin(testAngle) * d;
            if (tx < p2.radius || tx > CONFIG.CANVAS_WIDTH - p2.radius || ty < p2.radius || ty > CONFIG.CANVAS_HEIGHT - p2.radius) { clear = false; break; }
            for (let obs of GameState.currentObstacles) {
                if (circleRectCollision(tx, ty, p2.radius + 3, obs)) { clear = false; break; }
            }
            if (!clear) break;
        }
        if (clear) { moveAngle = testAngle; break; }
    }

    p2.angle = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    p2.angle += (Math.random() - 0.5) * diff.aimError;
    if (isLineOfSightClear(p2.x, p2.y, p1.x, p1.y)) {
        if (Date.now() - p2.lastShootTime >= diff.reactionTime) p2.shoot();
    }
    if (p2.hp < 30 && Date.now() - p2.lastDashTime >= p2.dashCooldown) p2.dash();
    const enemyDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    if (enemyDist < 150 && Date.now() - p2.lastGrenadeTime >= p2.grenadeCooldown && Math.random() < diff.intelligence) p2.throwGrenade();

    let finalDx = Math.cos(moveAngle), finalDy = Math.sin(moveAngle);
    if (Math.random() < 0.1) {
        let jitter = (Math.random() - 0.5) * 1.5;
        finalDx += -Math.sin(moveAngle) * jitter;
        finalDy += Math.cos(moveAngle) * jitter;
    }
    p2.move(finalDx, finalDy);
}