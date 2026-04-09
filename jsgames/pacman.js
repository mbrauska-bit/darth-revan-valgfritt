// 🟢 Pac-Man Game - Cleaner Version

// Canvas & Board Settings
let board;
let themeToggleButton;
let rowCount = 21;
let columnCount = 19;
let tileSize = 25;
let boardWidth = columnCount * tileSize;
let boardHeight = rowCount * tileSize;
let context;

const THEME_STORAGE_KEY = "pacman-theme";
let isDarkMode = true;
const themeColors = {
    dark: {
        boardBackground: "#000000",
        food: "#b66bff",
        hud: "#ffffff",
        gameOver: "#ff4d4d",
        gameOverSubtext: "#ffffff"
    },
    light: {
        boardBackground: "#fff6dd",
        food: "#6f2dbd",
        hud: "#1f1f1f",
        gameOver: "#c92a2a",
        gameOverSubtext: "#1f1f1f"
    }
};

// Images
let wallImg, blueGhostImg, orangeGhostImg, pinkGhostImg, redGhostImg;
let pacmanUpImg, pacmanDownImg, pacmanRightImg, pacmanLeftImg;

// Game Map
const tileMap = [
"XXXXXXXXXXXXXXXXXXX",
"X        X        X",
"X XX XXX X XXX XX X",
"X                 X",
"X XX X XXXXX X XX X",
"X    X       X    X",
"XXXX XXXX XXXX XXXX",
"OOOX X       X XOOO",
"XXXX X XXrXX X XXXX",
"O       bpo       O",
"XXXX X XXXXX X XXXX",
"OOOX X       X XOOO",
"XXXX X XXXXX X XXXX",
"X        X        X",
"X XX XXX X XXX XX X",
"X  X     P     X  X",
"XX X X XXXXX X X XX",
"X    X   X   X    X",
"X XXXXXX X XXXXXX X",
"X                 X",
"XXXXXXXXXXXXXXXXXXX"
];

// Game Objects
const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;

// Game State
let score = 0;
let lives = 3;
let gameOver = false;

// Helper Functions
function getFoodX(x) { return x + tileSize / 2 - 2; }
function getFoodY(y) { return y + tileSize / 2 - 2; }

function isWall(tile) { return tile === "X"; }

function isGhost(tile) {
    return tile === "b" || tile === "o" || tile === "p" || tile === "r";
}

function createGhost(tile, x, y) {
    if (tile === "b") return new Block(blueGhostImg, x, y, tileSize, tileSize);
    if (tile === "o") return new Block(orangeGhostImg, x, y, tileSize, tileSize);
    if (tile === "p") return new Block(pinkGhostImg, x, y, tileSize, tileSize);
    if (tile === "r") return new Block(redGhostImg, x, y, tileSize, tileSize);
    return null;
}

// Load all images
function loadImages() {
    wallImg = new Image(); wallImg.src = "../imagegames/wall.png";
    
    blueGhostImg = new Image();   blueGhostImg.src = "../imagegames/blueGhost.png";
    orangeGhostImg = new Image(); orangeGhostImg.src = "../imagegames/orangeGhost.png";
    pinkGhostImg = new Image();   pinkGhostImg.src = "../imagegames/pinkGhost.png";
    redGhostImg = new Image();    redGhostImg.src = "../imagegames/redGhost.png";
    
    pacmanUpImg = new Image();    pacmanUpImg.src = "../imagegames/pacmanUp.png";
    pacmanDownImg = new Image();  pacmanDownImg.src = "../imagegames/pacmanDown.png";
    pacmanLeftImg = new Image();  pacmanLeftImg.src = "../imagegames/pacmanLeft.png";
    pacmanRightImg = new Image(); pacmanRightImg.src = "../imagegames/pacmanRight.png";
}

// Load Map - Creates walls, ghosts, pacman and food
function loadMap() {
    walls.clear();
    ghosts.clear();
    foods.clear();

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            const tile = tileMap[r][c];
            const x = c * tileSize;
            const y = r * tileSize;

            if (isWall(tile)) {
                walls.add(new Block(wallImg, x, y, tileSize, tileSize));
            } 
            else if (isGhost(tile)) {
                ghosts.add(createGhost(tile, x, y));
            } 
            else if (tile === "P") {
                pacman = new Block(pacmanRightImg, x, y, tileSize, tileSize);
            } 
            else if (tile === " ") {
                foods.add(new Block(null, getFoodX(x), getFoodY(y), 4, 4));
            }
        }
    }
}

// Update Pacman image based on direction
function updatePacmanImage() {
    if (pacman.direction === "U") pacman.image = pacmanUpImg;
    else if (pacman.direction === "D") pacman.image = pacmanDownImg;
    else if (pacman.direction === "L") pacman.image = pacmanLeftImg;
    else if (pacman.direction === "R") pacman.image = pacmanRightImg;
}

// Simple move back when hitting wall
function moveBack(character) {
    character.x -= character.velocityX;
    character.y -= character.velocityY;
}

function resetPacmanPosition() {
    pacman.x = pacman.startX;
    pacman.y = pacman.startY;
}

function getCurrentTheme() {
    return isDarkMode ? themeColors.dark : themeColors.light;
}

function updateThemeToggleLabel() {
    if (themeToggleButton) {
        themeToggleButton.textContent = isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode";
    }
}

