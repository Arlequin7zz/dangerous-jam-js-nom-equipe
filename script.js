class FloorManager {
    constructor() {
        this.floorIsToxic = false;
        this.floorColor = 'green';
        this.currentState = 'SAFE';
        this.timer = 0;
        this.lastTime = Date.now();
        this.durations = {
            SAFE: 3000,
            WARNING: 1000,
            TOXIC: 2000
        };
        this.floorHeight = 50;
    }

    update() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.timer += deltaTime;

        if (this.timer >= this.durations[this.currentState]) {
            this.transitionState();
        }
    }

    transitionState() {
        this.timer = 0;
        switch (this.currentState) {
            case 'SAFE':
                this.currentState = 'WARNING';
                this.floorColor = 'orange';
                this.floorIsToxic = false;
                break;
            case 'WARNING':
                this.currentState = 'TOXIC';
                this.floorColor = 'red';
                this.floorIsToxic = true;
                break;
            case 'TOXIC':
                this.currentState = 'SAFE';
                this.floorColor = 'green';
                this.floorIsToxic = false;
                break;
        }
    }

    draw(ctx, canvas) {
        ctx.fillStyle = this.floorColor;
        ctx.fillRect(0, canvas.height - this.floorHeight, canvas.width, this.floorHeight);
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
let score = 0;
const floorManager = new FloorManager();

let enemies = [];
let enemyTimer = 0;
let enemyInterval = 1500;

let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height / 2 - 20,
    size: 40,
    speed: 5,
    color: 'cyan'
};

let keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
        if (gameState === 'START') gameState = 'PLAYING';
        else if (gameState === 'GAMEOVER') {
            player.x = canvas.width / 2 - 20;
            player.y = canvas.height / 2 - 20;
            score = 0;
            enemies = [];
            enemyTimer = 0;
            gameState = 'PLAYING';
        }
    }
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

function update() {
    if (gameState === 'PLAYING') {
        if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
        if (keys['ArrowDown'] && player.y < canvas.height - player.size) player.y += player.speed;
        if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
        if (keys['ArrowRight'] && player.x < canvas.width - player.size) player.x += player.speed;
        
        score++;

        enemyTimer += 16;
        if (enemyTimer > enemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyTimer = 0;
            if (enemyInterval > 500) enemyInterval -= 10;
        }

        enemies.forEach(enemy => {
            enemy.update();
            if (player.x < enemy.x + enemy.width &&
                player.x + player.size > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.size > enemy.y) {
                gameState = 'GAMEOVER';
            }
        });
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);

        floorManager.update();
        if (floorManager.checkDanger(player, canvas)) {
            gameState = 'GAMEOVER';
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'START') {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("DANGEROUS JAM", canvas.width / 2, canvas.height / 2);
        ctx.fillText("Press SPACE to Start", canvas.width / 2, canvas.height / 2 + 60);
    } 
    else if (gameState === 'PLAYING') {
        floorManager.draw(ctx, canvas);
        
        enemies.forEach(enemy => {
            enemy.draw(ctx);
        });

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Survival: " + Math.floor(score / 60), 20, 30);

        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }
    else if (gameState === 'GAMEOVER') {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = "white";
        ctx.fillText("Press SPACE to Restart", canvas.width / 2, canvas.height / 2 + 60);
    }

    update();
    requestAnimationFrame(draw);
}

draw();