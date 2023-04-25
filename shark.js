import NetEatingEffect from "./netEatingEffect.js";

class Shark {
    constructor(netGrid, netEatingContainer, imageLoader, playerSprite, gridCountX, gridCountY, speed) {
        this.netGrid = netGrid;
        this.netEatingContainer = netEatingContainer;
        this.directions = [
            {x: 1, y: 0}, // East
            {x: -1, y: 0}, // West
            {x: 0, y: 1}, // South
            {x: 0, y: -1}, // North
        ];
        this.direction = this.directions[Math.floor(Math.random() * this.directions.length)];
        this.isMoving = false;
        this.gridCountX = gridCountX;
        this.gridCountY = gridCountY;
        this.playerSprite = playerSprite;
        this.gridSize = 28;
        this.sharkImageCounter = 1;
        this.speed = speed;
        this.imageLoader = imageLoader;
        this.sharkSprite = this.createSharkSprite();
        this.setInitialRotation()
        this.imageUpdateInterval = 50;
        this.scheduleImageUpdate();
        this.netEatingDelay = Date.now() + 10000;
        this.angryCounter = 0;
        this.changeDirectionCooldown = 0;
    }

    scheduleImageUpdate() {
        setTimeout(() => {
            this.updateSharkImage();
            this.scheduleImageUpdate();
        }, this.imageUpdateInterval);
    }

    setNetEatingDelay(delay) {
        this.netEatingDelay = Date.now() + delay
    }

    updateSharkImage() {
        this.sharkImageCounter += 1;
        if (this.sharkImageCounter > 6) {
            this.sharkImageCounter = 1;
        }

        const texture = this.imageLoader.getImage(`shark${this.sharkImageCounter}`);
        this.sharkSprite.texture = texture;
    }

    createSharkSprite(imageLoader) {
        const texture = this.imageLoader.getImage("shark1");
        const sharkSprite = new PIXI.Sprite(texture);
        sharkSprite.anchor.set(0.5, 0.25);
        sharkSprite.width = 26;
        sharkSprite.height = 44;
        const gridX = Math.floor(Math.random() * (this.gridCountX - 1));
        const gridY = Math.floor(Math.random() * (this.gridCountY - 1));
        sharkSprite.x = 14 + (gridX * this.gridSize + this.gridSize / 2);
        sharkSprite.y = 14 + (gridY * this.gridSize + this.gridSize / 2);
        return sharkSprite;
    }

    setInitialRotation() {
        if (this.direction.x === 1) { // East
            this.sharkSprite.rotation = PIXI.DEG_TO_RAD * 90;
        } else if (this.direction.x === -1) { // West
            this.sharkSprite.rotation = PIXI.DEG_TO_RAD * 270;
        } else if (this.direction.y === 1) { // South
            this.sharkSprite.rotation = PIXI.DEG_TO_RAD * 180;
        } else if (this.direction.y === -1) { // North
            this.sharkSprite.rotation = 0;
        }
    }

    alignToGrid() {
        this.sharkSprite.x = 20 + Math.round((this.sharkSprite.x - 14) / this.gridSize) * this.gridSize;
        this.sharkSprite.y = 20 + Math.round((this.sharkSprite.y - 14) / this.gridSize) * this.gridSize;
    }

