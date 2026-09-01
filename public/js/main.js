// ==================== INIT ====================
function init() {
    // گرفتن عناصر DOM
    GameState.canvas = document.getElementById('gameCanvas');
    GameState.ctx = GameState.canvas.getContext('2d');
    GameState.minimap = document.getElementById('minimap');
    GameState.mctx = GameState.minimap.getContext('2d');
    GameState.gameContainer = document.getElementById('game-container');

    const savedMap = localStorage.getItem('selectedMap');
    if (savedMap && MAPS[savedMap]) GameState.selectedMap = savedMap;

    renderMapGrid();
    renderColorPickers();
    renderShapePicker();
    renderLeaderboard();
        
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }

    loadMap(GameState.selectedMap);

    // ساخت بازیکن‌ها
    GameState.p1 = new Player(1, 60, CONFIG.CANVAS_HEIGHT / 2, GameState.p1Color);
    GameState.p2 = new Player(2, CONFIG.CANVAS_WIDTH - 60, CONFIG.CANVAS_HEIGHT / 2, GameState.p2Color);
    GameState.p2.angle = Math.PI;

    window.addEventListener('keydown', (e) => {
        if (GameState.gamePaused || GameState.gameOver) return;

        const p1 = GameState.p1, p2 = GameState.p2;

        if (!onlineMode) {
            if (e.code === 'KeyE') {
                p1.shopOpen = !p1.shopOpen;
                document.getElementById('p1-shop').style.display = p1.shopOpen ? 'block' : 'none';
            }
            if (GameState.gameMode === 'pvp' && (e.code === 'ShiftLeft' || e.code === 'ShiftRight')) {
                p2.shopOpen = !p2.shopOpen;
                document.getElementById('p2-shop').style.display = p2.shopOpen ? 'block' : 'none';
            }
        } else {
            const myP = myPlayerId === 1 ? p1 : p2;
            const myShop = myPlayerId === 1 ? 'p1-shop' : 'p2-shop';
            if (e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                myP.shopOpen = !myP.shopOpen;
                document.getElementById(myShop).style.display = myP.shopOpen ? 'block' : 'none';
            }
        }

        if (p1.shopOpen) {
            if (e.code === 'Digit1' || e.code === 'Numpad1') buyUpgrade(1, 0);
            if (e.code === 'Digit2' || e.code === 'Numpad2') buyUpgrade(1, 1);
            if (e.code === 'Digit3' || e.code === 'Numpad3') buyUpgrade(1, 2);
            if (e.code === 'Digit4' || e.code === 'Numpad4') buyUpgrade(1, 3);
            if (e.code === 'Digit5' || e.code === 'Numpad5') buyUpgrade(1, 4);
            if (e.code === 'Digit6' || e.code === 'Numpad6') buyUpgrade(1, 5);
        }
        if (p2.shopOpen && GameState.gameMode === 'pvp') {
            if (e.code === 'Digit7' || e.code === 'Numpad7') buyUpgrade(2, 0);
            if (e.code === 'Digit8' || e.code === 'Numpad8') buyUpgrade(2, 1);
            if (e.code === 'Digit9' || e.code === 'Numpad9') buyUpgrade(2, 2);
            if (e.code === 'Digit0' || e.code === 'Numpad0') buyUpgrade(2, 3);
            if (e.code === 'Minus' || e.code === 'NumpadSubtract') buyUpgrade(2, 4);
            if (e.code === 'Equal' || e.code === 'NumpadAdd') buyUpgrade(2, 5);
        }

        if (!onlineMode) {
            if (e.code === 'KeyQ') p1.dash();
            if (e.code === 'KeyF') p1.throwGrenade();
            if (e.code === 'KeyM' && GameState.gameMode === 'pvp') p2.dash();
            if (e.code === 'KeyL' && GameState.gameMode === 'pvp') p2.throwGrenade();
        } else {
            const me = myPlayerId === 1 ? p1 : p2;
            if (e.code === 'KeyQ' || e.code === 'KeyM') me.dash();
            if (e.code === 'KeyF' || e.code === 'KeyL') me.throwGrenade();
        }

        updateUI();
    });

    GameState.canvas.addEventListener('contextmenu', e => e.preventDefault());

    console.log('🎮 نبرد نئونی در حال اجرا...');
    gameLoop();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}