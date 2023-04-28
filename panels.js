import Const from "./constants.js";

class Panels {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.beginGameContainer = new PIXI.Container();
        this.retryContainer = new PIXI.Container();
        this.nextLevelContainer = new PIXI.Container();
        this.pausedContainer = new PIXI.Container();
        this.getReadyContainer = new PIXI.Container();
    }

    showBeginGamePanel(callback) {
        // Set the initial alpha of the retryContainer to 0 (invisible)
        this.beginGameContainer.alpha = 0;

        // Fade in the retryContainer using GSAP with a 3-second delay
        gsap.to(this.beginGameContainer, {
            alpha: 1, // Target alpha value
            duration: 0.0, // Animation duration in seconds
            delay: 1.0, // Delay before starting the animation in seconds
            onComplete: callback // Function to call when the animation is completed
        });
    }

    showRetryPanel(callback) {
        // Set the initial alpha of the retryContainer to 0 (invisible)
        this.retryContainer.alpha = 0;

        // Fade in the retryContainer using GSAP with a 3-second delay
        gsap.to(this.retryContainer, {
            alpha: 1, // Target alpha value
            duration: 0.5, // Animation duration in seconds
            delay: 1.0, // Delay before starting the animation in seconds
            onComplete: callback, // Function to call when the animation is completed
        });
    }

    showNextLevelPanel(callback) {
        // Set the initial alpha of the retryContainer to 0 (invisible)
        this.nextLevelContainer.alpha = 0;

        // Fade in the retryContainer using GSAP with a 3-second delay
        gsap.to(this.nextLevelContainer, {
            alpha: 1, // Target alpha value
            duration: 0.5, // Animation duration in seconds
            delay: 2.5, // Delay before starting the animation in seconds
            onComplete: callback
        });
    }

    hidePauseContainer() {
        this.pausedContainer.visible = false;
    }

    showPauseContainer() {
        this.pausedContainer.visible = true;
    }

    hideRetryPanel(callback) {
        // Fade out the retryContainer using GSAP with a 1-second delay
        gsap.to(this.retryContainer, {
            alpha: 0, // Target alpha value
            duration: 0.25, // Animation duration in seconds
            delay: 0.25, // Delay before starting the animation in seconds
            onComplete: callback
        });
    }

    hideNextLevelPanel(callback) {
        // Fade out the retryContainer using GSAP with a 1-second delay
        gsap.to(this.nextLevelContainer, {
            alpha: 0, // Target alpha value
            duration: 0.25, // Animation duration in seconds
            delay: 0.25, // Delay before starting the animation in seconds
            onComplete: callback
        });
    }

    hideBeginGameContainer(callback) {
        // Fade out the retryContainer using GSAP with a 1-second delay
        gsap.to(this.beginGameContainer, {
            alpha: 0, // Target alpha value
            duration: 0.25, // Animation duration in seconds
            delay: 0.25, // Delay before starting the animation in seconds
            onComplete: callback
        });
    }

    getPauseContainer() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 30,
            fill: 'red',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 3,
        });
        const pausedText = new PIXI.Text('- GAME PAUSED -', textStyle);
        pausedText.anchor.set(0.5);
        pausedText.x = this.canvasWidth / 2;
        pausedText.y = 270;
        this.pausedContainer.addChild(pausedText);
        this.pausedContainer.visible = false;
        return this.pausedContainer;
    }

    getBeginGameContainer(level) {
        this.beginGameContainer.alpha = 0;

        // Create a semi-transparent rounded rectangle
        const rectWidth = 500;
        const rectHeight = 300;
        const rectX = (this.canvasWidth - rectWidth) / 2;
        const rectY = (this.canvasHeight - rectHeight) / 2;

// Create a semi-transparent rounded rectangle in the middle of the screen
        const rectangle = new PIXI.Graphics();
        rectangle.beginFill(0x000000, 0.80); // Set fill color and alpha for transparency
        rectangle.drawRoundedRect(rectX, rectY, rectWidth, rectHeight, 10); // Draw a 400x300 rounded rectangle
        rectangle.endFill();
        this.beginGameContainer.addChild(rectangle);

        // Create the "You Crashed!" text
        const crashStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 50,
            fill: 'red',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 3,
        });
        const titleText = new PIXI.Text('- SHARK ATTACK -', crashStyle);
        titleText.anchor.set(0.5);
        titleText.x = this.canvasWidth / 2;
        titleText.y = 250;
        this.beginGameContainer.addChild(titleText);

        // Create the "Click 'Enter' to try again" text
        const newGameStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 30,
            fill: 'white',
        });

        if (level > 0) {
            const newGameText = new PIXI.Text('Press "N" for new game.', newGameStyle);
            newGameText.anchor.set(0.5);
            newGameText.x = this.canvasWidth / 2;
            newGameText.y = 330;
            this.beginGameContainer.addChild(newGameText);
        }

        const currentLevelText = new PIXI.Text('Press "Enter" for level ' + (level + 1), newGameStyle);
        currentLevelText.anchor.set(0.5);
        currentLevelText.x = this.canvasWidth / 2;
        currentLevelText.y = 370;
        this.beginGameContainer.addChild(currentLevelText);

        return this.beginGameContainer;
    }

    getRetryContainer() {
        this.retryContainer.alpha = 0;

        // Create a semi-transparent rounded rectangle
        const rectWidth = 500;
        const rectHeight = 300;
        const rectX = (this.canvasWidth - rectWidth) / 2;
        const rectY = (this.canvasHeight - rectHeight) / 2;

// Create a semi-transparent rounded rectangle in the middle of the screen
        const rectangle = new PIXI.Graphics();
        rectangle.beginFill(0x000000, 0.80); // Set fill color and alpha for transparency
        rectangle.drawRoundedRect(rectX, rectY, rectWidth, rectHeight, 10); // Draw a 400x300 rounded rectangle
        rectangle.endFill();
        this.retryContainer.addChild(rectangle);

        // Create the "You Crashed!" text
        const crashStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 50,
            fill: 'red',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 3,
        });
        const crashText = new PIXI.Text('YOU WERE EATEN!', crashStyle);
        crashText.anchor.set(0.5);
        crashText.x = this.canvasWidth / 2;
        crashText.y = 250;
        this.retryContainer.addChild(crashText);

        // Create the "Click 'Enter' to try again" text
        const tryAgainStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 30,
            fill: 'white',
        });
        const tryAgainText = new PIXI.Text('Press "R" to try again', tryAgainStyle);
        tryAgainText.anchor.set(0.5);
        tryAgainText.x = this.canvasWidth / 2;
        tryAgainText.y = 370;
        this.retryContainer.addChild(tryAgainText);

        return this.retryContainer;
    }

    getNextLevelContainer() {
        this.nextLevelContainer.alpha = 0;

        // Create a semi-transparent rounded rectangle
        const rectWidth = 500;
        const rectHeight = 300;
        const rectX = (this.canvasWidth - rectWidth) / 2;
        const rectY = (this.canvasHeight - rectHeight) / 2;

// Create a semi-transparent rounded rectangle in the middle of the screen
        const rectangle = new PIXI.Graphics();
        rectangle.beginFill(0x000000, 0.80); // Set fill color and alpha for transparency
        rectangle.drawRoundedRect(rectX, rectY, rectWidth, rectHeight, 10); // Draw a 400x300 rounded rectangle
        rectangle.endFill();
        this.nextLevelContainer.addChild(rectangle);

        // Create the "You Crashed!" text
        const crashStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 50,
            fill: 'red',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 3,
        });
        const crashText = new PIXI.Text('LEVEL COMPLETE!', crashStyle);
        crashText.anchor.set(0.5);
        crashText.x = this.canvasWidth / 2;
        crashText.y = 250;
        this.nextLevelContainer.addChild(crashText);

        // Create the "Click 'Enter' to continue" text
        const tryAgainStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 30,
            fill: 'white',
        });

        const tryAgainText = new PIXI.Text('Press "Enter" for next level', tryAgainStyle);
        tryAgainText.anchor.set(0.5);
        tryAgainText.x = this.canvasWidth / 2;
        tryAgainText.y = 370;
        this.nextLevelContainer.addChild(tryAgainText);

        return this.nextLevelContainer;
    }

    getGetReadyContainer() {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 50,
            fill: 'red',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 3,
        });
        const getReadyText = new PIXI.Text('GET READY!', textStyle);
        getReadyText.anchor.set(0.5);
        getReadyText.x = this.canvasWidth / 2;
        getReadyText.y = this.canvasHeight / 2;
        this.getReadyContainer.alpha = 0;
        this.getReadyContainer.addChild(getReadyText);
        return this.getReadyContainer;
    }

    showGetReadyPanel() {
        // Show the "GET READY!" text
        this.getReadyContainer.alpha = 0;

        // Flash the "GET READY!" text for 3 seconds
        gsap.to(this.getReadyContainer, {
            alpha: 1,
            duration: 0.5,
            yoyo: true,
            repeat: 4,
            delay: 0.5,
            onComplete: () => {
                this.hideGetReadyPanel();
            },
        });
    }

    hideGetReadyPanel() {
        this.getReadyContainer.alpha = 0;
    }
}

export default Panels