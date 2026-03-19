// -------------------
// DOODLE JUMP GAME
// -------------------

// -------------------
// Board Setup
// -------------------
let board;                   // Variabel for å holde canvas-elementet fra HTML
let boardWidth = 360;        // Bredde på spillet, i piksler
let boardHeight = 560;       // Høyde på spillet, i piksler
let context;                 // 2D-tegneområdet vi bruker for å tegne doodler, plattformer og score

// -------------------
// Doodler Setup
// -------------------
let doodlerWidth = 46;       // Bredden på doodleren (spilleren)
let doodlerHeight = 46;      // Høyden på doodleren
let doodlerX = boardWidth / 2 - doodlerWidth / 2; // Startposisjon horisontalt (midt på brettet)
let doodlerY = boardHeight * 7 / 8 - doodlerHeight; // Startposisjon vertikalt (nær bunnen)
let doodlerRightImg, doodlerLeftImg; // Variabler for doodler-bilder når den ser til høyre eller venstre

// Doodler-objekt som samler alle doodler-egenskapene
let doodler = {
    img: null,               // Nåværende bilde som vises
    x: doodlerX,             // Horisontal posisjon
    y: doodlerY,             // Vertikal posisjon
    width: doodlerWidth,     // Bredde
    height: doodlerHeight    // Høyde
};

// -------------------
// Physics (Fysikk)
// -------------------
let velocityX = 0;            // Horisontal hastighet (bevegelse til venstre/høyre)
let velocityY = 0;            // Vertikal hastighet (bevegelse opp/ned)
let initialVelocityY = -14;   // Hastigheten doodleren får når den hopper (negativ fordi oppover er mot 0)
let gravity = 1;              // Tyngdekraft som trekker doodleren ned hver frame

// -------------------
// Platforms (Plattformer)
// -------------------
let platformArray = [];       // Liste som holder alle plattformer på skjermen
let platformWidth = 75;       // Plattformenes bredde
let platformHeight = 18;      // Plattformenes høyde
let platformImg;              // Bildet som brukes for plattformene

// -------------------
// Score (Poengsum)
// -------------------
let score = 0;                // Spilleren sin poengsum, øker for hver plattform man hopper på

// -------------------
// Game Over Flag (Spill slutt)
// -------------------
let gameOver = false;         // Holder styr på om spillet er over

// -------------------
// Initialize Game (Starter spillet)
// -------------------
window.onload = function() {
    board = document.getElementById("board");  // Kobler til canvas-elementet i HTML
    board.width = boardWidth;                  // Setter bredden på canvas
    board.height = boardHeight;                // Setter høyden på canvas
    context = board.getContext("2d");         // Setter opp 2D-tegneområdet

    // Laster doodler-bilder
    doodlerRightImg = new Image();             // Lager nytt bilde-objekt
    doodlerRightImg.src = "../imagegames/doodler-right%20(2).png"; // Kilde til bildet
    doodler.img = doodlerRightImg;            // Starter med å se til høyre

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "../imagegames/doodler-left%20(2).png";

    // Laster plattformbilde
    platformImg = new Image();
    platformImg.src = "../imagegames/platform.png";

    velocityY = initialVelocityY;             // Starter med et hopp

    placePlatforms();                          // Plasserer plattformer på skjermen
    requestAnimationFrame(update);            // Starter spill-loopen

    document.addEventListener("keydown", moveDoodler); // Lytter etter tastetrykk
};

