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
let floorManager = new FloorManager();

let enemies = [];
let enemyTimer = 0;
let enemyInterval = 1500;

let player = new Player(canvas.width / 2 - 20, canvas.height / 2 - 20);

let scoreManager = {
    startTime: 0,
    score: 0,
    getScore: function() {
        if (gameState === 'PLAYING') {
            return Math.floor((Date.now() - this.startTime) / 1000);
        }
        return this.score;
    }
};

let keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
        if (gameState === 'START' || gameState === 'GAMEOVER') {
            player = new Player(canvas.width / 2 - 20, canvas.height / 2 - 20);
            enemies = [];
            enemyTimer = 0;
            floorManager = new FloorManager();
            scoreManager.startTime = Date.now();
            gameState = 'PLAYING';
        }
    }
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

function update() {
    if (gameState === 'PLAYING') {
        player.move(keys, canvas.width, canvas.height);

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
                player.takeDamage(34);
                enemy.markedForDeletion = true;
            }
        });
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);

        floorManager.update();
        if (floorManager.checkDanger(player, canvas)) {
            player.takeDamage(1);
        }

        if (player.isDead()) {
            gameState = 'GAMEOVER';
            scoreManager.score = scoreManager.getScore();
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
        
        player.draw(ctx);

        enemies.forEach(enemy => {
            enemy.draw(ctx);
        });

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Survival: " + scoreManager.getScore() + "s", 20, 30);

        ctx.fillStyle = 'grey';
        ctx.fillRect(20, 40, 100, 15);
        ctx.fillStyle = 'green';
        ctx.fillRect(20, 40, player.health, 15);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(20, 40, 100, 15);
    }
    else if (gameState === 'GAMEOVER') {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = "white";
        ctx.fillText("Score: " + scoreManager.score + "s", canvas.width / 2, canvas.height / 2 + 60);
        ctx.fillText("Press SPACE to Restart", canvas.width / 2, canvas.height / 2 + 100);
    }

    update();
    requestAnimationFrame(draw);
}

draw();