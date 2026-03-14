class GameLogic {

    constructor(){
        this.score = 0;
    }

    update(){
        this.score++;
    }

    getScore(){
        return Math.floor(this.score / 60);
    }

}

const gameLogic = new GameLogic();
