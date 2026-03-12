class Player {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.size = 40;

        this.speed = 5;

        this.health = 100;

    }

    move(keys){

        if(keys["ArrowUp"]){
            this.y -= this.speed;
        }

        if(keys["ArrowDown"]){
            this.y += this.speed;
        }

        if(keys["ArrowLeft"]){
            this.x -= this.speed;
        }

        if(keys["ArrowRight"]){
            this.x += this.speed;
        }

    }

    draw(ctx){

        ctx.fillStyle = "blue";

        ctx.fillRect(
            this.x,
            this.y,
            this.size,
            this.size
        );

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