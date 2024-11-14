const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to match the browser window
function resizeCanvas() {
    canvas.width = window.innerWidth;  
    canvas.height = window.innerHeight;  
}

// Resize when the page loads
resizeCanvas();

// Canvas background in black
function drawBackground() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Adjust canvas size when the window is resized
window.addEventListener('resize', () => {
    resizeCanvas(); 
});

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2; // Center the paddle
const paddleSpeed = 7;
let rightPressed = false;
let leftPressed = false;

// Ball properties
const ballRadius = 8;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeed = 4;
let ballDX = ballSpeed * (Math.random() * 2 - 1);  // Random horizontal direction
let ballDY = -ballSpeed;  // Start moving up

// Brick properties
const brickRowCount = 8;
const brickColumnCount = 16;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Brick colors (from bottom to top)
const brickColors = ["red", "red", "orange", "orange", "green", "green", "yellow", "yellow"];

// Create bricks array
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: brickColors[r] }; // Assign color based on row
    }
}

// Game state flags
let gameOver = false;
let gameWon = false;
let score = 0; // Player's score
let highestScore = localStorage.getItem('highestScore') || 0; // Load highest score from localStorage

// Draw the paddle with a red color and shaded border
function drawPaddle() {
    // Paddle fill (now red)
    ctx.fillStyle = 'red';
    ctx.fillRect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
    
    // Paddle border shading (dark red for the shadow effect)
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'darkred';
    ctx.strokeRect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
}

// Draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// Draw the bricks with shading
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) { // Only draw bricks that are still active
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                // Fill the brick
                ctx.fillStyle = bricks[c][r].color;
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);

                // Add border for shading effect
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'dark' + bricks[c][r].color;  // Darker shade of the brick color
                ctx.strokeRect(brickX, brickY, brickWidth, brickHeight);
            }
        }
    }
}

// Draw the "GAME OVER" message
function drawGameOver() {
    ctx.font = '48px Arial'; // Set font size and family
    ctx.fillStyle = 'red'; // Color of the text
    ctx.textAlign = 'center'; // Horizontally center the text
    ctx.textBaseline = 'middle'; // Vertically center the text
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2); // Draw text in the center
}

// Draw the "YOU WIN!" message
function drawYouWin() {
    ctx.font = '48px Arial'; // Set font size and family
    ctx.fillStyle = 'green'; // Color of the text
    ctx.textAlign = 'center'; // Horizontally center the text
    ctx.textBaseline = 'middle'; // Vertically center the text
    ctx.shadowColor = 'yellow'; // Add shadow color for a nice effect
    ctx.shadowBlur = 5; // Shadow blur for better aesthetics
    ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2); // Draw text in the center
}

// Draw the current score and highest score
function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Score: ' + score, 8, 20); // Current score at top left
    ctx.fillText('Highest Score: ' + highestScore, canvas.width - 150, 20); // Highest score at top right
}

// Check if all bricks are destroyed
function checkWinCondition() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) { // If any brick is still active, return false
                return false;
            }
        }
    }
    return true; // All bricks destroyed
}

// Update game objects and check for collisions
function updateGame() {
    if (gameOver) {
        drawGameOver();
        return; // Stop the game loop
    }

    if (gameWon) {
        drawYouWin();
        return; // Stop the game loop
    }

    // Move the paddle
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

    // Move the ball
    ballX += ballDX;
    ballY += ballDY;

    // Ball collision with side walls
    if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) {
        ballDX = -ballDX;
    }
    // Ball collision with top wall
    if (ballY - ballRadius < 0) {
        ballDY = -ballDY;
    }

    // Ball collision with paddle
    if (ballY + ballRadius > canvas.height - paddleHeight - 10 &&
        ballX > paddleX && ballX < paddleX + paddleWidth) {
        ballDY = -ballDY;
    }

    // Ball goes off bottom (game over condition)
    if (ballY + ballRadius > canvas.height) {
        gameOver = true; // Trigger the game over state
    }

    // Check for brick collisions and increase score
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                if (
                    ballX > brick.x &&
                    ballX < brick.x + brickWidth &&
                    ballY > brick.y &&
                    ballY < brick.y + brickHeight
                ) {
                    ballDY = -ballDY;
                    brick.status = 0; // Set the brick to be "broken"
                    score++; // Increase score by 1 for destroyed brick
                }
            }
        }
    }

    // Check if all bricks are destroyed and trigger the win condition
    if (checkWinCondition()) {
        gameWon = true; // Trigger the win state
    }

    // Update highest score if the current score is higher
    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('highestScore', highestScore); // Save the new highest score in localStorage
    }

    // Clear the canvas and redraw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing
    drawBackground();
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();

    requestAnimationFrame(updateGame); // Keep the game loop running
}

// Handle keyboard input for paddle movement
document.addEventListener('keydown', (event) => {
    if (event.key === 'Right' || event.key === 'ArrowRight') {
        rightPressed = true;
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === ' ' && (gameOver || gameWon)) {
        location.reload(); // Reload the page when the game is over or won
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Right' || event.key === 'ArrowRight') {
        rightPressed = false;
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
        leftPressed = false;
    }
});

// Start the game loop
updateGame();
