class GameLevel {
    constructor(id = 1,
                sharks=1,
                octopuses = 0,
                speed = 1,
                coverage=25) {
        this.id = id;
        this.sharks = sharks;
        this.octopuses = octopuses;
        this.speed = speed;
        this.coverage = coverage;
    }
}

export default GameLevel;