class Score {
    constructor() {
        this.score = 0;
        this.highScore = 0;
        this.level = 0;
        this.testMode = false;
    }

    increment(amount) {
        this.score += amount;

        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
    }

    saveGameData() {
        localStorage.setItem('shark.attack.currentLevel', this.level);
        localStorage.setItem('shark.attack.highScore', this.highScore);
        console.log("Saved level: " + this.level)
    }

    loadGameData() {
        const currentLevel = localStorage.getItem('shark.attack.currentLevel') || 0;
        const highScore = localStorage.getItem('shark.attack.highScore') || 0;

        this.level = parseInt(currentLevel);
        this.highScore = parseInt(highScore);

        console.log("loaded level: " + this.level)
    }

    resetScore() {
        this.score = 0;
    }

    reset() {
        this.level = 0;
        this.saveGameData();
    }

    // Test mode is here as this object can be passed around easily
    toggleTestMode() {
        this.testMode = !this.testMode;
    }
}