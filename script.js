class FloorManager {
    constructor() {
        this.floorIsToxic = false;
        this.floorColor = '#00ff00';
        this.currentState = 'SAFE';
        this.timer = 0;
        this.lastTime = Date.now();
        this.durations = {
            SAFE: 3000,
            WARNING: 1000,
            TOXIC: 2000
        };
        this.floorHeight = 50;
        this.particles = [];
        this.targetDuration = 3000;
    }

    update(difficultyMultiplier = 1) {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.timer += deltaTime;

        const currentSafeDuration = Math.max(1000, this.durations.SAFE / difficultyMultiplier);
        this.targetDuration = this.currentState === 'SAFE' ? currentSafeDuration : this.durations[this.currentState];

        if (this.timer >= this.targetDuration) {
            this.transitionState();
        }

        if (this.currentState === 'TOXIC') {
            if (Math.random() < 0.3) {
                this.particles.push({
                    x: Math.random() * 800,
                    y: 500 - this.floorHeight,
                    speed: Math.random() * 2 + 1,
                    size: Math.random() * 5 + 3,
                    alpha: 0.8
                });
            }
        }

        this.particles.forEach(p => {
            p.y -= p.speed;
            p.alpha -= 0.015;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);
    }

    transitionState() {
        this.timer = 0;
        switch (this.currentState) {
            case 'SAFE':
                this.currentState = 'WARNING';
                this.floorColor = '#ff9900';
                this.floorIsToxic = false;
                break;
            case 'WARNING':
                this.currentState = 'TOXIC';
                this.floorColor = '#ff0000';
                this.floorIsToxic = true;
                break;
            case 'TOXIC':
                this.currentState = 'SAFE';
                this.floorColor = '#00ff00';
                this.floorIsToxic = false;
                break;
        }
    }

    draw(ctx, canvas) {
        ctx.save();
        
        let alpha = 1;
        if (this.currentState === 'WARNING') {
            alpha = Math.floor(Date.now() / 150) % 2 === 0 ? 0.3 : 1;
        }
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.floorColor;
        ctx.shadowBlur = this.currentState === 'TOXIC' ? 30 : 10;
        ctx.shadowColor = this.floorColor;
        
        ctx.fillRect(0, canvas.height - this.floorHeight, canvas.width, this.floorHeight);
        
        if (this.currentState === 'TOXIC' || this.particles.length > 0) {
            ctx.shadowBlur = 15;
            this.particles.forEach(p => {
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = this.floorColor;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        ctx.restore();
    }

    checkDanger(player, canvas) {
        if (!this.floorIsToxic) return false;
        
        const playerBottom = player.y + player.size;
        const floorTop = canvas.height - this.floorHeight;

        if (playerBottom >= floorTop) {
            return true;
        }
        return false;
    }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let gameState = 'START';
let floorManager = new FloorManager();

let enemies = [];
let enemyTimer = 0;
let enemyInterval = 1500;
let projectiles = [];

let powerUps = [];
let floatingTexts = [];
let powerUpTimer = 0;

let player = new Player(canvas.width / 2 - 20, canvas.height / 2 - 20);

let screenShake = 0;
let fadeAlpha = 0;
let fadeDirection = 0;
let nextState = null;

function changeGameState(newState) {
    if (fadeDirection === 0) {
        nextState = newState;
        fadeDirection = 1;
    }
}

let keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && fadeDirection === 0) {
        if (gameState === 'START' || gameState === 'GAMEOVER') {
            changeGameState('PLAYING');
        }
    }
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

function updateTransitions() {
    if (fadeDirection === 1) {
        fadeAlpha += 0.05;
        if (fadeAlpha >= 1) {
            fadeAlpha = 1;
            gameState = nextState;
            if (gameState === 'PLAYING') {
                player = new Player(canvas.width / 2 - 20, canvas.height / 2 - 20);
                enemies = [];
                projectiles = [];
                enemyTimer = 0;
                powerUps = [];
                floatingTexts = [];
                powerUpTimer = 0;
                floorManager = new FloorManager();
                gameLogic.start();
            }
            fadeDirection = -1;
        }
    } else if (fadeDirection === -1) {
        fadeAlpha -= 0.05;
        if (fadeAlpha <= 0) {
            fadeAlpha = 0;
            fadeDirection = 0;
        }
    }
}

function playBeep(floorMgr) {
    if (floorMgr.currentState === 'SAFE') {
        canvas.style.borderColor = '#00ffcc';
        canvas.style.boxShadow = '0 0 20px #00ffcc, inset 0 0 20px #00ffcc';
        return;
    }

    let progress = floorMgr.timer / floorMgr.targetDuration;
    
    let blinkRate = floorMgr.currentState === 'WARNING' ? 400 - (progress * 300) : 100;
    
    let isBlinkOn = Math.floor(Date.now() / blinkRate) % 2 === 0;

    if (floorMgr.currentState === 'WARNING') {
        if (isBlinkOn) {
            canvas.style.borderColor = '#ff9900';
            canvas.style.boxShadow = '0 0 20px #ff9900, inset 0 0 20px #ff9900';
        } else {
            canvas.style.borderColor = '#333';
            canvas.style.boxShadow = 'none';
        }
    } else if (floorMgr.currentState === 'TOXIC') {
        if (isBlinkOn) {
            canvas.style.borderColor = '#ff0000';
            canvas.style.boxShadow = '0 0 30px #ff0000, inset 0 0 30px #ff0000';
        } else {
            canvas.style.borderColor = '#550000';
            canvas.style.boxShadow = '0 0 10px #550000';
        }
    }
}

function update() {
    updateTransitions();

    if (gameState === 'PLAYING' && fadeDirection <= 0) {
        player.move(keys, canvas.width, canvas.height);
        player.update();
        gameLogic.update();

        const difficulty = gameLogic.getDifficultyMultiplier();

        powerUpTimer++;
        if (powerUpTimer > 300) {
            if (Math.random() < 0.4 && powerUps.length < 3) {
                powerUps.push(new PowerUp(canvas.width, canvas.height));
            }
            powerUpTimer = 0;
        }

        powerUps.forEach(pu => {
            pu.update();
            const distX = (player.x + player.size / 2) - pu.x;
            const distY = (player.y + player.size / 2) - pu.y;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance < player.size / 2 + pu.size) {
                pu.markedForDeletion = true;
                if (pu.type === 'heal') {
                    player.heal(20);
                    floatingTexts.push(new FloatingText('+20 HP', player.x + player.size / 2, player.y, '#00ff00'));
                } else if (pu.type === 'invincible') {
                    player.makeInvincible(180);
                    floatingTexts.push(new FloatingText('INVINCIBLE', player.x + player.size / 2, player.y, '#ffff00'));
                }
            }
        });
        powerUps = powerUps.filter(pu => !pu.markedForDeletion);

        floatingTexts.forEach(ft => ft.update());
        floatingTexts = floatingTexts.filter(ft => !ft.markedForDeletion);

        enemyTimer += 16 * difficulty;
        if (enemyTimer > enemyInterval) {
            const types = ['normal', 'normal', 'hunter', 'giant', 'flash'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            enemies.push(new Enemy(canvas.width, canvas.height, randomType));
            
            enemyTimer = 0;
            if (enemyInterval > 500) enemyInterval -= 10;
        }

        enemies.forEach(enemy => {
            enemy.update(difficulty, player);
            
            if (player.x < enemy.x + enemy.width &&
                player.x + player.size > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.size > enemy.y) {
                player.takeDamage(34);
                enemy.markedForDeletion = true;
                screenShake = 15;
            }
            
            if (floorManager.currentState === 'TOXIC') {
                const enemyBottom = enemy.y + enemy.height;
                const floorTop = canvas.height - floorManager.floorHeight;
                if (enemyBottom >= floorTop && !enemy.markedForDeletion && enemy.type !== 'flash') {
                    enemy.markedForDeletion = true;
                    for (let i = 0; i < 5; i++) {
                        projectiles.push(new Projectile(enemy.x + enemy.width / 2, enemyBottom));
                    }
                }
            }
        });
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);

        projectiles.forEach(proj => {
            proj.update();
            const distX = (player.x + player.size / 2) - proj.x;
            const distY = (player.y + player.size / 2) - proj.y;
            const distance = Math.sqrt(distX * distX + distY * distY);
            if (distance < player.size / 2 + proj.size) {
                player.takeDamage(5);
                proj.markedForDeletion = true;
                screenShake = 5;
            }
        });
        projectiles = projectiles.filter(proj => !proj.markedForDeletion);

        floorManager.update(difficulty);
        if (floorManager.checkDanger(player, canvas)) {
            player.takeDamage(1);
            screenShake = 5;
        }

        if (screenShake > 0) screenShake--;

        if (player.isDead()) {
            changeGameState('GAMEOVER');
        }
        
        playBeep(floorManager);
    }
}

function drawNeonText(ctx, text, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px 'Courier New', Courier, monospace`;
    ctx.textAlign = "center";
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillText(text, x, y);
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    
    if (gameState === 'PLAYING' && floorManager.currentState === 'TOXIC') {
        const angle = Math.sin(Date.now() / 100) * 0.02;
        const scale = 1 + Math.sin(Date.now() / 150) * 0.02;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    if (screenShake > 0) {
        const dx = (Math.random() - 0.5) * screenShake;
        const dy = (Math.random() - 0.5) * screenShake;
        ctx.translate(dx, dy);
    }

    if (gameState === 'START') {
        drawNeonText(ctx, "THE TOXIC FLOOR", canvas.width / 2, canvas.height / 2 - 60, 50, "#00ffcc");
        drawNeonText(ctx, "Évite le sol ROUGE !", canvas.width / 2, canvas.height / 2, 30, "#ff0000");
        drawNeonText(ctx, "ZQSD ou Flèches pour bouger", canvas.width / 2, canvas.height / 2 + 50, 20, "#cccccc");
        drawNeonText(ctx, "Espace pour commencer", canvas.width / 2, canvas.height / 2 + 100, 25, "#ffffff");
    } 
    else if (gameState === 'PLAYING') {
        floorManager.draw(ctx, canvas);
        
        player.draw(ctx);

        enemies.forEach(enemy => {
            enemy.draw(ctx);
        });
        
        projectiles.forEach(proj => {
            proj.draw(ctx);
        });

        powerUps.forEach(pu => pu.draw(ctx));
        floatingTexts.forEach(ft => ft.draw(ctx));

        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "bold 20px 'Courier New'";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "white";
        ctx.fillText("Survival: " + gameLogic.getScore() + "s", 20, 30);
        ctx.fillStyle = "#ff0055";
        ctx.shadowColor = "#ff0055";
        ctx.fillText("Wave: " + gameLogic.getWave(), 20, 60);
        ctx.restore();

        const barWidth = 200;
        ctx.fillStyle = '#222';
        ctx.fillRect(20, 80, barWidth, 20);
        
        const healthGradient = ctx.createLinearGradient(20, 80, 20 + barWidth, 80);
        healthGradient.addColorStop(0, "red");
        healthGradient.addColorStop(0.5, "orange");
        healthGradient.addColorStop(1, "lime");
        
        ctx.fillStyle = healthGradient;
        const currentHealthWidth = Math.max(0, (player.health / 100) * barWidth);
        ctx.fillRect(20, 80, currentHealthWidth, 20);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 80, barWidth, 20);
        
        ctx.fillStyle = '#222';
        ctx.fillRect(20, 110, barWidth / 2, 10);
        ctx.fillStyle = player.dashCooldown === 0 ? '#00ffff' : '#555';
        const dashWidth = Math.max(0, (1 - player.dashCooldown / 60) * (barWidth / 2));
        ctx.fillRect(20, 110, dashWidth, 10);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 110, barWidth / 2, 10);
        
        ctx.fillStyle = 'white';
        ctx.font = "bold 10px 'Courier New'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("DASH (SHIFT)", 20 + barWidth / 4, 115);
    }
    else if (gameState === 'GAMEOVER') {
        drawNeonText(ctx, "GAME OVER", canvas.width / 2, canvas.height / 2 - 40, 60, "#ff0000");
        drawNeonText(ctx, "Score: " + gameLogic.getScore() + "s", canvas.width / 2, canvas.height / 2 + 20, 30, "#ffffff");
        drawNeonText(ctx, "Wave Reached: " + gameLogic.getWave(), canvas.width / 2, canvas.height / 2 + 60, 25, "#ff9900");
        drawNeonText(ctx, "Press SPACE to Restart", canvas.width / 2, canvas.height / 2 + 120, 20, "#cccccc");
    }

    ctx.restore();

    if (fadeAlpha > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    update();
    requestAnimationFrame(draw);
}

draw();