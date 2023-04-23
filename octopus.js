class Octopus {
    constructor(imageLoader, gridX, gridY) {
        this.imageLoader = imageLoader;
        this.gridX = gridX;
        this.gridY = gridY;
        this.frameCounter = Math.floor(Math.random() * 48) + 1; // Start from a random frame
        this.maxFrames = 48;
        this.gridSize = 28;
        this.restMode = false;
        this.restModeCounter = 0;
        this.restModeMaxCounter = 0;
        this.updateInterval = Math.floor(Math.random() * 21) + 10; // Random speed between 10ms to 30ms
        this.octopusSprite = this.createOctopusSprite();
        this.scheduleUpdate();
    }

    createOctopusSprite() {
        const texture = this.imageLoader.getImage(`frame_${this.frameCounter}`);
        const octopusSprite = new PIXI.Sprite(texture);
        octopusSprite.anchor.set(0.5, 0.5);
        octopusSprite.width = 39;
        octopusSprite.height = 39;
        octopusSprite.x =  7 + (this.gridX * this.gridSize + this.gridSize / 2);
        octopusSprite.y = 5 + (this.gridY * this.gridSize + this.gridSize / 2);
        return octopusSprite;
    }

    startRestMode() {
        if (!this.restMode) {
            this.restMode = true;
            this.restModeMaxCounter = Math.floor(Math.random() * 19) + 2; // Random times to repeat the rest mode (2 to 20)
        }
    }

    stopRestMode() {
        this.restMode = false;
        this.restModeCounter = 0;
        this.restModeMaxCounter = 0;
    }

    scheduleUpdate() {
        // Randomly slow down the interval during rest mode
        let currentInterval = this.updateInterval;
        if (this.restMode && Math.random() < 0.5) {
            currentInterval *= Math.floor(Math.random() * 3) + 1; // Slow down by a factor of 1 to 3
        }

        setTimeout(() => {
            this.update();
            this.scheduleUpdate();

            // Randomly start or stop the rest mode
            if (Math.random() < 0.01) {
                this.startRestMode();
            } else if (Math.random() < 0.01) {
                this.stopRestMode();
            }
        }, currentInterval);
    }

    update() {
        if (this.restMode) {
            if (this.restModeCounter < this.restModeMaxCounter) {
                const framesToGoBack = Math.floor(Math.random() * 2) + 1; // Randomly go back 1 to 3 frames
                this.frameCounter -= framesToGoBack;
                if (this.frameCounter < 1) {
                    this.frameCounter += this.maxFrames;
                }
                this.restModeCounter += 1;
            } else {
                this.stopRestMode();
            }
        } else {
            this.frameCounter += 1;
            if (this.frameCounter > this.maxFrames) {
                this.frameCounter = 1;
            }
        }

        const texture = this.imageLoader.getImage(`frame_${this.frameCounter}`);
        this.octopusSprite.texture = texture;
    }
}

export default Octopus;
