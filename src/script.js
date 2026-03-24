class FloorManager {
    constructor(mode = 'Classic') {
        this.mode = mode;
        this.floorIsToxic = false;
        this.floorColor = '#00ff00';
        this.currentState = 'SAFE';
        this.timer = 0;
        this.lastTime = Date.now();
        this.durations = {
            SAFE: mode === 'Hardcore' ? 1500 : 3000,
            WARNING: mode === 'Hardcore' ? 0 : 1000,
            TOXIC: mode === 'Hardcore' ? 3000 : 2000
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
            // --- DENSE LAVA EFFECT ---
            // Spawn multiple bubbles per frame for a boiling toxic effect
            let bubblesToSpawn = Math.floor(Math.random() * 3) + 2; // 2 to 4 bubbles per frame
            for (let i = 0; i < bubblesToSpawn; i++) {
                this.particles.push({
                    x: Math.random() * canvas.width, // Adapted to actual canvas dimensions
                    y: canvas.height - this.floorHeight + (Math.random() * 15), 
                    speed: Math.random() * 3 + 2, // Faster rise
                    size: Math.random() * 6 + 4, // Varying bubble sizes
                    alpha: 0.9
                });
                // Limite stricte des particules à 50
                if (this.particles.length > 50) {
                    this.particles.shift(); // Retire la plus ancienne
                }
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
                if (this.mode === 'Hardcore') {
                    this.currentState = 'TOXIC';
                    this.floorColor = '#ff0000';
                    this.floorIsToxic = true;
                    showRadioMessage("DANGER INSTANTANÉ !");
                } else {
                    this.currentState = 'WARNING';
                    this.floorColor = '#ff9900';
                    this.floorIsToxic = false;
                }
                break;
            case 'WARNING':
                this.currentState = 'TOXIC';
                this.floorColor = '#ff0000';
                this.floorIsToxic = true;
                showRadioMessage("Attention, pic de toxicité détecté !");
                break;
            case 'TOXIC':
                this.currentState = 'SAFE';
                this.floorColor = '#00ff00';
                this.floorIsToxic = false;
                showRadioMessage("Le sol est redevenu stable... pour l'instant.");
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
        ctx.shadowBlur = this.currentState === 'TOXIC' ? 10 : 5; // Optimisation : shadowBlur strictement limité à 10 max
        ctx.shadowColor = this.floorColor;
        
        ctx.fillRect(0, canvas.height - this.floorHeight, canvas.width, this.floorHeight);
        
        if (this.currentState === 'TOXIC' || this.particles.length > 0) {
            ctx.save(); // Isolation stricte des particules
            ctx.shadowBlur = 0; // Optimisation : pas de flou pour les particules individuelles
            ctx.fillStyle = this.floorColor;
            this.particles.forEach(p => {
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
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

// --- ICON / CHARACTER MANAGEMENT ---
// We store the selected character's icon and base speed in a global object.
// When the player starts the game, a new Player instance is created using these values.
let selectedCharacter = { icon: "👻", speed: 8 };
let gameMode = 'Classic';
let nickname = "";
let highScore = 0;
let isMuted = false;

// --- INTERACTIVE LORE & CHAOS EVENT ---
let radioMessageFullText = "";      // The complete message to be displayed.
let radioMessageDisplayLength = 0;  // How many characters are currently visible.
let radioMessageCharTimer = 0;      // A timer to control the speed of the typewriter effect.
let radioMessageTimer = 0;          // How long the message stays on screen after being typed.
let chaosEventTimer = 0;            // A timer for the "Invert Colors" chaos event.

// --- AUDIO SETUP ---
// We create a simple beat manager to sync visual effects with the music's rhythm.
// For a game jam, assuming a fixed BPM is a robust and simple solution.
// For more complex projects, the Web Audio API's AnalyserNode would be used for real-time beat detection.
const BPM = 125; // Set this to your music's Beats Per Minute.
let lastBeatTime = 0;
let visualPulse = 0; // A value from 0 to 1 representing the beat's intensity.
let bgMusic = new Audio('assets/Instru by dasss.m4a');
bgMusic.loop = true;

// Setup HTML Input for Nickname
let nicknameInput = document.createElement('input');
nicknameInput.type = 'text';
nicknameInput.id = 'nicknameInput';
nicknameInput.placeholder = 'Enter Pseudo...';
nicknameInput.style.position = 'absolute';
nicknameInput.style.left = '-9999px'; // Caché hors écran au lancement avant calcul
nicknameInput.style.top = '-9999px';
nicknameInput.style.transform = 'translate(-50%, -50%)';
nicknameInput.style.fontSize = '20px';
nicknameInput.style.textAlign = 'center';
nicknameInput.style.padding = '5px';
nicknameInput.style.zIndex = '100';
nicknameInput.style.borderRadius = '5px';
nicknameInput.style.border = '2px solid #00ffcc';
nicknameInput.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
nicknameInput.style.color = '#ffffff';
document.body.appendChild(nicknameInput);

nicknameInput.addEventListener('input', (e) => {
    nickname = e.target.value;
    highScore = loadHighScore(nickname);
});

// --- LOCAL STORAGE LOGIC ---
// We use localStorage to save the highest score permanently on the user's browser.
// It stores data as key-value pairs. Here we use 'toxicFloorScores' as the key to store a JSON object of usernames and their scores.
function loadHighScore(name) {
    if (!name) return 0;
    const scores = JSON.parse(localStorage.getItem('toxicFloorScores')) || {};
    return scores[name] || 0;
}

function saveHighScore(name, score) {
    if (!name) return;
    const scores = JSON.parse(localStorage.getItem('toxicFloorScores')) || {};
    // Only update and save the score if it's higher than the previously saved score.
    if (!scores[name] || score > scores[name]) {
        scores[name] = score;
        localStorage.setItem('toxicFloorScores', JSON.stringify(scores));
    }
}

// Transforme l'objet des scores en tableau, le trie, et retourne les meilleurs
function getTopScores() {
    const scores = JSON.parse(localStorage.getItem('toxicFloorScores')) || {};
    let scoreArray = [];
    for (let name in scores) {
        scoreArray.push({name: name, score: scores[name]});
    }
    scoreArray.sort((a, b) => b.score - a.score);
    return scoreArray.slice(0, 3); // Retourne le Top 3
}
// ---------------------------

function showRadioMessage(msg) {
    radioMessageFullText = msg;
    radioMessageDisplayLength = 0; // Reset the typewriter
    radioMessageCharTimer = 0;
    radioMessageTimer = 300; // Time the message stays on screen
}

function changeGameState(newState) {
    if (fadeDirection === 0) {
        nextState = newState;
        fadeDirection = 1;
        if (newState !== 'START') {
            nicknameInput.style.display = 'none';
        }
    }
}

let keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    // Lance la musique à la première touche pressée (si le son n'est pas coupé)
    if (bgMusic.paused && !isMuted && e.code !== 'KeyV') {
        bgMusic.play().catch(err => console.log("Attente d'interaction pour l'audio"));
    }

    // Toggle pour le Son
    if (e.code === 'KeyV') {
        isMuted = !isMuted;
        bgMusic.muted = isMuted;
    }

    if (fadeDirection !== 0) return;

    if (gameState === 'START') {
        if (e.code === 'KeyH') {
            changeGameState('HOW_TO_PLAY');
        } else if (e.code === 'KeyC') {
            changeGameState('CHARACTER_SELECT');
        } else if (e.code === 'Space' && nickname.trim() !== '') {
            changeGameState('INTRO');
        }
    } else if (gameState === 'HOW_TO_PLAY' || gameState === 'CHARACTER_SELECT' || gameState === 'GAMEOVER') {
        if (gameState === 'CHARACTER_SELECT') {
            if (e.code === 'Digit1' || e.code === 'Numpad1') selectedCharacter = { icon: "👻", speed: 8 };
            if (e.code === 'Digit2' || e.code === 'Numpad2') selectedCharacter = { icon: "🤖", speed: 6 };
            if (e.code === 'Digit3' || e.code === 'Numpad3') selectedCharacter = { icon: "👽", speed: 10 };
            if (e.code === 'KeyM') gameMode = gameMode === 'Classic' ? 'Hardcore' : 'Classic';
        }
        if (e.code === 'Space') {
            changeGameState('START');
        }
    } else if (gameState === 'INTRO') {
        if (e.code === 'Space') {
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
            
            if (gameState === 'START') {
                nicknameInput.style.display = 'block';
            }

            if (gameState === 'PLAYING') {
                player = new Player(canvas.width / 2 - 20, canvas.height / 2 - 20, selectedCharacter.icon, selectedCharacter.speed);
                enemies = [];
                projectiles = [];
                enemyTimer = 0;
                powerUps = [];
                floatingTexts = [];
                powerUpTimer = 0;
                floorManager = new FloorManager(gameMode);
                gameLogic.start();
                showRadioMessage("Début de la survie. Bonne chance.");
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

let lastBoxShadow = "";
let lastBorderColor = "";

function playBeep(floorMgr) {
    // --- AUDIO SYNC VISUALS ---
    // Simplification : 2 intensités fixes (fort/faible) pour éviter les recalculs CSS constants
    const pulseIntensity = visualPulse > 0.5 ? 40 : 20; 

    let newBorderColor = '';
    let newBoxShadow = '';

    if (floorMgr.currentState === 'SAFE') {
        newBorderColor = '#00ffcc';
        newBoxShadow = `0 0 ${pulseIntensity}px #00ffcc, inset 0 0 ${pulseIntensity}px #00ffcc`;
    } else {
        let progress = floorMgr.timer / floorMgr.targetDuration;
        let blinkRate = floorMgr.currentState === 'WARNING' ? 400 - (progress * 300) : 100;
        let isBlinkOn = Math.floor(Date.now() / blinkRate) % 2 === 0;

        if (floorMgr.currentState === 'WARNING') {
            if (isBlinkOn) {
                newBorderColor = '#ff9900';
                newBoxShadow = `0 0 ${pulseIntensity}px #ff9900, inset 0 0 ${pulseIntensity}px #ff9900`;
            } else {
                newBorderColor = '#333';
                newBoxShadow = 'none';
            }
        } else if (floorMgr.currentState === 'TOXIC') {
            if (isBlinkOn) {
                newBorderColor = '#ff0000';
                newBoxShadow = `0 0 ${pulseIntensity * 1.5}px #ff0000, inset 0 0 ${pulseIntensity * 1.5}px #ff0000`;
            } else {
                newBorderColor = '#550000';
                newBoxShadow = '0 0 10px #550000';
            }
        }
    }

    // Optimisation MAJEURE : On applique au DOM uniquement s'il y a un vrai changement !
    if (lastBorderColor !== newBorderColor) {
        canvas.style.borderColor = newBorderColor;
        lastBorderColor = newBorderColor;
    }
    if (lastBoxShadow !== newBoxShadow) {
        canvas.style.boxShadow = newBoxShadow;
        lastBoxShadow = newBoxShadow;
    }
}

function update() {
    updateTransitions();

    if (screenShake > 0) screenShake--;

    // --- UPDATE TIMERS & MANAGERS ---
    const beatInterval = 60000 / BPM;
    const now = Date.now();
    if (now - lastBeatTime > beatInterval) {
        lastBeatTime = now - ((now - lastBeatTime) % beatInterval); // Sync with the beat
        visualPulse = 1.0; // Max intensity on beat
    }
    if (visualPulse > 0) visualPulse = Math.max(0, visualPulse - 0.05); // Decay pulse

    if (chaosEventTimer > 0) chaosEventTimer--;

    if (gameState === 'PLAYING' && fadeDirection <= 0) {
        // Update typewriter effect
        if (radioMessageDisplayLength < radioMessageFullText.length) {
            radioMessageCharTimer++;
            if (radioMessageCharTimer > 1) { // Change '1' to be faster or slower
                radioMessageDisplayLength++;
                radioMessageCharTimer = 0;
            }
        } else if (radioMessageTimer > 0) {
            radioMessageTimer--;
        }

        // --- CHAOS EVENT TRIGGER ---
        // A rare random chance to trigger the chaos event during gameplay.
        if (chaosEventTimer <= 0 && Math.random() < 0.0002) {
            chaosEventTimer = 300; // Event lasts for 5 seconds (300 frames / 60fps)
            showRadioMessage("SYSTEM CORRUPTION DETECTED!");
        }
        
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

        floatingTexts.forEach(ft => {
            ft.update();
            if (ft.y < -50) ft.markedForDeletion = true; // Cleanup hors-écran
        });
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
            
            // Nettoyage de l'ennemi s'il sort trop de l'écran
            if (enemy.x < -200 || enemy.x > canvas.width + 200 || enemy.y < -200 || enemy.y > canvas.height + 200) {
                enemy.markedForDeletion = true;
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
            
            // Nettoyage des projectiles qui sortent de l'écran
            if (proj.x < -50 || proj.x > canvas.width + 50 || proj.y < -50 || proj.y > canvas.height + 50) {
                proj.markedForDeletion = true;
            }
        });
        projectiles = projectiles.filter(proj => !proj.markedForDeletion);

        floorManager.update(difficulty);
        if (floorManager.checkDanger(player, canvas)) {
            // --- VISUAL JUICE: VIOLENT SCREEN SHAKE ---
            // If this damage is fatal, trigger a much stronger screen shake.
            if (player.health <= 1 && !player.invincible) {
                screenShake = 40; // A big shake for a dramatic death.
            } else {
                screenShake = 5;
            }
            player.takeDamage(1);
        }

        if (screenShake > 0) screenShake--;

        if (player.isDead()) {
            saveHighScore(nickname, gameLogic.getScore());
            highScore = loadHighScore(nickname);
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
    ctx.shadowBlur = 15; // Limite de l'éclat global pour les textes
    ctx.shadowColor = color;
    ctx.fillText(text, x, y);
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset complet du Canvas pour éviter la saturation blanche et les bugs de perfs
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;

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

    // --- CHAOS EVENT RENDER ---
    // If the chaos event is active, we apply a 'difference' composite operation.
    // Drawing a white rectangle over the screen with this mode inverts all the colors.
    if (chaosEventTimer > 0) {
        ctx.save(); // Isolation stricte de l'effet d'inversion
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    if (gameState === 'START') {
        // Calcule la position exacte du champ HTML par rapport au Canvas (s'adapte à tous les écrans)
        const rect = canvas.getBoundingClientRect();
        nicknameInput.style.left = (rect.left + rect.width / 2 + window.scrollX) + 'px';
        nicknameInput.style.top = (rect.top + rect.height / 2 + 65 + window.scrollY) + 'px';

        drawNeonText(ctx, "THE TOXIC FLOOR", canvas.width / 2, canvas.height / 2 - 160, 60, "#00ffcc");
        
        // LEADERBOARD
        drawNeonText(ctx, "🏆 LEADERBOARD 🏆", canvas.width / 2, canvas.height / 2 - 100, 22, "#ffff00");
        let topScores = getTopScores();
        if (topScores.length === 0) {
            drawNeonText(ctx, "Aucun score pour le moment", canvas.width / 2, canvas.height / 2 - 70, 18, "#aaaaaa");
        } else {
            topScores.forEach((entry, index) => {
                let colors = ["#ffd700", "#c0c0c0", "#cd7f32"]; // Or, Argent, Bronze
                drawNeonText(ctx, `${index + 1}. ${entry.name} - ${entry.score}s`, canvas.width / 2, canvas.height / 2 - 70 + (index * 25), 20, colors[index] || "#ffffff");
            });
        }
        
        drawNeonText(ctx, "▼ Enter Pseudo below ▼", canvas.width / 2, canvas.height / 2 + 20, 18, "#aaaaaa");
        
        drawNeonText(ctx, "[H] How to Play  |  [C] Character & Mode", canvas.width / 2, canvas.height / 2 + 115, 20, "#cccccc");
        if (nickname.trim() !== '') {
            drawNeonText(ctx, "► Press SPACE to Continue ◄", canvas.width / 2, canvas.height / 2 + 165, 25, Math.floor(Date.now() / 500) % 2 === 0 ? "#ffffff" : "#00ffcc");
        } else {
            drawNeonText(ctx, "Enter Pseudo to Start", canvas.width / 2, canvas.height / 2 + 165, 25, "#aa0000");
        }
    } 
    else if (gameState === 'HOW_TO_PLAY') {
        drawNeonText(ctx, "TUTORIAL", canvas.width / 2, 100, 40, "#00ffcc");
        drawNeonText(ctx, "Controls: ZQSD or Arrows to move. SHIFT to Dash.", canvas.width / 2, 200, 20, "#ffffff");
        drawNeonText(ctx, "Colors:", canvas.width / 2, 250, 25, "#ffffff");
        drawNeonText(ctx, "GREEN = Safe", canvas.width / 2, 290, 20, "#00ff00");
        drawNeonText(ctx, "ORANGE = Warning! Get ready.", canvas.width / 2, 330, 20, "#ff9900");
        drawNeonText(ctx, "RED = Instant Death! Don't touch.", canvas.width / 2, 370, 20, "#ff0000");
        drawNeonText(ctx, "Press SPACE to Go Back", canvas.width / 2, 500, 20, "#cccccc");
    }
    else if (gameState === 'CHARACTER_SELECT') {
        drawNeonText(ctx, "SETTINGS", canvas.width / 2, 100, 40, "#00ffcc");
        
        drawNeonText(ctx, "Choose Character:", canvas.width / 2, 180, 25, "#ffffff");
        drawNeonText(ctx, `[1] 👻 Ghost (Normal) ${selectedCharacter.icon === '👻' ? '<--' : ''}`, canvas.width / 2, 230, 20, selectedCharacter.icon === '👻' ? '#00ff00' : '#cccccc');
        drawNeonText(ctx, `[2] 🤖 Robot (Slow)   ${selectedCharacter.icon === '🤖' ? '<--' : ''}`, canvas.width / 2, 270, 20, selectedCharacter.icon === '🤖' ? '#00ff00' : '#cccccc');
        drawNeonText(ctx, `[3] 👽 Alien (Fast)   ${selectedCharacter.icon === '👽' ? '<--' : ''}`, canvas.width / 2, 310, 20, selectedCharacter.icon === '👽' ? '#00ff00' : '#cccccc');
        
        drawNeonText(ctx, "Game Mode: Press [M] to toggle", canvas.width / 2, 380, 25, "#ffffff");
        drawNeonText(ctx, `Current Mode: ${gameMode}`, canvas.width / 2, 420, 30, gameMode === 'Classic' ? '#00ffcc' : '#ff0000');
        
        drawNeonText(ctx, "Press SPACE to Go Back", canvas.width / 2, 520, 20, "#cccccc");
    }
    else if (gameState === 'INTRO') {
        drawNeonText(ctx, "TRANSMISSION ENTRANTE...", canvas.width / 2, 100, 30, "#00ff00");
        drawNeonText(ctx, "L'usine chimique X-10 a explosé.", canvas.width / 2, 250, 20, "#ffffff");
        drawNeonText(ctx, "Le sol est devenu instable et toxique.", canvas.width / 2, 290, 20, "#ffffff");
        drawNeonText(ctx, "Tu es le dernier survivant.", canvas.width / 2, 330, 20, "#ffffff");
        drawNeonText(ctx, "Fuis avant que les radiations ne t'emportent.", canvas.width / 2, 370, 20, "#ff5555");
        
        drawNeonText(ctx, "Press SPACE to Survive", canvas.width / 2, 500, 25, "#00ffcc");
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
        
        // --- NEW RECORD FEEDBACK ---
        if (highScore > 0 && gameLogic.getScore() > highScore) {
            if (Math.floor(Date.now() / 300) % 2 === 0) { // Blinking effect
                ctx.fillStyle = "#ffff00"; // Yellow text
                ctx.shadowColor = "#ffff00";
                ctx.fillText("NEW RECORD!", 250, 30);
            }
        }
        
        ctx.fillStyle = "#ff0055";
        ctx.shadowColor = "#ff0055";
        ctx.fillText("Wave: " + gameLogic.getWave(), 20, 60);
        ctx.restore();

        ctx.save(); // Isolation stricte pour ne pas faire fuiter les styles de l'interface
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
        ctx.restore();
        
        // Draw typewriter radio message
        if (radioMessageTimer > 0 && radioMessageFullText) {
            let textToDraw = radioMessageFullText.substring(0, Math.floor(radioMessageDisplayLength));
            // Add a blinking cursor for style
            if (radioMessageDisplayLength < radioMessageFullText.length && Math.floor(Date.now() / 300) % 2 === 0) textToDraw += '_';
            drawNeonText(ctx, `📻 ${textToDraw}`, canvas.width / 2, 50, 20, "#00ff00");
        }
    }
    else if (gameState === 'GAMEOVER') {
        drawNeonText(ctx, "GAME OVER", canvas.width / 2, canvas.height / 2 - 40, 60, "#ff0000");
        drawNeonText(ctx, "Score: " + gameLogic.getScore() + "s", canvas.width / 2, canvas.height / 2 + 20, 30, "#ffffff");
        drawNeonText(ctx, "Wave Reached: " + gameLogic.getWave(), canvas.width / 2, canvas.height / 2 + 60, 25, "#ff9900");
        drawNeonText(ctx, "Press SPACE to Restart", canvas.width / 2, canvas.height / 2 + 120, 20, "#cccccc");
    }

    ctx.restore();

    // UI pour le Son (Affiché en permanence en bas du jeu)
    drawNeonText(ctx, "♪ Sound: " + (isMuted ? "OFF" : "ON") + " [Press V]", canvas.width / 2, canvas.height - 15, 16, isMuted ? "#ff5555" : "#00ff00");

    if (fadeAlpha > 0) {
        ctx.save(); // Isolation pour ne pas altérer les styles de la frame suivante
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    update();
    requestAnimationFrame(draw);
}

draw();