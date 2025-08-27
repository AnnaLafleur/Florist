document.addEventListener('DOMContentLoaded', function() {
    const svgEllipse = document.getElementById('ellipse-svg');
    if (!svgEllipse) return;

    // Настройки SVG - фиксированные размеры
    svgEllipse.style.width = '60%';
    svgEllipse.style.height = 'auto';

    // Параметры эллипса
    const unitRadius = 32;
    let bestContainerRadius = Infinity;
    const perspectiveScale = 0.7;

    // Список цветов и их параметры
    const sizeMultipliers = {
        'carnation': 1.2, 'dahlia': 1.242, 'hippeastrum': 1.2, 'hydrangea': 1.5,
        'iris': 1.326, 'calla': 1.416, 'camellia': 1.2, 'crocus': 1.2,
        'lisianthus': 1.2, 'lily': 1.416, 'forget-me-not': 1.242, 'orchid': 1.326,
        'peony': 1.416, 'ranunculus': 1.242, 'rose': 1.242, 'lilac': 1.5,
        'tulip': 1.2, 'chrysanthemum': 1.326, 'cymbidium': 1.2, 'eustoma': 1.242
    };

    // Цветы, которые нужно поворачивать
    const flowersToRotate = ['iris', 'calla', 'crocus', 'orchid'];

    // Класс Ball
    class Ball {
        constructor(x, y, radius) {
            this.r = radius;
            this.velocity = { x: 0, y: 0 };
            this.position = { x: x, y: y };
        }
        applyForce(force) {
            this.velocity.x += force.x;
            this.velocity.y += force.y;
            const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
            if (speed > 1.0) {
                this.velocity.x = (this.velocity.x / speed) * 1.0;
                this.velocity.y = (this.velocity.y / speed) * 1.0;
            }
        }
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

    // Класс Packer
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

        estimateContainerRadius(n) {
            if (n === 1) return unitRadius * 0.6;
            if (n === 3) return unitRadius * 2.0;
            return unitRadius * Math.sqrt(n / 0.9);
        }

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
                const outerCount = n === 11 ? 8 : 10;
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

        deterministicRandom(seed, index) {
            const x = Math.sin(seed + index * 1000) * 10000;
            return x - Math.floor(x);
        }

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

        update() {
            this.iter++;
            this.hasCollisions = false;
            this.maxVelocity = 0;
            if (this.iter < 2000 && this.balls.length !== 9 && this.balls.length !== 11 && this.balls.length !== 13) {
                for (let ball of this.balls) {
                    const noiseX = (this.deterministicRandom(this.seed, ball.position.x * 1000 + this.iter) - 0.5) * 0.6;
                    const noiseY = (this.deterministicRandom(this.seed, ball.position.y * 1000 + this.iter + 1000) - 0.5) * 0.6;
                    ball.position.x += noiseX;
                    ball.position.y += noiseY;
                }
            }
            for (let ball of this.balls) {
                const d = Math.sqrt(ball.position.x ** 2 + ball.position.y ** 2);
                if (d > this.containerRadius - ball.r) {
                    const norm = { x: ball.position.x / (d || 0.01), y: ball.position.y / (d || 0.01) };
                    ball.position.x = norm.x * (this.containerRadius - ball.r - 0.01);
                    ball.position.y = norm.y * (this.containerRadius - ball.r - 0.01);
                    ball.velocity.x *= -0.8;
                    ball.velocity.y *= -0.8;
                    this.hasCollisions = true;
                }
                const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
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
                        const force = { x: dx / (d || 0.01), y: dy / (d || 0.01) };
                        ball1.position.x += force.x * overlap * 0.8;
                        ball1.position.y += force.y * overlap * 0.8;
                        ball2.position.x -= force.x * overlap * 0.8;
                        ball2.position.y -= force.y * overlap * 0.8;
                        const forceMagnitude = overlap * 5.0 * (1.0 + 2.0);
                        ball1.applyForce({ x: force.x * forceMagnitude, y: force.y * forceMagnitude });
                        ball2.applyForce({ x: -force.x * forceMagnitude, y: -force.y * forceMagnitude });
                    }
                }
            }
            for (let ball of this.balls) {
                ball.update(this.seed + this.iter, this.iter);
            }
        }

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
                            const force = { x: dx / (d || 0.01), y: dy / (d || 0.01) };
                            ball1.position.x += force.x * overlap * step;
                            ball1.position.y += force.y * overlap * step;
                            ball2.position.x -= force.x * overlap * step;
                            ball2.position.y -= force.y * overlap * step;
                        }
                    }
                }
                for (let ball of this.balls) {
                    const d = Math.sqrt(ball.position.x ** 2 + ball.position.y ** 2);
                    if (d > this.containerRadius - ball.r) {
                        const norm = { x: ball.position.x / (d || 0.01), y: ball.position.y / (d || 0.01) };
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
            return this.maxVelocity < 0.005 || this.iter >= 2000;
        }

        getCurrentContainerRadius() {
            let maxDist = 0;
            for (let ball of this.balls) {
                const d = Math.sqrt(ball.position.x ** 2 + ball.position.y ** 2) + ball.r;
                maxDist = Math.max(maxDist, d);
            }
            return maxDist;
        }

        solve(n_circles) {
            this.balls = [];
            bestContainerRadius = Infinity;
            this.containerRadius = this.estimateContainerRadius(n_circles);
            if (n_circles === 3) {
                const r = unitRadius * 2;
                this.balls.push(new Ball(0, -r, unitRadius));
                this.balls.push(new Ball(r * Math.cos(Math.PI / 6), r * Math.sin(Math.PI / 6), unitRadius));
                this.balls.push(new Ball(-r * Math.cos(Math.PI / 6), r * Math.sin(Math.PI / 6), unitRadius));
            } else if (n_circles === 9 || n_circles === 11 || n_circles === 13) {
                this.balls = this.createSpecialConfiguration(n_circles);
                if (n_circles === 13) {
                    this.finalizeAdjustments = this.finalizePositions();
                    bestContainerRadius = this.getCurrentContainerRadius();
                    return this.balls.map(ball => ({ c: { x: ball.position.x, y: ball.position.y }, r: ball.r }));
                }
            } else {
                for (let i = 0; i < n_circles; i++) {
                    const angle = (i * 137.5) % 360 * (Math.PI / 180);
                    const r = (this.deterministicRandom(this.seed, i) * 0.5 + 0.5) * (this.containerRadius - unitRadius) * 0.3;
                    this.balls.push(new Ball(Math.cos(angle) * r, Math.sin(angle) * r, n_circles === 1 ? unitRadius * 0.5 : unitRadius));
                }
            }
            let bestConfiguration = [];
            while (!this.isSettled() && this.iter < 2000) {
                this.update();
                const currentRadius = this.getCurrentContainerRadius();
                if (currentRadius < bestContainerRadius && !this.hasOverlaps(this.balls)) {
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
            return this.balls.map(ball => ({ c: { x: ball.position.x, y: ball.position.y }, r: ball.r }));
        }
    }

    function deterministicRandom(seed, index) {
        const x = Math.sin(seed + index * 1000) * 10000;
        return x - Math.floor(x);
    }

    function getFlowerCount() {
        const countElement = document.querySelector('.count');
        return countElement ? parseInt(countElement.textContent, 10) : 5;
    }

    function getFlowerData() {
        const svg = document.getElementById('flowers-svg');
        if (!svg) return [];

        const flowerGroups = svg.querySelectorAll('g.flower-group');
        const flowerData = [];

        flowerGroups.forEach((group, index) => {
            const image = group.querySelector('image.flower-image');
            if (!image) return;

            const href = image.getAttribute('href');
            const match = href.match(/animation\/([^\/]+)\/([^\/]+)\/0001\.png$/);
            if (!match) return;

            const flowerName = match[1];
            const color = match[2];
            const transform = group.getAttribute('transform') || '';
            const rotationMatch = transform.match(/rotate\(([^,]+),/);
            const rotation = rotationMatch ? parseFloat(rotationMatch[1]) : 0;

            flowerData.push({
                flowerName,
                color,
                rotation,
                originalIndex: index
            });
        });

        return flowerData;
    }

    function drawEllipse() {
        svgEllipse.innerHTML = '';

        const count = getFlowerCount();
        const flowerData = getFlowerData();

        const packer = new Packer(count);
        if (!packer.list || packer.list.length === 0) return;

        const w = bestContainerRadius * 2;
        const h = w;
        const margin = 50;

        // Фиксированный zoom вместо динамического расчета
        const zoom = 2.8; // Фиксированный коэффициент масштабирования

        // Увеличиваем viewBox для предотвращения обрезания
        const viewBoxYOffset = 400;
        const viewBoxHeight = h * zoom * perspectiveScale + margin * 2 + viewBoxYOffset;
        const xOffset = -50;
        const yOffset = -280;

        // Сохраняем оригинальные размеры viewBox по ширине
        const viewBoxWidth = w * zoom + margin * 2 + 50;
        svgEllipse.setAttribute('viewBox', `${-margin} -${viewBoxYOffset} ${viewBoxWidth} ${viewBoxHeight}`);
        svgEllipse.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // Создаем группы для разных слоев
        const backgroundGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const contentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const foregroundGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        svgEllipse.appendChild(backgroundGroup);
        svgEllipse.appendChild(contentGroup);
        svgEllipse.appendChild(foregroundGroup);

        // Параметры для фоновых изображений
        const bgWidth = w * zoom * 3.3;
        const bgHeight = h * zoom * perspectiveScale * 3.3;
        const bgYOffset = 100;
        const bgXOffset = (viewBoxWidth - bgWidth) / 2 - margin;

        // Центр эллипса
        const ellipseCenterX = w/2 * zoom + margin + xOffset;
        const ellipseCenterY = (h/2 * zoom * perspectiveScale + margin) + yOffset;

        // Фоновое изображение (paper2) - центрируем относительно эллипса
        const paper2 = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        paper2.setAttribute('href', 'img/texture/paper2/0001/white.png');
        paper2.setAttribute('width', (bgWidth * 1.05).toString());
        paper2.setAttribute('height', bgHeight.toString());
        paper2.setAttribute('x', (ellipseCenterX - bgWidth/2 - 25).toString());
        paper2.setAttribute('y', (ellipseCenterY - bgHeight/2 + bgYOffset + 20).toString());
        backgroundGroup.appendChild(paper2);

        // Основное содержимое (цветы)
        const positions = packer.list.map((circle, index) => ({
            originalIndex: index,
            cx: (circle.c.x + w/2) * zoom + margin + xOffset,
            cy: ((circle.c.y + h/2) * zoom * perspectiveScale + margin) + yOffset,
            r: (count === 1 ? unitRadius * 0.5 : unitRadius) * zoom
        })).sort((a, b) => a.cy - b.cy);

        positions.forEach(pos => {
            const flower = flowerData.find(f => f.originalIndex === pos.originalIndex);
            if (!flower) return;

            const sizeMultiplier = sizeMultipliers[flower.flowerName] || 1;
            const imageSize = pos.r * 2 * sizeMultiplier;

            const flowerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            flowerGroup.setAttribute('class', 'flower-group');

            if (flower.rotation || flowersToRotate.includes(flower.flowerName)) {
                const finalRotation = flower.rotation || 0;
                flowerGroup.setAttribute('transform', `rotate(${finalRotation}, ${pos.cx}, ${pos.cy})`);
            }

            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('href', `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flower.flowerName}/${flower.color}/0001.png`);
            image.setAttribute('width', imageSize.toString());
            image.setAttribute('height', imageSize.toString());
            image.setAttribute('x', (pos.cx - imageSize/2).toString());
            image.setAttribute('y', (pos.cy - imageSize/2).toString());
            image.setAttribute('class', 'flower-image');

            flowerGroup.appendChild(image);
            contentGroup.appendChild(flowerGroup);
        });

        // Прозрачный эллипс
        const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        if (count === 1) {
            const innerCircle = packer.list[0];
            const centerX = (innerCircle.c.x + w/2) * zoom + margin + xOffset;
            const centerY = ((innerCircle.c.y + h/2) * zoom * perspectiveScale + margin) + yOffset;
            ellipse.setAttribute("cx", centerX.toString());
            ellipse.setAttribute("cy", centerY.toString());
            ellipse.setAttribute("rx", (unitRadius * 0.33 * zoom).toString());
            ellipse.setAttribute("ry", (unitRadius * 0.33 * zoom * perspectiveScale).toString());
        } else {
            ellipse.setAttribute("cx", ellipseCenterX.toString());
            ellipse.setAttribute("cy", ellipseCenterY.toString());
            ellipse.setAttribute("rx", (w/2 * zoom).toString());
            ellipse.setAttribute("ry", (h/2 * zoom * perspectiveScale).toString());
        }
        ellipse.setAttribute("fill", "none");
        ellipse.setAttribute("stroke", "transparent");
        ellipse.setAttribute("stroke-width", "0");
        contentGroup.appendChild(ellipse);

        // Верхнее изображение (paper1) - центрируем относительно эллипса и поднимаем выше
        const paper1 = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        paper1.setAttribute('href', 'img/texture/paper1/0001/white.png');
        paper1.setAttribute('width', (bgWidth * 1.05).toString()); // Увеличиваем ширину на 20%
        paper1.setAttribute('height', bgHeight.toString());
        paper1.setAttribute('x', (ellipseCenterX - bgWidth/2 - 5).toString()); // Центрируем новую ширину
        paper1.setAttribute('y', (ellipseCenterY - bgHeight/2 + bgYOffset - 30).toString()); // Опускаем на 30px (было -50)
        foregroundGroup.appendChild(paper1);
    }

    function initialize() {
        function checkVisibility() {
            const thirdStage = document.querySelector('.third-stage');
            if (thirdStage && thirdStage.style.display !== 'none') {
                drawEllipse();
                return true;
            }
            return false;
        }

        if (!checkVisibility()) {
            const thirdStage = document.querySelector('.third-stage');
            if (thirdStage) {
                const observer = new MutationObserver(function() {
                    checkVisibility();
                });
                observer.observe(thirdStage, {
                    attributes: true,
                    attributeFilter: ['style']
                });
            }
        }

        // Убрали обработчик ресайза
        // window.addEventListener('resize', drawEllipse);

        document.addEventListener('click', function(e) {
            if (e.target.closest('.next-btn-short, .next-btn, .arrow-left, .arrow-right')) {
                setTimeout(drawEllipse, 100);
            }
        });

        setTimeout(drawEllipse, 1000);
    }

    initialize();
});