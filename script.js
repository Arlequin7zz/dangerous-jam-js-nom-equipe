// ==========================================
// 1. LE GARDIEN DU SOL (Ta classe FloorManager)
// ==========================================
class FloorManager {
    constructor() {
        this.floorIsToxic = false;
        this.floorColor = 'green';
        this.currentState = 'SAFE';
        this.timer = 0;
        this.lastTime = Date.now();
        this.durations = {
            SAFE: 3000,    // 3 secondes de sécurité
            WARNING: 1000, // 1 seconde d'alerte (Orange)
            TOXIC: 2000    // 2 secondes de poison (Rouge)
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
        
        // On calcule si le bas du joueur touche le sol
        const playerBottom = player.y + player.size;
        const floorTop = canvas.height - this.floorHeight;

        if (playerBottom >= floorTop) {
            return true; // MORT !
        }
        return false;
    }
}

// ==========================================
// 2. CONFIGURATION DU JEU
// ==========================================
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let gameState = 'START'; 
let score = 0;
const floorManager = new FloorManager();

let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height / 2 - 20,
    size: 40,
    speed: 5,
    color: 'cyan'
};

// Gestion du clavier
let keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
        if (gameState === 'START') gameState = 'PLAYING';
        else if (gameState === 'GAMEOVER') {
            // Reset du jeu
            player.x = canvas.width / 2 - 20;
            player.y = canvas.height / 2 - 20;
            score = 0;
            gameState = 'PLAYING';
        }
    }
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

// ==========================================
// 3. BOUCLE PRINCIPALE (Update & Draw)
// ==========================================
function update() {
    if (gameState === 'PLAYING') {
        // Mouvements
        if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
        if (keys['ArrowDown'] && player.y < canvas.height - player.size) player.y += player.speed;
        if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
        if (keys['ArrowRight'] && player.x < canvas.width - player.size) player.x += player.speed;
        
        score++;

        // Gestion du sol
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