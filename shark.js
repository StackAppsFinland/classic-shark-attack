class Shark {
    constructor(netGrid, imageLoader, playerSprite, gridCountX, gridCountY, speed) {
        this.netGrid = netGrid;
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
        this.isAngry = 0;
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

    isOnGridPosition() {
        return (this.sharkSprite.x + 14) % this.gridSize === 0 && (this.sharkSprite.y + 14) % this.gridSize === 0;
    }

    alignToGrid() {
        this.sharkSprite.x = 20 + Math.round((this.sharkSprite.x - 14) / this.gridSize) * this.gridSize;
        this.sharkSprite.y = 20 + Math.round((this.sharkSprite.y - 14) / this.gridSize) * this.gridSize;
    }

    update() {
        if (this.isMoving) return;

        const newX = this.sharkSprite.x + this.direction.x * this.speed;
        const newY = this.sharkSprite.y + this.direction.y * this.speed;

        // Check if the new position is within the grid
        const gridX = Math.floor(newX / this.gridSize);
        const gridY = Math.floor(newY / this.gridSize);

        if ((newX < 5  || gridX >= this.gridCountX) || (newY < 5 || gridY >= this.gridCountY)) {
            this.alignToGrid();
            this.changeDirection();
            this.isAngry--;
            if (this.isAngry <= 0) this.isAngry = 0;
            return;
        }

        const playerGridX = Math.floor(this.playerSprite.x / this.gridSize);
        const playerGridY = Math.floor(this.playerSprite.y / this.gridSize);

        if (this.isAngry > 0) {
            if (this.direction.y === 0) {
                if (playerGridX === gridX) {
                    this.alignToGrid();
                    let newDirection;
                    if (playerGridY > gridY) {
                        newDirection = { x: 0, y: 1 }; // South
                    } else {
                        newDirection = { x: 0, y: -1 }; // North
                    }
                    const targetRotation = this.directionToRotation(newDirection);
                    this.direction = newDirection;

                    gsap.to(this.sharkSprite, {
                        rotation: targetRotation,
                        duration: 0.2,
                    });
                    return;
                }
            } else if (this.direction.x === 0) {
                if (playerGridY === gridY) {
                    this.alignToGrid();
                    let newDirection;
                    if (playerGridX > gridX) {
                        newDirection = { x: 1, y: 0 }; // East
                    } else {
                        newDirection = { x: -1, y: 0 }; // West
                    }
                    const targetRotation = this.directionToRotation(newDirection);
                    this.direction = newDirection;

                    gsap.to(this.sharkSprite, {
                        rotation: targetRotation,
                        duration: 0.2,
                    });
                    return;
                }
            }
        }

        // Check if the shark is at a grid position
        /* if ((Math.floor(Math.random() * 1000) + 1) > 997) {
            this.alignToGrid();
            this.changeDirection();
            return;
        } */

        if (this.netGrid[gridX][gridY] === null || Date.now() > this.netEatingDelay) {
            if (this.netGrid[gridX][gridY] !== null) {
                const parentContainer = this.netGrid[gridX][gridY].sprite.parent;
                parentContainer.removeChild(this.netGrid[gridX][gridY].sprite)
                this.netGrid[gridX][gridY] = null
            }
            this.move(newX, newY);
        } else {
            this.isAngry++;
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

            if ((gridX < 0 || gridX >= this.gridCountX) || (gridY < 0 || gridY >= this.gridCountY)) {
                return false;
            }

            return this.netGrid[gridX][gridY] === null || Date.now() > this.netEatingDelay;
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