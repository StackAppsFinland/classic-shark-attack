import ImageLoader from './imageLoader.js';
import Panels from './panels.js';
import Score from './score.js';
import levels from './levels.js';
import Shark from "./shark.js";
import WaterSplashEffect from "./waterSplashEffect.js";
import ProgressBar from "./progressBar.js";
import Octopus from "./octopus.js";

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
    const explodeSound = new Howl({
        src: ['sounds/player-explode.wav'],
        volume: 1.0
    });

    const sound = new Howl({
        src: ['./sounds/music.mp3'],
        loop: true,
        volume: 0.1, // Set the volume to a low level (0.1)
    });

    sound.play();

    const gridSize = 28;
    const gridCountX = 30;
    const gridCountY = 22;
    const currentScore = new Score();
    let gameMode = 0;
    let testModeCounter = 0;
    let playerSpeed = 1.35;
    let isPaused = false;
    const blockSize = 20;
    let netGrid = new Array(gridCountX).fill(null).map(() => new Array(gridCountY).fill(null));
    const keysPressed = {
        a: false,
        z: false,
        ',': false,
        '.': false,
    };
    const autoPause = false;
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
    const sharks = [];

    // Add the application view to the HTML body
    document.body.appendChild(app.view);

    // Create containers
    const player = createPlayer(0, 0);
    const netContainer = new PIXI.Container();
    const netEatenContainer = new PIXI.Container();
    const playerContainer = new PIXI.Container();
    const sharkContainer = new PIXI.Container();
    const octopusContainer = new PIXI.Container();
    const waterSplashContainer = new PIXI.Container();

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
    performanceTestReady();

    // Define the game loop
    function gameLoop() {
        if (isPaused) return

        if (gameMode != 2) return;

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

        for (const shark of sharks) {
            shark.update();

            if (checkCollision(player, shark.sharkSprite)) {
                if (waterSplashContainer.children.length == 0) {
                    const waterSplashEffect = new WaterSplashEffect(player.x, player.y, 3000, 600, 1.0);
                    waterSplashContainer.addChild(waterSplashEffect.container);
                }
            }
        }

        updateSpecialEffects();
        requestAnimationFrame(gameLoop);
    }

    function resetGame() {
        sharks.length = 0
        //sharkContainer.destroy({ children: true });
        sharkContainer.removeChildren();
        //netContainer.destroy({ children: true });
        netContainer.removeChildren();
        netGrid = new Array(gridCountX).fill(null).map(() => new Array(gridCountY).fill(null));
        currentLevel = getCurrentLevel()
        let speed = currentLevel.speed;
        for (let i = 0; i < currentLevel.sharks; i++) {
            const shark = new Shark(netGrid, netEatenContainer, imageLoader, player, gridCountX, gridCountY, currentLevel.speed);
            speed += 0.05;
            sharkContainer.addChild(shark.sharkSprite);
            sharks.push(shark);
        }

        for (let i = 0; i < 10; i++) {
            const octopus = new Octopus(imageLoader, gridCountX, gridCountY);
            octopusContainer.addChild(octopus.octopusSprite);
        }

        currentGridX = 0;
        currentGridY = 0;

        player.x = 20 + (currentGridX * gridSize);
        player.y = 18 + (currentGridY * gridSize);

        for (let key in keysPressed) {
            keysPressed[key] = false;
        }
    }

    function updateSpecialEffects() {
        for (let i = netEatenContainer.children.length - 1; i >= 0; i--) {
            const effect = netEatenContainer.children[i].instance;
            effect.update();

            if (effect.isFinished) {
                netEatenContainer.removeChild(effect);
            }
        }

        for (let i = waterSplashContainer.children.length - 1; i >= 0; i--) {
            const effect = waterSplashContainer.children[i].instance;
            effect.update();

            if (effect.isFinished) {
                waterSplashContainer.removeChild(effect);
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

    function createPlayer(x, y) {
        const texture = imageLoader.getImage("spool");
        const spool = new PIXI.Sprite(texture);
        spool.anchor.set(0.5, 0.5);
        spool.width = 24;
        spool.height = 24;
        spool.x = 4 + (x * gridSize + gridSize / 2);
        spool.y = 4 + (y * gridSize + gridSize / 2);
        return spool;
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
        gameMode = 1
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

            for (const shark in sharks) {
                sharks[shark].setNetEatingDelay(3000);
            }

        } else {
            const currentImageId = netGrid[x][y].imageId;
            if (direction === "0100") previousDirection = "0101"
            if (direction === "0001") previousDirection = "0101"
            if (direction === "1000") previousDirection = "1010"
            if (direction === "0010") previousDirection = "1000"

            const imageId = orStrings(currentImageId, direction)
            if (imageId !== currentImageId) {
                const texture = imageLoader.getImage("net-" + imageId);
                netGrid[x][y].sprite.texture = texture;
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
            const texture = imageLoader.getImage("net-" + imageId);
            netGrid[currentGridX][currentGridY].sprite.texture = texture;
            netGrid[currentGridX][currentGridY].imageId = imageId;
        } else {
            currentScore.increment(1)
            updateScoreDisplay()
            updateProgressBar()
        }

        gsap.to(player, {
            x: 20 + (currentGridX * gridSize),
            y: 18 + (currentGridY * gridSize),
            rotation: player.rotation + PIXI.DEG_TO_RAD * 10,
            duration: 0.10,
            onComplete: () => {
                isMoving = false;
            },
        });
    }

    function handleInput() {
        window.addEventListener('keydown', (event) => {
            if (gameMode === 0) return;

            if (gameMode == 3) {
                if (event.code === 'Enter') {
                    currentScore.level = currentScore.level + 1;
                    if (currentScore.level > levels.length - 1) {
                        currentScore.level = 1;
                    }

                    resetGame();
                    gameMode = 2;
                    panels.hideNextLevelPanel();
                    gameLoop();
                }

                return;
            }

            if (gameMode <= 1) {
                if (event.code === 'Enter') {
                    currentScore.level = currentScore.level + 1;
                    if (currentScore.level > levels.length - 1) {
                        currentScore.level = 1;
                    }

                    gameMode = 2;
                    panels.hideBeginGameContainer();
                    resetGame();
                    gameLoop();
                }

                if (event.code === 'KeyN' && currentScore.level > 1) {
                    currentScore.reset();
                    currentScore.level = 1;
                    resetGame();
                    panels.hideBeginGameContainer();
                    gameLoop();
                }
                return;
            }

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

            if (['a', 'z', ',', '.'].includes(event.key)) {
                keysPressed[event.key] = true;
                event.preventDefault();
            }
        });

        window.addEventListener('keyup', (event) => {
            if (gameMode <= 1 || gameMode == 3) return;

            if (['a', 'z', ',', '.'].includes(event.key)) {
                keysPressed[event.key] = false;
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
            gameMode = 3;
            panels.showNextLevelPanel()
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




