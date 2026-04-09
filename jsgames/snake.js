// størrelse på hver rute i spillet (25px)
let blockSize = 25;

// antall rader og kolonner på brettet
let rows = 20;
let cols = 20;

// variabler for canvas og tegneverktøy
let board;
let context;


// ----------------------
// SCORE SYSTEM
// ----------------------

// nåværende score
let score = 0;

// beste score (record)
let highScore = 0;


// ----------------------
// SNAKE (SLANGEN)
// ----------------------

// startposisjon til slangehodet
let snakeX = blockSize * 5;
let snakeY = blockSize * 5;

// hastighet / retning til slangen
let velocityX = 0;
let velocityY = 0;

// array som lagrer kroppsdeler til slangen
let snakeBody = [];


// ----------------------
// MAT
// ----------------------

// posisjon til maten
let foodX;
let foodY;


// ----------------------
// GAME STATE
// ----------------------

// sjekker om spillet er slutt
let gameOver = false;


// ----------------------
// START SPILLET
// ----------------------

window.onload = function() {

    // finner canvas elementet i HTML
    board = document.getElementById("board");

    // setter høyden på canvas
    board.height = rows * blockSize;

    // setter bredden på canvas
    board.width = cols * blockSize;

    // lager et 2D tegneområde
    context = board.getContext("2d");

    // plasser mat tilfeldig på brettet
    placeFood();

    // lytter etter tastatur (piltaster)
    document.addEventListener("keyup", changeDirection);

    // kjører update funksjonen 10 ganger per sekund
    setInterval(update, 1000/10);
}


// ----------------------
// GAME LOOP
// ----------------------

function update() {

    // hvis spillet er over stopp funksjonen
    if (gameOver) {
        return;
    }

    // tegner svart bakgrunn
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);


    // ----------------------
    // VIS SCORE
    // ----------------------

    context.fillStyle = "white";
    context.font = "20px Arial";

    context.fillText("Score: " + score, 10, 25);
    context.fillText("Record: " + highScore, 10, 50);


    // ----------------------
    // TEGN MAT
    // ----------------------

    context.fillStyle = "red";
    context.fillRect(foodX, foodY, blockSize, blockSize);


    // ----------------------
    // SJEKK OM SLANGEN SPISER MAT
    // ----------------------

    if (snakeX == foodX && snakeY == foodY) {

        // legg til en ny kroppsdel
        snakeBody.push([foodX, foodY]);

        // øk score
        score++;

        // oppdater record
        if (score > highScore) {
            highScore = score;
        }

        // plasser ny mat
        placeFood();
    }


    // ----------------------
    // FLYTT SLANGENS KROPP
    // ----------------------

    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
        
    }

    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }


    // ----------------------
    // FLYTT SLANGEHODET
    // ----------------------

    context.fillStyle = "lime";

    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;

    context.fillRect(snakeX, snakeY, blockSize, blockSize);


    // ----------------------
    // TEGN SLANGEKROPPEN
    // ----------------------

    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(
            snakeBody[i][0],
            snakeBody[i][1],
            blockSize,
            blockSize
        );
    }


    // ----------------------
    // GAME OVER - VEGGER
    // ----------------------

    if (snakeX < 0 || snakeX >= cols * blockSize ||
        snakeY < 0 || snakeY >= rows * blockSize) {

        endGame();
    }


    // ----------------------
    // GAME OVER - TREFFE SEG SELV
    // ----------------------

    for (let i = 0; i < snakeBody.length; i++) {

        if (snakeX == snakeBody[i][0] &&
            snakeY == snakeBody[i][1]) {

            endGame();
        }
    }
}


// ----------------------
// GAME OVER FUNKSJON
// ----------------------

function endGame() {

    gameOver = true;

    alert("Game Over");

    // restart spillet
    score = 0;
    snakeBody = [];

    snakeX = blockSize * 5;
    snakeY = blockSize * 5;

    velocityX = 0;
    velocityY = 0;

    gameOver = false;

    placeFood();
}


// ----------------------
// ENDRE RETNING
// ----------------------

function changeDirection(e) {

    // opp
    if ((e.code == "ArrowUp" || e.code == "KeyW") && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    }

    // ned
    else if ((e.code == "ArrowDown" || e.code == "KeyS") && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    }

    // venstre
    else if ((e.code == "ArrowLeft" || e.code == "KeyA") && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    }

    // høyre
    else if ((e.code == "ArrowRight" || e.code == "KeyD") && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}



// ----------------------
// PLASSER MAT TILFELDIG
// ----------------------

function placeFood() {

    foodX = Math.floor(Math.random() * cols) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;
}
