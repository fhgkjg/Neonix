class Player {
    constructor(id, x, y, color) {
        this.id = id;
        this.spawnX = x;
        this.spawnY = y;
        this.x = x;
        this.y = y;
        this.radius = CONFIG.PLAYER_RADIUS;
        this.color = color;
        this.hp = 100;
        this.maxHp = 100;
        this.score = 0;
        this.coins = 0;
        this.kills = 0;
        this.deaths = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.speed = CONFIG.BASE_SPEED;
        this.baseSpeed = CONFIG.BASE_SPEED;
        this.damage = CONFIG.BASE_DAMAGE;
        this.bulletSpeed = CONFIG.BASE_BULLET_SPEED;
        this.lastShootTime = 0;
        this.shootCooldown = CONFIG.SHOOT_COOLDOWN;
        this.angle = 0;
        this.shopOpen = false;
        this.shieldActive = false;
        this.shieldExpiry = 0;
        this.respawnProtection = 0;
        this.dashCooldown = CONFIG.DASH_COOLDOWN;
        this.lastDashTime = 0;
        this.isDashing = false;
        this.dashExpiry = 0;
        this.dashDirection = { x: 0, y: 0 };
        this.grenadeCooldown = CONFIG.GRENADE_COOLDOWN;
        this.lastGrenadeTime = 0;
        this.tripleShot = 0;
        this.speedBoost = 0;
        this.rapidFire = 0;
        this.invisibility = 0;
        this.freeze = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 100;
        this.killStreak = 0;
        this.lastKillTime = 0;
        this.trail = [];
        this.hitFlash = 0;
        this.vx = 0;
        this.vy = 0;
    }

    reset(fullReset = false) {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.hp = this.maxHp;
        this.shieldActive = false;
        this.shieldExpiry = 0;
        this.respawnProtection = Date.now() + CONFIG.RESPAWN_PROTECTION;
        this.tripleShot = 0;
        this.speedBoost = 0;
        this.rapidFire = 0;
        this.invisibility = 0;
        this.freeze = 0;
        this.vx = 0;
        this.vy = 0;
        if (fullReset) {
            this.score = 0; this.coins = 0; this.kills = 0; this.deaths = 0;
            this.shotsFired = 0; this.shotsHit = 0;
            this.speed = CONFIG.BASE_SPEED; this.baseSpeed = CONFIG.BASE_SPEED;
            this.damage = CONFIG.BASE_DAMAGE; this.bulletSpeed = CONFIG.BASE_BULLET_SPEED;
            this.level = 1; this.xp = 0; this.xpToNext = 100; this.killStreak = 0;
        }
    }

    addXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.onLevelUp();
        }
    }

    onLevelUp() {
        this.maxHp += 10;
        this.hp = Math.min(this.hp + 20, this.maxHp);
        this.damage += 2;
        this.speed += 0.1;
        this.baseSpeed += 0.1;
        addFloatingText(this.x, this.y - 30, `${t('fx.level_up')} Lv.${this.level}`, '#ffd700');
        playSound('levelup');
        for (let i = 0; i < 20; i++) spawnParticle(this.x, this.y, '#ffd700', 'sparkle');
    }

    draw() {
        if (this.trail.length > 0 && GameState.fxLevel !== 'low') {
            GameState.ctx.save();
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                const alpha = i / this.trail.length * 0.5;
                GameState.ctx.globalAlpha = alpha;
                GameState.ctx.fillStyle = this.color;
                GameState.ctx.beginPath();
                GameState.ctx.arc(t.x, t.y, this.radius * (i / this.trail.length), 0, Math.PI * 2);
                GameState.ctx.fill();
            }
            GameState.ctx.restore();
        }

        GameState.ctx.save();
        GameState.ctx.translate(this.x, this.y);
        GameState.ctx.rotate(this.angle);

        if (this.respawnProtection > Date.now()) {
            GameState.ctx.globalAlpha = 0.3 + 0.3 * Math.sin(Date.now() / 100);
            GameState.ctx.fillStyle = '#ffffff';
            GameState.ctx.beginPath();
            GameState.ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
            GameState.ctx.fill();
            GameState.ctx.globalAlpha = 1;
        }

        if (this.shieldActive && Date.now() < this.shieldExpiry) {
            GameState.ctx.beginPath();
            GameState.ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
            GameState.ctx.strokeStyle = `rgba(138, 43, 226, ${0.5 + 0.5 * Math.sin(Date.now() / 100)})`;
            GameState.ctx.lineWidth = 3;
            GameState.ctx.shadowBlur = 15;
            GameState.ctx.shadowColor = '#8a2be2';
            GameState.ctx.stroke();
        }

        if (this.invisibility > Date.now()) GameState.ctx.globalAlpha = 0.3;

        if (this.hitFlash > Date.now()) {
            GameState.ctx.shadowBlur = 20;
            GameState.ctx.shadowColor = '#ffffff';
            GameState.ctx.fillStyle = '#ffffff';
        } else {
            GameState.ctx.shadowBlur = 12;
            GameState.ctx.shadowColor = this.color;
            GameState.ctx.fillStyle = this.color;
        }

        if (this.speedBoost > Date.now()) { GameState.ctx.shadowColor = '#ffff00'; GameState.ctx.shadowBlur = 20; }
        if (this.freeze > Date.now()) { GameState.ctx.shadowColor = '#00ffff'; GameState.ctx.fillStyle = '#a0e7ff'; }

        drawShape(GameState.ctx, 0, 0, this.radius, GameState.playerShape, GameState.ctx.fillStyle);

        GameState.ctx.fillStyle = '#fff';
        GameState.ctx.fillRect(0, -3, this.radius + 10, 6);
        GameState.ctx.restore();
    }

    move(dx, dy) {
        if (this.shopOpen) return;
        let speedMod = 1;
        if (this.freeze > Date.now()) speedMod = 0.4;
        if (this.speedBoost > Date.now()) speedMod *= 1.8;
        if (this.isDashing && Date.now() < this.dashExpiry) {
            dx = this.dashDirection.x;
            dy = this.dashDirection.y;
            speedMod = 4;
        } else {
            this.isDashing = false;
        }
        let currentSpeed = this.speed * speedMod;
        let nextX = this.x + dx * currentSpeed;
        let nextY = this.y + dy * currentSpeed;
        if (nextX - this.radius < 0 || nextX + this.radius > CONFIG.CANVAS_WIDTH) nextX = this.x;
        if (nextY - this.radius < 0 || nextY + this.radius > CONFIG.CANVAS_HEIGHT) nextY = this.y;
        for (let obs of GameState.currentObstacles) {
            if (circleRectCollision(nextX, this.y, this.radius, obs)) nextX = this.x;
            if (circleRectCollision(this.x, nextY, this.radius, obs)) nextY = this.y;
        }
        this.x = nextX;
        this.y = nextY;
        if (dx !== 0 || dy !== 0) {
            this.angle = Math.atan2(dy, dx);
            if (GameState.fxLevel !== 'low') {
                this.trail.push({ x: this.x, y: this.y });
                if (this.trail.length > 10) this.trail.shift();
            }
        }
    }

    dash() {
        if (this.shopOpen) return;
        const now = Date.now();
        if (now - this.lastDashTime >= this.dashCooldown) {
            this.isDashing = true;
            this.dashExpiry = now + 200;
            this.dashDirection = { x: Math.cos(this.angle), y: Math.sin(this.angle) };
            this.lastDashTime = now;
            this.respawnProtection = now + 300;
            playSound('dash');
            for (let i = 0; i < 10; i++) spawnParticle(this.x, this.y, this.color, 'dash');
        }
    }

    throwGrenade() {
        if (this.shopOpen) return;
        const now = Date.now();
        if (now - this.lastGrenadeTime >= this.grenadeCooldown) {
            GameArrays.grenades.push({
                x: this.x, y: this.y,
                vx: Math.cos(this.angle) * 5,
                vy: Math.sin(this.angle) * 5,
                ownerId: this.id,
                timer: Date.now() + 1500,
                damage: 40
            });
            this.lastGrenadeTime = now;
            playSound('grenade');
        }
    }

    shoot() {
        if (this.shopOpen || this.invisibility > Date.now()) return;
        const now = Date.now();
        let cooldown = this.shootCooldown;
        if (this.rapidFire > Date.now()) cooldown /= 3;
        if (now - this.lastShootTime >= cooldown) {
            const bulletBase = {
                x: this.x + Math.cos(this.angle) * (this.radius + 12),
                y: this.y + Math.sin(this.angle) * (this.radius + 12),
                damage: this.damage,
                ownerId: this.id,
                color: this.color,
                speed: this.bulletSpeed
            };
            if (this.tripleShot > Date.now()) {
                for (let i = -1; i <= 1; i++) {
                    const angle = this.angle + i * 0.2;
                    GameArrays.bullets.push({
                        ...bulletBase,
                        vx: Math.cos(angle) * this.bulletSpeed,
                        vy: Math.sin(angle) * this.bulletSpeed
                    });
                }
            } else {
                GameArrays.bullets.push({
                    ...bulletBase,
                    vx: Math.cos(this.angle) * this.bulletSpeed,
                    vy: Math.sin(this.angle) * this.bulletSpeed
                });
            }
            this.lastShootTime = now;
            this.shotsFired++;
            playSound('shoot');
        }
    }

    takeDamage(amount, attackerId) {
        if (this.respawnProtection > Date.now()) return false;
        if (this.shieldActive && Date.now() < this.shieldExpiry) {
            this.shieldActive = false;
            playSound('shield');
            addFloatingText(this.x, this.y - 20, t('fx.blocked'), "#8a2be2");
            return false;
        }
        this.hp -= amount;
        this.hitFlash = Date.now() + 200;
        playSound('damage');
        spawnScreenShake(5);
        for (let i = 0; i < 5; i++) spawnParticle(this.x, this.y, '#ff0000', 'blood');
        return this.hp <= 0;
    }
}