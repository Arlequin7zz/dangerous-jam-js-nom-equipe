class Player {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.size = 40;

        this.speed = 5;

        this.health = 100;

    }

    move(keys, canvasWidth, canvasHeight){

        if(keys["ArrowUp"] && this.y > 0){
            this.y -= this.speed;
        }

        if(keys["ArrowDown"] && this.y < canvasHeight - this.size){
            this.y += this.speed;
        }

        if(keys["ArrowLeft"] && this.x > 0){
            this.x -= this.speed;
        }

        if(keys["ArrowRight"] && this.x < canvasWidth - this.size){
            this.x += this.speed;
        }

    }

    draw(ctx){

        ctx.save();
        ctx.fillStyle = "#00ffff"; // Cyan neon color
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ffff";
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Inner core for styling
        ctx.fillStyle = "white";
        ctx.shadowBlur = 0;
        ctx.fillRect(this.x + 10, this.y + 10, this.size - 20, this.size - 20);
        ctx.restore();

    }

    takeDamage(amount){

        this.health -= amount;

        if(this.health < 0){
            this.health = 0;
        }

    }

    isDead(){

        return this.health <= 0;

    }

}