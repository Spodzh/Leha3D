// ---------- НАСТРОЙКИ ----------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Размеры канваса (можно сделать адаптивными позже)
const W = 800;
const H = 600;
canvas.width = W;
canvas.height = H;

// Карта (0 - пусто, 1 - стена)
const map = [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1]
];
const TILE_SIZE = 64; // размер одного тайла на 2D-карте

// Игрок
let player = {
    x: 1.5 * TILE_SIZE,  // позиция в пикселях
    y: 1.5 * TILE_SIZE,
    angle: 0,            // направление в радианах (0 - вправо)
    speed: 2,
    rotSpeed: 0.03
};

// ---------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----------
function drawMap() {
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[0].length; col++) {
            if (map[row][col] === 1) {
                ctx.fillStyle = '#666';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else {
                ctx.fillStyle = '#222';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawPlayer() {
    // Рисуем игрока как круг
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Линия направления взгляда
    ctx.strokeStyle = '#ff0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(
        player.x + Math.cos(player.angle) * 40,
        player.y + Math.sin(player.angle) * 40
    );
    ctx.stroke();
}

// ---------- УПРАВЛЕНИЕ ----------
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true; });
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

// ---------- ЦИКЛ ОБНОВЛЕНИЯ ----------
function update() {
    // Движение вперёд/назад
    if (keys['w'] || keys['ArrowUp']) {
        player.x += Math.cos(player.angle) * player.speed;
        player.y += Math.sin(player.angle) * player.speed;
    }
    if (keys['s'] || keys['ArrowDown']) {
        player.x -= Math.cos(player.angle) * player.speed;
        player.y -= Math.sin(player.angle) * player.speed;
    }
    // Поворот
    if (keys['a'] || keys['ArrowLeft']) {
        player.angle -= player.rotSpeed;
    }
    if (keys['d'] || keys['ArrowRight']) {
        player.angle += player.rotSpeed;
    }

    // Простая коллизия со стенами (проверка по центру игрока)
    // Преобразуем пиксельные координаты в индекс тайла
    const col = Math.floor(player.x / TILE_SIZE);
    const row = Math.floor(player.y / TILE_SIZE);
    if (map[row] && map[row][col] === 1) {
        // Откат назад (упрощённо)
        player.x -= Math.cos(player.angle) * player.speed;
        player.y -= Math.sin(player.angle) * player.speed;
    }
}

function draw() {
    ctx.clearRect(0, 0, W, H);
    drawMap();
    drawPlayer();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Запуск
gameLoop();