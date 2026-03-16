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
        this.particles = []; // Array for toxic smoke particles
    }

    update(difficultyMultiplier = 1) {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.timer += deltaTime;

        // Dynamic safe duration based on wave difficulty
        const currentSafeDuration = Math.max(1000, this.durations.SAFE / difficultyMultiplier);
        const targetDuration = this.currentState === 'SAFE' ? currentSafeDuration : this.durations[this.currentState];

        if (this.timer >= targetDuration) {
            this.transitionState();
        }

        // Generate smoke particles when toxic
        if (this.currentState === 'TOXIC') {
            if (Math.random() < 0.3) {
                this.particles.push({
                    x: Math.random() * 800, // Fixed width
                    y: 500 - this.floorHeight,
                    speed: Math.random() * 2 + 1,
                    size: Math.random() * 5 + 3,
                    alpha: 0.8
                });
            }
        }

        // Update particles
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
        
        // Blinking effect for WARNING state
        let alpha = 1;
        if (this.currentState === 'WARNING') {
            alpha = Math.floor(Date.now() / 150) % 2 === 0 ? 0.3 : 1;
        }
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.floorColor;
        ctx.shadowBlur = this.currentState === 'TOXIC' ? 30 : 10;
        ctx.shadowColor = this.floorColor;
        
        ctx.fillRect(0, canvas.height - this.floorHeight, canvas.width, this.floorHeight);
        
        // Draw toxic smoke particles
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

let player = new Player(canvas.width / 2 - 20, canvas.height / 2 - 20);

let screenShake = 0;
let fadeAlpha = 0;
let fadeDirection = 0; // 1 = fade out, -1 = fade in
let nextState = null;

// State machine for handling screen transitions
function changeGameState(newState) {
    if (fadeDirection === 0) {
        nextState = newState;
        fadeDirection = 1; // Start fading out to black
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
                // Reset game states
                player = new Player(canvas.width / 2 - 20, canvas.height / 2 - 20);
                enemies = [];
                enemyTimer = 0;
                floorManager = new FloorManager();
                gameLogic.start(); // Using modular GameLogic
            }
            fadeDirection = -1; // Trigger fade-in
        }
    } else if (fadeDirection === -1) {
        fadeAlpha -= 0.05;
        if (fadeAlpha <= 0) {
            fadeAlpha = 0;
            fadeDirection = 0;
        }
    }
}

function update() {
    updateTransitions();

    if (gameState === 'PLAYING' && fadeDirection <= 0) {
        player.move(keys, canvas.width, canvas.height);
        gameLogic.update();

        const difficulty = gameLogic.getDifficultyMultiplier();

        enemyTimer += 16 * difficulty;
        if (enemyTimer > enemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyTimer = 0;
            if (enemyInterval > 500) enemyInterval -= 10;
        }

        enemies.forEach(enemy => {
            enemy.update(difficulty);
            if (player.x < enemy.x + enemy.width &&
                player.x + player.size > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.size > enemy.y) {
                player.takeDamage(34);
                enemy.markedForDeletion = true;
                screenShake = 15;
            }
        });
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);

        floorManager.update(difficulty);
        if (floorManager.checkDanger(player, canvas)) {
            player.takeDamage(1);
            screenShake = 5;
        }

        if (screenShake > 0) screenShake--;

        if (player.isDead()) {
            changeGameState('GAMEOVER');
        }
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
    // Apply Screen Shake transformation
    if (screenShake > 0) {
        const dx = (Math.random() - 0.5) * screenShake;
        const dy = (Math.random() - 0.5) * screenShake;
        ctx.translate(dx, dy);
    }

    if (gameState === 'START') {
        drawNeonText(ctx, "THE TOXIC FLOOR", canvas.width / 2, canvas.height / 2 - 20, 50, "#00ffcc");
        drawNeonText(ctx, "Press SPACE to Start", canvas.width / 2, canvas.height / 2 + 50, 25, "#ffffff");
    } 
    else if (gameState === 'PLAYING') {
        floorManager.draw(ctx, canvas);
        
        player.draw(ctx);

        enemies.forEach(enemy => {
            enemy.draw(ctx);
        });

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

        // Using Linear Gradient for better UI aesthetics
        const barWidth = 200;
        ctx.fillStyle = '#222';
        ctx.fillRect(20, 80, barWidth, 20); // Background
        
        const healthGradient = ctx.createLinearGradient(20, 80, 20 + barWidth, 80);
        healthGradient.addColorStop(0, "red");
        healthGradient.addColorStop(0.5, "orange");
        healthGradient.addColorStop(1, "lime");
        
        ctx.fillStyle = healthGradient;
        const currentHealthWidth = Math.max(0, (player.health / 100) * barWidth);
        ctx.fillRect(20, 80, currentHealthWidth, 20);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 80, barWidth, 20); // Border
    }
    else if (gameState === 'GAMEOVER') {
        drawNeonText(ctx, "GAME OVER", canvas.width / 2, canvas.height / 2 - 40, 60, "#ff0000");
        drawNeonText(ctx, "Score: " + gameLogic.getScore() + "s", canvas.width / 2, canvas.height / 2 + 20, 30, "#ffffff");
        drawNeonText(ctx, "Wave Reached: " + gameLogic.getWave(), canvas.width / 2, canvas.height / 2 + 60, 25, "#ff9900");
        drawNeonText(ctx, "Press SPACE to Restart", canvas.width / 2, canvas.height / 2 + 120, 20, "#cccccc");
    }

    ctx.restore(); // Ensure UI overlay properties don't inherit transforms

    // Draw Fade Overlay for smooth state transitions
    if (fadeAlpha > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    update();
    requestAnimationFrame(draw);
}

draw();