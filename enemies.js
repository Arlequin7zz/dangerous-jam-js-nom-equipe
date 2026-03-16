class Enemy {
    constructor(canvasWidth, canvasHeight, type = 'normal') {
        this.type = type;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.markedForDeletion = false;
        
        switch (type) {
            case 'hunter':
                this.width = 20;
                this.height = 20;
                this.speedY = Math.random() * 1.5 + 2.5; 
                this.speedX = 0;
                this.color = "#ff3300";
                break;
            case 'giant':
                this.width = 70;
                this.height = 70;
                this.speedY = Math.random() * 1 + 1; 
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.color = "#9900ff";
                break;
            case 'flash':
                this.width = 15;
                this.height = 50;
                this.speedY = Math.random() * 3 + 6; 
                this.speedX = 0; 
                this.color = "#ffff00";
                break;
            default:
                this.width = 30;
                this.height = 30;
                this.speedY = Math.random() * 2 + 2; 
                this.speedX = (Math.random() - 0.5) * 2;
                this.color = "#ff00ff";
                break;
        }

        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height;
    }

    update(difficultyMultiplier = 1, playerTarget = null) {
        if (this.type === 'hunter' && playerTarget) {
            if (this.x + this.width / 2 < playerTarget.x + playerTarget.size / 2) {
                this.x += 1.5 * difficultyMultiplier;
            } else {
                this.x -= 1.5 * difficultyMultiplier;
            }
        } else if (this.type !== 'flash') {
            this.x += this.speedX * difficultyMultiplier;
            
            if (this.x < 0 || this.x > this.canvasWidth - this.width) {
                this.speedX *= -1;
            }
        }

        this.y += this.speedY * difficultyMultiplier;

        if (this.y > this.canvasHeight) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() * -5) - 2;
        this.color = "#ff0000";
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += 0.3;
        
        if (this.y > 600) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}