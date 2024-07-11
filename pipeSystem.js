const fs = require("fs");

// Coordinate offsets for each direction
const PIPE_OPENINGS = {
  "═": [
    [-1, 0],
    [1, 0],
  ],
  "║": [
    [0, 1],
    [0, -1],
  ],
  "╔": [
    [1, 0],
    [0, -1],
  ],
  "╗": [
    [1, 0],
    [0, 1],
  ],
  "╚": [
    [-1, 0],
    [0, -1],
  ],
  "╝": [
    [-1, 0],
    [0, 1],
  ],
  "╠": [
    [-1, 0],
    [1, 0],
    [0, 1],
  ],
  "╣": [
    [-1, 0],
    [1, 0],
    [0, -1],
  ],
  "╦": [
    [0, 1],
    [0, -1],
    [1, 0],
  ],
  "╩": [
    [0, 1],
    [0, -1],
    [-1, 0],
  ],
};

function parseInputFile(filePath) {
  // Read the file
  const data = fs.readFileSync(filePath, "utf8").trim().split("\n");
  // Map over the data, and using array destructuring to get the char, x, and y. x and y are converted from strings to numbers
  return data.map((line) => {
    const [char, x, y] = line.trim().split(" ");
    return [char, Number(x), Number(y)];
  });
}

function createGrid(parsedData) {
  // initialise a new map
  const grid = new Map();

  // Loop over the parsed data
  for (const [char, x, y] of parsedData) {
    // Creates a new row map if it doesn't exist
    if (!grid.has(y)) {
      grid.set(y, new Map());
    }
    grid.get(y).set(x, char);
  }
  return grid;
  // You end up with a map of maps, where the outer map is the y coordinate, and the inner map is the x coordinate
}

function isConnected(grid, x1, y1, x2, y2) {
  // Get the characters at the coordinates to be compared
  const char1 = grid.get(y1)?.get(x1);
  const char2 = grid.get(y2)?.get(x2);

  // If either of the characters are undefined, return false
  if (!char1 || !char2) {
    return false;
  }
  // If either of the characters are the source or a sink, return true
  if (
    char1 === "*" ||
    char2 === "*" ||
    /[A-Z]/.test(char1) ||
    /[A-Z]/.test(char2)
  )
    return true;

  const openings1 = PIPE_OPENINGS[char1];
  const openings2 = PIPE_OPENINGS[char2];

  for (const [directionX1, directionY1] of openings1) {
    // Check if there is an opening on one side that leds to the coords of the second pipe
    if (x1 + directionX1 === x2 && y1 + directionY1 === y2) {
      // If it is, we check the other pipe for the same thing in reverse
      for (const [directionX2, directionY2] of openings2) {
        if (x2 + directionX2 === x1 && y2 + directionY2 === y1) {
          return true;
        }
      }
    }
  }
  return false;
}

function findConnectedSinks(filePath) {
  const parsedData = parseInputFile(filePath);
  const grid = createGrid(parsedData);

  // Find the source
  const source = parsedData.find(([char]) => char === "*");

  // Find the sinks
  const sinks = parsedData.filter(([char]) => /[A-Z]/.test(char));

  // Keep track of visited cells, queue and connected sinks
  const visited = new Set();
  const queue = [source];
  const connectedSinks = new Set();

  while (queue.length > 0) {
    const [char, x, y] = queue.shift();
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);
    if (/[A-Z]/.test(char)) connectedSinks.add(char);

    // Check if current cell is a sink
    if (sinks.includes(char)) {
      connectedSinks.add(char);
    }
    // Check the four directions
    const directions = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];
    for (const [directionX, directionY] of directions) {
      const nextX = x + directionX;
      const nextY = y + directionY;
      if (isConnected(grid, x, y, nextX, nextY)) {
        queue.push([grid.get(nextY)?.get(nextX), nextX, nextY]);
      }
    }
  }
  return Array.from(connectedSinks).sort().join("");
}

console.log(findConnectedSinks("./coding_qual_input.txt"));
