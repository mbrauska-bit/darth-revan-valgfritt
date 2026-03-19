// 🟢 Pac-Man Game Full Dynamic Ghosts

// Canvas & board
let board;
let rowCount = 21;
let columnCount = 19;
let tileSize = 32;
let boardWidth = columnCount * tileSize;
let boardHeight = rowCount * tileSize;
let context;

// Images
let blueGhostImg, orangeGhostImg, pinkGhostImg, redGhostImg;
let pacmanUpImg, pacmanDownImg, pacmanRightImg, pacmanLeftImg;
let wallImg;

// Game map
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

// Sets for objects
const walls = new Set();
const foods = new Set();
const ghosts = new Set();

// Game state
let pacman;
const directions = ["U","D","L","R"];
let score = 0;
let lives = 3;
let gameOver = false;

// 🟢 When page is loaded
window.onload = function(){
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    loadImages();
    loadMap();

    // Random direction for ghosts
    for(let ghost of ghosts){
        ghost.chooseRandomDirection();
    }

    update(); // Start game loop
    document.addEventListener("keyup", movePacman); // Keyboard input
};

// 🟢 Load images
function loadImages(){
    wallImg = new Image(); wallImg.src = "../imagegames/wall.png";
    blueGhostImg = new Image(); blueGhostImg.src = "../imagegames/blueGhost.png";
    orangeGhostImg = new Image(); orangeGhostImg.src = "../imagegames/orangeGhost.png";
    pinkGhostImg = new Image(); pinkGhostImg.src = "../imagegames/pinkGhost.png";
    redGhostImg = new Image(); redGhostImg.src = "../imagegames/redGhost.png";
    pacmanDownImg = new Image(); pacmanDownImg.src = "../imagegames/pacmanDown.png";
    pacmanUpImg = new Image(); pacmanUpImg.src = "../imagegames/pacmanUp.png";
    pacmanLeftImg = new Image(); pacmanLeftImg.src = "../imagegames/pacmanLeft.png";
    pacmanRightImg = new Image(); pacmanRightImg.src = "../imagegames/pacmanRight.png";
}

// 🟢 Load map and create objects
function loadMap(){
    for(let r=0; r<rowCount; r++){
        for(let c=0; c<columnCount; c++){
            const tile = tileMap[r][c];
            const x = c*tileSize;
            const y = r*tileSize;

            if(tile=="X") walls.add(new Block(wallImg,x,y,tileSize,tileSize));
            else if(tile=="b") ghosts.add(new Block(blueGhostImg,x,y,tileSize,tileSize));
            else if(tile=="o") ghosts.add(new Block(orangeGhostImg,x,y,tileSize,tileSize));
            else if(tile=="p") ghosts.add(new Block(pinkGhostImg,x,y,tileSize,tileSize));
            else if(tile=="r") ghosts.add(new Block(redGhostImg,x,y,tileSize,tileSize));
            else if(tile=="P") pacman = new Block(pacmanRightImg,x,y,tileSize,tileSize);
            else if(tile==" ") foods.add(new Block(null, x + tileSize/2 - 2, y + tileSize/2 - 2, 4, 4));
        }
    }
}

// 🟢 Game loop
function update(){
    if(!gameOver){
        move(); // Only move objects if game is not over
    }
    draw();
    setTimeout(update,50); // 20 FPS
}

// 🟢 Draw everything
function draw(){
    if(gameOver){
        context.clearRect(0,0,board.width,board.height);
        context.fillStyle = "red";
        context.font = "30px sans-serif";
        context.fillText("GAME OVER", 80, 250);
        context.fillStyle = "black";
        context.font = "16px sans-serif";
        context.fillText("Press R to Restart", 90, 300);
        context.fillText("Score: " + score, 130, 340);
        return;
    }

    context.clearRect(0,0,board.width,board.height);

    for(let wall of walls) context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);

    context.fillStyle = "purple";
    for(let food of foods) context.fillRect(food.x, food.y, food.width, food.height);

    for(let ghost of ghosts) context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);

    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);

    context.fillStyle = "white";
    context.font = "16px sans-serif";
    context.fillText("Score: " + score, 5, 20);
    context.fillText("Lives: " + lives, 5, 40);
}

