class Enemy {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        this.width = 40;
        this.height = 40;
        
        this.x = this.canvasWidth;
        this.y = Math.random() * (this.canvasHeight - 100 - this.height) + 50;
        this.speedX = Math.random() * 4 + 3;
        
        this.markedForDeletion = false;
        this.color = 'red';
    }

    update() {
        this.x -= this.speedX;

        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}