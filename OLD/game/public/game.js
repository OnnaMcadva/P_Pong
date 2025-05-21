"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('startButton');
const leaderboard = document.getElementById('leaderboard');
let playerScore = 0;
let computerScore = 0;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = -5;
let ballSpeedY = 5;
const paddleHeight = 80;
const paddleWidth = 10;
let paddleY = (canvas.height - paddleHeight) / 2;
let paddleY2 = (canvas.height - paddleHeight) / 2;
function saveScore(player, player_score, computer_score) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Отправка счёта:', { player, player_score, computer_score });
        try {
            const response = yield fetch('/api/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ player, player_score, computer_score }),
            });
            const data = yield response.json();
            console.log('Ответ от сервера:', data);
        }
        catch (error) {
            console.error('Ошибка при сохранении счёта:', error);
        }
    });
}
function loadLeaderboard() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/api/scores');
            const scores = yield response.json();
            console.log('Получены результаты:', scores);
            const sortedScores = scores
                .sort((a, b) => b.player_score - a.player_score)
                .slice(0, 5);
            leaderboard.innerHTML = '';
            sortedScores.forEach((entry) => {
                const row = document.createElement('tr');
                row.innerHTML = `
        <td class="px-4 py-2">${entry.player}</td>
        <td class="px-4 py-2">${entry.player_score}</td>
        <td class="px-4 py-2">${entry.computer_score}</td>
        <td class="px-4 py-2">${entry.date}</td>
      `;
                leaderboard.appendChild(row);
            });
        }
        catch (error) {
            console.error('Ошибка при загрузке таблицы лидеров:', error);
        }
    });
}
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}
function drawBall(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fill();
}
function update() {
    drawRect(0, 0, canvas.width, canvas.height, 'black');
    drawRect(10, paddleY, paddleWidth, paddleHeight, 'white');
    drawRect(canvas.width - 20, paddleY2, paddleWidth, paddleHeight, 'white');
    drawBall(ballX, ballY, 10, 'white');
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    if (ballY < 0 || ballY > canvas.height)
        ballSpeedY = -ballSpeedY;
    if (ballX < 20 && ballY > paddleY && ballY < paddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        playerScore++;
    }
    if (ballX > canvas.width - 30 && ballY > paddleY2 && ballY < paddleY2 + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        computerScore++;
    }
    scoreElement.textContent = `Игрок: ${playerScore} | Компьютер: ${computerScore}`;
    if (ballX < 0 || ballX > canvas.width) {
        saveScore('Anna', playerScore, computerScore);
        loadLeaderboard();
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX;
        playerScore = 0;
        computerScore = 0;
        scoreElement.textContent = `Игрок: ${playerScore} | Компьютер: ${computerScore}`;
    }
    const paddleCenter = paddleY2 + paddleHeight / 2;
    if (paddleCenter < ballY - 35) {
        paddleY2 += 4;
    }
    if (paddleCenter > ballY + 35) {
        paddleY2 -= 4;
    }
    if (paddleY2 < 0)
        paddleY2 = 0;
    if (paddleY2 > canvas.height - paddleHeight)
        paddleY2 = canvas.height - paddleHeight;
    requestAnimationFrame(update);
}
startButton.addEventListener('click', () => {
    startButton.disabled = true;
    loadLeaderboard();
    update();
});
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    paddleY = e.clientY - rect.top - paddleHeight / 2;
    if (paddleY < 0)
        paddleY = 0;
    if (paddleY > canvas.height - paddleHeight)
        paddleY = canvas.height - paddleHeight;
});
