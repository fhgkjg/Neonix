// ==================== CONFIG ====================
const CONFIG = {
    CANVAS_WIDTH: 1000,
    CANVAS_HEIGHT: 600,
    WINNING_SCORE: 5,
    PLAYER_RADIUS: 16,
    BASE_SPEED: 2.8,
    BASE_DAMAGE: 15,
    BASE_BULLET_SPEED: 7,
    SHOOT_COOLDOWN: 250,
    DASH_COOLDOWN: 3000,
    GRENADE_COOLDOWN: 5000,
    RESPAWN_PROTECTION: 2000,
    INPUT_SEND_RATE: 50
};

// ==================== MAPS ====================
const MAPS = {
    arena: {
        name: 'آرنا', icon: '🏟️',
        description: 'مپ کلاسیک و متوازن',
        bgColor: '#0a0a0a',
        obstacles: [
            { x: 450, y: 250, w: 100, h: 100 },
            { x: 200, y: 100, w: 80, h: 20 },
            { x: 200, y: 480, w: 80, h: 20 },
            { x: 720, y: 100, w: 80, h: 20 },
            { x: 720, y: 480, w: 80, h: 20 },
            { x: 300, y: 200, w: 20, h: 200 },
            { x: 680, y: 200, w: 20, h: 200 },
            { x: 400, y: 100, w: 40, h: 40 },
            { x: 560, y: 100, w: 40, h: 40 },
            { x: 400, y: 460, w: 40, h: 40 },
            { x: 560, y: 460, w: 40, h: 40 }
        ]
    },
    maze: {
        name: 'پیچ در پیچ', icon: '🌀',
        description: 'پر از راه‌های پیچیده',
        bgColor: '#0a0810',
        obstacles: [
            { x: 100, y: 100, w: 200, h: 20 },
            { x: 100, y: 100, w: 20, h: 150 },
            { x: 300, y: 200, w: 20, h: 200 },
            { x: 400, y: 100, w: 20, h: 300 },
            { x: 500, y: 200, w: 20, h: 300 },
            { x: 600, y: 100, w: 20, h: 200 },
            { x: 700, y: 200, w: 20, h: 300 },
            { x: 200, y: 350, w: 150, h: 20 },
            { x: 400, y: 450, w: 150, h: 20 },
            { x: 600, y: 350, w: 150, h: 20 },
            { x: 150, y: 500, w: 20, h: 50 },
            { x: 350, y: 100, w: 20, h: 80 },
            { x: 850, y: 150, w: 20, h: 300 }
        ]
    },
    castle: {
        name: 'قلعه', icon: '🏰',
        description: 'مپ متقارن با قلعه مرکزی',
        bgColor: '#0a0a08',
        obstacles: [
            { x: 450, y: 250, w: 100, h: 100 },
            { x: 420, y: 220, w: 20, h: 20 },
            { x: 560, y: 220, w: 20, h: 20 },
            { x: 420, y: 360, w: 20, h: 20 },
            { x: 560, y: 360, w: 20, h: 20 },
            { x: 100, y: 100, w: 100, h: 100 },
            { x: 800, y: 100, w: 100, h: 100 },
            { x: 100, y: 400, w: 100, h: 100 },
            { x: 800, y: 400, w: 100, h: 100 },
            { x: 450, y: 50, w: 100, h: 40 },
            { x: 450, y: 510, w: 100, h: 40 },
            { x: 50, y: 280, w: 40, h: 40 },
            { x: 910, y: 280, w: 40, h: 40 }
        ]
    },
    space: {
        name: 'فضا', icon: '🌌',
        description: 'موانع پراکنده و آزاد',
        bgColor: '#050510',
        obstacles: [
            { x: 150, y: 150, w: 50, h: 50 },
            { x: 300, y: 100, w: 60, h: 40 },
            { x: 500, y: 200, w: 40, h: 80 },
            { x: 700, y: 150, w: 70, h: 40 },
            { x: 850, y: 250, w: 50, h: 50 },
            { x: 200, y: 350, w: 60, h: 60 },
            { x: 400, y: 400, w: 80, h: 40 },
            { x: 650, y: 450, w: 50, h: 50 },
            { x: 800, y: 400, w: 40, h: 80 },
            { x: 100, y: 500, w: 70, h: 40 }
        ]
    },
    jungle: {
        name: 'جنگل', icon: '🌳',
        description: 'موانع متراکم و طبیعی',
        bgColor: '#080a08',
        obstacles: [
            { x: 100, y: 80, w: 120, h: 30 },
            { x: 100, y: 490, w: 120, h: 30 },
            { x: 780, y: 80, w: 120, h: 30 },
            { x: 780, y: 490, w: 120, h: 30 },
            { x: 250, y: 200, w: 30, h: 150 },
            { x: 720, y: 200, w: 30, h: 150 },
            { x: 400, y: 100, w: 200, h: 30 },
            { x: 400, y: 470, w: 200, h: 30 },
            { x: 450, y: 250, w: 100, h: 100 }
        ]
    },
    random: {
        name: 'تصادفی', icon: '🎲',
        description: 'مپ تصادفی تولید می‌شود',
        bgColor: '#0a0a0a',
        obstacles: []
    }
};

// ==================== COLORS & SHAPES ====================
const PLAYER_COLORS = [
    '#ff416c', '#ff9500', '#ffcc00', '#00ff88',
    '#00ffff', '#2193b0', '#8a2be2', '#ff69b4'
];
const SHAPES = ['circle', 'triangle', 'square', 'star', 'hexagon'];

// ==================== SHOP ====================
const SHOP_ITEMS = [
    { name: 'damage', cost: 40, apply: (p) => p.damage += 5 },
    { name: 'speed', cost: 50, apply: (p) => { p.speed += 0.5; p.baseSpeed += 0.5; } },
    { name: 'bulletSpeed', cost: 100, apply: (p) => p.bulletSpeed += 2 },
    { name: 'heal', cost: 60, apply: (p) => p.hp = Math.min(p.maxHp, p.hp + 30) },
    { name: 'tripleShot', cost: 150, apply: (p) => p.tripleShot = Date.now() + 15000 },
    { name: 'superShield', cost: 120, apply: (p) => { p.shieldActive = true; p.shieldExpiry = Date.now() + 8000; } }
];

// ==================== GAME STATE ====================
const GameState = {
    canvas: null,
    ctx: null,
    minimap: null,
    mctx: null,
    gameContainer: null,
    keys: {},
    gameOver: false,
    gamePaused: false,
    gameMode: 'pvp',
    botDifficulty: 'medium',
    selectedMap: 'arena',
    currentObstacles: [],
    p1: null,
    p2: null,
    p1Color: localStorage.getItem('p1Color') || '#ff416c',
    p2Color: localStorage.getItem('p2Color') || '#2193b0',
    playerShape: localStorage.getItem('playerShape') || 'circle',
    masterVolume: 0.5,
    musicVolume: 0.3,
    fxLevel: 'medium',
    showMinimap: true,
    screenShake: 0
};

// آرایه‌های بازی
const GameArrays = {
    coins: [],
    stars: [],
    shields: [],
    bullets: [],
    grenades: [],
    explosions: [],
    mines: [],
    particles: [],
    powerups: [],
    ripples: [],
    trails: []
};