function applyTheme() {
    document.body.classList.toggle("light-mode", !isDarkMode);
    updateThemeToggleLabel();
    if (context && pacman) {
        draw();
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
    applyTheme();
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    isDarkMode = savedTheme !== "light";
}

// ====================== MAIN GAME ======================

window.onload = function() {
    board = document.getElementById("board");
    themeToggleButton = document.getElementById("themeToggle");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    loadThemePreference();
    applyTheme();
    themeToggleButton.addEventListener("click", toggleTheme);

    loadImages();
    loadMap();

    // Give ghosts initial random direction
    for (let ghost of ghosts) {
        ghost.chooseRandomDirection();
    }

    update();                    // Start game loop
    document.addEventListener("keyup", movePacman);
};

// Game Loop
function update() {
    if (!gameOver) {
        move();
    }
    draw();
    setTimeout(update, 50);     // ~20 FPS
}

// Draw everything on screen
function draw() {
    const currentTheme = getCurrentTheme();

    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = currentTheme.boardBackground;
    context.fillRect(0, 0, board.width, board.height);

    if (gameOver) {
        context.fillStyle = currentTheme.gameOver;
        context.font = "30px sans-serif";
        context.fillText("GAME OVER", 80, 250);
        context.fillStyle = currentTheme.gameOverSubtext;
        context.font = "16px sans-serif";
        context.fillText("Press R to Restart", 90, 300);
        context.fillText("Score: " + score, 130, 340);
        return;
    }

    // Draw Walls
    for (let wall of walls) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }

    // Draw Food
    context.fillStyle = currentTheme.food;
    for (let food of foods) {
        context.fillRect(food.x, food.y, food.width, food.height);
    }

    // Draw Ghosts
    for (let ghost of ghosts) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }

    // Draw Pacman
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);

    // Draw Score & Lives
    context.fillStyle = currentTheme.hud;
    context.font = "16px sans-serif";
    context.fillText("Score: " + score, 5, 20);
    context.fillText("Lives: " + lives, 5, 40);
}

// Main movement logic
function move() {
    // Move Pacman
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    // Check wall collision for Pacman
    for (let wall of walls) {
        if (checkCollision(pacman, wall)) {
            moveBack(pacman);
            break;
        }
    }

    // Eat food
    for (let food of foods) {
        if (checkCollision(pacman, food)) {
            foods.delete(food);
            score += 10;
            break;
        }
    }

    // Move Ghosts
    for (let ghost of ghosts) {
        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;

        let hitWall = false;

        for (let wall of walls) {
            if (checkCollision(ghost, wall) || 
                ghost.x < 0 || 
                ghost.x + ghost.width > boardWidth) {
                moveBack(ghost);
                hitWall = true;
                break;
            }
        }

        // Change direction if hit wall or randomly
        if (hitWall || Math.random() < 0.1) {
            ghost.chooseRandomDirection();
        }

        // Ghost catches Pacman
        if (checkCollision(pacman, ghost)) {
            lives--;
            resetPacmanPosition();
            if (lives <= 0) gameOver = true;
        }
    }
}

// Keyboard Controls
function movePacman(e) {
    if (gameOver && e.code === "KeyR") {
        restartGame();
        return;
    }

    if (e.code === "ArrowUp" || e.code === "KeyW") pacman.updateDirection("U");
    else if (e.code === "ArrowDown" || e.code === "KeyS") pacman.updateDirection("D");
    else if (e.code === "ArrowLeft" || e.code === "KeyA") pacman.updateDirection("L");
    else if (e.code === "ArrowRight" || e.code === "KeyD") pacman.updateDirection("R");

    updatePacmanImage();
}

// Collision Detection
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Restart Game
function restartGame() {
    score = 0;
    lives = 3;
    gameOver = false;

    resetPacmanPosition();
    pacman.direction = "R";
    pacman.updateVelocity();
    updatePacmanImage();

    for (let ghost of ghosts) {
        ghost.x = ghost.startX;
        ghost.y = ghost.startY;
        ghost.chooseRandomDirection();
    }

    foods.clear();
    loadMap();   // Reload food
}

// ====================== Block Class ======================
class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.startX = x;
        this.startY = y;
        this.direction = "R";
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updateDirection(direction) {
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();

        this.x += this.velocityX;
        this.y += this.velocityY;

        for (let wall of walls) {
            if (checkCollision(this, wall)) {
                moveBack(this);
                this.direction = prevDirection;
                this.updateVelocity();
                return;
            }
        }
    }

    updateVelocity() {
        if (this.direction === "U") { this.velocityX = 0; this.velocityY = -tileSize/4; }
        else if (this.direction === "D") { this.velocityX = 0; this.velocityY = tileSize/4; }
        else if (this.direction === "L") { this.velocityX = -tileSize/4; this.velocityY = 0; }
        else if (this.direction === "R") { this.velocityX = tileSize/4; this.velocityY = 0; }
    }

    chooseRandomDirection() {
        const possibleDirections = [];
        
        for (const dir of ["U", "D", "L", "R"]) {
            let vx = 0, vy = 0;
            if (dir === "U") vy = -tileSize/4;
            else if (dir === "D") vy = tileSize/4;
            else if (dir === "L") vx = -tileSize/4;
            else if (dir === "R") vx = tileSize/4;

            let newX = this.x + vx;
            let newY = this.y + vy;

            let collision = false;
            for (let wall of walls) {
                if (newX < wall.x + wall.width &&
                    newX + this.width > wall.x &&
                    newY < wall.y + wall.height &&
                    newY + this.height > wall.y) {
                    collision = true;
                    break;
                }
            }
            if (!collision) possibleDirections.push(dir);
        }
        if (possibleDirections.length > 0) {
            const newDir = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            this.updateDirection(newDir);
        }
    }
}
