class GameLogic {

    constructor(){
        this.startTime = 0;
        this.score = 0;
        this.wave = 1;
        this.difficultyMultiplier = 1;
    }

    start() {
        this.startTime = Date.now();
        this.score = 0;
        this.wave = 1;
        this.difficultyMultiplier = 1;
    }

    update(){
        this.score = Math.floor((Date.now() - this.startTime) / 1000);
        
        this.wave = Math.floor(this.score / 10) + 1;
        
        this.difficultyMultiplier = 1 + ((this.wave - 1) * 0.15);
    }

    getScore(){
        return this.score;
    }

    getWave() {
        return this.wave;
    }

    getDifficultyMultiplier() {
        return this.difficultyMultiplier;
    }

}

const gameLogic = new GameLogic();

class PowerUp {
    constructor(canvasWidth, canvasHeight) {
        this.size = 15;
        this.x = Math.random() * (canvasWidth - this.size * 2) + this.size;
        this.y = Math.random() * (canvasHeight - 100 - this.size * 2) + this.size;
        this.type = Math.random() < 0.5 ? 'heal' : 'invincible';
        this.markedForDeletion = false;
        this.timer = 400;
    }

    update() {
        this.timer--;
        if (this.timer <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        if (this.timer < 60 && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.type === 'heal' ? "#00ff00" : "#ffff00";
        ctx.shadowColor = this.fillStyle;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "black";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 0;
        ctx.fillText(this.type === 'heal' ? "+" : "★", this.x, this.y + 1);
        ctx.restore();
    }
}

class FloatingText {
    constructor(text, x, y, color) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.color = color;
        this.alpha = 1;
        this.markedForDeletion = false;
    }

    update() {
        this.y -= 1;
        this.alpha -= 0.02;
        if (this.alpha <= 0) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.font = "bold 20px 'Courier New'";
        ctx.textAlign = "center";
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}
