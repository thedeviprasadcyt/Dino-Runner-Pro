// =========================
// ELEMENTS
// =========================

const dino = document.getElementById("dino");
const gameArea = document.getElementById("gameArea");
const obstaclesContainer = document.getElementById("obstacles");
const particlesContainer = document.getElementById("particles");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const levelEl = document.getElementById("level");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const pauseOverlay = document.getElementById("pauseOverlay");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const soundBtn = document.getElementById("soundBtn");

const finalScoreEl = document.getElementById("finalScore");
const bestScoreDisplay = document.getElementById("bestScoreDisplay");

// =========================
// GAME VARIABLES
// =========================

let score = 0;
let highScore = localStorage.getItem("dinoHighScore") || 0;
let level = 1;

let gameRunning = false;
let paused = false;

let soundEnabled = true;

let gravity = 0.8;
let jumpForce = -22;
let velocityY = 0;

let isJumping = false;

let obstacleSpeed = 6;

let animationFrame;
let obstacleInterval;
let scoreInterval;
let difficultyInterval;

// Dino position
let dinoY = 0;

// =========================
// INIT
// =========================

highScoreEl.textContent = highScore;

dino.classList.add("running");

// =========================
// START GAME
// =========================

function startGame() {
    score = 0;
    level = 1;
    obstacleSpeed = 6;

    velocityY = 0;
    dinoY = 0;

    gameRunning = true;
    paused = false;

    scoreEl.textContent = score;
    levelEl.textContent = level;

    startScreen.classList.remove("active");
    gameOverScreen.classList.remove("active");

    obstaclesContainer.innerHTML = "";
    document.getElementById("mobileHint").style.display = "none";

    createObstacleLoop();
    startScoreLoop();
    startDifficultyLoop();

    gameLoop();
}

// =========================
// RESTART
// =========================

function restartGame() {
    cancelAnimationFrame(animationFrame);

    clearInterval(obstacleInterval);
    clearInterval(scoreInterval);
    clearInterval(difficultyInterval);

    startGame();
}

// =========================
// JUMP
// =========================

function jump() {

    if (!gameRunning) return;
    if (paused) return;

    if (!isJumping) {

        velocityY = jumpForce;
        isJumping = true;

        createParticles();

        playBeep(500, 0.08);
    }
}

// =========================
// PHYSICS
// =========================

function updateDino() {

    velocityY += gravity;

    dinoY -= velocityY;

    if (dinoY < 0) {
        dinoY = 0;
        velocityY = 0;
        isJumping = false;
    }

    dino.style.bottom = `${90 + dinoY}px`;
}

// =========================
// OBSTACLES
// =========================

function spawnObstacle() {

    const obstacle = document.createElement("div");

    obstacle.classList.add("obstacle");

    obstacle.style.left = gameArea.offsetWidth + "px";

    obstaclesContainer.appendChild(obstacle);
}

function createObstacleLoop() {

    obstacleInterval = setInterval(() => {

        if (!paused && gameRunning) {
            spawnObstacle();
        }

    }, randomBetween(1200, 2200));
}

function moveObstacles() {

    const obstacles =
        document.querySelectorAll(".obstacle");

    obstacles.forEach(obstacle => {

        let left =
            parseFloat(obstacle.style.left);

        left -= obstacleSpeed;

        obstacle.style.left = left + "px";

        if (left < -100) {
            obstacle.remove();
        }

        if (checkCollision(dino, obstacle)) {
            gameOver();
        }
    });
}

// =========================
// COLLISION
// =========================

function checkCollision(a, b) {

    const rect1 = a.getBoundingClientRect();
    const rect2 = b.getBoundingClientRect();

    return !(
        rect1.top > rect2.bottom ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right ||
        rect1.right < rect2.left
    );
}

// =========================
// SCORE
// =========================

