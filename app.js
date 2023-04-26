import ImageLoader from './imageLoader.js';
import Panels from './panels.js';
import Score from './score.js';
import levels from './levels.js';
import Shark from "./shark.js";
import WaterSplashEffect from "./waterSplashEffect.js";
import ProgressBar from "./progressBar.js";
import Octopus from "./octopus.js";
import BrightnessFlash from "./brightnessFlash.js";

WebFont.load({
    custom: {
        families: ['space-font'],
        urls: ['SHPinscher-Regular.otf']
    },
    active: function () {
        console.log("All sound files loaded")
        const onImagesLoaded = () => {
            console.log('All images have been loaded.');
            sharkAttack(imageLoader);
        };
        const imageLoader = new ImageLoader(onImagesLoaded);
    }
});

function sharkAttack(imageLoader) {
    const playerSplash = new Howl({
        src: ['sounds/splash.mp3'],
        volume: 1.0
    });

    const tada = new Howl({
        src: ['sounds/tada.mp3'],
        volume: 1.0
    });


    const chomp = new Howl({
        src: ['sounds/chomp.wav'],
        volume: 0.3
    });

    const reelNoise = new Howl({
        src: ['sounds/reel.wav'],
        loop: true,
        volume: 0.5
    });

    const music = new Howl({
        src: ['./sounds/music.mp3'],
        loop: true,
        volume: 0.1, // Set the volume to a low level (0.1)
    });

    music.play();

    const INITIALIZE_GAME = 0;
    const START_PANEL = 1;
    const GAME_RUNNING = 2;
    const NEXT_LEVEL = 3;
    const PLAYER_DEAD = 4;
    const RETRY_LEVEL = 5;

    const gridSize = 28;
    const gridCountX = 30;
    const gridCountY = 22;
    const currentScore = new Score();
    let gameMode = INITIALIZE_GAME;
    let isPaused = false;
    const blockSize = 20;
    let netGrid = new Array(gridCountX).fill(null).map(() => new Array(gridCountY).fill(null));
    const keysPressed = {
        a: false,
        z: false,
        ',': false,
        '.': false,
    };
    let muteMusic = false;
    let previousDirection = "0000";
    let currentGridX = 0;
    let currentGridY = 0;
    let isMoving = false;
    const app = new PIXI.Application({
        width: gridCountX * gridSize,
        height: (gridCountY + 1) * gridSize,
        backgroundColor: 0x3030FF
    });

    gsap.registerPlugin(PixiPlugin);
    currentScore.loadGameData();
    let currentLevel = getCurrentLevel();
    handleInput()
    drawScoreText();
    const scoreDisplay = drawScores();
    // Add the application view to the HTML body
    document.body.appendChild(app.view);

    // Create containers
    const netContainer = new PIXI.Container();
    const netEatenContainer = new PIXI.Container();
    const playerContainer = new PIXI.Container();
    const sharkContainer = new PIXI.Container();
    const octopusContainer = new PIXI.Container();
    const waterSplashContainer = new PIXI.Container();
    let player = createPlayer();
    let screenFlash = new BrightnessFlash(app)

    playerContainer.addChild(player)
    app.stage.addChild(netContainer);
    app.stage.addChild(netEatenContainer);
    app.stage.addChild(playerContainer);
    app.stage.addChild(sharkContainer);
    app.stage.addChild(octopusContainer);
    app.stage.addChild(waterSplashContainer);
    const progressBar = new ProgressBar(400, 634);
    app.stage.addChild(progressBar.container);
    const panels = new Panels(app.screen.width, app.screen.height);
    app.stage.addChild(panels.getBeginGameContainer(currentScore.level));
    app.stage.addChild(panels.getRetryContainer());
    app.stage.addChild(panels.getNextLevelContainer());
    app.stage.addChild(panels.getPauseContainer());
    app.stage.addChild(panels.getGetReadyContainer())
    performanceTestReady();

    // Define the game loop
    function gameLoop() {
        if (isPaused) return

        if (gameMode !== GAME_RUNNING && gameMode !== PLAYER_DEAD) return;

        if (gameMode !== PLAYER_DEAD ) {
            if (!isMoving) {
                if (keysPressed['a']) {
                    if (previousDirection === "0000") previousDirection = "0010"
                    movePlayer('1000');
                } else if (keysPressed['z']) {
                    if (previousDirection === "0000") previousDirection = "1000"
                    movePlayer('0010');
                } else if (keysPressed[',']) {
                    if (previousDirection === "0000") previousDirection = "0100"
                    movePlayer('0001');
                } else if (keysPressed['.']) {
                    if (previousDirection === "0000") previousDirection = "0001"
                    movePlayer('0100');
                }
            }

            for (const shark of sharkContainer.children) {
                shark.instance.update();

                if (checkCollision(player, shark)) {
                    if (waterSplashContainer.children.length === 0) {
                        const waterSplashEffect = new WaterSplashEffect(player.x, player.y, 3000, 600, 1.0);
                        playerSplash.play();
                        waterSplashContainer.addChild(waterSplashEffect.container);
                        gameMode = PLAYER_DEAD;
                    }
                }
            }
            updateProgressBar();
        }

        updateSpecialEffects();
        requestAnimationFrame(gameLoop);
    }

    function delayStartGameLoop() {
        isPaused = true;
        setTimeout(() => {
            isPaused = false;
            gameLoop()
        }, 3000); // Pause for 3 seconds (3000 milliseconds)
    }

    function destroyChildren(container) {
        for (let i=container.children.length-1;i>=0;i--) {
            if (container.children[i].instance) {
                container.children[i].instance.destroy();
                container.children[i].instance = null;
            }

            container.children[i].destroy({children:true});
        }

        container.removeChildren();
    }

    function resetGame() {
        destroyChildren(sharkContainer)
        destroyChildren(octopusContainer);
        destroyChildren(netContainer);

        netGrid = new Array(gridCountX).fill(null).map(() => new Array(gridCountY).fill(null));
        currentLevel = getCurrentLevel();
        updateScoreDisplay();
        let speed = currentLevel.speed;
        for (let i = 0; i < currentLevel.sharks; i++) {
            const shark = new Shark(netGrid, netEatenContainer, imageLoader, player, gridCountX, gridCountY, currentLevel.speed, chomp, currentLevel.eatNetAfter);
            speed += 0.05;
            sharkContainer.addChild(shark.sharkSprite);
        }

        for (let i = 0; i < currentLevel.octopuses; i++) {
            let gridX, gridY, isOccupied;

            // Generate random grid positions until an unoccupied one is found
            do {
                gridX = Math.floor(Math.random() * (gridCountX - 1));
                gridY = Math.floor(Math.random() * (gridCountY - 1));
                isOccupied = false;

                for (let j = 0; j < octopusContainer.children.length; j++) {
                    const existingOctopus = octopusContainer.children[j];
                    if (existingOctopus.x === 7 + (gridX * 28 + 14) && existingOctopus.y === 5 + (gridY * 28 + 14)) {
                        isOccupied = true;
                        break;
                    }
                }
            } while (isOccupied);

            const octopus = new Octopus(imageLoader, gridX, gridY);
            octopusContainer.addChild(octopus.octopusSprite);
        }

        setInitialPlayerPosition();

        for (let key in keysPressed) {
            keysPressed[key] = false;
        }
    }

    function updateSpecialEffects() {
        for (let i = netEatenContainer.children.length - 1; i >= 0; i--) {
            const effect = netEatenContainer.children[i].instance;
            effect.update();

            if (effect.isFinished) {
                netEatenContainer.children[i].destroy()
                netEatenContainer.removeChild(netEatenContainer.children[i]);
            }
        }

        for (let i = waterSplashContainer.children.length - 1; i >= 0; i--) {
            const effect = waterSplashContainer.children[i].instance;
            effect.update();

            if (effect.isFinished) {
                waterSplashContainer.children[i].destroy()
                waterSplashContainer.removeChild(netEatenContainer.children[i]);
                music.pause()
                if (gameMode === PLAYER_DEAD) {
                    gameMode = RETRY_LEVEL;
                    panels.showRetryPanel()
                }
            }
        }
    }

    function checkCollision(player, shark) {
        const dx = player.x - shark.x;
        const dy = player.y - shark.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (player.width / 2) + (shark.width / 2);

        return distance < minDistance;
    }

    function getCurrentLevel() {
        let gameLevel = levels.find(level => level.id === currentScore.level);
        if (!gameLevel) gameLevel = levels.find(level => level.id === 1);
        return gameLevel;
    }

    function createPlayer() {
        const texture = imageLoader.getImage("player2");
        const playerSprite = new PIXI.Sprite(texture);
        playerSprite.anchor.set(0.5, 0.5);
        playerSprite.width = 24;
        playerSprite.height = 24;
        playerSprite.x = -30;
        playerSprite.y = -30;
        return playerSprite;
    }

    function setInitialPlayerPosition() {
        const placement = getSafeInitialPlayerPosition();
        player.x = placement.x;
        player.y = placement.y;
    }

    function getSafeInitialPlayerPosition() {
        let safePosition = false;
        let playerPosition = { x: 0, y: 0 };

        while (!safePosition) {
            const gridX = Math.floor(Math.random() * (gridCountX - 1));
            const gridY = Math.floor(Math.random() * (gridCountY - 1));
            currentGridX = gridX
            currentGridY = gridY
            playerPosition.x =  7 + (gridX * gridSize + gridSize / 2);
            playerPosition.y = 7 + (gridY * gridSize + gridSize / 2);

            let safeFromSharks = true;
            sharkContainer.children.forEach(shark => {
                const dx = Math.abs(shark.x - playerPosition.x);
                const dy = Math.abs(shark.y - playerPosition.y);
                if (dx <= 2 * gridSize && dy <= 2 * gridSize) {
                    safeFromSharks = false;
                }
            });

            let safeFromOctopuses = true;
            octopusContainer.children.forEach(octopus => {
                const dx = Math.abs(octopus.x - playerPosition.x);
                const dy = Math.abs(octopus.y - playerPosition.y);
                if (dx <= 2 * gridSize && dy <= 2 * gridSize) {
                    safeFromOctopuses = false;
                }
            });

            if (safeFromSharks && safeFromOctopuses) {
                safePosition = true;
            }
        }

        return playerPosition;
    }

    const orStrings = (a, b) => {
        let result = "";

        for (let i = 0; i < a.length; i++) {
            if (a[i] === "1" || b[i] === "1") {
                result += "1";
            } else {
                result += "0";
            }
        }

        if (result === "1000") result = "1010"
        if (result === "0010") result = "1010"
        if (result === "0100") result = "0101"
        if (result === "0001") result = "0101"

        return result;
    };

    function performanceTestReady() {
        panels.showBeginGamePanel();
        gameMode = START_PANEL;
    }

    function drawTrailImage(x, y, direction) {
        if (netGrid[x][y] === null) {
            const imageId = orStrings(previousDirection, direction)
            const texture = imageLoader.getImage("net-" + imageId);
            const sprite = new PIXI.Sprite(texture);
            sprite.x = x * gridSize + (gridSize - blockSize) / 2 + 3;
            sprite.y = y * gridSize + (gridSize - blockSize) / 2 + 2;
            sprite.width = 28;
            sprite.height = 28;
            netContainer.addChild(sprite);
            netGrid[x][y] = {sprite, imageId: imageId};

            if (direction === "0100") previousDirection = "0001"
            if (direction === "0001") previousDirection = "0100"
            if (direction === "1000") previousDirection = "0010"
            if (direction === "0010") previousDirection = "1000"

            sharkContainer.children.forEach(shark => {
                shark.instance.setNetEatingDelay(currentLevel.eatNetAfter);
            });
        } else {
            const currentImageId = netGrid[x][y].imageId;
            if (direction === "0100") previousDirection = "0101"
            if (direction === "0001") previousDirection = "0101"
            if (direction === "1000") previousDirection = "1010"
            if (direction === "0010") previousDirection = "1000"

            const imageId = orStrings(currentImageId, direction)
            if (imageId !== currentImageId) {
                netGrid[x][y].sprite.texture = imageLoader.getImage("net-" + imageId);
                netGrid[x][y].imageId = imageId;
            }
        }
    }

    function movePlayer(direction) {
        if (isMoving) return;

        let newX = currentGridX;
        let newY = currentGridY;

        if (direction === '1000') {
            newY -= 1;
        } else if (direction === '0010') {
            newY += 1;
        } else if (direction === '0001') {
            newX -= 1;
        } else if (direction === '0100') {
            newX += 1;
        }

        // Check if the new position is within the grid boundaries
        if (newX < 0 || newX >= gridCountX || newY < 0 || newY >= gridCountY) {
            return;
        }

        isMoving = true;

        drawTrailImage(currentGridX, currentGridY, direction);

        currentGridX = newX;
        currentGridY = newY;

        currentGridX = Math.max(0, Math.min(gridCountX - 1, currentGridX));
        currentGridY = Math.max(0, Math.min(gridCountY - 1, currentGridY));

        if (netGrid[currentGridX][currentGridY] !== null) {
            let oppositeDir = "0000"
            if (direction === "0100") oppositeDir = "0001"
            if (direction === "0001") oppositeDir = "0100"
            if (direction === "1000") oppositeDir = "0010"
            if (direction === "0010") oppositeDir = "1000"
            const imageId = orStrings(oppositeDir, netGrid[currentGridX][currentGridY].imageId)
            netGrid[currentGridX][currentGridY].sprite.texture = imageLoader.getImage("net-" + imageId);
            netGrid[currentGridX][currentGridY].imageId = imageId;
        } else {
            currentScore.increment(1)
            updateScoreDisplay()
        }

        gsap.to(player, {
            x: 20 + (currentGridX * gridSize),
            y: 20 + (currentGridY * gridSize),
            rotation: player.rotation + PIXI.DEG_TO_RAD * 10,
            duration: 0.10,
            onComplete: () => {
                isMoving = false;
            },
        });
    }

    function handleInput() {
        window.addEventListener('keydown', (event) => {
                if (gameMode === INITIALIZE_GAME) return;

                if (gameMode === RETRY_LEVEL) {
                    if (event.code === 'KeyR') {
                        resetGame();
                        gameMode = GAME_RUNNING;
                        panels.hideRetryPanel();
                        panels.showGetReadyPanel();
                        delayStartGameLoop();
                    }

                    return;
                }

                if (gameMode === NEXT_LEVEL) {
                    if (event.code === 'Enter') {
                        currentScore.level = currentScore.level + 1;
                        if (currentScore.level > levels.length - 1) {
                            currentScore.level = 1;
                        }

                        resetGame();
                        gameMode = GAME_RUNNING;
                        panels.hideNextLevelPanel();
                        panels.showGetReadyPanel();
                        delayStartGameLoop();
                    }

                    return;
                }

                if (gameMode <= START_PANEL) {
                    if (event.code === 'Enter') {
                        currentScore.level = currentScore.level + 1;
                        if (currentScore.level > levels.length - 1) {
                            currentScore.level = 1;
                        }

                        gameMode = GAME_RUNNING;
                        panels.hideBeginGameContainer();
                        resetGame();
                        panels.showGetReadyPanel();
                        delayStartGameLoop();
                    }

                    if (event.code === 'KeyN' && currentScore.level > 1) {
                        currentScore.reset();
                        currentScore.level = 1;
                        resetGame();
                        panels.hideBeginGameContainer();
                        panels.showGetReadyPanel();
                        delayStartGameLoop();
                    }
                    return;
                }

                if (gameMode === GAME_RUNNING) {
                    if (event.code === "KeyP") {
                        if (isPaused) {
                            panels.hidePauseContainer();
                            isPaused = false;
                            Howler.mute(false);
                        } else {
                            panels.showPauseContainer();
                            isPaused = true;
                            Howler.mute(true);
                        }
                    }

                    if (event.code === "KeyM") {
                        muteMusic = !muteMusic;

                        if (muteMusic) {
                            music.pause();
                        } else {
                            music.play();
                        }
                    }

                    if (['a', 'z', ',', '.'].includes(event.key)) {
                        keysPressed[event.key] = true;

                        if (isPaused) return;

                        if (!reelNoise.playing())
                            reelNoise.play();
                        event.preventDefault();
                    }
                }
            }
        );

        window.addEventListener('keyup', (event) => {
            if (gameMode <= START_PANEL || gameMode === NEXT_LEVEL) return;

            if (isPaused) return;

            if (['a', 'z', ',', '.'].includes(event.key)) {
                keysPressed[event.key] = false;
                reelNoise.pause();
                event.preventDefault();
            }
        });
    }

    function drawScoreText() {
        const scoreStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 20,
            fill: 'Grey',
            dropShadow: true,
            dropShadowColor: 0xe0e0e0,
            dropShadowDistance: 1.5,
        });

        const scoreText = new PIXI.Text("SCORE:", scoreStyle);
        scoreText.x = 10;
        scoreText.y = 636;

        const levelText = new PIXI.Text("LEVEL:", scoreStyle);
        levelText.x = 230;
        levelText.y = 636;

        const highScoreText = new PIXI.Text("HIGH SCORE:", scoreStyle);
        highScoreText.x = 620;
        highScoreText.y = 636;

        app.stage.addChild(scoreText, levelText, highScoreText);
    }

    function drawScores() {
        const scoreStyle = new PIXI.TextStyle({
            fontFamily: 'space-font',
            fontSize: 22,
            fill: 'darkred',
            dropShadow: true,
            dropShadowColor: 0xeeeeee,
            dropShadowDistance: 1,
        });

        const scoreValue = new PIXI.Text("" + currentScore.score, scoreStyle);
        scoreValue.x = 86;
        scoreValue.y = 634;

        const levelValue = new PIXI.Text("" + currentScore.level, scoreStyle);
        levelValue.x = 302;
        levelValue.y = 634;

        const highScoreValue = new PIXI.Text("" + currentScore.highScore, scoreStyle);
        highScoreValue.x = 743;
        highScoreValue.y = 634;

        app.stage.addChild(scoreValue, levelValue, highScoreValue);
        return {scoreValue, levelValue, highScoreValue};
    }

    function updateScoreDisplay() {
        scoreDisplay.scoreValue.text = "" + currentScore.score;
        scoreDisplay.levelValue.text = "" + currentScore.level;
        scoreDisplay.highScoreValue.text = "" + currentScore.highScore;
    }

    function updateProgressBar() {
        let nonNullCount = 0;
        let totalCount = netGrid.length * netGrid[0].length;

        for (let x = 0; x < netGrid.length; x++) {
            for (let y = 0; y < netGrid[x].length; y++) {
                if (netGrid[x][y] !== null) {
                    nonNullCount++;
                }
            }
        }

        let actualPercentage = (nonNullCount / totalCount) * 100;
        let progressBarPercentage = (actualPercentage / currentLevel.coverage) * 100;
        progressBarPercentage = Math.min(Math.max(progressBarPercentage, 0), 100);

        if (progressBarPercentage === 100) {
            screenFlash.flash()
            tada.play();
            gameMode = NEXT_LEVEL;
            panels.showNextLevelPanel();
            reelNoise.stop();
            return;
        }
        progressBar.setPercentage(progressBarPercentage)
    }

    function resizeStage() {
        const padding = 50;
        const targetHeight = window.innerHeight - 2 * padding;
        const aspectRatio = (4 + gridSize * gridCountX) / ((gridCountY + 1) * gridSize);
        const targetWidth = targetHeight * aspectRatio;

        app.renderer.resize(targetWidth + 20, targetHeight + 20);

        const scaleX = targetWidth / (4 + gridSize * gridCountX);
        const scaleY = targetHeight / ((gridCountY + 1) * gridSize);

        app.stage.scale.set(scaleX, scaleY);
    }

    resizeStage();
    window.addEventListener('resize', resizeStage);
}




