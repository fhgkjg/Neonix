// ==================== COLLISION & MATH ====================
function circleRectCollision(cx, cy, r, rect) {
    let nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    let nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    let distX = cx - nearestX;
    let distY = cy - nearestY;
    return (distX * distX + distY * distY) < (r * r);
}

function checkCircleCollision(c1, c2) {
    let dx = c1.x - c2.x;
    let dy = c1.y - c2.y;
    return Math.sqrt(dx * dx + dy * dy) < c1.radius + c2.radius;
}

function isLineOfSightClear(x1, y1, x2, y2) {
    let dist = Math.hypot(x2 - x1, y2 - y1);
    let steps = Math.ceil(dist / 10);
    for (let i = 0; i <= steps; i++) {
        let px = x1 + (x2 - x1) * (i / steps);
        let py = y1 + (y2 - y1) * (i / steps);
        for (let obs of GameState.currentObstacles) {
            if (px > obs.x - 4 && px < obs.x + obs.w + 4 && py > obs.y - 4 && py < obs.y + obs.h + 4) {
                return false;
            }
        }
    }
    return true;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// ==================== EFFECTS ====================
function addFloatingText(x, y, text, color, size = 16) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.style.left = (GameState.canvas.offsetLeft + x) + 'px';
    el.style.top = (GameState.canvas.offsetTop + y) + 'px';
    el.style.color = color;
    el.style.fontSize = size + 'px';
    el.innerText = text;
    GameState.gameContainer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

function showStreak(text) {
    const el = document.createElement('div');
    el.className = 'streak-announcement';
    el.innerText = text;
    GameState.gameContainer.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

function spawnScreenShake(amount) {
    GameState.screenShake = Math.max(GameState.screenShake, amount);
}

function spawnParticle(x, y, color, type = 'normal') {
    const particle = {
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        color,
        size: 3,
        type
    };
    if (type === 'blood') { particle.vx *= 2; particle.vy *= 2; particle.size = 4; }
    else if (type === 'sparkle') { particle.vx *= 3; particle.vy *= 3; particle.size = 2; particle.life = 1.5; }
    else if (type === 'dash') { particle.size = 5; particle.vx = -particle.vx; particle.vy = -particle.vy; }
    else if (type === 'explosion') { particle.vx *= 4; particle.vy *= 4; particle.size = 6; particle.life = 1.5; }
    GameArrays.particles.push(particle);
}

function spawnRipple(x, y, color) {
    GameArrays.ripples.push({ x, y, radius: 5, maxRadius: 40, alpha: 1, color });
}

// ==================== DRAWING HELPERS ====================
function drawShape(ctx, x, y, radius, shape, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.beginPath();
    switch (shape) {
        case 'circle':
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            break;
        case 'triangle':
            for (let i = 0; i < 3; i++) {
                const angle = (i * 120 - 90) * Math.PI / 180;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            break;
        case 'square':
            ctx.rect(-radius, -radius, radius * 2, radius * 2);
            break;
        case 'star':
            for (let i = 0; i < 5; i++) {
                const outer = (i * 72 - 90) * Math.PI / 180;
                const inner = ((i * 72 + 36) - 90) * Math.PI / 180;
                ctx.lineTo(Math.cos(outer) * radius, Math.sin(outer) * radius);
                ctx.lineTo(Math.cos(inner) * (radius / 2), Math.sin(inner) * (radius / 2));
            }
            ctx.closePath();
            break;
        case 'hexagon':
            for (let i = 0; i < 6; i++) {
                const angle = (i * 60 - 90) * Math.PI / 180;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            break;
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}