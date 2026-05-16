let logos = [
    "images/bmw.png",
    "images/audi.png",
    "images/vw.png",
    "images/ford.png",
    "images/fiat.png",
    "images/toyota.png",
    "images/honda.png",
    "images/kia.png",
    "images/nissan.png",
    "images/mazda.png",
    "images/volvo.png",
    "images/tesla.png",
    "images/hyundai.png",
    "images/mini.png",
    "images/opel.png",
    "images/renault.png",
    "images/peugeot.png",
    "images/skoda.png"
];

let cards = [];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let gameOver = false;
let moves = 0;
let matchedCount = 0;
let wrongAttempts = 0;
let seconds = 0;
let timer;
let confettiAnimation;

let pairCount = 18;
let moveLimit = 90;
let shuffleLimit = 10;

let gameBoard = document.getElementById("gameBoard");
let movesText = document.getElementById("moves");
let timeText = document.getElementById("time");
let bestScoreText = document.getElementById("bestScore");
let message = document.getElementById("message");
let restartBtn = document.getElementById("restartBtn");

let pairCountInput = document.getElementById("pairCount");
let moveLimitInput = document.getElementById("moveLimit");
let shuffleLimitInput = document.getElementById("shuffleLimit");
let applySettingsBtn = document.getElementById("applySettingsBtn");

function prepareCards() {
    cards = [];

    let selectedLogos = logos.slice(0, pairCount);

    selectedLogos.forEach(function (logo, index) {
        cards.push({
            id: index + "-a",
            value: logo,
            matched: false
        });

        cards.push({
            id: index + "-b",
            value: logo,
            matched: false
        });
    });
}

function shuffleCards() {
    cards.sort(function () {
        return Math.random() - 0.5;
    });
}

function createBoard() {
    gameBoard.innerHTML = "";
    message.textContent = "";

    moves = 0;
    matchedCount = 0;
    wrongAttempts = 0;
    seconds = 0;
    gameOver = false;

    movesText.textContent = moves;
    timeText.textContent = seconds;

    firstCard = null;
    secondCard = null;
    lockBoard = false;

    clearInterval(timer);
    stopConfetti();

    let bestScore = localStorage.getItem("bestScore");
    bestScoreText.textContent = bestScore ? bestScore + " hamle" : "Yok";

    prepareCards();
    shuffleCards();

    timer = setInterval(function () {
        seconds++;
        timeText.textContent = seconds;
    }, 1000);

    cards.forEach(function (cardData) {
        let card = document.createElement("div");
        card.classList.add("card");
        card.dataset.value = cardData.value;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">
                    <img src="${cardData.value}" alt="Car Logo">
                </div>
            </div>
        `;

        card.addEventListener("click", function () {
            flipCard(card);
        });

        gameBoard.appendChild(card);
    });
}

function flipCard(card) {
    if (lockBoard) return;
    if (gameOver) return;
    if (card === firstCard) return;
    if (card.classList.contains("matched")) return;

    card.classList.add("open");

    if (firstCard === null) {
        firstCard = card;
        return;
    }

    secondCard = card;
    moves++;
    movesText.textContent = moves;

    if (moves > moveLimit) {
        gameOver = true;
        lockBoard = true;
        clearInterval(timer);
        message.textContent = "Oyunu kaybettiniz! " + moveLimit + " hamleyi geçtiniz.";
        return;
    }

    checkMatch();
}

function checkMatch() {
    if (firstCard.dataset.value === secondCard.dataset.value) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        matchedCount += 2;
        wrongAttempts = 0;
        resetCards();

        if (matchedCount === cards.length) {
            gameOver = true;
            lockBoard = true;
            clearInterval(timer);

            let bestScore = localStorage.getItem("bestScore");

            if (bestScore === null || moves < Number(bestScore)) {
                localStorage.setItem("bestScore", moves);
                bestScoreText.textContent = moves + " hamle";
            }

            message.textContent = "Tebrikler! Oyunu kazandınız. Hamle: " + moves + " | Süre: " + seconds + " sn";
            startConfetti();
        }

    } else {
        lockBoard = true;
        wrongAttempts++;

        setTimeout(function () {
            firstCard.classList.remove("open");
            secondCard.classList.remove("open");

            resetCards();

            if (wrongAttempts >= shuffleLimit && !gameOver) {
                shuffleBoard();
            }

        }, 800);
    }
}

function shuffleBoard() {
    lockBoard = true;
    wrongAttempts = 0;

    let unmatchedCards = Array.from(document.querySelectorAll(".card:not(.matched)"));

    unmatchedCards.forEach(function (card) {
        card.style.transition = "transform 0.6s ease, opacity 0.6s ease";
        card.style.transform = "scale(0.7) rotate(360deg)";
        card.style.opacity = "0";
    });

    setTimeout(function () {
        let remainingValues = unmatchedCards.map(function (card) {
            return card.dataset.value;
        });

        remainingValues.sort(function () {
            return Math.random() - 0.5;
        });

        unmatchedCards.forEach(function (card, index) {
            card.dataset.value = remainingValues[index];
            card.querySelector("img").src = remainingValues[index];
            card.classList.remove("open");
            card.style.transform = "scale(1)";
            card.style.opacity = "1";
        });

        lockBoard = false;
    }, 700);
}

function resetCards() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function applySettings() {
    pairCount = Number(pairCountInput.value);
    moveLimit = Number(moveLimitInput.value);
    shuffleLimit = Number(shuffleLimitInput.value);

    if (moveLimit < 1) {
        moveLimit = 90;
        moveLimitInput.value = 90;
    }

    if (shuffleLimit < 1) {
        shuffleLimit = 10;
        shuffleLimitInput.value = 10;
    }

    createBoard();
}

function startConfetti() {
    let canvas = document.getElementById("confettiCanvas");
    let ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let colors = ["#ffcc00", "#ff4d4d", "#4caf50", "#2196f3", "#ffffff"];
    let confetti = [];

    for (let i = 0; i < 180; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 4 + 2,
            angle: Math.random() * 360,
            rotation: Math.random() * 0.2
        });
    }

    function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confetti.forEach(function (piece) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate(piece.angle);
            ctx.fillRect(0, 0, piece.size, piece.size);
            ctx.restore();

            piece.y += piece.speed;
            piece.angle += piece.rotation;

            if (piece.y > canvas.height) {
                piece.y = -20;
                piece.x = Math.random() * canvas.width;
            }
        });

        confettiAnimation = requestAnimationFrame(drawConfetti);
    }

    drawConfetti();

    setTimeout(function () {
        stopConfetti();
    }, 4000);
}

function stopConfetti() {
    let canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;

    let ctx = canvas.getContext("2d");
    cancelAnimationFrame(confettiAnimation);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

restartBtn.addEventListener("click", createBoard);
applySettingsBtn.addEventListener("click", applySettings);

createBoard();