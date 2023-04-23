class Octopus {
    constructor(imageLoader, gridCountX, gridCountY) {
        this.imageLoader = imageLoader;
        this.gridCountX = gridCountX;
        this.gridCountY = gridCountY;
        this.frameCounter = Math.floor(Math.random() * 48) + 1; // Start from a random frame
        this.maxFrames = 48;
        this.gridSize = 28;
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
        const gridX = Math.floor(Math.random() * (this.gridCountX - 1));
        const gridY = Math.floor(Math.random() * (this.gridCountY - 1));
        octopusSprite.x =  7 + (gridX * this.gridSize + this.gridSize / 2);
        octopusSprite.y = 5 + (gridY * this.gridSize + this.gridSize / 2);
        return octopusSprite;
    }

    scheduleUpdate() {
        setTimeout(() => {
            this.update();
            this.scheduleUpdate();
        }, this.updateInterval);
    }

    update() {
        this.frameCounter += 1;
        if (this.frameCounter > this.maxFrames) {
            this.frameCounter = 1;
        }
        const texture = this.imageLoader.getImage(`frame_${this.frameCounter}`);
        this.octopusSprite.texture = texture;
    }
}

export default Octopus;
