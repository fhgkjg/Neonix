function updateUI() {
    const p1 = GameState.p1, p2 = GameState.p2;
    document.getElementById('p1-score').innerText = p1.score;
    document.getElementById('p1-coins').innerText = p1.coins;
    document.getElementById('p1-kills').innerText = p1.kills;
    document.getElementById('p1-level').innerText = `Lv.${p1.level}`;
    document.getElementById('p1-health').style.width = Math.max(0, (p1.hp / p1.maxHp) * 100) + '%';
    document.getElementById('p1-hp-text').innerText = `${Math.max(0, p1.hp)}/${p1.maxHp}`;
    document.getElementById('p2-score').innerText = p2.score;
    document.getElementById('p2-coins').innerText = p2.coins;
    document.getElementById('p2-kills').innerText = p2.kills;
    document.getElementById('p2-level').innerText = `Lv.${p2.level}`;
    document.getElementById('p2-health').style.width = Math.max(0, (p2.hp / p2.maxHp) * 100) + '%';
    document.getElementById('p2-hp-text').innerText = `${Math.max(0, p2.hp)}/${p2.maxHp}`;
}

function setCustomColor(playerId, color) {
    if (playerId === 1) {
        GameState.p1Color = color;
        if (GameState.p1) GameState.p1.color = color;
        localStorage.setItem('p1Color', color);
    } else {
        GameState.p2Color = color;
        if (GameState.p2) GameState.p2.color = color;
        localStorage.setItem('p2Color', color);
    }
    renderColorPickers();
}

function setShape(shape) {
    GameState.playerShape = shape;
    localStorage.setItem('playerShape', shape);
    renderShapePicker();
}

function renderColorPickers() {
    const p1C = document.getElementById('p1-colors');
    const p2C = document.getElementById('p2-colors');
    p1C.innerHTML = '';
    p2C.innerHTML = '';
    PLAYER_COLORS.forEach(color => {
        const s1 = document.createElement('div');
        s1.className = 'color-swatch' + (GameState.p1Color === color ? ' selected' : '');
        s1.style.backgroundColor = color;
        s1.onclick = () => setCustomColor(1, color);
        p1C.appendChild(s1);
        const s2 = document.createElement('div');
        s2.className = 'color-swatch' + (GameState.p2Color === color ? ' selected' : '');
        s2.style.backgroundColor = color;
        s2.onclick = () => setCustomColor(2, color);
        p2C.appendChild(s2);
    });
    document.getElementById('p1-custom-color').value = GameState.p1Color;
    document.getElementById('p2-custom-color').value = GameState.p2Color;
}

function renderShapePicker() {
    const container = document.getElementById('shapes');
    container.innerHTML = '';
    SHAPES.forEach(shape => {
        const btn = document.createElement('div');
        btn.className = 'shape-btn' + (GameState.playerShape === shape ? ' selected' : '');
        const c = document.createElement('canvas');
        c.width = 40; c.height = 40;
        const ctx = c.getContext('2d');
        drawShape(ctx, 20, 20, 15, shape, '#66fcf1');
        btn.appendChild(c);
        btn.onclick = () => setShape(shape);
        container.appendChild(btn);
    });
}

function renderMapGrid() {
    const grid = document.getElementById('map-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    Object.entries(MAPS).forEach(([id, map]) => {
        const card = document.createElement('div');
        card.className = 'map-card' + (GameState.selectedMap === id ? ' selected' : '');
        card.onclick = () => selectMap(id);
        
        const preview = document.createElement('canvas');
        preview.width = 160; preview.height = 80;
        preview.className = 'map-preview';
        drawMapPreview(preview.getContext('2d'), id);
        
        // استفاده از ترجمه
        const mapName = t(`map.${id}`) || map.name;
        const mapDesc = t(`map.${id}_desc`) || map.description;
        
        card.innerHTML = `
            <div class="map-name">${map.icon} ${mapName}</div>
            <div style="font-size:11px;color:#888;text-align:center;">${mapDesc}</div>
        `;
        card.insertBefore(preview, card.firstChild);
        grid.appendChild(card);
    });
}

function drawMapPreview(ctx, mapId) {
    const obstacles = mapId === 'random' ? [] : MAPS[mapId].obstacles;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 160, 80);
    const scaleX = 160 / CONFIG.CANVAS_WIDTH;
    const scaleY = 80 / CONFIG.CANVAS_HEIGHT;
    ctx.fillStyle = '#45a29e';
    obstacles.forEach(o => ctx.fillRect(o.x * scaleX, o.y * scaleY, o.w * scaleX, o.h * scaleY));
    ctx.fillStyle = '#ff416c';
    ctx.beginPath(); ctx.arc(10, 40, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2193b0';
    ctx.beginPath(); ctx.arc(150, 40, 4, 0, Math.PI * 2); ctx.fill();
}

function selectMap(id) {
    GameState.selectedMap = id;
    localStorage.setItem('selectedMap', id);
    renderMapGrid();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('tab-' + tabName).classList.add('active');
}

function setFXLevel(level) { GameState.fxLevel = level; }
function setWinScore(score) { CONFIG.WINNING_SCORE = parseInt(score); }
function toggleMinimap(show) {
    GameState.showMinimap = show;
    document.getElementById('minimap').style.display = show ? 'block' : 'none';
}

// Leaderboard
function saveToLeaderboard(entry) {
    let lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    lb.unshift(entry);
    lb = lb.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(lb));
    renderLeaderboard();
}

function renderLeaderboard() {
    const lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const container = document.getElementById('leaderboard');
    if (lb.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:20px;">هنوز رکوردی نیست!</p>';
        return;
    }
    container.innerHTML = lb.map((entry, i) => `
        <div class="lb-row">
            <span class="lb-rank">#${i + 1}</span>
            <span>${entry.winner}</span>
            <span>🗺️ ${entry.map}</span>
            <span class="lb-score">💀 ${entry.kills}</span>
        </div>
    `).join('');
}

function clearLeaderboard() {
    if (confirm('آیا مطمئن هستید؟')) {
        localStorage.removeItem('leaderboard');
        renderLeaderboard();
    }
}

// کنترل‌ها
window.addEventListener('keydown', (e) => {
    GameState.keys[e.code] = true;
    if (e.code === 'Escape' && !GameState.gameOver) togglePause();
    if (GameState.gamePaused || GameState.gameOver) return;
    // بقیه کنترل‌ها در game.js
});

window.addEventListener('keyup', (e) => { GameState.keys[e.code] = false; });