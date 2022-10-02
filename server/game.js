import { GRID_SIZE } from "./constants.js";

export { initGame, gameLoop, getUpdatedVelocity };

const initGame = () => {
  const state = createGameState();
  randomFood(state);
  return state;
};

const createGameState = () => {
  return {
    players: [
      {
        pos: {
          x: 3,
          y: 8,
        },
        vel: {
          x: 1,
          y: 0,
        },
        snake: [
          { x: 1, y: 8 },
          { x: 2, y: 8 },
          { x: 3, y: 8 },
        ],
      },
      {
        pos: {
          x: 8,
          y: 8,
        },
        vel: {
          x: 0,
          y: 0,
        },
        snake: [
          { x: 20, y: 8 },
          { x: 19, y: 8 },
          { x: 18, y: 8 },
        ],
      },
    ],
    food: {},
    gridSize: GRID_SIZE,
  };
};

const gameLoop = (state) => {
  if (!state) return;

  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;
  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  if (
    playerOne.pos.x < 0 ||
    playerOne.pos.x > GRID_SIZE ||
    playerOne.pos.y < 0 ||
    playerOne.pos.y > GRID_SIZE
  ) {
    return 2;
  }
  if (
    playerTwo.pos.x < 0 ||
    playerTwo.pos.x > GRID_SIZE ||
    playerTwo.pos.y < 0 ||
    playerTwo.pos.y > GRID_SIZE
  ) {
    return 1;
  }

  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    randomFood(state);
  }
  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;
    randomFood(state);
  }

  if (playerOne.vel.x || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        return 2;
      }
    }

    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }
  if (playerTwo.vel.x || playerTwo.vel.y) {
    for (let cell of playerTwo.snake) {
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        return 1;
      }
    }

    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }

  return false;
};

const randomFood = (state) => {
  let food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };

  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }
  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
};

const getUpdatedVelocity = (keyCode) => {
  switch (keyCode) {
    case 37: {
      // left
      return { x: -1, y: 0 };
    }
    case 38: {
      // down
      return { x: 0, y: -1 };
    }
    case 39: {
      // right
      return { x: 1, y: 0 };
    }
    case 40: {
      // up
      return { x: 0, y: 1 };
    }
  }
};
