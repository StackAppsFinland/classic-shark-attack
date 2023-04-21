import ImageLoader from './imageLoader.js';
import Score from './score.js';
import levels from './levels.js';
import Shark from "./shark.js";

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
    const gridSize = 28;
    const gridCountX = 30;
    const gridCountY = 22;
    const images = imageLoader;
    const currentScore = new Score();
    let specialEffects = [];
    let testModeCounter = 0;
    let playerSpeed = 1.35;
    let isGameReady = true;
    let isPaused = false;
    const blockSize = 20;

    const netGrid = new Array(gridCountX).fill(null).map(() => new Array(gridCountY).fill(null));

    const keysPressed = {
        a: false,
        z: false,
        ',': false,
        '.': false,
    };


// Create a PixiJS Application
    const app = new PIXI.Application({
        width:  gridCountX * gridSize,
        height: (gridCountY + 1) * gridSize,
        backgroundColor: 0x3030FF
    });

    gsap.registerPlugin(PixiPlugin);

    //currentScore.loadGameData();
    handleInput()
// Add after app created
    const canvasWidth = app.screen.width;
    const canvasHeight = app.screen.height;
    drawScoreText();
    const scoreDisplay = drawScores();

    const sharks = [];

// Add the application view to the HTML body
    document.body.appendChild(app.view);

    //const staticParts = drawStaticParts();
    // Define the game loop
    function gameLoop() {
        if (isPaused) return

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
        }

        requestAnimationFrame(gameLoop);
    }

    function getCurrentLevel() {
        let gameLevel = levels.find(level => level.id === currentScore.level);
        if (!gameLevel) gameLevel = levels.find(level => level.id === 1);
        return gameLevel;
    }

    function startGame() {
        // createBuildings();
        // panels.hideNextLevelPanel();
        // panels.hideBeginGameContainer();
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

    const player = createPlayer(0, 0);

    const netContainer = new PIXI.Container();
    const playerContainer = new PIXI.Container();
    const sharkContainer = new PIXI.Container();
    playerContainer.addChild(player)
    app.stage.addChild(netContainer);
    app.stage.addChild(playerContainer);
    app.stage.addChild(sharkContainer);


    let speed = 0.9;
    for (let i = 0; i < 8; i++) {
        const shark = new Shark(netGrid, imageLoader, player, gridCountX, gridCountY, speed);
        speed += 0.1;
        sharkContainer.addChild(shark.sharkSprite);
        sharks.push(shark);
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

let previousDirection = "0000";
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
            netGrid[x][y] = { sprite, imageId: imageId };

            if (direction === "0100") previousDirection = "0001"
            if (direction === "0001") previousDirection = "0100"
            if (direction === "1000") previousDirection = "0010"
            if (direction === "0010") previousDirection = "1000"

            for(const shark in sharks) {
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

    let currentGridX = 0;
    let currentGridY = 0;
    let isMoving = false;

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
        }

        gsap.to(player, {
            x:  20 + (currentGridX * gridSize),
            y:  18 + (currentGridY * gridSize),
            rotation: player.rotation + PIXI.DEG_TO_RAD * 10,
            duration: 0.10,
            onComplete: () => {
                isMoving = false;
            },
        });
    }

    function handleInput() {
        window.addEventListener('keydown', (event) => {
            if (!isGameReady) return;
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
        levelText.x = 320;
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
        levelValue.x = 392;
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

    function resizeStage() {
        const padding = 50;
        const targetHeight = window.innerHeight - 2 * padding;
        const aspectRatio =  (4 + gridSize * gridCountX) / ((gridCountY + 1) * gridSize);
        const targetWidth = targetHeight * aspectRatio;

        app.renderer.resize(targetWidth + 20, targetHeight + 20);

        const scaleX = targetWidth / (4 + gridSize * gridCountX);
        const scaleY = targetHeight / ((gridCountY + 1) * gridSize);

        app.stage.scale.set(scaleX, scaleY);
    }

    resizeStage();
    window.addEventListener('resize', resizeStage);
    gameLoop();
}




