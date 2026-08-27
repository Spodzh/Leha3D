// ---------- НАСТРОЙКИ ----------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Разрешение рендера (небольшое для производительности на телефоне)
const RENDER_W = 640;
const RENDER_H = 400;
canvas.width = RENDER_W;
canvas.height = RENDER_H;

// Карта (0 - пусто, 1 - стена)
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1]
];
const TILE_SIZE = 1; // используем единицы для карты, игрок в тех же единицах

// Игрок (координаты в единицах карты)
let player = {
    x: 1.5,
    y: 1.5,
    angle: 0,      // радианы
    speed: 0.05,
    rotSpeed: 0.035
};

// ---------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----------
function isWall(x, y) {
    const col = Math.floor(x);
    const row = Math.floor(y);
    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
    return map[row][col] === 1;
}

// ---------- РЕЙКАСТИНГ ----------
function castRay(angle) {
    // Начальное положение игрока
    let x = player.x;
    let y = player.y;
    // Направление луча
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    // DDA алгоритм
    // Шаг по сетке
    const stepX = dx > 0 ? 1 : -1;
    const stepY = dy > 0 ? 1 : -1;
    // Длина луча до следующей вертикальной/горизонтальной границы
    const tDeltaX = Math.abs(1 / dx);
    const tDeltaY = Math.abs(1 / dy);
    let tMaxX = (dx > 0) ? (Math.ceil(x) - x) * tDeltaX : (x - Math.floor(x)) * tDeltaX;
    let tMaxY = (dy > 0) ? (Math.ceil(y) - y) * tDeltaY : (y - Math.floor(y)) * tDeltaY;

    let side = 0; // 0 - вертикальная стена, 1 - горизонтальная
    let hit = false;
    while (!hit) {
        if (tMaxX < tMaxY) {
            x += stepX * tDeltaX;
            y += stepY * tDeltaX;
            tMaxX += tDeltaX;
            side = 0;
        } else {
            x += stepX * tDeltaY;
            y += stepY * tDeltaY;
            tMaxY += tDeltaY;
            side = 1;
        }
        if (isWall(x, y)) {
            hit = true;
        }
    }

    // Расстояние до стены (с коррекцией на "рыбий глаз")
    let perpDist;
    if (side === 0) {
        perpDist = (x - player.x) / dx;
    } else {
        perpDist = (y - player.y) / dy;
    }
    if (perpDist < 0.01) perpDist = 0.01; // защита от деления на ноль

    return { distance: perpDist, side: side, wallX: (side === 0) ? y % 1 : x % 1 };
}

// ---------- ОТРИСОВКА 3D-СЦЕНЫ ----------
function render() {
    const W = RENDER_W;
    const H = RENDER_H;

    // Рисуем пол и потолок
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, W, H/2);
    ctx.fillStyle = '#444';
    ctx.fillRect(0, H/2, W, H/2);

    // Для каждого столбца
    for (let col = 0; col < W; col++) {
        // Угол луча: камера имеет поле зрения 60 градусов (PI/3)
        const angle = player.angle - Math.PI/6 + (col / W) * (Math.PI/3);
        const result = castRay(angle);
        const dist = result.distance;

        // Высота полосы на экране
        const lineHeight = H / dist;
        // Ограничиваем, чтобы не вылезало за экран
        const drawStart = Math.max(0, (H - lineHeight) / 2);
        const drawEnd = Math.min(H, (H + lineHeight) / 2);

        // Цвет зависит от расстояния (затемнение) и от стороны стены
        let brightness = 1 - Math.min(dist / 10, 1); // расстояние до 10 единиц затемняет
        if (brightness < 0.2) brightness = 0.2;
        let r = 150, g = 150, b = 150;
        // Немного оттеняем в зависимости от стороны
        if (result.side === 1) {
            r *= 0.7; g *= 0.7; b *= 0.7;
        }
        r = Math.floor(r * brightness);
        g = Math.floor(g * brightness);
        b = Math.floor(b * brightness);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

        ctx.fillRect(col, drawStart, 1, drawEnd - drawStart);
    }
}

// ---------- УПРАВЛЕНИЕ ----------
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.key] = true; });
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

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

// ---------- ДВИЖЕНИЕ И КОЛЛИЗИЯ ----------
function update() {
    // Вперёд/назад
    let moveX = 0, moveY = 0;
    if (keys['w'] || keys['ArrowUp']) {
        moveX += Math.cos(player.angle) * player.speed;
        moveY += Math.sin(player.angle) * player.speed;
    }
    if (keys['s'] || keys['ArrowDown']) {
        moveX -= Math.cos(player.angle) * player.speed;
        moveY -= Math.sin(player.angle) * player.speed;
    }
    // Поворот
    if (keys['a'] || keys['ArrowLeft']) player.angle -= player.rotSpeed;
    if (keys['d'] || keys['ArrowRight']) player.angle += player.rotSpeed;

    // Проверка коллизии по X и Y отдельно
    if (moveX !== 0 || moveY !== 0) {
        // Двигаем по X
        const newX = player.x + moveX;
        if (!isWall(newX, player.y)) {
            player.x = newX;
        }
        // Двигаем по Y
        const newY = player.y + moveY;
        if (!isWall(player.x, newY)) {
            player.y = newY;
        }
    }
}

// ---------- ЦИКЛ ----------
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();