    update() {
        if (this.isMoving) return;

        if (this.angryCounter-- < 0) { this.angryCounter = 0; }

        const newX = this.sharkSprite.x + this.direction.x * this.speed;
        const newY = this.sharkSprite.y + this.direction.y * this.speed;

        // Check if the new position is within the grid
        const gridX = Math.floor(newX / this.gridSize);
        const gridY = Math.floor(newY / this.gridSize);

        if ((newX < 5  || gridX >= this.gridCountX) || (newY < 5 || gridY >= this.gridCountY)) {
            this.alignToGrid();
            this.changeDirection();
            return;
        }

        const playerGridX = Math.floor(this.playerSprite.x / this.gridSize);
        const playerGridY = Math.floor(this.playerSprite.y / this.gridSize);

        this.changeDirectionCooldown -= this.speed;
        if (this.changeDirectionCooldown < 0) {
            this.changeDirectionCooldown = 0;
        }

        if (this.angryCounter > 0 && this.changeDirectionCooldown === 0) {
            this.alignToGrid();

            let newDirection;
            if (this.direction.y === 0) {
                if (playerGridY > gridY) {
                    newDirection = { x: 0, y: 1 }; // South
                } else {
                    newDirection = { x: 0, y: -1 }; // North
                }
            } else if (this.direction.x === 0) {
                if (playerGridX > gridX) {
                    newDirection = { x: 1, y: 0 }; // East
                } else {
                    newDirection = { x: -1, y: 0 }; // West
                }
            }

            const targetRotation = this.directionToRotation(newDirection);
            this.direction = newDirection;

            gsap.to(this.sharkSprite, {
                rotation: targetRotation,
                duration: 0.2,
            });
            this.changeDirectionCooldown = 1000;
            return;
        }

        if (this.netGrid[gridX][gridY] === null || Date.now() > this.netEatingDelay) {
            if (this.netGrid[gridX][gridY] !== null) {
                const parentContainer = this.netGrid[gridX][gridY].sprite.parent;
                parentContainer.removeChild(this.netGrid[gridX][gridY].sprite)
                this.netGrid[gridX][gridY] = null

                let offsetX = 0;
                let offsetY = 0;
                if (this.direction.y === -1) {
                    offsetX = 20;
                    offsetY = 8;
                }
                if (this.direction.y === 1) {
                    offsetX = 20;
                    offsetY = 14;
                }
                if (this.direction.x === 1) {
                    offsetX = 18;
                    offsetY = 18;
                }
                if (this.direction.x === -1) {
                    offsetX = 12;
                    offsetY = 18;
                }

                const netEatingEffect = new NetEatingEffect((gridX * 28) + offsetX, (gridY * 28) + offsetY, 280, 25, 1.0);
                this.netEatingContainer.addChild(netEatingEffect.container);
            }
            this.move(newX, newY);
        } else {
            // If net is touched, angry count goes up
            this.angryCounter = this.angryCounter + 100;
            if (this.angryCounter > 2000) { this.angryCounter = 2000; }
            this.alignToGrid();
            this.changeDirection();
        }
    }

    move(newX, newY) {
        this.sharkSprite.x = newX;
        this.sharkSprite.y = newY;
    }

    changeDirection() {
        let availableDirections = this.directions.filter(dir => {
            const newX = this.sharkSprite.x + dir.x * this.gridSize;
            const newY = this.sharkSprite.y + dir.y * this.gridSize;
            const gridX = Math.floor(newX / this.gridSize);
            const gridY = Math.floor(newY / this.gridSize);

            const gridPlayerX = Math.floor(this.playerSprite.x / this.gridSize);
            const gridPlayerY = Math.floor(this.playerSprite.y / this.gridSize);

            if ((gridX < 0 || gridX >= this.gridCountX) || (gridY < 0 || gridY >= this.gridCountY)) {
                return false;
            }

            if (gridX === gridPlayerX && gridY === gridPlayerY) {
                return true;
            }

            return this.netGrid[gridX][gridY] === null  || Date.now() > this.netEatingDelay;
        });

        if (availableDirections.length > 0) {
            const newDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)];
            const targetRotation = this.directionToRotation(newDirection);
            this.direction = newDirection;

            gsap.to(this.sharkSprite, {
                rotation: targetRotation,
                duration: 0.2,
            });
        }
    }


    directionToRotation(direction) {
        if (direction.x === 1) { // East
            return PIXI.DEG_TO_RAD * 90;
        } else if (direction.x === -1) { // West
            return PIXI.DEG_TO_RAD * 270;
        } else if (direction.y === 1) { // South
            return PIXI.DEG_TO_RAD * 180;
        } else if (direction.y === -1) { // North
            return 0;
        }
    }
}

export default Shark;