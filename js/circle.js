document.addEventListener('DOMContentLoaded', function() {
    // Инициализация интерфейса и параметров
    const stepper = document.querySelector('.stepper');
    const countElement = stepper?.querySelector('.count');
    const arrowTop = document.querySelector('.arrow-top');
    const arrowBottom = document.querySelector('.arrow-bottom');
    const formDisplay = document.querySelector('.form-display');
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    const svg = document.getElementById('flowers-svg');
    const shapes = ['form-circle', 'form-square', 'form-oval', 'form-rectangle'];
    let count = 5;
    let selectedFlowerCount = 5;
    let isDragging = false;
    let dragTarget = null;
    let startY = 0;
    let startX = 0;
    let arrowInterval = null;
    const sensitivity = 80;
    const maxOffset = 10;
    let currentShapeIndex = 0;
    let lastActionTime = 0;
    const DEBOUNCE_TIME = 300;
    let unitRadius = 30;
    let bestContainerRadius = Infinity;
    let temperature = 2.0;
    const coolingRate = 0.9997;
    const maxIterations = 5000;

    // Класс для круга
    class Ball {
        constructor(x, y, radius) {
            this.r = radius;
            this.velocity = { x: 0, y: 0 };
            this.position = { x: x, y: y };
        }

        // Применение силы
        applyForce(force) {
            this.velocity.x += force.x;
            this.velocity.y += force.y;
            const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > 1.0) {
                this.velocity.x = (this.velocity.x / speed) * 1.0;
                this.velocity.y = (this.velocity.y / speed) * 1.0;
            }
        }

        // Обновление позиции
        update(seed, iter) {
            const noiseX = (deterministicRandom(seed, this.position.x * 1000 + iter) - 0.5) * 1.2;
            const noiseY = (deterministicRandom(seed, this.position.y * 1000 + iter + 1000) - 0.5) * 1.2;
            this.velocity.x += noiseX;
            this.velocity.y += noiseY;
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.velocity.x *= 0.98;
            this.velocity.y *= 0.98;
        }
    }

    // Класс для упаковки кругов
    class Packer {
        constructor(n_circles) {
            this.circles = Array(n_circles).fill(1);
            this.balls = [];
            this.iter = 0;
            this.hasCollisions = true;
            this.maxVelocity = 0;
            this.seed = 12345 * n_circles;
            this.finalizeAdjustments = 0;
            this.containerRadius = this.estimateContainerRadius(n_circles);
            this.list = this.solve(n_circles);
        }

        // Оценка радиуса контейнера
        estimateContainerRadius(n) {
            if (n === 1) return unitRadius;
            if (n === 3) return unitRadius * 2.0;
            return unitRadius * Math.sqrt(n / 0.9);
        }

        // Конфигурация для n=9, 11, 13
        createSpecialConfiguration(n) {
            if (n === 9) {
                let newBalls = [];
                newBalls.push(new Ball(0, 0, unitRadius));
                const outerRadius = unitRadius * 2.414;
                for (let i = 0; i < 8; i++) {
                    const angle = (i * 2 * Math.PI) / 8;
                    const x = Math.cos(angle) * outerRadius;
                    const y = Math.sin(angle) * outerRadius;
                    newBalls.push(new Ball(x, y, unitRadius));
                }
                return newBalls;
            } else if (n === 11 || n === 13) {
                const outerCount = n - 3;
                const innerCount = 3;
                const outerRadius = unitRadius * 1.5 * (outerCount / 6);
                const innerRadius = unitRadius * 0.8;
                let newBalls = [];
                for (let i = 0; i < outerCount; i++) {
                    const angle = (i * 2 * Math.PI) / outerCount;
                    const x = Math.cos(angle) * outerRadius;
                    const y = Math.sin(angle) * outerRadius;
                    newBalls.push(new Ball(x, y, unitRadius));
                }
                for (let i = 0; i < innerCount; i++) {
                    const angle = (i * 2 * Math.PI) / innerCount + Math.PI/6;
                    const x = Math.cos(angle) * innerRadius;
                    const y = Math.sin(angle) * innerRadius;
                    newBalls.push(new Ball(x, y, unitRadius));
                }
                return newBalls;
            }
            return [];
        }

        // Генерация случайного числа
        deterministicRandom(seed, index) {
            const x = Math.sin(seed + index * 1000) * 10000;
            return x - Math.floor(x);
        }

        // Проверка пересечений
        hasOverlaps(balls) {
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const dx = balls[i].position.x - balls[j].position.x;
                    const dy = balls[i].position.y - balls[j].position.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < balls[i].r + balls[j].r && d > 0) {
                        return true;
                    }
                }
            }
            return false;
        }

        // Обновление позиций кругов
        update() {
            this.iter++;
            this.hasCollisions = false;
            this.maxVelocity = 0;
            if (this.iter < 2000) {
                for (let ball of this.balls) {
                    const noiseX = (this.deterministicRandom(this.seed, ball.position.x * 1000 + this.iter) - 0.5) * 0.6;
                    const noiseY = (this.deterministicRandom(this.seed, ball.position.y * 1000 + this.iter + 1000) - 0.5) * 0.6;
                    ball.position.x += noiseX;
                    ball.position.y += noiseY;
                }
            }
            for (let ball of this.balls) {
                const d = Math.sqrt(ball.position.x * ball.position.x + ball.position.y * ball.position.y);
                if (d > this.containerRadius - ball.r) {
                    const norm = {
                        x: ball.position.x / (d || 0.01),
                        y: ball.position.y / (d || 0.01)
                    };
                    ball.position.x = norm.x * (this.containerRadius - ball.r - 0.01);
                    ball.position.y = norm.y * (this.containerRadius - ball.r - 0.01);
                    ball.velocity.x *= -0.8;
                    ball.velocity.y *= -0.8;
                    this.hasCollisions = true;
                }
                const speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
                this.maxVelocity = Math.max(this.maxVelocity, speed);
            }
            for (let i = 0; i < this.balls.length; i++) {
                for (let j = i + 1; j < this.balls.length; j++) {
                    const ball1 = this.balls[i];
                    const ball2 = this.balls[j];
                    const dx = ball1.position.x - ball2.position.x;
                    const dy = ball1.position.y - ball2.position.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    const minDist = ball1.r + ball2.r;
                    if (d < minDist && d > 0) {
                        this.hasCollisions = true;
                        const overlap = minDist - d;
                        const force = {
                            x: dx / (d || 0.01),
                            y: dy / (d || 0.01)
                        };
                        ball1.position.x += force.x * overlap * 0.8;
                        ball1.position.y += force.y * overlap * 0.8;
                        ball2.position.x -= force.x * overlap * 0.8;
                        ball2.position.y -= force.y * overlap * 0.8;
                        const forceMagnitude = overlap * 5.0 * (1.0 + temperature);
                        ball1.applyForce({
                            x: force.x * forceMagnitude,
                            y: force.y * forceMagnitude
                        });
                        ball2.applyForce({
                            x: -force.x * forceMagnitude,
                            y: -force.y * forceMagnitude
                        });
                    }
                }
            }
            for (let ball of this.balls) {
                ball.update(this.seed + this.iter, this.iter);
            }
            temperature *= coolingRate;
        }

        // Корректировка позиций
        finalizePositions() {
            let adjustments = 0;
            let step = 0.5;
            const maxAdjustments = 3000;
            while (adjustments < maxAdjustments) {
                let hasOverlap = false;
                for (let i = 0; i < this.balls.length; i++) {
                    for (let j = i + 1; j < this.balls.length; j++) {
                        const ball1 = this.balls[i];
                        const ball2 = this.balls[j];
                        const dx = ball1.position.x - ball2.position.x;
                        const dy = ball1.position.y - ball2.position.y;
                        const d = Math.sqrt(dx * dx + dy * dy);
                        const minDist = ball1.r + ball2.r;
                        if (d < minDist && d > 0) {
                            hasOverlap = true;
                            const overlap = minDist - d;
                            const force = {
                                x: dx / (d || 0.01),
                                y: dy / (d || 0.01)
                            };
                            ball1.position.x += force.x * overlap * step;
                            ball1.position.y += force.y * overlap * step;
                            ball2.position.x -= force.x * overlap * step;
                            ball2.position.y -= force.y * overlap * step;
                        }
                    }
                }
                for (let ball of this.balls) {
                    const d = Math.sqrt(ball.position.x * ball.position.x + ball.position.y * ball.position.y);
                    if (d > this.containerRadius - ball.r) {
                        const norm = {
                            x: ball.position.x / (d || 0.01),
                            y: ball.position.y / (d || 0.01)
                        };
                        ball.position.x = norm.x * (this.containerRadius - ball.r - 0.01);
                        ball.position.y = norm.y * (this.containerRadius - ball.r - 0.01);
                        hasOverlap = true;
                    }
                }
                if (!hasOverlap) break;
                adjustments++;
                step = Math.max(0.1, step * 0.999);
            }
            if (this.balls.length === 9 && this.balls[0]) {
                this.balls[0].position.x = 0;
                this.balls[0].position.y = 0;
            }
            return adjustments;
        }

        // Проверка завершения
        isSettled() {
            for (let i = 0; i < this.balls.length; i++) {
                for (let j = i + 1; j < this.balls.length; j++) {
                    const dx = this.balls[i].position.x - this.balls[j].position.x;
                    const dy = this.balls[i].position.y - this.balls[j].position.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < this.balls[i].r + this.balls[j].r) {
                        return false;
                    }
                }
            }
            return this.maxVelocity < 0.005 || this.iter >= maxIterations;
        }

        // Получение радиуса контейнера
        getCurrentContainerRadius() {
            let maxDist = 0;
            for (let ball of this.balls) {
                const d = Math.sqrt(ball.position.x * ball.position.x + ball.position.y * ball.position.y) + ball.r;
                maxDist = Math.max(maxDist, d);
            }
            return maxDist;
        }

        // Решение задачи упаковки
        solve(n_circles) {
            this.balls = [];
            bestContainerRadius = Infinity;
            temperature = 2.0;
            this.containerRadius = this.estimateContainerRadius(n_circles);
            if (n_circles === 3) {
                const r = unitRadius * 2;
                this.balls.push(new Ball(0, -r, unitRadius));
                this.balls.push(new Ball(r * Math.cos(Math.PI / 6), r * Math.sin(Math.PI / 6), unitRadius));
                this.balls.push(new Ball(-r * Math.cos(Math.PI / 6), r * Math.sin(Math.PI / 6), unitRadius));
            } else if (n_circles === 9 || n_circles === 11 || n_circles === 13) {
                this.balls = this.createSpecialConfiguration(n_circles);
            } else {
                for (let i = 0; i < n_circles; i++) {
                    const angle = (i * 137.5) % 360 * (Math.PI / 180);
                    const r = (this.deterministicRandom(this.seed, i) * 0.5 + 0.5) * (this.containerRadius - unitRadius) * 0.3;
                    this.balls.push(new Ball(Math.cos(angle) * r, Math.sin(angle) * r, unitRadius));
                }
            }
            let bestConfiguration = [];
            while (!this.isSettled() && this.iter < maxIterations) {
                this.update();
                const currentRadius = this.getCurrentContainerRadius();
                if (currentRadius < bestContainerRadius && !this.hasOverlaps(this.balls)) {
                    bestContainerRadius = currentRadius;
                    bestConfiguration = this.balls.map(ball => ({ c: { x: ball.position.x, y: ball.position.y }, r: ball.r }));
                }
            }
            let maxAttempts = 3;
            let attempt = 0;
            this.finalizeAdjustments = this.finalizePositions();
            while (this.hasOverlaps(this.balls) && attempt < maxAttempts) {
                this.containerRadius *= 1.05;
                this.finalizeAdjustments += this.finalizePositions();
                attempt++;
            }
            bestContainerRadius = this.getCurrentContainerRadius();
            return this.balls.map(ball => ({
                c: { x: ball.position.x, y: ball.position.y },
                r: ball.r
            }));
        }
    }

    // Генерация случайного числа
    function deterministicRandom(seed, index) {
        const x = Math.sin(seed + index * 1000) * 10000;
        return x - Math.floor(x);
    }

    // Получение нечётного числа
    function getOddNumber(num) {
        return Math.max(1, Math.min(15, num % 2 === 0 ? num - 1 : num));
    }

    // Обновление количества кругов
    function updateCount(newCount) {
        const validatedCount = getOddNumber(newCount);
        if (validatedCount !== count) {
            count = validatedCount;
            selectedFlowerCount = count;
            countElement.textContent = count;
            updateArrowVisibility();
            if (currentShapeIndex === 0) {
                drawFlowers(count);
            }
            return true;
        }
        return false;
    }

    // Обновление формы
    function updateShape(newIndex) {
        currentShapeIndex = Math.max(0, Math.min(newIndex, shapes.length - 1));
        document.querySelectorAll('.form-shape').forEach(shape => {
            shape.classList.remove('active');
        });
        const shapeElement = document.querySelector(`.${shapes[currentShapeIndex]}`);
        if (shapeElement) {
            shapeElement.classList.add('active');
        }
        updateArrowVisibility();
        if (currentShapeIndex === 0) {
            drawFlowers(selectedFlowerCount);
        } else {
            svg.innerHTML = '';
        }
    }

    // Обновление видимости стрелок
    function updateArrowVisibility() {
        arrowTop.style.display = count >= 15 ? 'none' : 'flex';
        arrowBottom.style.display = count <= 1 ? 'none' : 'flex';
        arrowRight.style.display = currentShapeIndex >= shapes.length - 1 ? 'none' : 'flex';
        arrowLeft.style.display = currentShapeIndex <= 0 ? 'none' : 'flex';
    }

    // Инициализация начальных значений
    countElement.textContent = '5';
    updateCount(5);
    updateShape(0);
    updateArrowVisibility();

    // Начало перетаскивания
    function startDragging(e, element, isVertical = true) {
        if (Date.now() - lastActionTime < DEBOUNCE_TIME) return;
        isDragging = true;
        dragTarget = element;
        if (isVertical) {
            startY = e.clientY;
        } else {
            startX = e.clientX;
        }
        element.style.transition = 'none';
        e.preventDefault();
    }

    // Обработка перетаскивания
    function handleDragging(e) {
        if (!isDragging || !dragTarget) return;
        const isVertical = dragTarget === stepper;
        const delta = isVertical ? e.clientY - startY : e.clientX - startX;
        const move = Math.min(Math.max(delta * 0.4, -maxOffset), maxOffset);
        dragTarget.style.transform = isVertical ? `translateY(${move}px)` : `translateX(${move}px)`;
        if (Math.abs(delta) > sensitivity) {
            const change = isVertical ? (delta < 0 ? 1 : -1) : (delta > 0 ? 1 : -1);
            if (isVertical) {
                if (updateCount(count + (change * 2))) {
                    startY = e.clientY;
                    dragTarget.style.transition = 'transform 0.2s ease-out';
                    setTimeout(() => {
                        dragTarget.style.transform = 'translateY(0)';
                    }, 10);
                    lastActionTime = Date.now();
                }
            } else {
                const newIndex = currentShapeIndex + change;
                if (newIndex >= 0 && newIndex < shapes.length) {
                    updateShape(newIndex);
                    startX = e.clientX;
                    dragTarget.style.transition = 'transform 0.2s ease-out';
                    setTimeout(() => {
                        dragTarget.style.transform = 'translateX(0)';
                    }, 10);
                    lastActionTime = Date.now();
                }
            }
        }
    }

    // Завершение перетаскивания
    function stopDragging() {
        if (isDragging && dragTarget) {
            isDragging = false;
            const isVertical = dragTarget === stepper;
            dragTarget.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.7, 0.4, 1.2)';
            dragTarget.style.transform = isVertical ? 'translateY(0)' : 'translateX(0)';
            dragTarget = null;
            lastActionTime = Date.now();
        }
    }

    // Обработчики перетаскивания
    stepper.addEventListener('mousedown', function(e) {
        if (e.target.closest('.arrow-btn')) return;
        startDragging(e, stepper, true);
    });
    formDisplay.addEventListener('mousedown', function(e) {
        if (e.target.closest('.arrow-btn')) return;
        startDragging(e, formDisplay, false);
    });
    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', stopDragging);

    // Изменение значения кнопками
    function changeValue(btn) {
        if (Date.now() - lastActionTime < DEBOUNCE_TIME) return;
        const isCounter = btn === arrowTop || btn === arrowBottom;
        const change = isCounter
            ? (btn === arrowTop ? 2 : -2)
            : (btn === arrowRight ? 1 : -1);
        if (isCounter) {
            updateCount(count + change);
        } else {
            updateShape(currentShapeIndex + change);
        }
        const element = isCounter ? stepper : formDisplay;
        const transformProp = isCounter ? 'translateY' : 'translateX';
        const offset = isCounter
            ? (btn === arrowTop ? -6 : 6)
            : (btn === arrowRight ? 6 : -6);
        element.style.transition = 'transform 0.1s ease-out';
        element.style.transform = `${transformProp}(${offset}px)`;
        setTimeout(() => {
            element.style.transition = 'transform 0.3s ease-out';
            element.style.transform = `${transformProp}(0)`;
        }, 100);
        lastActionTime = Date.now();
    }

    // Запуск непрерывного изменения
    function startContinuousChange(btn) {
        if (arrowInterval) return;
        changeValue(btn);
        arrowInterval = setInterval(() => changeValue(btn), 200);
    }

    // Остановка непрерывного изменения
    function stopContinuousChange() {
        clearInterval(arrowInterval);
        arrowInterval = null;
    }

    // Обработчики кнопок
    [arrowTop, arrowBottom, arrowLeft, arrowRight].forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            changeValue(btn);
        });
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startContinuousChange(btn);
        });
        btn.addEventListener('mouseup', stopContinuousChange);
        btn.addEventListener('mouseleave', stopContinuousChange);
    });

    // Вычисление свободных областей
    function calculateFreeAreas(packer, width, height, margin) {
        const gridSize = 2;
        const circles = packer.list.map(circle => ({
            x: circle.c.x + width / 2,
            y: circle.c.y + height / 2,
            r: circle.r + 0.3
        }));
        const border = {
            x: 0,
            y: 0,
            width: width,
            height: height,
            cx: width / 2,
            cy: height / 2,
            r: width / 2
        };
        const cols = Math.ceil(border.width / gridSize);
        const rows = Math.ceil(border.height / gridSize);
        const visited = new Array(cols).fill().map(() => new Array(rows).fill(false));
        const regions = [];
        function isOutsideCircles(x, y) {
            const minDistanceThreshold = gridSize * 0.3;
            const distToCenter = Math.sqrt((x - border.cx) ** 2 + (y - border.cy) ** 2);
            if (distToCenter > border.r + minDistanceThreshold) {
                return false;
            }
            for (const circle of circles) {
                const dx = x - circle.x;
                const dy = y - circle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= circle.r + minDistanceThreshold) {
                    return false;
                }
            }
            return true;
        }
        function bfs(startX, startY) {
            const queue = [[startX, startY]];
            const points = [];
            while (queue.length > 0) {
                const [x, y] = queue.shift();
                const col = Math.floor(x / gridSize);
                const row = Math.floor(y / gridSize);
                if (col < 0 || col >= cols || row < 0 || row >= rows || visited[col][row]) {
                    continue;
                }
                visited[col][row] = true;
                const cellCenterX = col * gridSize + gridSize / 2;
                const cellCenterY = row * gridSize + gridSize / 2;
                if (isOutsideCircles(cellCenterX, cellCenterY)) {
                    points.push([cellCenterX, cellCenterY]);
                    queue.push([x + gridSize, y]);
                    queue.push([x - gridSize, y]);
                    queue.push([x, y + gridSize]);
                    queue.push([x, y - gridSize]);
                    queue.push([x + gridSize, y + gridSize]);
                    queue.push([x - gridSize, y - gridSize]);
                    queue.push([x + gridSize, y - gridSize]);
                    queue.push([x - gridSize, y + gridSize]);
                }
            }
            if (points.length > 0) {
                regions.push({
                    points: points
                });
            }
        }
        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                if (!visited[col][row]) {
                    const x = col * gridSize + gridSize / 2;
                    const y = row * gridSize + gridSize / 2;
                    if (isOutsideCircles(x, y)) {
                        bfs(col * gridSize, row * gridSize);
                    } else {
                        visited[col][row] = true;
                    }
                }
            }
        }
        return { regions, gridSize };
    }

    // Создание путей для свободных областей
    function createRegionPaths(packer, regions, svg, gridSize, border, zoom, margin) {
        const regionsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        regionsGroup.setAttribute("class", "free-regions");
        const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipPath.setAttribute("id", "border-clip");
        const clipCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        clipCircle.setAttribute("cx", (border.cx * zoom + margin).toString());
        clipCircle.setAttribute("cy", (border.cy * zoom + margin).toString());
        clipCircle.setAttribute("r", (border.r * zoom).toString());
        clipPath.appendChild(clipCircle);
        svg.appendChild(clipPath);
        regionsGroup.setAttribute("clip-path", "url(#border-clip)");
        const validRegions = [];
        const processedHulls = [];
        const corners = [
            [border.cx - border.r, border.cy - border.r],
            [border.cx + border.r, border.cy - border.r],
            [border.cx - border.r, border.cy + border.r],
            [border.cx + border.r, border.cy + border.r]
        ];
        const totalArea = Math.PI * (border.r ** 2);
        const minAreaThreshold = selectedFlowerCount === 15 ? 0.02 * totalArea : 0.07 * totalArea;

        // Добавление трёх прямоугольных областей для n=13
        if (selectedFlowerCount === 13) {
            const circles = packer.list.map(circle => ({
                x: circle.c.x + border.width / 2,
                y: circle.c.y + border.height / 2,
                r: circle.r
            }));
            const innerCircles = circles.slice(10, 13); // Внутренние круги (3)
            const outerCircles = circles.slice(0, 10); // Внешние круги (10)
            for (let i = 0; i < innerCircles.length; i++) {
                const inner1 = innerCircles[i];
                const inner2 = innerCircles[(i + 1) % 3]; // Следующий внутренний круг
                // Находим ближайший внешний круг к середине между inner1 и inner2
                const midX = (inner1.x + inner2.x) / 2;
                const midY = (inner1.y + inner2.y) / 2;
                let closestOuter = null;
                let minDist = Infinity;
                outerCircles.forEach(outer => {
                    const dx = midX - outer.x;
                    const dy = midY - outer.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < minDist) {
                        minDist = dist;
                        closestOuter = outer;
                    }
                });
                // Направление от центра треугольника к середине между внутренними кругами
                const centerX = innerCircles.reduce((sum, c) => sum + c.x, 0) / 3;
                const centerY = innerCircles.reduce((sum, c) => sum + c.y, 0) / 3;
                const dirX = midX - centerX;
                const dirY = midY - centerY;
                const dirLen = Math.sqrt(dirX * dirX + dirY * dirY) || 0.01;
                const normDirX = dirX / dirLen;
                const normDirY = dirY / dirLen;
                // Перпендикулярное направление для ширины прямоугольника
                const perpX = -normDirY;
                const perpY = normDirX;
                // Параметры прямоугольника
                const offsetInner = unitRadius * 0.2; // Смещение для внутренних кругов
                const offsetOuter = unitRadius * 1.8; // Смещение для внешнего круга
                const widthOffset = unitRadius * 2.4; // Половина ширины прямоугольника
                const lengthFactor = 0.8; // Ограничение длины до 80% расстояния
                const outerPointX = midX + lengthFactor * (closestOuter.x - midX);
                const outerPointY = midY + lengthFactor * (closestOuter.y - midY);
                // Точки прямоугольника
                const hullPoints = [
                    // Внутренняя сторона (у inner1)
                    [inner1.x + offsetInner * normDirX + widthOffset * perpX, inner1.y + offsetInner * normDirY + widthOffset * perpY],
                    // Внутренняя сторона (у inner2)
                    [inner2.x + offsetInner * normDirX - widthOffset * perpX, inner2.y + offsetInner * normDirY - widthOffset * perpY],
                    // Внешняя сторона (ближе к closestOuter)
                    [outerPointX - widthOffset * perpX, outerPointY - widthOffset * perpY],
                    // Внешняя сторона (ближе к closestOuter)
                    [outerPointX + widthOffset * perpX, outerPointY + widthOffset * perpY]
                ];
                const centroid = {
                    x: hullPoints.reduce((sum, p) => sum + p[0], 0) / hullPoints.length,
                    y: hullPoints.reduce((sum, p) => sum + p[1], 0) / hullPoints.length
                };
                let signedArea = 0;
                for (let j = 0; j < hullPoints.length; j++) {
                    const x0 = hullPoints[j][0];
                    const y0 = hullPoints[j][1];
                    const x1 = hullPoints[(j + 1) % hullPoints.length][0];
                    const y1 = hullPoints[(j + 1) % hullPoints.length][1];
                    signedArea += x0 * y1 - x1 * y0;
                }
                signedArea *= 0.5;
                const hull = convexHull(hullPoints);
                if (hull.length >= 3) {
                    validRegions.push({
                        points: hullPoints,
                        hull: hull,
                        area: Math.abs(signedArea),
                        centroid: centroid
                    });
                    processedHulls.push(hull);
                }
            }
        }

        // Обработка регионов
        regions.forEach((region, index) => {
            if (region.points.length < 3) {
                return;
            }
            let hull = convexHull(region.points);
            if (hull.length < 3) {
                return;
            }
            const cornerThreshold = gridSize;
            corners.forEach(corner => {
                const [cx, cy] = corner;
                const distToCenter = Math.sqrt((cx - border.cx) ** 2 + (cy - border.cy) ** 2);
                if (Math.abs(distToCenter - border.r) < cornerThreshold) {
                    let isValidCorner = true;
                    for (const circle of packer.list) {
                        const circleX = circle.c.x + border.width / 2;
                        const circleY = circle.c.y + border.height / 2;
                        const circleR = circle.r;
                        const dist = Math.sqrt((cx - circleX) ** 2 + (cy - circleY) ** 2);
                        if (dist <= circleR + gridSize * 0.3) {
                            isValidCorner = false;
                            break;
                        }
                    }
                    if (isValidCorner) {
                        hull.push([cx, cy]);
                    }
                }
            });
            hull = convexHull(hull);
            if (hull.length < 3) {
                return;
            }
            let signedArea = 0;
            let cx = 0, cy = 0;
            for (let i = 0; i < hull.length; i++) {
                const x0 = hull[i][0];
                const y0 = hull[i][1];
                const x1 = hull[(i + 1) % hull.length][0];
                const y1 = hull[(i + 1) % hull.length][1];
                const a = x0 * y1 - x1 * y0;
                signedArea += a;
                cx += (x0 + x1) * a;
                cy += (y0 + y1) * a;
            }
            signedArea *= 0.5;
            const area = Math.abs(signedArea);
            if (area >= minAreaThreshold) {
                if (!processedHulls.some(existingHull => doRegionsIntersect(hull, existingHull))) {
                    validRegions.push({ points: region.points, hull, area, centroid: { x: cx / (6 * signedArea), y: cy / (6 * signedArea) } });
                    processedHulls.push(hull);
                }
            }
        });
        validRegions.sort((a, b) => b.area - a.area);
        validRegions.forEach((region, regionIndex) => {
            let hull = region.hull;
            if (hull.length < 3) return;
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            let pathData = `M ${(hull[0][0] * zoom + margin)} ${(hull[0][1] * zoom + margin)}`;
            const controlPointDist = 0.1 * gridSize * zoom;
            for (let i = 0; i < hull.length; i++) {
                const p1 = hull[i];
                const p2 = hull[(i + 1) % hull.length];
                const p3 = hull[(i + 2) % hull.length] || hull[0];
                const cp1x = p1[0] + (p2[0] - p1[0]) * 0.2;
                const cp1y = p1[1] + (p2[1] - p1[1]) * 0.2;
                const cp2x = p2[0] - (p3[0] - p2[0]) * 0.2;
                const cp2y = p2[1] - (p3[1] - p2[1]) * 0.2;
                pathData += ` C ${(cp1x * zoom + margin)} ${(cp1y * zoom + margin)}, ${(cp2x * zoom + margin)} ${(cp2y * zoom + margin)}, ${(p2[0] * zoom + margin)} ${(p2[1] * zoom + margin)}`;
            }
            pathData += " Z";
            path.setAttribute("d", pathData);
            path.setAttribute("fill", "#9cce88");
            path.setAttribute("opacity", "0.7");
            path.setAttribute("class", "free-region");
            path.addEventListener('mouseenter', function(e) {
                e.stopPropagation();
                this.setAttribute('opacity', '0.9');
                this.setAttribute('fill', "#8ebb7c");
            });
            path.addEventListener('mouseleave', function(e) {
                e.stopPropagation();
                this.setAttribute('opacity', '0.7');
                this.setAttribute('fill', "#9cce88");
            });
            regionsGroup.appendChild(path);
            const cx = region.centroid.x;
            const cy = region.centroid.y;
            const xCoords = hull.map(p => p[0]);
            const yCoords = hull.map(p => p[1]);
            const width = Math.max(...xCoords) - Math.min(...xCoords);
            const height = Math.max(...yCoords) - Math.min(...yCoords);
            const minDimension = Math.min(width, height);
            const basePlusSize = gridSize * 2;
            const plusSize = Math.max(basePlusSize, minDimension * 0.2);
            const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line1.setAttribute("x1", (cx - plusSize / 2) * zoom + margin);
            line1.setAttribute("y1", cy * zoom + margin);
            line1.setAttribute("x2", (cx + plusSize / 2) * zoom + margin);
            line1.setAttribute("y2", cy * zoom + margin);
            line1.setAttribute("stroke", "#fedfd7");
            line1.setAttribute("stroke-width", "4");
            line1.setAttribute("stroke-linecap", "round");
            line1.setAttribute("pointer-events", "none");
            regionsGroup.appendChild(line1);
            const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line2.setAttribute("x1", cx * zoom + margin);
            line2.setAttribute("y1", (cy - plusSize / 2) * zoom + margin);
            line2.setAttribute("x2", cx * zoom + margin);
            line2.setAttribute("y2", (cy + plusSize / 2) * zoom + margin);
            line2.setAttribute("stroke", "#fedfd7");
            line2.setAttribute("stroke-width", "4");
            line2.setAttribute("stroke-linecap", "round");
            line2.setAttribute("pointer-events", "none");
            regionsGroup.appendChild(line2);
        });
        svg.insertBefore(regionsGroup, svg.firstChild);
    }

    // Вычисление выпуклой оболочки
    function convexHull(points) {
        if (points.length < 3) return points;
        let leftmost = 0;
        for (let i = 1; i < points.length; i++) {
            if (points[i][0] < points[leftmost][0] ||
                (points[i][0] === points[leftmost][0] && points[i][1] < points[leftmost][1])) {
                leftmost = i;
            }
        }
        const hull = [];
        let current = leftmost;
        let next;
        do {
            hull.push(points[current]);
            next = (current + 1) % points.length;
            for (let i = 0; i < points.length; i++) {
                if (i === current) continue;
                const o = orientation(points[current], points[i], points[next]);
                if (o > 0 || (o === 0 && distance(points[current], points[i]) > distance(points[current], points[next]))) {
                    next = i;
                }
            }
            current = next;
        } while (current !== leftmost);
        return hull;
    }

    // Вычисление ориентации
    function orientation(p, q, r) {
        return (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    }

    // Вычисление расстояния
    function distance(p1, p2) {
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Проверка пересечения регионов
    function doRegionsIntersect(hull1, hull2) {
        function projectPolygon(hull, axis) {
            let min = Infinity, max = -Infinity;
            for (const point of hull) {
                const dot = point[0] * axis[0] + point[1] * axis[1];
                min = Math.min(min, dot);
                max = Math.max(max, dot);
            }
            return { min, max };
        }
        function getAxes(hull) {
            const axes = [];
            for (let i = 0; i < hull.length; i++) {
                const p1 = hull[i];
                const p2 = hull[(i + 1) % hull.length];
                const edge = [p2[0] - p1[0], p2[1] - p1[1]];
                const normal = [-edge[1], edge[0]];
                const length = Math.sqrt(normal[0] ** 2 + normal[1] ** 2);
                if (length > 0) {
                    normal[0] /= length;
                    normal[1] /= length;
                    axes.push(normal);
                }
            }
            return axes;
        }
        const axes = [...getAxes(hull1), ...getAxes(hull2)];
        const buffer = 1;
        for (const axis of axes) {
            const proj1 = projectPolygon(hull1, axis);
            const proj2 = projectPolygon(hull2, axis);
            if (proj1.max + buffer < proj2.min || proj2.max + buffer < proj1.min) {
                return false;
            }
        }
        return true;
    }

    // Отрисовка кругов и областей
    function drawFlowers(n) {
        svg.innerHTML = '';
        if (currentShapeIndex !== 0) return;
        const packer = new Packer(n);
        if (!packer.list || packer.list.length === 0) {
            return;
        }
        const w = bestContainerRadius * 2;
        const h = w;
        const margin = 20;
        const maxWidth = window.innerWidth * 0.7 - margin * 2;
        const maxHeight = window.innerHeight * 0.8 - margin * 2;
        const zoom = Math.min(maxWidth / w, maxHeight / h);
        const scaleFactor = n === 1 ? 0.6 : 1;
        const strokeWidth = n === 1 ? 4 / scaleFactor : 4;
        const border = {
            x: 0,
            y: 0,
            width: w,
            height: h,
            cx: w / 2,
            cy: h / 2,
            r: w / 2
        };
        const viewBoxWidth = w * zoom + margin * 2;
        const viewBoxHeight = h * zoom + margin * 2;
        svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
        svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
        const contentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        if (n === 1) {
            const centerX = viewBoxWidth / 2;
            const centerY = viewBoxHeight / 2;
            contentGroup.setAttribute("transform", `translate(${centerX},${centerY}) scale(${scaleFactor}) translate(${-centerX},${-centerY})`);
        }
        svg.appendChild(contentGroup);
        const borderCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        borderCircle.setAttribute("cx", (border.cx * zoom + margin).toString());
        borderCircle.setAttribute("cy", (border.cy * zoom + margin).toString());
        borderCircle.setAttribute("r", (border.r * zoom).toString());
        borderCircle.setAttribute("fill", "none");
        borderCircle.setAttribute("stroke", "#fedfd7");
        borderCircle.setAttribute("stroke-width", strokeWidth.toString());
        borderCircle.setAttribute("pointer-events", "none");
        contentGroup.appendChild(borderCircle);
        if (n !== 1) {
            try {
                const { regions, gridSize } = calculateFreeAreas(packer, w, h, margin);
                createRegionPaths(packer, regions, contentGroup, gridSize, border, zoom, margin);
            } catch (error) {
                console.error(error);
            }
        }
        packer.list.forEach((circle) => {
            const cx = (circle.c.x + w / 2) * zoom + margin;
            const cy = (circle.c.y + h / 2) * zoom + margin;
            const radius = circle.r * zoom;
            const circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circleEl.setAttribute("cx", cx.toString());
            circleEl.setAttribute("cy", cy.toString());
            circleEl.setAttribute("r", radius.toString());
            circleEl.setAttribute("fill", "#fd8264");
            circleEl.setAttribute("stroke", "#fedfd7");
            circleEl.setAttribute("stroke-width", strokeWidth.toString());
            contentGroup.appendChild(circleEl);

            const plusSize = radius * 0.4;
            const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line1.setAttribute("x1", (cx - plusSize / 2).toString());
            line1.setAttribute("y1", cy.toString());
            line1.setAttribute("x2", (cx + plusSize / 2).toString());
            line1.setAttribute("y2", cy.toString());
            line1.setAttribute("stroke", "#fedfd7");
            line1.setAttribute("stroke-width", strokeWidth.toString());
            line1.setAttribute("stroke-linecap", "round");
            line1.setAttribute("pointer-events", "none");

            contentGroup.appendChild(line1);
            const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line2.setAttribute("x1", cx.toString());
            line2.setAttribute("y1", (cy - plusSize / 2).toString());
            line2.setAttribute("x2", cx.toString());
            line2.setAttribute("y2", (cy + plusSize / 2).toString());
            line2.setAttribute("stroke", "#fedfd7");
            line2.setAttribute("stroke-width", strokeWidth.toString());
            line2.setAttribute("stroke-linecap", "round");
            line2.setAttribute("pointer-events", "none");
            contentGroup.appendChild(line2);
        });
    }

    // Начальная отрисовка
    drawFlowers(5);

    // Обновление при изменении окна
    window.addEventListener('resize', function() {
        if (currentShapeIndex === 0) {
            drawFlowers(selectedFlowerCount);
        }
    });

    // Обработчик кнопки Next
    document.querySelector('.next-btn-short')?.addEventListener('click', function() {
        if (currentShapeIndex === 0) {
            drawFlowers(selectedFlowerCount);
        }
    });
});