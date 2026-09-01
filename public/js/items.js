function generateRandomMap() {
    const obstacles = [];
    const count = 10 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
        let attempts = 0, valid = false, obs;
        while (!valid && attempts < 50) {
            const w = 30 + Math.random() * 100;
            const h = 30 + Math.random() * 100;
            const x = 50 + Math.random() * (CONFIG.CANVAS_WIDTH - w - 100);
            const y = 50 + Math.random() * (CONFIG.CANVAS_HEIGHT - h - 100);
            if ((x < 150 && y > CONFIG.CANVAS_HEIGHT / 2 - 100 && y < CONFIG.CANVAS_HEIGHT / 2 + 100) ||
                (x + w > CONFIG.CANVAS_WIDTH - 150 && y > CONFIG.CANVAS_HEIGHT / 2 - 100 && y < CONFIG.CANVAS_HEIGHT / 2 + 100)) {
                attempts++; continue;
            }
            obs = { x, y, w, h };
            valid = !obstacles.some(o =>
                x < o.x + o.w + 20 && x + w > o.x - 20 &&
                y < o.y + o.h + 20 && y + h > o.y - 20
            );
            attempts++;
        }
        if (valid) obstacles.push(obs);
    }
    return obstacles;
}

function loadMap(mapId) {
    if (mapId === 'random') GameState.currentObstacles = generateRandomMap();
    else GameState.currentObstacles = JSON.parse(JSON.stringify(MAPS[mapId].obstacles));
}

function spawnItem(type) {
    const maxCounts = { coin: 8, star: 3, shield: 2, speed: 2, triple: 1, rapid: 1, invis: 1, mine: 2 };
    const currentCount = {
        coin: GameArrays.coins.length,
        star: GameArrays.stars.length,
        shield: GameArrays.shields.length,
        speed: GameArrays.powerups.filter(p => p.type === 'speed').length,
        triple: GameArrays.powerups.filter(p => p.type === 'triple').length,
        rapid: GameArrays.powerups.filter(p => p.type === 'rapid').length,
        invis: GameArrays.powerups.filter(p => p.type === 'invis').length,
        mine: GameArrays.mines.length
    };
    if (currentCount[type] >= maxCounts[type]) return;

    let valid = false, cx, cy, attempts = 0;
    while (!valid && attempts < 100) {
        cx = Math.floor(Math.random() * (CONFIG.CANVAS_WIDTH - 100)) + 50;
        cy = Math.floor(Math.random() * (CONFIG.CANVAS_HEIGHT - 100)) + 50;
        valid = true;
        if (cx < 100 && Math.abs(cy - CONFIG.CANVAS_HEIGHT / 2) < 100) valid = false;
        if (cx > CONFIG.CANVAS_WIDTH - 100 && Math.abs(cy - CONFIG.CANVAS_HEIGHT / 2) < 100) valid = false;
        for (let obs of GameState.currentObstacles) {
            if (circleRectCollision(cx, cy, 14, obs)) { valid = false; break; }
        }
        attempts++;
    }
    if (!valid) return;

    const item = { x: cx, y: cy, radius: 10, shakeTime: 0, shakeX: 0, shakeY: 0 };
    switch (type) {
        case 'coin': GameArrays.coins.push(item); break;
        case 'star': GameArrays.stars.push(item); spawnRipple(cx, cy, '#00ff00'); break;
        case 'shield': GameArrays.shields.push(item); spawnRipple(cx, cy, '#8a2be2'); break;
        case 'speed':
        case 'triple':
        case 'rapid':
        case 'invis':
            item.type = type;
            GameArrays.powerups.push(item);
            spawnRipple(cx, cy, '#ffff00');
            break;
        case 'mine':
            item.placedBy = null;
            GameArrays.mines.push(item);
            break;
    }
}

function spawnPowerup() {
    const types = ['speed', 'triple', 'rapid', 'invis', 'shield'];
    spawnItem(types[Math.floor(Math.random() * types.length)]);
}

// شروع spawn های دوره‌ای
setInterval(() => spawnItem('coin'), 4000);
setInterval(() => spawnItem('star'), 12000);
setInterval(() => spawnItem('shield'), 18000);
setInterval(spawnPowerup, 15000);

function buyUpgrade(playerId, index) {
    const player = playerId === 1 ? GameState.p1 : GameState.p2;
    const item = SHOP_ITEMS[index];
    if (player.coins >= item.cost) {
        player.coins -= item.cost;
        item.apply(player);
        addFloatingText(player.x, player.y - 30, t('fx.upgrade'), '#ffd700');
        playSound('pickup');
        if (typeof updateUI === 'function') updateUI();
    }
}