// -------------------
// Main Game Loop (Hovedløkke)
// -------------------
function update() {
    requestAnimationFrame(update); // Kaller update igjen neste frame

    // -------------------
    // Stop game if over (Game Over)
    // -------------------
    if (gameOver) {
        context.clearRect(0, 0, board.width, board.height); // Tøm skjermen

        // Tegn Game Over tekst
        context.fillStyle = "red";                // Farge på teksten
        context.font = "30px sans-serif";         // Font og størrelse
        context.fillText("GAME OVER", 80, 250);   // Tekst og posisjon

        // Tegn instruksjon for restart
        context.font = "16px sans-serif";
        context.fillText("Press R to Restart", 90, 300);

        // Tegn poengsum
        context.fillStyle = "black";
        context.fillText("Score: " + score, 130, 340);
        return; // Stopper oppdateringen
    }

    // -------------------
    // Clear screen
    // -------------------
    context.clearRect(0, 0, board.width, board.height); // Tøm hele canvas før ny frame

    // -------------------
    // Move doodler
    // -------------------
    doodler.x += velocityX;                      // Oppdater horisontal posisjon
    if (doodler.x > boardWidth) doodler.x = 0;                 // Wrap rundt høyre kant
    if (doodler.x + doodler.width < 0) doodler.x = boardWidth; // Wrap rundt venstre kant

    velocityY += gravity;                        // Påfør tyngdekraft
    doodler.y += velocityY;                      // Oppdater vertikal posisjon

    // -------------------
    // Check for game over
    // -------------------
    if (doodler.y > boardHeight) {
        gameOver = true; // Doodleren falt utenfor skjermen
    }

    // -------------------
    // Camera Logic (scrolling)
    // -------------------
    let cameraLine = boardHeight / 3;           // Når doodleren går over 1/3 av skjermen
    if (doodler.y < cameraLine) {
        let diff = cameraLine - doodler.y;      // Hvor mye vi må flytte plattformer ned
        doodler.y = cameraLine;                 // Hold doodleren på denne linjen
        for (let i = 0; i < platformArray.length; i++) {
            platformArray[i].y += diff;         // Flytt alle plattformer ned for å gi scroll-effekt
        }
    }
    // -------------------
    // Draw doodler
    // -------------------
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height); // Tegn doodler

    // -------------------
    // Draw and handle platforms
    // -------------------
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];

        // Kollisjon og hopp
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = initialVelocityY;       // Doodleren hopper opp

            // Øk score kun én gang per plattform
            if (!platform.scored) {
                score += 10;
                platform.scored = true;
            }
        }

        // Tegn plattform
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // -------------------
    // Remove off-screen platforms & add new ones
    // -------------------
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); // Fjern nederste plattform
        newPlatform();         // Legg til ny plattform øverst
    }

    // -------------------
    // Draw score
    // -------------------
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText("Score: " + score, 5, 20); // Tegn poengsum øverst til venstre
}

// -------------------
// Doodler Controls
// -------------------
function moveDoodler(e) {
    // Restart hvis Game Over og R trykkes
    if (gameOver && e.code == "KeyR") {
        restartGame();
        return;
    }

    // Beveg doodler horisontalt
    if (e.code == "ArrowRight" || e.code == "KeyD") {
        velocityX = 4;               // Flytt høyre
        doodler.img = doodlerRightImg; // Bytt bilde til høyre
    } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        velocityX = -4;              // Flytt venstre
        doodler.img = doodlerLeftImg; // Bytt bilde til venstre
    }
}

// -------------------
// Platform Generation
// -------------------
function placePlatforms() {
    platformArray = []; // Tøm gamle plattformer

    // Startplattform
    platformArray.push({
        img: platformImg,
        x: platformWidth / 2,      // Midt på brettet
        y: boardHeight - 50,       // Nær bunnen
        width: platformWidth,
        height: platformHeight,
        scored: false              // Holder styr på om poeng er gitt
    });

    // Andre plattformer tilfeldig plassert
    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * (boardWidth - platformWidth));
        platformArray.push({
            img: platformImg,
            x: randomX,
            y: boardHeight - 75 * i - 150, // Plasser vertikalt
            width: platformWidth,
            height: platformHeight,
            scored: false
        });
    }
}

// Oppretter ny plattform øverst
function newPlatform() {
    let randomX = Math.floor(Math.random() * (boardWidth - platformWidth));
    platformArray.push({
        img: platformImg,
        x: randomX,
        y: -platformHeight, // Start rett over skjermen
        width: platformWidth,
        height: platformHeight,
        scored: false
    });
}

// -------------------
// Collision Detection
// -------------------
function detectCollision(a, b) {
    // Sjekker om to rektangler overlapper
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// -------------------
// Restart Game
// -------------------
function restartGame() {
    gameOver = false;          // Reset Game Over
    score = 0;                 // Reset poeng

    // Reset doodler-posisjon og hastigheter
    doodler.x = doodlerX;
    doodler.y = doodlerY;
    velocityX = 0;
    velocityY = initialVelocityY;

    // Reset plattformer
    placePlatforms();
}
