// 1. Configuration du terrain de jeu
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// 2. Variables du jeu
let gameState = 'START'; 
let score = 0;

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
    if (e.code === 'Space' && gameState === 'START') {
        gameState = 'PLAYING';
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
        // Dessiner le score
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Survival Time: " + Math.floor(score / 60), 20, 30);

        // Dessiner le joueur
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }

    update();
    requestAnimationFrame(draw);
}

// Lancement du moteur
draw();