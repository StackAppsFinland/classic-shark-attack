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
    if (!('getGamepads' in navigator)) {
        alert('Your browser does not support the Gamepad API');
    }

    window.addEventListener('gamepadconnected', (event) => {
        console.log('Gamepad connected:', event.gamepad);
    });

    window.addEventListener('gamepaddisconnected', (event) => {
        console.log('Gamepad disconnected:', event.gamepad);
    });

    const playerSplash = new Howl({
        src: ['sounds/splash.mp3'],
        volume: 1.0
    });

    const tada = new Howl({
        src: ['sounds/tada.mp3'],
        volume: 0.5
    });


    const chomp = new Howl({
        src: ['sounds/chomp.wav'],
        volume: 0.3
    });

    const chomp2 = new Howl({
        src: ['sounds/chomp2.wav'],
        volume: 1.0
    });

    const reelNoise = new Howl({
        src: ['sounds/reel.wav'],
        loop: true,
        volume: 0.25
    });

    const tracks = ['sounds/track1.mp3', 'sounds/track2.mp3', 'sounds/track3.mp3', 'sounds/track4.mp3'];

// Initialize a counter to keep track of the current track
    let currentTrack = 0;

    // Create a new Howl instance for each track
    const music = tracks.map(track => new Howl({
        src: [track],
        loop: false,
        autoplay: false,
        preload: true,
        volume: 0.4
    }));

    music.forEach((m, i) => {
        m.on('end', () => {
            currentTrack = (i + 1) % music.length;
            music[currentTrack].play();
        });
    });

    const INITIALIZE_GAME = 0;
    const START_PANEL = 1;
    const GAME_RUNNING = 2;
    const NEXT_LEVEL = 3;
    const PLAYER_DEAD = 4;
    const RETRY_LEVEL = 5;

    let initializePerformance = true;
    let times = 60;
    let speedMultiplier = 0;
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
    let backtrackingMoves = 0;
    let totalNumberOfMoves = 0;
    let isMoving = false;
    const app = new PIXI.Application({
        width: gridCountX * gridSize,
        height: (gridCountY + 1) * gridSize,
        backgroundAlpha: 0
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
    const progressBar = new ProgressBar(400, 631);
    app.stage.addChild(progressBar.container);
    const panels = new Panels(app.screen.width, app.screen.height);
    app.stage.addChild(panels.getOpeningContainer(currentScore.level));
    app.stage.addChild(panels.getRetryContainer());
    app.stage.addChild(panels.getNextLevelContainer());
    app.stage.addChild(panels.getPauseContainer());
    app.stage.addChild(panels.getGetReadyContainer())
    performanceTestReady();

    function triggerKeyDownEvent(keyCode, key) {
        const event = new KeyboardEvent('keydown', { code: keyCode, key: key });
        window.dispatchEvent(event);
    }

    function triggerKeyUpEvent(keyCode, key) {
        const event = new KeyboardEvent('keyup', { code: keyCode, key: key });
        window.dispatchEvent(event);
    }

    let prevXAxisState = 'center';
    let prevYAxisState = 'center';

    // Define a threshold to detect stick movement
    const threshold = 0.5;

    function pollGamepad() {
        const gamepads = navigator.getGamepads();

        for (const gamepad of gamepads) {
            if (gamepad) {
                // Handle stick axes (assuming axes 0 and 1)
                const xAxis = gamepad.axes[0];
                const yAxis = gamepad.axes[1];

                if (xAxis < -threshold) {
                    triggerKeyDownEvent('ArrowLeft', 'ArrowLeft');
                    prevXAxisState = 'left';
                } else if (xAxis > threshold) {
                    triggerKeyDownEvent('ArrowRight', 'ArrowRight');
                    prevXAxisState = 'right';
                } else {
                    if (prevXAxisState === 'left') {
                        triggerKeyUpEvent('ArrowLeft', 'ArrowLeft');
                    } else if (prevXAxisState === 'right') {
                        triggerKeyUpEvent('ArrowRight', 'ArrowRight');
                    }
                    prevXAxisState = 'center';
                }

                if (yAxis < -threshold) {
                    triggerKeyDownEvent('KeyA', 'a');
                    prevYAxisState = 'up';
                } else if (yAxis > threshold) {
                    triggerKeyDownEvent('KeyZ', 'z');
                    prevYAxisState = 'down';
                } else {
                    if (prevYAxisState === 'up') {
                        triggerKeyUpEvent('KeyA', 'a');
                    } else if (prevYAxisState === 'down') {
                        triggerKeyUpEvent('KeyZ', 'z');
                    }
                    prevYAxisState = 'center';
                }

                // Handle buttons (example: trigger 'Enter' when the first button is pressed)
                if (gamepad.buttons[0].pressed) {
                    triggerKeyDownEvent('Enter', 'Enter');
                }

                // Handle other buttons similarly
            }
        }
    }

    const speedConstant = 121;
    app.ticker.add((delta) => {
        if (initializePerformance) {
            speedMultiplier = speedConstant * delta * (1 / 60);
            times--;
            if (times <= 0) initializePerformance = false;
        }

        pollGamepad();

        if (isPaused) {
            return;
        }

        if (gameMode !== GAME_RUNNING && gameMode !== PLAYER_DEAD) return;

        if (gameMode !== PLAYER_DEAD ) {
            if (!isMoving) {
                if (keysPressed['a']) {
                    if (previousDirection === "0000") previousDirection = "0010"
                    movePlayer('1000');
                } else if (keysPressed['z']) {
                    if (previousDirection === "0000") previousDirection = "1000"
                    movePlayer('0010');
                } else if (keysPressed[',']  || keysPressed['ArrowLeft']) {
                    if (previousDirection === "0000") previousDirection = "0100"
                    movePlayer('0001');
                } else if (keysPressed['.'] || keysPressed['ArrowRight']) {
                    if (previousDirection === "0000") previousDirection = "0001"
                    movePlayer('0100');
                }
            }

            for (const shark of sharkContainer.children) {
                shark.instance.update();
                if (checkSharkToPlayerCollision(player, shark)) {
                    if (waterSplashContainer.children.length === 0) {
                        const waterSplashEffect = new WaterSplashEffect(player.x, player.y, 3000, 600, speedMultiplier);
                        playerSplash.play();
                        waterSplashContainer.addChild(waterSplashEffect.container);
                        gameMode = PLAYER_DEAD;
                        music[currentTrack].pause();
                    }
                }
            }

            for (const octopus of octopusContainer.children) {
                if (checkPlayerToOctopusCollision(player, octopus)) {
                    const waterSplashEffect = new WaterSplashEffect(player.x, player.y, 3000, 600, 1.0);
                    playerSplash.play();
                    waterSplashContainer.addChild(waterSplashEffect.container);
                    gameMode = PLAYER_DEAD;
                    music[currentTrack].pause();
                }
            }
            updateProgressBar();
        }

        updateSpecialEffects();
    })

    function delayStartGameLoop() {
        isPaused = true;
        setTimeout(() => {
            isPaused = false;
            music[currentTrack].play();
            app.ticker.start()
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
        currentScore.resetScore();
        updateScoreDisplay();

        backtrackingMoves = 0;
        totalNumberOfMoves = 0;

        let speed = currentLevel.speed * speedMultiplier;
        for (let i = 0; i < currentLevel.sharks; i++) {
            const shark = new Shark(netGrid, netEatenContainer, octopusContainer, imageLoader, player,
                gridCountX, gridCountY, speed, chomp, chomp2, currentLevel.eatNetAfter);
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
                    if (existingOctopus.x === 6 + (gridX * 28 + 14) && existingOctopus.y === 6 + (gridY * 28 + 14)) {
                        isOccupied = true;
                        break;
                    }
                }
            } while (isOccupied);

            const octopus = new Octopus(imageLoader, gridX, gridY);
            octopusContainer.addChild(octopus.octopusSprite);
            const sprite = octopus.octopusSprite;
            netGrid[gridX][gridY] = {sprite, isNet: false};
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
                music[currentTrack].pause();
                isPaused = true;
                if (gameMode === PLAYER_DEAD) {
                    panels.showRetryPanel(() => {
                        gameMode = RETRY_LEVEL;
                    })
                }
            }
        }
    }

    function checkSharkToPlayerCollision(player, shark) {
        const dx = player.x - shark.x;
        const dy = player.y - shark.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (player.width / 2) + (shark.width / 2);
        return distance < minDistance;
    }

    function checkPlayerToOctopusCollision(player, shark) {
        const dx = player.x - shark.x;
        const dy = player.y - shark.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (player.width / 2) + (shark.width / 2) - 4.0;
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
        panels.showOpeningPanel(() => gameMode = START_PANEL);
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
            netGrid[x][y] = {sprite, imageId: imageId, isNet: true};

            if (direction === "0100") previousDirection = "0001"
            if (direction === "0001") previousDirection = "0100"
            if (direction === "1000") previousDirection = "0010"
            if (direction === "0010") previousDirection = "1000"

            sharkContainer.children.forEach(shark => {
                shark.instance.setNetEatingDelay(currentLevel.eatNetAfter);
            });
            totalNumberOfMoves++;
        } else {
            if (!netGrid[x][y].isNet) return;
            const currentImageId = netGrid[x][y].imageId;
            if (direction === "0100") previousDirection = "0101"
            if (direction === "0001") previousDirection = "0101"
            if (direction === "1000") previousDirection = "1010"
            if (direction === "0010") previousDirection = "1000"

            backtrackingMoves++;
            totalNumberOfMoves++;
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

        if (netGrid[currentGridX][currentGridY] !== null && netGrid[currentGridX][currentGridY].isNet) {
            let oppositeDir = "0000"
            if (direction === "0100") oppositeDir = "0001"
            if (direction === "0001") oppositeDir = "0100"
            if (direction === "1000") oppositeDir = "0010"
            if (direction === "0010") oppositeDir = "1000"
            const imageId = orStrings(oppositeDir, netGrid[currentGridX][currentGridY].imageId)
            netGrid[currentGridX][currentGridY].sprite.texture = imageLoader.getImage("net-" + imageId);
            netGrid[currentGridX][currentGridY].imageId = imageId;
        } else {
            currentScore.increment(2)
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
                        panels.hideRetryPanel(() => {
                            panels.showGetReadyPanel();
                            delayStartGameLoop();
                        });
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
                        panels.hideNextLevelPanel(() => {
                            panels.showGetReadyPanel();
                            delayStartGameLoop();
                        });
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
                        panels.hideOpeningContainer(() => {
                            resetGame();
                            panels.showGetReadyPanel();
                            delayStartGameLoop();
                        });
                    }

                    if (event.code === 'KeyN') {
                        currentScore.reset();
                        currentScore.level = 1;

                        panels.hideOpeningContainer(() => {
                            resetGame();
                            panels.showGetReadyPanel();
                            delayStartGameLoop();
                        });
                    }
                    return;
                }

                if (gameMode === GAME_RUNNING) {
                    if (event.code === "KeyP") {

                        if (isPaused) {
                            panels.hidePauseContainer();
                            isPaused = false;
                            Howler.mute(false);
                            app.ticker.start();
                        } else {
                            panels.showPauseContainer()
                            isPaused = true;
                            Howler.mute(true);
                            app.ticker.stop();
                        }
                    }

                    if (isPaused) return;

                    if (event.code === "KeyM") {
                        muteMusic = !muteMusic;

                        if (muteMusic) {
                            music[currentTrack].pause();
                        } else {
                            music[currentTrack].play();
                        }
                    }

                    if (['a', 'z', ',', '.', 'ArrowLeft', 'ArrowRight'].includes(event.key) && !isPaused) {
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

            if (['a', 'z', ',', '.','ArrowLeft', 'ArrowRight'].includes(event.key)) {
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
        scoreText.y = 632;

        const levelText = new PIXI.Text("LEVEL:", scoreStyle);
        levelText.x = 230;
        levelText.y = 632;

        const highScoreText = new PIXI.Text("HIGH SCORE:", scoreStyle);
        highScoreText.x = 620;
        highScoreText.y = 632;

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
        scoreValue.y = 631;

        const levelValue = new PIXI.Text("" + currentScore.level, scoreStyle);
        levelValue.x = 302;
        levelValue.y = 631;

        const highScoreValue = new PIXI.Text("" + currentScore.highScore, scoreStyle);
        highScoreValue.x = 743;
        highScoreValue.y = 631;

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
                if (netGrid[x][y] !== null && netGrid[x][y].isNet) {
                    nonNullCount++;
                }
            }
        }

        let actualPercentage = (nonNullCount / totalCount) * 100;
        let progressBarPercentage = (actualPercentage / currentLevel.coverage) * 100;
        progressBarPercentage = Math.min(Math.max(progressBarPercentage, 0), 100);

        if (progressBarPercentage === 100) {
            if (isPaused) return;
            isPaused = true;
            music[currentTrack].pause();
            screenFlash.flash()
            tada.play();
            reelNoise.stop();
            const bonusScore = Math.round((totalNumberOfMoves - backtrackingMoves) / totalNumberOfMoves * 100);
            currentScore.increment(bonusScore)
            currentScore.saveGameData();
            panels.setScoreInfo(currentScore.score, bonusScore);
            panels.showNextLevelPanel(() => gameMode = NEXT_LEVEL);
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




