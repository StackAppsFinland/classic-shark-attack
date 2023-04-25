class BrightnessFlash {
    constructor(app) {
        this.app = app;
    }

    flash() {
        // Create a PIXI.Graphics object
        this.brightnessOverlay = new PIXI.Graphics();

        // Set the fill color to white with an initial alpha value of 0 (transparent)
        this.brightnessOverlay.beginFill(0xFFFFFF, 0);
        this.brightnessOverlay.zIndex = 1000;

        // Draw a rectangle covering the entire screen
        const screenWidth = this.app.screen.width;
        const screenHeight = this.app.screen.height;
        this.brightnessOverlay.drawRect(0, 0, screenWidth, screenHeight);

        // End the fill
        this.brightnessOverlay.endFill();

        // Ensure the overlay is on top of other objects on the stage
        this.app.stage.addChildAt(this.brightnessOverlay, this.app.stage.children.length);

        // Use GSAP to create the "ta-da!" effect
        gsap.timeline()
            .to(this.brightnessOverlay, { alpha: 0.5, duration: 0.2 }) // Flash brightness
            .to(this.brightnessOverlay, { alpha: 0, duration: 0.2 }) // Fade out
            .to(this.brightnessOverlay, { alpha: 0.5, duration: 0.2 }) // Flash brightness
            .to(this.brightnessOverlay, { alpha: 0, duration: 0.2 }) // Fade out
            .to(this.brightnessOverlay, { alpha: 0.5, duration: 0.2 }) // Flash brightness
            .to(this.brightnessOverlay, { alpha: 0, duration: 0.2 }) // Fade out
            .call(() => {
                // Remove the brightness overlay from the stage after the animation is complete
                this.app.stage.removeChild(this.brightnessOverlay);
            });
    }
}

export default BrightnessFlash;
