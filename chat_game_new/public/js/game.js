var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var canvas = document.getElementById('pongCanvas');
var ctx = canvas.getContext('2d');
var scoreElement = document.getElementById('score');
var startButton = document.getElementById('startButton');
var leaderboard = document.getElementById('leaderboard');
var playerScore = 0;
var computerScore = 0;
var ballX = canvas.width / 2;
var ballY = canvas.height / 2;
var ballSpeedX = -5;
var ballSpeedY = 5;
var paddleHeight = 80;
var paddleWidth = 10;
var paddleY = (canvas.height - paddleHeight) / 2;
var paddleY2 = (canvas.height - paddleHeight) / 2;
function saveScore(player, player_score, computer_score) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Отправка счёта:', { player: player, player_score: player_score, computer_score: computer_score });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/score', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ player: player, player_score: player_score, computer_score: computer_score }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    console.log('Ответ от сервера:', data);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Ошибка при сохранении счёта:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function loadLeaderboard() {
    return __awaiter(this, void 0, void 0, function () {
        var response, scores, sortedScores, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/scores')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    scores = _a.sent();
                    console.log('Получены результаты:', scores);
                    sortedScores = scores
                        .sort(function (a, b) { return b.player_score - a.player_score; })
                        .slice(0, 5);
                    leaderboard.innerHTML = '';
                    sortedScores.forEach(function (entry) {
                        var row = document.createElement('tr');
                        row.innerHTML = "\n        <td class=\"px-4 py-2\">".concat(entry.player, "</td>\n        <td class=\"px-4 py-2\">").concat(entry.player_score, "</td>\n        <td class=\"px-4 py-2\">").concat(entry.computer_score, "</td>\n        <td class=\"px-4 py-2\">").concat(entry.date, "</td>\n      ");
                        leaderboard.appendChild(row);
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Ошибка при загрузке таблицы лидеров:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
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
    scoreElement.textContent = "\u0418\u0433\u0440\u043E\u043A: ".concat(playerScore, " | \u041A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440: ").concat(computerScore);
    if (ballX < 0 || ballX > canvas.width) {
        saveScore('Anna', playerScore, computerScore);
        loadLeaderboard();
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX;
        playerScore = 0;
        computerScore = 0;
        scoreElement.textContent = "\u0418\u0433\u0440\u043E\u043A: ".concat(playerScore, " | \u041A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440: ").concat(computerScore);
    }
    var paddleCenter = paddleY2 + paddleHeight / 2;
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
startButton.addEventListener('click', function () {
    startButton.disabled = true;
    loadLeaderboard();
    update();
});
canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    paddleY = e.clientY - rect.top - paddleHeight / 2;
    if (paddleY < 0)
        paddleY = 0;
    if (paddleY > canvas.height - paddleHeight)
        paddleY = canvas.height - paddleHeight;
});
