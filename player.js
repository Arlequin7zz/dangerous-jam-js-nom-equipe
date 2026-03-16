class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 50; 
        this.speed = 5;
        this.health = 100;
    }

    move(keys, width, height) {
        if (keys['ArrowUp'] && this.y > 0) this.y -= this.speed;
        if (keys['ArrowDown'] && this.y < height - this.size) this.y += this.speed;
        if (keys['ArrowLeft'] && this.x > 0) this.x -= this.speed;
        if (keys['ArrowRight'] && this.x < width - this.size) this.x += this.speed;
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    isDead() {
        return this.health <= 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = 1; // Force l'opacité
        ctx.font = `bold ${this.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Contour noir pour la visibilité
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.strokeText("👻", this.x + this.size / 2, this.y + this.size / 2);

        // Effet de lueur
        ctx.shadowBlur = 20;
        ctx.shadowColor = "white";
        
        ctx.fillText("👻", this.x + this.size / 2, this.y + this.size / 2);
        ctx.restore();
    }
}