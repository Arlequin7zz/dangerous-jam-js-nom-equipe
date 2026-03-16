class GameLogic {

    constructor(){
        this.startTime = 0;
        this.score = 0;
        this.wave = 1;
        this.difficultyMultiplier = 1;
    }

    // Modular initialization for the presentation
    start() {
        this.startTime = Date.now();
        this.score = 0;
        this.wave = 1;
        this.difficultyMultiplier = 1;
    }

    update(){
        // Calculate time survived in seconds
        this.score = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Wave system: difficulty increases every 10 seconds
        this.wave = Math.floor(this.score / 10) + 1;
        
        // Multiplier adds 15% speed/challenge per wave
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
