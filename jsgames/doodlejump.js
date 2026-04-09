// ====================== DOODLE JUMP ======================

// Board
let board;
let context;
const boardWidth = 360;
const boardHeight = 560;

// Doodler
const doodlerWidth = 46;
const doodlerHeight = 46;
const doodlerStartX = boardWidth / 2 - doodlerWidth / 2;
const doodlerStartY = boardHeight * 7 / 8 - doodlerHeight;

let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img: null,
    x: doodlerStartX,
    y: doodlerStartY,
    width: doodlerWidth,
    height: doodlerHeight
};

// Physics
let velocityX = 0;
let velocityY = 0;
const jumpPower = -14;
const gravity = 1;

// Platforms
const platformWidth = 75;
const platformHeight = 18;
let platformImg;
let platforms = [];

// Game state
let score = 0;
let gameOver = false;

// ====================== SETUP ======================

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    loadImages();
    resetGame();

    document.addEventListener("keydown", moveDoodler);
    requestAnimationFrame(update);
};

function loadImages() {
    doodlerRightImg = new Image();
    doodlerRightImg.src = "../imagegames/doodler-right%20(2).png";

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "../imagegames/doodler-left%20(2).png";

    platformImg = new Image();
    platformImg.src = "../imagegames/platform.png";

    doodler.img = doodlerRightImg;
}

// ====================== GAME LOOP ======================

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        drawGameOver();
        return;
    }

    moveDoodlerPhysics();
    movePlatforms();
    checkPlatformCollisions();
    removeOldPlatforms();
    draw();
}

// ====================== DRAW ======================

function draw() {
    context.clearRect(0, 0, board.width, board.height);

    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    for (let platform of platforms) {
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText("Score: " + score, 5, 20);
}

function drawGameOver() {
    context.clearRect(0, 0, board.width, board.height);

    context.fillStyle = "red";
    context.font = "30px sans-serif";
    context.fillText("GAME OVER", 80, 250);

    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText("Press R to Restart", 90, 300);
    context.fillText("Score: " + score, 130, 340);
}

// ====================== MOVEMENT ======================

function moveDoodlerPhysics() {
    doodler.x += velocityX;

    if (doodler.x > boardWidth) doodler.x = 0;
    if (doodler.x + doodler.width < 0) doodler.x = boardWidth;

    velocityY += gravity;
    doodler.y += velocityY;

    if (doodler.y > boardHeight) {
        gameOver = true;
    }
}

function movePlatforms() {
    const cameraLine = boardHeight / 3;

    if (doodler.y < cameraLine) {
        const moveDown = cameraLine - doodler.y;
        doodler.y = cameraLine;

        for (let platform of platforms) {
            platform.y += moveDown;
        }
    }
}

function checkPlatformCollisions() {
    for (let platform of platforms) {
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = jumpPower;

            if (!platform.scored) {
                score += 10;
                platform.scored = true;
            }
        }
    }
}

// ====================== PLATFORMS ======================

function createPlatform(x, y) {
    return {
        img: platformImg,
        x: x,
        y: y,
        width: platformWidth,
        height: platformHeight,
        scored: false
    };
}

function placePlatforms() {
    platforms = [];

    platforms.push(createPlatform(platformWidth / 2, boardHeight - 50));

    for (let i = 0; i < 6; i++) {
        const randomX = Math.floor(Math.random() * (boardWidth - platformWidth));
        const platformY = boardHeight - 75 * i - 150;
        platforms.push(createPlatform(randomX, platformY));
    }
}

function addNewPlatform() {
    const randomX = Math.floor(Math.random() * (boardWidth - platformWidth));
    platforms.push(createPlatform(randomX, -platformHeight));
}

function removeOldPlatforms() {
    while (platforms.length > 0 && platforms[0].y >= boardHeight) {
        platforms.shift();
        addNewPlatform();
    }
}

// ====================== CONTROLS ======================

function moveDoodler(e) {
    if (gameOver && e.code === "KeyR") {
        resetGame();
        return;
    }

    if (e.code === "ArrowRight" || e.code === "KeyD") {
        velocityX = 4;
        doodler.img = doodlerRightImg;
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    }
}

// ====================== HELPERS ======================

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function resetGame() {
    gameOver = false;
    score = 0;

    doodler.x = doodlerStartX;
    doodler.y = doodlerStartY;
    doodler.img = doodlerRightImg;

    velocityX = 0;
    velocityY = jumpPower;

    placePlatforms();
}
