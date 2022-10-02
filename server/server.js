import { createServer } from "http";
import { Server } from "socket.io";
import { initGame, gameLoop, getUpdatedVelocity } from "./game.js";
import { FRAME_RATE } from "./constants.js";
import { makeId } from "./utils.js";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:8080",
  },
});

const state = {};
const clientRooms = {};

io.on("connection", (socket) => {
  const handleKeyDown = (keyCode) => {
    const roomName = clientRooms[socket.id];
    if (!roomName) return;

    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);
    if (vel) {
      state[roomName].players[socket.number - 1].vel = vel;
    }
  };

  const handleNewGame = () => {
    let roomName = makeId(5);
    clientRooms[socket.id] = roomName;
    socket.emit("gameCode", roomName);

    state[roomName] = initGame();

    socket.join(roomName);
    socket.number = 1;
    socket.emit("init", 1);
  };

  const handleJoinGame = (gameCode) => {
    // const room = io.sockets.adapter.rooms[gameCode];
    // console.log(io.sockets.adapter.rooms.get(gameCode).size);
    // let allUsers;
    // if (room) {
    //   allUsers = room.sockets;
    // }

    let numClients = 0;
    // if (allUsers) {
    //   numClients = Object.keys(allUsers).length;
    // }
    numClients = io.sockets.adapter.rooms.get(gameCode).size;

    if (numClients === 0) {
      socket.emit("unknownGame");
    } else if (numClients > 1) {
      socket.emit("tooManyPlayers");
      return;
    }

    clientRooms[socket.id] = gameCode;
    socket.join(gameCode);
    socket.number = 2;
    socket.emit("init", 2);

    startGameInterval(gameCode);
  };

  socket.on("keydown", handleKeyDown);
  socket.on("newGame", handleNewGame);
  socket.on("joinGame", handleJoinGame);
});

const startGameInterval = (roomName) => {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if (!winner) {
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
};

const emitGameState = (roomName, state) => {
  io.sockets.in(roomName).emit("gameState", JSON.stringify(state));
};

const emitGameOver = (roomName, winner) => {
  io.sockets.in(roomName).emit("gameOver", JSON.stringify({ winner }));
};

httpServer.listen(3000);
