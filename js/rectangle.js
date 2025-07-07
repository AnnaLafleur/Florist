document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const stepper = document.querySelector('.stepper');
    const countElement = stepper.querySelector('.count');
    const arrowTop = document.querySelector('.arrow-top');
    const arrowBottom = document.querySelector('.arrow-bottom');
    const formDisplay = document.querySelector('.form-display');
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    const shapes = ['form-circle', 'form-square', 'form-oval', 'form-rectangle'];

    // Состояние приложения
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

    // Вспомогательные функции
    function getOddNumber(num) {
        return Math.max(1, Math.min(15, num % 2 === 0 ? num - 1 : num));
    }

    function updateCount(newCount) {
        const validatedCount = getOddNumber(newCount);
        if (validatedCount !== count) {
            count = validatedCount;
            selectedFlowerCount = count;
            countElement.textContent = count;
            updateArrowVisibility();
            return true;
        }
        return false;
    }

    function updateShape(newIndex) {
        currentShapeIndex = Math.max(0, Math.min(newIndex, shapes.length - 1));
        document.querySelectorAll('.form-shape').forEach(shape => {
            shape.classList.remove('active');
        });
        document.querySelector(`.${shapes[currentShapeIndex]}`).classList.add('active');
        updateArrowVisibility();
    }

    function updateArrowVisibility() {
        arrowTop.style.display = count >= 15 ? 'none' : 'flex';
        arrowBottom.style.display = count <= 1 ? 'none' : 'flex';
        arrowRight.style.display = currentShapeIndex >= shapes.length - 1 ? 'none' : 'flex';
        arrowLeft.style.display = currentShapeIndex <= 0 ? 'none' : 'flex';
    }

    // Инициализация
    countElement.textContent = '5';
    updateCount(5);
    updateShape(0);
    updateArrowVisibility();

    // Логика перетаскивания
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

    // Обработчики событий перетаскивания
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

    // Изменение значений
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

        // Анимация
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

    // Непрерывное изменение при зажатии
    function startContinuousChange(btn) {
        if (arrowInterval) return;
        changeValue(btn);
        arrowInterval = setInterval(() => changeValue(btn), 200);
    }

    function stopContinuousChange() {
        clearInterval(arrowInterval);
        arrowInterval = null;
    }

    // Назначение обработчиков для стрелок
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

    // Алгоритм упаковки кругов
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        dist(p) { return this.vect(p).norm(); }
        vect(p) { return new Point(p.x - this.x, p.y - this.y); }
        norm() { return Math.sqrt(this.x * this.x + this.y * this.y); }
        add(p) { return new Point(this.x + p.x, this.y + p.y); }
        mult(a) { return new Point(this.x * a, this.y * a); }
    }

    class Circle {
        constructor(radius, center) {
            this.r = radius;
            this.c = center;
        }

        distance(circle) { return this.c.dist(circle.c) - this.r - circle.r; }
    }

    class Packer {
        constructor(n_circles) {
            this.n_circles = n_circles;
            this.radius = 0.5;
            this.circles = Array(n_circles).fill(this.radius);
            this.list = this.solve();
        }

        compute(surface, ratio) {
            var w = this.w = Math.sqrt(surface * ratio);
            var h = this.h = w / ratio;
            var r = this.radius;

            if (this.n_circles === 1) {
                w = this.w = 1.7;
                h = this.h = 1.2;
                return [new Circle(r, new Point(w / 2, h / 2))];
            }

            if (this.n_circles === 3) {
                w = this.w = 3;
                h = this.h = 1;
                return [
                    new Circle(r, new Point(w / 6, h / 2)),
                    new Circle(r, new Point(w / 2, h / 2)),
                    new Circle(r, new Point(5 * w / 6, h / 2))
                ];
            }

            if (Math.abs(w - h) < 1e-5) return [];

            function in_rect(radius, center) {
                if (center.x - radius < 0) return false;
                if (center.x + radius > w) return false;
                if (center.y - radius < 0) return false;
                if (center.y + radius > h) return false;
                return true;
            }

            function corner(radius, c1, c2) {
                var u = c1.c.vect(c2.c);
                var A = u.norm();
                if (A < 1e-6) return [];
                u = u.mult(1 / A);
                var B = c1.r + radius;
                var C = c2.r + radius;
                if (A > B + C) return [];
                var x = (A + (B * B - C * C) / A) / 2;
                var y = Math.sqrt(Math.max(0, B * B - x * x));
                if (isNaN(y)) y = 0;
                var base = c1.c.add(u.mult(x));

                var res = [];
                var p1 = new Point(base.x - u.y * y, base.y + u.x * y);
                var p2 = new Point(base.x + u.y * y, base.y - u.x * y);
                if (in_rect(radius, p1)) res.push({ circle: new Circle(radius, p1), touches: 0 });
                if (in_rect(radius, p2)) res.push({ circle: new Circle(radius, p2), touches: 0 });

                for (var i = 0; i < res.length; i++) {
                    if (Math.abs(c1.c.dist(res[i].circle.c) - 2 * r) < 1e-6) res[i].touches++;
                    if (Math.abs(c2.c.dist(res[i].circle.c) - 2 * r) < 1e-6) res[i].touches++;
                }

                return res;
            }

            var placed = [];
            if (this.n_circles >= 5) {
                placed = [
                    new Circle(r, new Point(r, r)),
                    new Circle(r, new Point(w - r, r)),
                    new Circle(r, new Point(r, h - r)),
                    new Circle(r, new Point(w - r, h - r))
                ];
                if (this.n_circles === 13) {
                    placed.push(new Circle(r, new Point(r + Math.sqrt(3)/2, r + r)));
                }
            }

            var unplaced = Array(this.n_circles - placed.length).fill(r);

            while (unplaced.length > 0) {
                var lambda = [];
                var circle = [];
                for (var i = 0; i < unplaced.length; i++) {
                    var lambda_min = Infinity;
                    lambda[i] = -Infinity;
                    for (var j = 0; j < placed.length; j++) {
                        for (var k = j + 1; k < placed.length; k++) {
                            var corners = corner(r, placed[j], placed[k]);
                            for (var c = 0; c < corners.length; c++) {
                                var d_min = Infinity;
                                var touches = corners[c].touches;
                                var extra_touches = 0;
                                for (var l = 0; l < placed.length; l++) {
                                    if (l == j || l == k) continue;
                                    var d = placed[l].distance(corners[c].circle);
                                    if (d <= 0) break;
                                    if (Math.abs(d) < 1e-6) extra_touches++;
                                    if (d < d_min) d_min = d;
                                }
                                if (l == placed.length) {
                                    var gain = 1 - d_min / r;
                                    if (touches >= 2) gain *= 1.4;
                                    if (this.n_circles === 13) {
                                        var cx = corners[c].circle.c.x;
                                        var cy = corners[c].circle.c.y;
                                        var expected_x = [
                                            r,
                                            r + Math.sqrt(3)/2,
                                            r + Math.sqrt(3),
                                            r + 3*Math.sqrt(3)/2,
                                            w - r
                                        ];
                                        var expected_y = [r, 2*r, 3*r, 4*r, 5*r];
                                        var close_x = false, close_y = false;
                                        for (var ex = 0; ex < expected_x.length; ex++) {
                                            if (Math.abs(cx - expected_x[ex]) < 0.3) {
                                                close_x = true;
                                                break;
                                            }
                                        }
                                        for (var ey = 0; ey < expected_y.length; ey++) {
                                            if (Math.abs(cy - expected_y[ey]) < 0.3) {
                                                close_y = true;
                                                break;
                                            }
                                        }
                                        if (close_x && close_y) {
                                            gain *= 1.8;
                                        }
                                        if (Math.abs(cx - r) < 0.1 || Math.abs(cx - (w - r)) < 0.1 ||
                                            Math.abs(cy - r) < 0.1 || Math.abs(cy - (h - r)) < 0.1) {
                                            gain *= 1.2;
                                        }
                                        if (touches + extra_touches >= 3) {
                                            gain *= 1.4;
                                        }
                                    }
                                    if (this.n_circles === 3) {
                                        var cx = corners[c].circle.c.x;
                                        var expected_x = [w / 3, w / 2, 2 * w / 3];
                                        for (var ex = 0; ex < expected_x.length; ex++) {
                                            if (Math.abs(cx - expected_x[ex]) < 0.3) {
                                                gain *= 1.5;
                                                break;
                                            }
                                        }
                                        if (Math.abs(cx - r) < 0.1 || Math.abs(cx - (w - r)) < 0.1) {
                                            gain *= 1.2;
                                        }
                                    }
                                    if (d_min < lambda_min) {
                                        lambda_min = d_min;
                                        lambda[i] = gain;
                                        circle[i] = corners[c].circle;
                                    }
                                }
                            }
                        }
                    }
                }

                var lambda_max = -Infinity;
                var i_max = -1;
                for (var i = 0; i < unplaced.length; i++) {
                    if (lambda[i] > lambda_max) {
                        lambda_max = lambda[i];
                        i_max = i;
                    }
                }

                if (i_max == -1) break;
                unplaced.splice(i_max, 1);
                placed.push(circle[i_max]);
            }

            if (placed.length >= 4) {
                var center_distance_1_3 = placed[0].c.dist(placed[2].c);
                var center_distance_2_4 = placed[1].c.dist(placed[3].c);
                if (center_distance_1_3 < 2 * r - 1e-6 || center_distance_2_4 < 2 * r - 1e-6) {
                    return [];
                }
            }

            return placed;
        }

        hasSymmetry(placement) {
            if (!placement || placement.length === 0) return false;
            if (this.n_circles === 13 || this.n_circles === 1 || this.n_circles === 3) return true;

            var w = this.w;
            var h = this.h;
            var centerX = w / 2;
            var centerY = h / 2;
            var tolerance = 0.2;

            var normalized = placement.map(c => new Point(c.c.x - centerX, c.c.y - centerY));

            var horizontalSymmetry = true;
            for (var i = 0; i < normalized.length; i++) {
                var c = normalized[i];
                var mirrored = new Point(c.x, -c.y);
                var found = false;

                for (var j = 0; j < normalized.length; j++) {
                    if (Math.abs(normalized[j].x - mirrored.x) < tolerance &&
                        Math.abs(normalized[j].y - mirrored.y) < tolerance) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    horizontalSymmetry = false;
                    break;
                }
            }

            var verticalSymmetry = true;
            for (var i = 0; i < normalized.length; i++) {
                var c = normalized[i];
                var mirrored = new Point(-c.x, c.y);
                var found = false;

                for (var j = 0; j < normalized.length; j++) {
                    if (Math.abs(normalized[j].x - mirrored.x) < tolerance &&
                        Math.abs(normalized[j].y - mirrored.y) < tolerance) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    verticalSymmetry = false;
                    break;
                }
            }

            return horizontalSymmetry || verticalSymmetry;
        }

        solve() {
            var r = this.radius;
            var circle_area = Math.PI * r * r;
            var total_surface = this.n_circles * circle_area;
            var best_density = 0;
            var best_placement = [];
            var best_w = 0;
            var best_h = 0;

            var valid_n = [1, 3, 5, 7, 9, 11, 13, 15];
            if (!valid_n.includes(this.n_circles)) {
                console.error("Invalid number of circles: must be 1, 3, 5, 7, 9, 11, 13, or 15");
                return [];
            }

            if (this.n_circles === 1) {
                var w = this.w = 1.7;
                var h = this.h = 1.2;
                return [new Circle(r, new Point(w / 2, h / 2))];
            }

            if (this.n_circles === 3) {
                var surface = 3;
                var ratio = 3;
                var placement = this.compute(surface, ratio);
                this.w = 3;
                this.h = 1;
                return placement;
            }

            if (this.n_circles === 15) {
                var w = 5 * 2 * r;
                var h = 3 * 2 * r;
                var dx = 2 * r;
                var dy = 2 * r;
                var placement = [];
                for (var row = 0; row < 3; row++) {
                    for (var col = 0; col < 5; col++) {
                        placement.push(new Circle(r, new Point(r + col * dx, r + row * dy)));
                    }
                }
                this.w = w;
                this.h = h;
                return placement;
            }

            var hex_density = 0.9069;
            var initial_surface = this.n_circles === 13 ? 9.91 : total_surface / hex_density;
            var ratios = [];
            var ratio_min = this.n_circles === 5 ? 1.2 : 1.0;
            var ratio_max = 2.0;
            var ratio_step = 0.002;

            if (this.n_circles === 13) {
                ratios.push((r + 2 * Math.sqrt(3)) / (5 * r));
            }
            for (var ratio = ratio_min; ratio <= ratio_max; ratio += ratio_step) {
                ratios.push(ratio);
            }

            for (var r_idx = 0; r_idx < ratios.length; r_idx++) {
                var ratio = ratios[r_idx];
                var surface = initial_surface;
                var limit = surface / 10000;
                var step = surface / 4;
                var placement = [];

                while (step > limit) {
                    var tmp_placement = this.compute(surface, ratio);
                    if (tmp_placement.length != this.n_circles) {
                        surface += step;
                    } else {
                        placement = tmp_placement;
                        surface -= step;
                    }
                    step /= 2;
                }

                if (placement.length == this.n_circles && this.hasSymmetry(placement)) {
                    var w = Math.sqrt(surface * ratio);
                    var h = w / ratio;
                    if (this.n_circles === 5 && Math.abs(h - 2.0) > 0.2) continue;
                    var density = total_surface / (w * h);
                    if (density > best_density) {
                        best_density = density;
                        best_placement = placement;
                        best_w = w;
                        best_h = h;
                    }
                }
            }

            if (this.n_circles === 9 && best_placement.length > 0) {
                for (var i = 0; i < best_placement.length; i++) {
                    if (Math.abs(best_placement[i].c.x - 1.5) < 0.1 && Math.abs(best_placement[i].c.y - 0.5) < 0.1) {
                        best_placement[i].c.x = 2.5;
                        best_placement[i].c.y = 0.5;
                        var valid = true;
                        for (var j = 0; j < best_placement.length; j++) {
                            if (i === j) continue;
                            if (best_placement[i].distance(best_placement[j]) < -1e-6) {
                                valid = false;
                                break;
                            }
                        }
                        if (!valid || best_placement[i].c.x + r > best_w || best_placement[i].c.x - r < 0 ||
                            best_placement[i].c.y + r > best_h || best_placement[i].c.y - r < 0) {
                            best_placement[i].c.x = 1.5;
                            best_placement[i].c.y = 0.5;
                        }
                        break;
                    }
                }
            }

            this.w = best_w;
            this.h = best_h;
            return best_placement;
        }
    }

    function calculateFreeAreas(packer, width, height, margin, zoom) {
        const gridSize = 0.025; // Уменьшен для большей точности
        const maxPoints = 2000; // Ограничение на количество точек в регионе
        const circles = packer.list.map(circle => ({
            x: circle.c.x,
            y: circle.c.y,
            r: circle.r
        }));

        const border = {
            x: 0,
            y: 0,
            width: width,
            height: height
        };

        const cols = Math.ceil(border.width / gridSize);
        const rows = Math.ceil(border.height / gridSize);

        // Матрица для отметки посещенных ячеек
        const visited = Array(cols).fill().map(() => Array(rows).fill(false));
        const regions = [];

        // Проверяем, находится ли точка вне всех кругов
        function isOutsideCircles(x, y) {
            const minDistanceThreshold = gridSize * 0.5; // Увеличен порог для включения краевых точек
            for (const circle of circles) {
                const dx = x - circle.x;
                const dy = y - circle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= circle.r + minDistanceThreshold) {
                    return false;
                }
            }
            return x >= border.x && x <= border.x + border.width &&
                   y >= border.y && y <= border.y + border.height;
        }

        // Поиск в ширину для нахождения связной области
        function bfs(startX, startY) {
            const queue = [[startX, startY]];
            const points = [];
            let pointCount = 0;

            while (queue.length > 0 && pointCount < maxPoints) {
                const [x, y] = queue.shift();
                const col = Math.floor((x - border.x) / gridSize);
                const row = Math.floor((y - border.y) / gridSize);

                if (col < 0 || col >= cols || row < 0 || row >= rows || visited[col][row]) {
                    continue;
                }

                visited[col][row] = true;
                const cellCenterX = border.x + col * gridSize + gridSize / 2;
                const cellCenterY = border.y + row * gridSize + gridSize / 2;

                if (isOutsideCircles(cellCenterX, cellCenterY)) {
                    points.push([cellCenterX, cellCenterY]);
                    pointCount++;

                    // Добавляем соседние ячейки
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

        // Находим все свободные области
        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                if (!visited[col][row]) {
                    const x = border.x + col * gridSize + gridSize / 2;
                    const y = border.y + row * gridSize + gridSize / 2;

                    if (isOutsideCircles(x, y)) {
                        bfs(x, y);
                    } else {
                        visited[col][row] = true;
                    }
                }
            }
        }

        return { regions, gridSize };
    }

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
        const buffer = 0.01;
        for (const axis of axes) {
            const proj1 = projectPolygon(hull1, axis);
            const proj2 = projectPolygon(hull2, axis);
            if (proj1.max + buffer < proj2.min || proj2.max + buffer < proj1.min) {
                return false;
            }
        }
        return true;
    }

    function createRegionPaths(regions, svg, gridSize, border, zoom, margin) {
        const regionsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        regionsGroup.setAttribute("class", "free-regions");

        // Создаем clipPath для обрезки регионов по границам прямоугольника
        const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipPath.setAttribute("id", "border-clip");
        const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        clipRect.setAttribute("x", (border.x * zoom + margin).toString());
        clipRect.setAttribute("y", (border.y * zoom + margin).toString());
        clipRect.setAttribute("width", (border.width * zoom).toString());
        clipRect.setAttribute("height", (border.height * zoom).toString());
        clipPath.appendChild(clipRect);
        svg.appendChild(clipPath);

        regionsGroup.setAttribute("clip-path", "url(#border-clip)");

        const validRegions = [];
        const processedHulls = [];

        const corners = [
            [border.x, border.y],
            [border.x + border.width, border.y],
            [border.x, border.y + border.height],
            [border.x + border.width, border.y + border.height]
        ];

        const totalArea = border.width * border.height;
        const minAreaThreshold = selectedFlowerCount === 13 ? 0.02 * totalArea : 0.05 * totalArea;

        regions.forEach((region, index) => {
            if (region.points.length < 3) {
                console.log(`Region ${index} skipped: too few points (${region.points.length})`);
                return;
            }

            let hull = convexHull(region.points);
            if (hull.length < 3) {
                console.log(`Region ${index} skipped: invalid hull (${hull.length} points)`);
                return;
            }

            const cornerThreshold = gridSize * 0.5; // Уменьшен порог для угловых точек
            corners.forEach(corner => {
                const [cx, cy] = corner;
                const nearestPoint = hull.reduce((min, p) => {
                    const dist = Math.sqrt((p[0] - cx) ** 2 + (p[1] - cy) ** 2);
                    return dist < min.dist ? { point: p, dist: dist } : min;
                }, { point: null, dist: Infinity });

                if (nearestPoint.dist < cornerThreshold) {
                    let isValidCorner = true;
                    for (const circle of svg.querySelectorAll('circle')) {
                        const circleX = parseFloat(circle.getAttribute('cx'));
                        const circleY = parseFloat(circle.getAttribute('cy'));
                        const circleR = parseFloat(circle.getAttribute('r'));
                        const dist = Math.sqrt((cx * zoom + margin - circleX) ** 2 + (cy * zoom + margin - circleY) ** 2);
                        if (dist <= circleR + gridSize * 0.5 * zoom) {
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
                console.log(`Region ${index} skipped: invalid hull after corners (${hull.length} points)`);
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
            const centroid = { x: cx / (6 * signedArea), y: cy / (6 * signedArea) };

            if (area >= minAreaThreshold) {
                if (!processedHulls.some(existingHull => doRegionsIntersect(hull, existingHull))) {
                    validRegions.push({ points: region.points, hull, area, centroid });
                    processedHulls.push(hull);
                } else {
                    console.log(`Region ${index} skipped: intersects with existing hull`);
                }
            } else {
                console.log(`Region ${index} skipped: area too small (${area} < ${minAreaThreshold})`);
            }
        });

        console.log(`Valid Regions: ${validRegions.length}`);

        validRegions.sort((a, b) => b.area - a.area);

        validRegions.forEach(region => {
            const hull = region.hull;
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

            path.addEventListener('mouseenter', function() {
                this.style.opacity = '0.9';
                this.style.fill = "#8ebb7c";
            });

            path.addEventListener('mouseleave', function() {
                this.style.opacity = '0.7';
                this.style.fill = "#9cce88";
            });

            regionsGroup.appendChild(path);

            const cx = region.centroid.x * zoom + margin;
            const cy = region.centroid.y * zoom + margin;

            const xCoords = hull.map(p => p[0]);
            const yCoords = hull.map(p => p[1]);
            const width = Math.max(...xCoords) - Math.min(...xCoords);
            const height = Math.max(...yCoords) - Math.min(...yCoords);
            const minDimension = Math.min(width, height);
            const basePlusSize = gridSize * 2 * zoom;
            const plusSize = Math.max(basePlusSize, minDimension * 0.2 * zoom);

            const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line1.setAttribute("x1", (cx - plusSize / 2).toString());
            line1.setAttribute("y1", cy.toString());
            line1.setAttribute("x2", (cx + plusSize / 2).toString());
            line1.setAttribute("y2", cy.toString());
            line1.setAttribute("stroke", "#fedfd7");
            line1.setAttribute("stroke-width", "4");
            line1.setAttribute("stroke-linecap", "round");
            line1.setAttribute("pointer-events", "none");
            regionsGroup.appendChild(line1);

            const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line2.setAttribute("x1", cx.toString());
            line2.setAttribute("y1", (cy - plusSize / 2).toString());
            line2.setAttribute("x2", cx.toString());
            line2.setAttribute("y2", (cy + plusSize / 2).toString());
            line2.setAttribute("stroke", "#fedfd7");
            line2.setAttribute("stroke-width", "4");
            line2.setAttribute("stroke-linecap", "round");
            line2.setAttribute("pointer-events", "none");
            regionsGroup.appendChild(line2);
        });

        svg.insertBefore(regionsGroup, svg.firstChild);
    }

    // Алгоритм Джарвиса для выпуклой оболочки
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

    function orientation(p, q, r) {
        const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
        return val;
    }

    function distance(p1, p2) {
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    function drawFlowers(n) {
        const packer = new Packer(n);
        const svg = document.getElementById('flowers-svg');
        if (!svg) return;

        svg.innerHTML = '';
        if (currentShapeIndex !== 3) return;
        if (!packer.list || packer.list.length === 0) return;

        const w = packer.w;
        const h = packer.h;
        const margin = 20;
        const maxWidth = window.innerWidth * 0.7 - margin * 2;
        const maxHeight = window.innerHeight * 0.8 - margin * 2;
        const zoom = Math.min(maxWidth / w, maxHeight / h);
        const scaleFactor = n === 1 ? 0.7 : 1;

        const border = {
            x: 0,
            y: 0,
            width: w,
            height: h
        };

        const viewBoxWidth = w * zoom + margin * 2;
        const viewBoxHeight = h * zoom + margin * 2 + (n === 3 ? 200 : n === 15 ? 100 : 0);
        svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        const contentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        if (n === 1) {
            const centerX = viewBoxWidth / 2;
            const centerY = viewBoxHeight / 2;
            contentGroup.setAttribute("transform", `translate(${centerX},${centerY}) scale(${scaleFactor}) translate(${-centerX},${-centerY})`);
        } else if (n === 3) {
            contentGroup.setAttribute("transform", `translate(0, 200)`);
        } else if (n === 15) {
            contentGroup.setAttribute("transform", `translate(0, 100)`);
        }
        svg.appendChild(contentGroup);

        const borderRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        borderRect.setAttribute("x", (border.x * zoom + margin).toString());
        borderRect.setAttribute("y", (border.y * zoom + margin).toString());
        borderRect.setAttribute("width", (border.width * zoom).toString());
        borderRect.setAttribute("height", (border.height * zoom).toString());
        borderRect.setAttribute("fill", "none");
        borderRect.setAttribute("stroke", "#fedfd7");
        borderRect.setAttribute("stroke-width", "4");
        contentGroup.appendChild(borderRect);

        if (n !== 1 && n !== 3) {
            const { regions, gridSize } = calculateFreeAreas(packer, w, h, margin, zoom);
            createRegionPaths(regions, contentGroup, gridSize, border, zoom, margin);
        }

        packer.list.forEach(circle => {
            const cx = (circle.c.x * zoom + margin).toString();
            const cy = (circle.c.y * zoom + margin).toString();
            const radius = (circle.r * zoom * scaleFactor).toString();

            const circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circleEl.setAttribute("cx", cx);
            circleEl.setAttribute("cy", cy);
            circleEl.setAttribute("r", radius);
            circleEl.setAttribute("fill", "#fd8262");
            circleEl.setAttribute("stroke", "#fedfd7");
            circleEl.setAttribute("stroke-width", "4");
            contentGroup.appendChild(circleEl);

            const plusSize = circle.r * zoom * 0.4;
            const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line1.setAttribute("x1", (parseFloat(cx) - plusSize / 2).toString());
            line1.setAttribute("y1", cy);
            line1.setAttribute("x2", (parseFloat(cx) + plusSize / 2).toString());
            line1.setAttribute("y2", cy);
            line1.setAttribute("stroke", "#fedfd7");
            line1.setAttribute("stroke-width", "4");
            line1.setAttribute("stroke-linecap", "round");
            line1.setAttribute("pointer-events", "none");
            contentGroup.appendChild(line1);

            const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line2.setAttribute("x1", cx);
            line2.setAttribute("y1", (parseFloat(cy) - plusSize / 2).toString());
            line2.setAttribute("x2", cx);
            line2.setAttribute("y2", (parseFloat(cy) + plusSize / 2).toString());
            line2.setAttribute("stroke", "#fedfd7");
            line2.setAttribute("stroke-width", "4");
            line2.setAttribute("stroke-linecap", "round");
            line2.setAttribute("pointer-events", "none");
            contentGroup.appendChild(line2);
        });
    }

    // Обработчики событий
    window.addEventListener('resize', function() {
        if (currentShapeIndex === 3) {
            const count = parseInt(document.querySelector('.count').textContent) || 5;
            drawFlowers(count);
        }
    });

    document.querySelector('.next-btn-short')?.addEventListener('click', function() {
        if (currentShapeIndex === 3) {
            drawFlowers(selectedFlowerCount);
        }
    });
});