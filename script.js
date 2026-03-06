const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// États du jeu
let gameState = 'START'; 

function draw() {
    // Nettoyer l'écran
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'START') {
        // Affichage du Menu
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("DANGEROUS JAM", canvas.width / 2, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Appuyez sur ESPACE pour jouer", canvas.width / 2, canvas.height / 2 + 50);
    } 
    else if (gameState === 'PLAYING') {
        // Zone de jeu : on dessine un carré pour tester
        ctx.fillStyle = 'cyan';
        ctx.fillRect(canvas.width / 2 - 25, canvas.height / 2 - 25, 50, 50);
    }

    requestAnimationFrame(draw);
}

// Écouteur de touches pour démarrer
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === 'START') {
        gameState = 'PLAYING';
    }
});

draw();