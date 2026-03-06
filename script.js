// 1. Configuration du terrain de jeu
const canvas = document.getElementById('game');
window.canvas = canvas; // Permet à enemies.js d'accéder au canvas si besoin
const ctx = canvas.getContext('2d');

// 2. Variables du jeu
let gameState = 'START'; 
let score = 0;

// Instanciation du gestionnaire de sol (Le Gardien)
const floorManager = new FloorManager();

// 3. Objet Joueur (Position, taille, vitesse)
let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height / 2 - 20,
    size: 40,
    speed: 5,
    color: 'cyan'
};

// 4. Gestion du clavier (On mémorise les touches appuyées)
let keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    // Appuyer sur ESPACE pour démarrer le jeu
    if (e.code === 'Space') {
        if (gameState === 'START') {
            gameState = 'PLAYING';
        } else if (gameState === 'GAMEOVER') {
            // Réinitialisation du jeu
            player.x = canvas.width / 2 - 20;
            player.y = canvas.height / 2 - 20;
            score = 0;
            gameState = 'PLAYING';
        }
    }
});
window.addEventListener('keyup', (e) => keys[e.code] = false);

// 5. Mise à jour de la logique (Mouvements)
function update() {
    if (gameState === 'PLAYING') {
        if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
        if (keys['ArrowDown'] && player.y < canvas.height - player.size) player.y += player.speed;
        if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
        if (keys['ArrowRight'] && player.x < canvas.width - player.size) player.x += player.speed;
        
        // Le score augmente avec le temps
        score++;

        // Gestion du sol toxique
        floorManager.update();
        if (floorManager.checkDanger(player)) {
            gameState = 'GAMEOVER';
        }
    }
}

// 6. Dessin du jeu
function draw() {
    // On efface l'écran
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'START') {
        // Menu de départ
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("DANGEROUS JAM", canvas.width / 2, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Press SPACE to Start", canvas.width / 2, canvas.height / 2 + 50);
    } 
    else if (gameState === 'PLAYING') {
        // Dessiner le sol
        floorManager.draw(ctx, canvas);

        // Dessiner le score
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Survival Time: " + Math.floor(score / 60), 20, 30);

        // Dessiner le joueur
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }
    else if (gameState === 'GAMEOVER') {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Press SPACE to Restart", canvas.width / 2, canvas.height / 2 + 50);
    }

    update();
    requestAnimationFrame(draw);
}

// Lancement du moteur
draw();