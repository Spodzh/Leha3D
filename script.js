// ---------- НАСТРОЙКИ ----------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
const TILE_SIZE = 64;

// Игрок
let player = {
    x: 1.5 * TILE_SIZE,
    y: 1.5 * TILE_SIZE,
    angle: 0,
    speed: 2,
    rotSpeed: 0.03
};

// ---------- РИСОВАНИЕ 2D-КАРТЫ ----------
function drawMap() {
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[0].length; col++) {
            ctx.fillStyle = map[row][col] === 1 ? '#666' : '#222';
            ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 8, 0, Math.PI * 2);
    ctx.fill();

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

// ---------- КЛАВИАТУРА ----------
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true; });
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

// ---------- СЕНСОРНОЕ УПРАВЛЕНИЕ ----------
function setupTouchButton(id, key) {
    const btn = document.getElementById(id);
    if (!btn) return;

    const start = (e) => {
        e.preventDefault();
        keys[key] = true;
        btn.classList.add('active');
    };
    const end = (e) => {
        e.preventDefault();
        keys[key] = false;
        btn.classList.remove('active');
    };

    btn.addEventListener('touchstart', start);
    btn.addEventListener('touchend', end);
    btn.addEventListener('touchcancel', end);
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', end);
    btn.addEventListener('mouseleave', end);
}

setupTouchButton('btnForward', 'w');
setupTouchButton('btnBack', 's');
setupTouchButton('btnLeft', 'a');
setupTouchButton('btnRight', 'd');

// ---------- ЛОГИКА ДВИЖЕНИЯ ----------
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

    // Простая коллизия
    const col = Math.floor(player.x / TILE_SIZE);
    const row = Math.floor(player.y / TILE_SIZE);
    if (map[row] && map[row][col] === 1) {
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

gameLoop();