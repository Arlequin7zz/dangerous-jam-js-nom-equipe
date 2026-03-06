class FloorManager {
    constructor() {
        this.floorIsToxic = false;
        this.floorColor = 'green';
        
        this.currentState = 'SAFE';

        this.timer = 0;
        this.lastTime = Date.now();

        this.durations = {
            SAFE: 3000,
            WARNING: 1000,
            TOXIC: 2000
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

    checkDanger(player) {
        if (!this.floorIsToxic) return false;

        if (!player) return false;

        const playerHeight = player.height || player.size || 50; 
        const playerBottom = player.y + playerHeight;

        const canvasHeight = (window.canvas) ? window.canvas.height : 600;
        const floorTop = canvasHeight - this.floorHeight;

        if (playerBottom >= floorTop) {
            return true;
        }

        return false;
    }
}
