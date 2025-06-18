const tileSize = 20;
const cols = 51;  // 必ず奇数
const rows = 51;
const canvas = document.getElementById("maze");
canvas.width = cols * tileSize;
canvas.height = rows * tileSize;
const ctx = canvas.getContext("2d");

let maze = Array.from({ length: rows }, () => Array(cols).fill(1)); // 1=壁, 0=道, 2=ゴール

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateMazePrim() {
  const frontier = [];

  function addFrontier(x, y) {
    if (x > 0 && x < cols && y > 0 && y < rows && maze[y][x] === 1) {
      maze[y][x] = 2; // frontierとして印付け
      frontier.push([x, y]);
    }
  }

  function neighbors(x, y) {
    const n = [];
    for (let [dx, dy] of [[0, -2], [0, 2], [-2, 0], [2, 0]]) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && nx < cols && ny > 0 && ny < rows && maze[ny][nx] === 0) {
        n.push([nx, ny]);
      }
    }
    return n;
  }

  let startX = 1, startY = 1;
  maze[startY][startX] = 0;

  addFrontier(startX + 2, startY);
  addFrontier(startX - 2, startY);
  addFrontier(startX, startY + 2);
  addFrontier(startX, startY - 2);

  while (frontier.length) {
    const randIndex = Math.floor(Math.random() * frontier.length);
    const [x, y] = frontier.splice(randIndex, 1)[0];
    const n = neighbors(x, y);
    if (n.length > 0) {
      const [nx, ny] = n[Math.floor(Math.random() * n.length)];
      maze[y][x] = 0;
      maze[(y + ny) >> 1][(x + nx) >> 1] = 0;

      addFrontier(x + 2, y);
      addFrontier(x - 2, y);
      addFrontier(x, y + 2);
      addFrontier(x, y - 2);
    }
  }

  // ゴールを右下に
  maze[rows - 2][cols - 2] = 3;
}

function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = "#000"; // 壁
      } else if (maze[y][x] === 3) {
        ctx.fillStyle = "#f00"; // ゴール
      } else {
        ctx.fillStyle = "#fff"; // 通路
      }
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
  // プレイヤー
  ctx.fillStyle = "#00f";
  ctx.fillRect(player.x * tileSize, player.y * tileSize, tileSize, tileSize);
}

function move(dx, dy) {
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (maze[ny][nx] !== 1) {
    player.x = nx;
    player.y = ny;
    if (maze[ny][nx] === 3) {
      setTimeout(() => alert("🎉 ゴールしました！"), 100);
    }
  }
  drawMaze();
}

document.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowUp": move(0, -1); break;
    case "ArrowDown": move(0, 1); break;
    case "ArrowLeft": move(-1, 0); break;
    case "ArrowRight": move(1, 0); break;
  }
});

generateMazePrim();
const far = findFarthestPoint(1, 1);
maze[far.y][far.x] = 3; // ゴール
const player = { x: 1, y: 1 };
drawMaze();

function findFarthestPoint(sx, sy) {
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [[sx, sy, 0]];
  let farthest = { x: sx, y: sy, dist: 0 };

  while (queue.length) {
    const [x, y, d] = queue.shift();
    if (visited[y][x]) continue;
    visited[y][x] = true;
    if (d > farthest.dist) farthest = { x, y, dist: d };

    for (let [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows &&
          !visited[ny][nx] && maze[ny][nx] === 0) {
        queue.push([nx, ny, d + 1]);
      }
    }
  }
  return farthest;
}

