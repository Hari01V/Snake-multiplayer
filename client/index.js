let socket;

const BG_COLOR = "#231F20";
const SNAKE_COLOR1 = "#c2c2c2";
const SNAKE_COLOR2 = "red";
const FOOD_COLOR = "#e66916";

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const newGameBtn = document.getElementById("newGameButton");
const joinGameBtn = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");

const newGame = () => {
  socket.emit("newGame");
  init();
};

const joinGame = () => {
  const code = gameCodeInput.value;
  socket.emit("joinGame", code);
  init();
};

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);

let canvas, ctx;
let playerNumber;
let gameActive = false;

const handleInit = (number) => {
  playerNumber = number;
};

const handleGameState = (gameState) => {
  if (!gameActive) return;
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
};

const handleGameOver = (data) => {
  if (!gameActive) return;
  data = JSON.parse(data);
  if (data.winner === playerNumber) {
    alert("You win!");
  } else {
    alert("You lose!");
  }
  gameActive = false;
};

const handleGameCode = (gameCode) => {
  gameCodeDisplay.innerText = gameCode;
};

const handleUnknownGame = () => {
  reset();
  alert("Unknown game code");
};

const handleTooManyPlayers = () => {
  reset();
  alert("This game is already in progress");
};

const reset = () => {
  playerNumber = null;
  gameCodeInput.value = "";
  gameCodeDisplay.innerText = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
};

const init = () => {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener("keydown", keyDown);
  gameActive = true;
};

const keyDown = (e) => {
  socket.emit("keydown", e.keyCode);
};

const paintGame = (state) => {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridSize = state.gridSize;
  const size = canvas.width / gridSize;

  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOR1);
  paintPlayer(state.players[1], size, SNAKE_COLOR2);
};

const paintPlayer = (playerState, size, color) => {
  const snake = playerState.snake;
  ctx.fillStyle = color;

  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
};

(() => {
  socket = io.connect("http://localhost:3000");

  socket.on("init", handleInit);
  socket.on("gameState", handleGameState);
  socket.on("gameOver", handleGameOver);
  socket.on("gameCode", handleGameCode);
  socket.on("unknownGame", handleUnknownGame);
  socket.on("tooManyPlayers", handleTooManyPlayers);
})();
