class GameLevel {
    constructor(id = 1,
                sharks=1,
                octopuses = 0,
                speed = 1,
                coverage=25,
                eatNetAfter = 3000) {
        this.id = id;
        this.sharks = sharks;
        this.octopuses = octopuses;
        this.speed = speed;
        this.coverage = coverage;
        this.eatNetAfter = eatNetAfter;
    }
}

export default GameLevel;