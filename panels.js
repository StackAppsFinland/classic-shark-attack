
class Panels {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.openingContainer = new PIXI.Container();
        this.beginGameContainer = new PIXI.Container();
        this.retryContainer = new PIXI.Container();
        this.nextLevelContainer = new PIXI.Container();
        this.pausedContainer = new PIXI.Container();
        this.getReadyContainer = new PIXI.Container();
        this.scoreStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 20,
            fill: 'white',
        });
        this.score = new PIXI.Text('0', this.scoreStyle);
        this.bonusScore = new PIXI.Text('0', this.scoreStyle);
    }

    setScoreInfo(score, bonus) {
        this.score.text = score;
        this.bonusScore.text = bonus;
    }

    showOpeningPanel(callback) {
        this.openingContainer.alpha = 0;

        gsap.to(this.openingContainer, {
            alpha: 1, // Target alpha value
            duration: 0.0, // Animation duration in seconds
            delay: 1.0, // Delay before starting the animation in seconds
            onComplete: callback // Function to call when the animation is completed
        });
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

    hideOpeningContainer(callback) {
        gsap.to(this.openingContainer, {
            alpha: 0, // Target alpha value
            duration: 0.25, // Animation duration in seconds
            delay: 0.25, // Delay before starting the animation in seconds
            onComplete: callback
        });
    }

    getOpeningContainer() {
        this.openingContainer.alpha = 0;

        // Create a semi-transparent rounded rectangle in the middle of the screen
        const rectWidth = 720;
        const rectHeight = 550;
        const rectX = (this.canvasWidth - rectWidth) / 2;
        const rectY = (this.canvasHeight - rectHeight) / 2;

        const rectangle = new PIXI.Graphics();
        rectangle.beginFill(0x000000, 0.80); // Set fill color and alpha for transparency
        rectangle.drawRoundedRect(rectX, rectY, rectWidth, rectHeight, 10); // Draw a rounded rectangle
        rectangle.endFill();
        this.openingContainer.addChild(rectangle);

        // Create text for the title
        const titleStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 40,
            fill: 'red',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 3,
        });
        const welcomeText = new PIXI.Text('Welcome to', titleStyle);
        welcomeText.anchor.set(0.5);
        welcomeText.x = this.canvasWidth / 2;
        welcomeText.y = 95;
        this.openingContainer.addChild(welcomeText);

        const titleText = new PIXI.Text('Classic Shark Attack!', titleStyle);
        titleText.anchor.set(0.5);
        titleText.x = this.canvasWidth / 2;
        titleText.y = 140;
        this.openingContainer.addChild(titleText);


        // Create text for the instructions
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 20,
            fill: 'white',
        });
        const instructionsText = new PIXI.Text('Your goal in this game is to contain the sharks with your net. Be ' +
            'careful not to wait too long or forget to lay new nets, as the sharks will eat their way out and escape. ' +
            'You must also avoid and protect the Octopuses at the same time! If a shark eats one, chaos ensues and the ' +
            'shark who ate the Octopus will come after you. As you progress in the game, the sharks become more ' +
            'numerous and faster, and there are more Octopuses to protect. To keep them contained and protect the ' +
            'Octopuses, you will need to lay more nets. Be aware that surrounded sharks can get agitated and break ' +
            'out, so keep an eye on them!', textStyle);
        instructionsText.anchor.set(0.5);
        instructionsText.x = this.canvasWidth / 2;
        instructionsText.y = 270;
        instructionsText.style.wordWrap = true;
        instructionsText.style.wordWrapWidth = rectWidth - 50;
        this.openingContainer.addChild(instructionsText);

        const textStyleRed = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 20,
            fill: 'red',
        });

        const pressEnter = new PIXI.Text('PRESS "ENTER" TO START', textStyleRed);
        pressEnter.anchor.set(0.5);
        pressEnter.x = this.canvasWidth / 2;
        pressEnter.y = 560;
        pressEnter.style.wordWrap = true;
        pressEnter.style.wordWrapWidth = rectWidth - 50;
        this.openingContainer.addChild(pressEnter);

        const newGame = new PIXI.Text('PRESS "N" FOR NEW GAME', textStyleRed);
        newGame.anchor.set(0.5);
        newGame.x = this.canvasWidth / 2;
        newGame.y = 530;
        newGame.style.wordWrap = true;
        newGame.style.wordWrapWidth = rectWidth - 50;
        this.openingContainer.addChild(newGame);

        const keys = new PIXI.Text('"P" PAUSES GAME  -   "M" MUTES MUSIC ', textStyle);
        keys.anchor.set(0.5);
        keys.x = this.canvasWidth / 2;
        keys.y = 490;
        keys.style.wordWrap = true;
        keys.style.wordWrapWidth = rectWidth - 50;
        this.openingContainer.addChild(keys);

        const controls1 = new PIXI.Text('CONTROL WITH JOYSTICK OR "A" - UP, "Z" - DOWN', textStyle);
        controls1.anchor.set(0.5);
        controls1.x = this.canvasWidth / 2;
        controls1.y = 410;
        controls1.style.wordWrap = true;
        controls1.style.wordWrapWidth = rectWidth - 50;
        this.openingContainer.addChild(controls1);

        const controls2 = new PIXI.Text('LEFT ARROW OR COMMA   -   RIGHT ARROW OR FULL STOP', textStyle);
        controls2.anchor.set(0.5);
        controls2.x = this.canvasWidth / 2;
        controls2.y = 450;
        controls2.style.wordWrap = true;
        controls2.style.wordWrapWidth = rectWidth - 50;
        this.openingContainer.addChild(controls2);

        return this.openingContainer;
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
        crashText.y = 230;
        this.nextLevelContainer.addChild(crashText);

        // Create the "Click 'Enter' to continue" text
        const nextLevelStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 30,
            fill: 'white',
        });

        const scoreText = new PIXI.Text('TOTAL SCORE:', this.scoreStyle);
        scoreText.anchor.set(0.5);
        scoreText.x = this.canvasWidth / 2;
        scoreText.y = 330;
        this.nextLevelContainer.addChild(scoreText);

        this.score.anchor.set(0.5);
        this.score.x = (this.canvasWidth / 2) + 100;
        this.score.y = 330;
        this.nextLevelContainer.addChild(this.score);

        const bonusScoreText = new PIXI.Text('Backtracking bonus:', this.scoreStyle);
        bonusScoreText.anchor.set(0.7);
        bonusScoreText.x = this.canvasWidth / 2;
        bonusScoreText.y = 300;
        this.nextLevelContainer.addChild(bonusScoreText);

        this.bonusScore.anchor.set(0.5);
        this.bonusScore.x = (this.canvasWidth / 2) + 100;
        this.bonusScore.y = 296;
        this.nextLevelContainer.addChild(this.bonusScore);

        const bonusMeaningStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 16,
            fill: 'white',
        });

        const bonusMeaning = new PIXI.Text('(The less times you backtracked the better)', bonusMeaningStyle);
        bonusMeaning.anchor.set(0.5);
        bonusMeaning.x = this.canvasWidth / 2;
        bonusMeaning.y = 355;
        this.nextLevelContainer.addChild(bonusMeaning);



        const nextLevelText = new PIXI.Text('Press "Enter" for next level', nextLevelStyle);
        nextLevelText.anchor.set(0.5);
        nextLevelText.x = this.canvasWidth / 2;
        nextLevelText.y = 400;
        this.nextLevelContainer.addChild(nextLevelText);

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