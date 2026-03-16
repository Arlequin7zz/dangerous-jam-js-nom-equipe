class Enemy {
    constructor(canvasWidth, canvasHeight) {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height; // Spawn slightly above canvas
        
        // Initial velocity
        this.speedY = Math.random() * 2 + 2; 
        this.speedX = (Math.random() - 0.5) * 2;
        
        this.markedForDeletion = false;
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
    }

    // Difficulty multiplier speeds up enemies
    update(difficultyMultiplier = 1) {
        this.y += this.speedY * difficultyMultiplier;
        this.x += this.speedX * difficultyMultiplier;
        
        // Bounce off side walls
        if (this.x < 0 || this.x > this.canvasWidth - this.width) {
            this.speedX *= -1;
        }

        if (this.y > this.canvasHeight) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "#ff00ff"; // Magenta neon
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff00ff";
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}