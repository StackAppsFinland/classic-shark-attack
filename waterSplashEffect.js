
class WaterSplashEffect {
    constructor(x, y, duration, numParticles, speedMultiplier) {
        this.x = x;
        this.y = y;
        this.duration = duration;
        this.numParticles = numParticles;
        this.container = new PIXI.Container();
        this.isFinished = false;
        this.vxSpeed = 0.15 * speedMultiplier;
        this.vySpeed = 3.65 * speedMultiplier;
        this.rotationSpeed = 0.06 * speedMultiplier;
        this.rotationStart = this.rotationSpeed / 2;
        this.speedMultiplier = speedMultiplier;
        this.gravity = 0.03 * speedMultiplier;
        this.createParticles();
    }

    gaussianRand() {
        let rand = 0;
        for (let i = 0; i < 6; i++) {
            rand += Math.random();
        }
        return rand / 6 - 0.5;
    }

    createParticles() {
        for (let i = 0; i < this.numParticles; i++) {
            const thickness = 2;
            const length = Math.floor(Math.random() * 7) + 1;
            const rectangle = new PIXI.Graphics();

            const whichColor = Math.floor(Math.random() * 2) + 1;
            if (whichColor > 1)
                rectangle.beginFill(0xFFFFFF);
            else
                rectangle.beginFill(0x0000FF);

            rectangle.drawRect(0, 0, thickness, length);
            rectangle.endFill();

            rectangle.x = this.x;
            rectangle.y = this.y;
            rectangle.vx = this.gaussianRand() * this.vxSpeed * 8; // Use Gaussian distribution for horizontal velocity
            rectangle.vy = (Math.random() * -0.5) * this.vySpeed;
            rectangle.alpha = 1;
            rectangle.rotation = Math.floor(Math.random() * 360);
            rectangle.rotationSpeed = (Math.random() * this.rotationSpeed - this.rotationStart);
            this.container.addChild(rectangle);
            this.container.instance = this;
        }

        setTimeout(() => {
            this.container.destroy({ children: true });
            this.isFinished = true;
        }, this.duration);
    }

    update() {
        for (let i = 0; i < this.container.children.length; i++) {
            const particle = this.container.children[i];
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.y > this.y) particle.y = this.y;
            particle.vy += this.gravity;
            particle.alpha = particle.alpha - 0.003 * this.speedMultiplier;
            particle.rotation += particle.rotationSpeed;
        }
    }
}

export default WaterSplashEffect;