function startScoreLoop() {

    scoreInterval = setInterval(() => {

        if (!paused && gameRunning) {

            score++;

            scoreEl.textContent = score;

            if (score > highScore) {

                highScore = score;

                localStorage.setItem(
                    "dinoHighScore",
                    highScore
                );

                highScoreEl.textContent =
                    highScore;
            }

            if (score % 100 === 0) {
                playBeep(900, 0.05);
            }
        }

    }, 100);
}

// =========================
// LEVELS
// =========================

function startDifficultyLoop() {

    difficultyInterval = setInterval(() => {

        if (!paused && gameRunning) {

            level++;

            obstacleSpeed += 0.8;

            levelEl.textContent = level;
        }

    }, 15000);
}

// =========================
// GAME OVER
// =========================

function gameOver() {

    gameRunning = false;

    cancelAnimationFrame(animationFrame);

    clearInterval(obstacleInterval);
    clearInterval(scoreInterval);
    clearInterval(difficultyInterval);

    finalScoreEl.textContent = score;
    bestScoreDisplay.textContent = highScore;

    document.body.classList.add("shake");

    setTimeout(() => {
        document.body.classList.remove("shake");
    }, 300);

    playBeep(150, 0.4);

    gameOverScreen.classList.add("active");
}

// =========================
// PAUSE
// =========================

function pauseGame() {

    if (!gameRunning) return;

    paused = true;

    pauseOverlay.classList.add("show");
}

function resumeGame() {

    paused = false;

    pauseOverlay.classList.remove("show");
}

// =========================
// PARTICLES
// =========================

function createParticles() {

    for (let i = 0; i < 8; i++) {

        const particle =
            document.createElement("div");

        particle.classList.add("particle");

        particle.style.left =
            dino.offsetLeft + 20 + "px";

        particle.style.bottom =
            "100px";

        particlesContainer.appendChild(
            particle
        );

        const x =
            (Math.random() - 0.5) * 80;

        const y =
            Math.random() * 60;

        particle.animate(
            [
                {
                    transform:
                        "translate(0,0)",
                    opacity: 1
                },
                {
                    transform:
                        `translate(${x}px,-${y}px)`,
                    opacity: 0
                }
            ],
            {
                duration: 600
            }
        );

        setTimeout(() => {
            particle.remove();
        }, 600);
    }
}

// =========================
// SOUND
// =========================

function playBeep(freq, duration) {

    if (!soundEnabled) return;

    const audioContext =
        new(window.AudioContext ||
            window.webkitAudioContext)();

    const osc =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    osc.type = "square";

    osc.frequency.value = freq;

    osc.connect(gain);

    gain.connect(
        audioContext.destination
    );

    osc.start();

    gain.gain.setValueAtTime(
        0.05,
        audioContext.currentTime
    );

    osc.stop(
        audioContext.currentTime +
        duration
    );
}

// =========================
// GAME LOOP
// =========================

function gameLoop() {

    if (!gameRunning) return;

    if (!paused) {

        updateDino();

        moveObstacles();
    }

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );
}

// =========================
// HELPERS
// =========================

function randomBetween(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

// =========================
// BUTTON EVENTS
// =========================

startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    restartGame
);

pauseBtn.addEventListener(
    "click",
    pauseGame
);

resumeBtn.addEventListener(
    "click",
    resumeGame
);

soundBtn.addEventListener(
    "click",
    () => {

        soundEnabled =
            !soundEnabled;

        soundBtn.textContent =
            soundEnabled ? "🔊" : "🔇";
    }
);

// =========================
// KEYBOARD
// =========================

document.addEventListener(
    "keydown",
    e => {

        if (
            e.code === "Space" ||
            e.code === "ArrowUp"
        ) {
            jump();
        }

        if (
            e.code === "KeyP"
        ) {

            if (paused)
                resumeGame();
            else
                pauseGame();
        }

        if (
            e.code === "Enter" &&
            !gameRunning
        ) {
            restartGame();
        }
    }
);

// =========================
// MOBILE
// =========================

gameArea.addEventListener(
    "touchstart",
    e => {

        e.preventDefault();

        jump();

    },
    { passive: false }
);

gameArea.addEventListener(
    "click",
    () => {

        jump();
    }
);