// 🟢 Move pacman and ghosts
function move(){
    // Move Pacman
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    // Wall collision for Pacman
    for(let wall of walls){
        if(checkCollision(pacman, wall)){
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    // Eat food
    let foodEaten = null;
    for(let food of foods){
        if(checkCollision(pacman, food)){
            foodEaten = food;
            score += 10;
            break;
        }
    }
    if(foodEaten) foods.delete(foodEaten);

    // Move ghosts
    for(let ghost of ghosts){
        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;

        let hitWall = false;
        for(let wall of walls){
            if(checkCollision(ghost, wall) || ghost.x < 0 || ghost.x + ghost.width > boardWidth){
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                hitWall = true;
                break;
            }
        }

        // Velg ny retning hvis vegg ble truffet eller tilfeldig (10% sjanse)
        if(hitWall || Math.random() < 0.1){
            ghost.chooseRandomDirection();
        }

        // Pacman vs ghost collision
        if(checkCollision(pacman, ghost)){
            lives--;
            pacman.x = pacman.startX;
            pacman.y = pacman.startY;
            if(lives <= 0) gameOver = true;
        }
    }
}

// 🟢 Keyboard input
function movePacman(e){
    if(gameOver && e.code=="KeyR"){ restartGame(); return; }

    if(e.code=="ArrowUp"||e.code=="KeyW") pacman.updateDirection("U");
    else if(e.code=="ArrowDown"||e.code=="KeyS") pacman.updateDirection("D");
    else if(e.code=="ArrowLeft"||e.code=="KeyA") pacman.updateDirection("L");
    else if(e.code=="ArrowRight"||e.code=="KeyD") pacman.updateDirection("R");

    if(pacman.direction=="U") pacman.image=pacmanUpImg;
    else if(pacman.direction=="D") pacman.image=pacmanDownImg;
    else if(pacman.direction=="L") pacman.image=pacmanLeftImg;
    else if(pacman.direction=="R") pacman.image=pacmanRightImg;
}

// 🟢 Collision detection
function checkCollision(obj1,obj2){
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// 🟢 Restart game
function restartGame(){
    score = 0;
    lives = 3;
    gameOver = false;

    pacman.x = pacman.startX;
    pacman.y = pacman.startY;
    pacman.direction = "R";
    pacman.updateVelocity();

    for(let ghost of ghosts){
        ghost.x = ghost.startX;
        ghost.y = ghost.startY;
        ghost.chooseRandomDirection();
    }

    foods.clear();
    loadMap(); // reload food
}

// 🟢 Block class (Pacman, Ghost, Wall, Food)
class Block{
    constructor(image,x,y,width,height){
        this.image=image;
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.startX=x;
        this.startY=y;
        this.direction="R";
        this.velocityX=0;
        this.velocityY=0;
    }

    updateDirection(direction){
        const prevDirection=this.direction;
        this.direction=direction;
        this.updateVelocity();

        this.x += this.velocityX;
        this.y += this.velocityY;

        for(let wall of walls){
            if(checkCollision(this, wall)){
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection;
                this.updateVelocity();
                return;
            }
        }
    }

    updateVelocity(){
        if(this.direction=="U"){ this.velocityX=0; this.velocityY=-tileSize/4; }
        else if(this.direction=="D"){ this.velocityX=0; this.velocityY=tileSize/4; }
        else if(this.direction=="L"){ this.velocityX=-tileSize/4; this.velocityY=0; }
        else if(this.direction=="R"){ this.velocityX=tileSize/4; this.velocityY=0; }
    }

    // 🟢 Choose a random valid direction for ghosts
    chooseRandomDirection(){
        const possibleDirections = [];
        for(const dir of directions){
            let vx = 0, vy = 0;
            if(dir=="U") vy = -tileSize/4;
            else if(dir=="D") vy = tileSize/4;
            else if(dir=="L") vx = -tileSize/4;
            else if(dir=="R") vx = tileSize/4;

            let newX = this.x + vx;
            let newY = this.y + vy;

            let collision = false;
            for(let wall of walls){
                if(newX < wall.x + wall.width &&
                   newX + this.width > wall.x &&
                   newY < wall.y + wall.height &&
                   newY + this.height > wall.y){
                    collision = true;
                    break;
                }
            }

            if(!collision) possibleDirections.push(dir);
        }

        if(possibleDirections.length > 0){
            const newDir = possibleDirections[Math.floor(Math.random()*possibleDirections.length)];
            this.updateDirection(newDir);
        }
    }
}