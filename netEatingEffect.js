import { destroyChildren } from './utils.js';

class NetEatingEffect {
    constructor(x, y, duration, numParticles, speedMultiplier) {
        this.x = x;
        this.y = y;
        this.duration = duration;
        this.numParticles = numParticles;
        this.container = new PIXI.Container();
        this.isFinished = false;
        this.vxSpeed = 0.55 * speedMultiplier;
        this.vySpeed = 0.55 * speedMultiplier;
        this.rotationSpeed = 0.06 * speedMultiplier;
        this.rotationStart = this.rotationSpeed / 2;
        this.speedMultiplier = speedMultiplier;
        this.createParticles();
    }

    createParticles() {
        for (let i = 0; i < this.numParticles; i++) {
            const thickness = 1;
            const length = Math.floor(Math.random() * 7) + 1;

            // Create a black rectangle
            const rectangle = new PIXI.Graphics();
            rectangle.beginFill(0xCFCF00);
            rectangle.drawRect(0, 0, thickness, length);
            rectangle.endFill();

            rectangle.x = this.x;
            rectangle.y = this.y;
            rectangle.vx = (Math.random() * 2 - 1) * this.vxSpeed;
            rectangle.vy = (Math.random() * 2 - 1) * this.vySpeed;
            rectangle.alpha = 1;
            rectangle.rotation = Math.floor(Math.random() * 360);
            rectangle.rotationSpeed = (Math.random() * this.rotationSpeed - this.rotationStart);
            this.container.addChild(rectangle);
            this.container.instance = this;
        }

        setTimeout(() => {
            destroyChildren(this.container)
            this.isFinished = true;
        }, this.duration);
    }

    update() {
        for (let i = 0; i < this.container.children.length; i++) {
            const particle = this.container.children[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.alpha = particle.alpha - 0.001 * this.speedMultiplier;
            particle.rotation += particle.rotationSpeed;
        }
    }
}

export default NetEatingEffect;
