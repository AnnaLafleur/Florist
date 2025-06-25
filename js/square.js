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
        mirror() { return new Point(this.y, this.x); }
    }

    class Circle {
        constructor(radius, center) {
            this.r = radius;
            this.c = center;
        }

        distance(circle) { return this.c.dist(circle.c) - this.r - circle.r; }
        intersects(circle) { return this.distance(circle) < 0; }
        mirror() { return new Circle(this.r, this.c.mirror()); }
    }

    class Packer {
        constructor(n_circles) {
            this.circles = Array(n_circles).fill(1);
            this.ratio = 1; // Квадратная область
            this.list = this.solve(n_circles);
            if (n_circles === 13) {
                this.symmetrizeCircles(n_circles);
                this.centerFreeCircles13();
            } else {
                this.centerFreeCircles();
            }
        }

        compute(surface, numCircles) {
            function in_rect(radius, center) {
                if (center.x - radius < -w / 2) return false;
                if (center.x + radius > w / 2) return false;
                if (center.y - radius < -w / 2) return false;
                if (center.y + radius > w / 2) return false;
                return true;
            }

            function bounding_circle(x0, y0, x1, y1) {
                let xm = Math.abs((x1 - x0) * w);
                let ym = Math.abs((y1 - y0) * w);
                let m = xm > ym ? xm : ym;
                let theta = Math.asin(m / 4 / bounding_r);
                let r = bounding_r * Math.cos(theta);
                return new Circle(bounding_r,
                    new Point(r * (y0 - y1) / 2 + (x0 + x1) * w / 4,
                              r * (x1 - x0) / 2 + (y0 + y1) * w / 4));
            }

            function corner(radius, c1, c2) {
                let u = c1.c.vect(c2.c);
                let A = u.norm();
                if (A < 1e-6) return [];
                u = u.mult(1 / A);
                let B = c1.r + radius;
                let C = c2.r + radius;
                if (A > B + C) return [];
                let x = (A + (B * B - C * C) / A) / 2;
                let y = Math.sqrt(Math.max(0, B * B - x * x));
                if (isNaN(y)) y = 0;
                let base = c1.c.add(u.mult(x));

                let res = [];
                let p1 = new Point(base.x - u.y * y, base.y + u.x * y);
                let p2 = new Point(base.x + u.y * y, base.y - u.x * y);
                if (in_rect(radius, p1)) res.push(new Circle(radius, p1));
                if (in_rect(radius, p2)) res.push(new Circle(radius, p2));
                return res;
            }

            let bounding_r = Math.sqrt(surface) * 100;
            let w = this.w = Math.sqrt(surface * this.ratio);
            let h = this.h = w; // Квадратная область

            let placed = [];

            if (numCircles === 5) {
                let r = Math.sqrt(surface / numCircles / Math.PI);
                let w = 2 * r * (1 + Math.sqrt(2));
                this.w = w;
                this.h = w;
                placed.push(new Circle(r, new Point(-w/2 + r, -w/2 + r)));
                placed.push(new Circle(r, new Point(w/2 - r, -w/2 + r)));
                placed.push(new Circle(r, new Point(-w/2 + r, w/2 - r)));
                placed.push(new Circle(r, new Point(w/2 - r, w/2 - r)));
                placed.push(new Circle(r, new Point(0, 0)));
                this.tmp_bounds = [];
                return placed;
            }

            placed = [
                bounding_circle(1, 1, 1, -1),
                bounding_circle(1, -1, -1, -1),
                bounding_circle(-1, -1, -1, 1),
                bounding_circle(-1, 1, 1, 1)
            ];

            let unplaced = this.circles.slice(0);
            while (unplaced.length > 0) {
                let lambda = {};
                let circle = {};
                for (let i = 0; i < unplaced.length; i++) {
                    let lambda_min = 1e10;
                    lambda[i] = -1e10;
                    for (let j = 0; j < placed.length; j++) {
                        for (let k = j + 1; k < placed.length; k++) {
                            let corners = corner(unplaced[i], placed[j], placed[k]);
                            for (let c = 0; c < corners.length; c++) {
                                let d_min = 1e10;
                                let valid = true;
                                for (let l = 0; l < placed.length; l++) {
                                    if (l == j || l == k) continue;
                                    let d = placed[l].distance(corners[c]);
                                    if (d < 0) {
                                        valid = false;
                                        break;
                                    }
                                    if (d < d_min) d_min = d;
                                }
                                if (valid && d_min < lambda_min) {
                                    lambda_min = d_min;
                                    lambda[i] = 1 - d_min / unplaced[i];
                                    circle[i] = corners[c];
                                }
                            }
                        }
                    }
                }

                let lambda_max = -1e10;
                let i_max = -1;
                for (let i = 0; i < unplaced.length; i++) {
                    if (lambda[i] > lambda_max) {
                        lambda_max = lambda[i];
                        i_max = i;
                    }
                }

                if (i_max == -1) break;

                placed.push(circle[i_max]);
                unplaced.splice(i_max, 1);

                if ([11].includes(numCircles) && unplaced.length > 0) {
                    let mirrored = circle[i_max].mirror();
                    let canPlaceMirrored = true;

                    for (let m = 0; m < placed.length; m++) {
                        if (mirrored.intersects(placed[m])) {
                            canPlaceMirrored = false;
                            break;
                        }
                    }

                    if (canPlaceMirrored && !in_rect(mirrored.r, mirrored.c)) {
                        canPlaceMirrored = false;
                    }

                    if (canPlaceMirrored) {
                        placed.push(mirrored);
                        unplaced.splice(0, 1);
                    }
                }
            }

            this.tmp_bounds = placed.splice(0, 4);
            return placed;
        }

        compute13(surface, numCircles) {
            function in_rect(radius, center) {
                if (center.x - radius < -w / 2) return false;
                if (center.x + radius > w / 2) return false;
                if (center.y - radius < -w / 2) return false;
                if (center.y + radius > w / 2) return false;
                return true;
            }

            function bounding_circle(x0, y0, x1, y1) {
                let xm = Math.abs((x1 - x0) * w);
                let ym = Math.abs((y1 - y0) * w);
                let m = xm > ym ? xm : ym;
                let theta = Math.asin(m / 4 / bounding_r);
                let r = bounding_r * Math.cos(theta);
                return new Circle(bounding_r,
                    new Point(r * (y0 - y1) / 2 + (x0 + x1) * w / 4,
                              r * (x1 - x0) / 2 + (y0 + y1) * w / 4));
            }

            function corner(radius, c1, c2) {
                let u = c1.c.vect(c2.c);
                let A = u.norm();
                if (A == 0) return [];
                u = u.mult(1 / A);
                let B = c1.r + radius;
                let C = c2.r + radius;
                if (A > (B + C)) return [];
                let x = (A + (B * B - C * C) / A) / 2;
                let y = Math.sqrt(B * B - x * x);
                let base = c1.c.add(u.mult(x));

                let res = [];
                let p1 = new Point(base.x - u.y * y, base.y + u.x * y);
                let p2 = new Point(base.x + u.y * y, base.y - u.x * y);
                if (in_rect(radius, p1)) res.push(new Circle(radius, p1));
                if (in_rect(radius, p2)) res.push(new Circle(radius, p2));
                return res;
            }

            let bounding_r = Math.sqrt(surface) * 100;
            let w = this.w = Math.sqrt(surface * this.ratio);
            let h = this.h = w;

            let placed = [
                bounding_circle(1, 1, 1, -1),
                bounding_circle(1, -1, -1, -1),
                bounding_circle(-1, -1, -1, 1),
                bounding_circle(-1, 1, 1, 1)
            ];

            let unplaced = this.circles.slice(0);
            while (unplaced.length > 0) {
                let lambda = {};
                let circle = {};
                for (let i = 0; i < unplaced.length; i++) {
                    let lambda_min = 1e10;
                    lambda[i] = -1e10;
                    for (let j = 0; j < placed.length; j++) {
                        for (let k = j + 1; k < placed.length; k++) {
                            let corners = corner(unplaced[i], placed[j], placed[k]);
                            for (let c = 0; c < corners.length; c++) {
                                let d_min = 1e10;
                                let valid = true;
                                for (let l = 0; l < placed.length; l++) {
                                    if (l == j || l == k) continue;
                                    let d = placed[l].distance(corners[c]);
                                    if (d < 0) {
                                        valid = false;
                                        break;
                                    }
                                    if (d < d_min) d_min = d;
                                }
                                if (valid && d_min < lambda_min) {
                                    lambda_min = d_min;
                                    lambda[i] = 1 - d_min / unplaced[i];
                                    circle[i] = corners[c];
                                }
                            }
                        }
                    }
                }

                let lambda_max = -1e10;
                let i_max = -1;
                for (let i = 0; i < unplaced.length; i++) {
                    if (lambda[i] > lambda_max) {
                        lambda_max = lambda[i];
                        i_max = i;
                    }
                }

                if (i_max == -1) break;

                placed.push(circle[i_max]);
                unplaced.splice(i_max, 1);

                if ([5, 11, 13].includes(numCircles) && unplaced.length > 0) {
                    let mirrored = circle[i_max].mirror();
                    let canPlaceMirrored = true;

                    for (let m = 0; m < placed.length; m++) {
                        if (mirrored.intersects(placed[m])) {
                            canPlaceMirrored = false;
                            break;
                        }
                    }

                    if (canPlaceMirrored && !in_rect(mirrored.r, mirrored.c)) {
                        canPlaceMirrored = false;
                    }

                    if (canPlaceMirrored) {
                        placed.push(mirrored);
                        unplaced.splice(0, 1);
                    }
                }
            }

            this.tmp_bounds = placed.splice(0, 4);
            return placed;
        }

        checkSymmetry() {
            let circles = this.list;
            let tolerance = 1e-6;
            let used = new Array(circles.length).fill(false);
            let unpaired = [];

            for (let i = 0; i < circles.length; i++) {
                if (used[i]) continue;
                let cx = circles[i].c.x;
                let cy = circles[i].c.y;
                let foundMatch = false;

                for (let j = 0; j < circles.length; j++) {
                    if (i === j || used[j]) continue;
                    let cxj = circles[j].c.x;
                    let cyj = circles[j].c.y;
                    if (Math.abs(cx + cxj) < tolerance && Math.abs(cy + cyj) < tolerance) {
                        used[i] = true;
                        used[j] = true;
                        foundMatch = true;
                        break;
                    }
                }

                if (!foundMatch) {
                    if (Math.abs(cx) < tolerance && Math.abs(cy) < tolerance && unpaired.length === 0) {
                        used[i] = true;
                    } else {
                        unpaired.push(i);
                    }
                }
            }

            return unpaired.length === 0;
        }

        symmetrizeCircles(numCircles) {
            if (this.checkSymmetry()) return;

            if ([5, 11, 13].includes(numCircles)) {
                let newCircles = this.optimizeSymmetry(this.list);
                let valid = true;
                for (let i = 0; i < newCircles.length; i++) {
                    for (let j = i + 1; j < newCircles.length; j++) {
                        if (newCircles[i].intersects(newCircles[j])) {
                            valid = false;
                            break;
                        }
                    }
                    if (!valid) break;
                }
                if (valid) {
                    this.list = newCircles;
                }
            }
        }

        optimizeSymmetry(circles) {
            let centerX = 0, centerY = 0;
            for (let i = 0; i < circles.length; i++) {
                centerX += circles[i].c.x;
                centerY += circles[i].c.y;
            }
            centerX /= circles.length;
            centerY /= circles.length;

            let symmetric = [];
            let used = new Array(circles.length).fill(false);

            for (let i = 0; i < circles.length; i++) {
                if (used[i]) continue;

                let mirroredPos = circles[i].c.mirror();
                let closest = -1;
                let minDist = Infinity;

                for (let j = 0; j < circles.length; j++) {
                    if (i == j || used[j]) continue;
                    let d = circles[j].c.dist(mirroredPos);
                    if (d < minDist) {
                        minDist = d;
                        closest = j;
                    }
                }

                if (closest != -1 && minDist < 1.0) {
                    let avgX = (circles[i].c.x + circles[closest].c.y) / 2;
                    let avgY = (circles[i].c.y + circles[closest].c.x) / 2;

                    symmetric.push(new Circle(circles[i].r, new Point(avgX, avgY)));
                    symmetric.push(new Circle(circles[i].r, new Point(avgY, avgX)));
                    used[i] = true;
                    used[closest] = true;
                } else {
                    symmetric.push(circles[i]);
                    used[i] = true;
                }
            }

            let valid = true;
            for (let i = 0; i < symmetric.length; i++) {
                if (symmetric[i].c.x - symmetric[i].r < -this.w/2 ||
                    symmetric[i].c.x + symmetric[i].r > this.w/2 ||
                    symmetric[i].c.y - symmetric[i].r < -this.h/2 ||
                    symmetric[i].c.y + symmetric[i].r > this.h/2) {
                    valid = false;
                    break;
                }

                for (let j = i + 1; j < symmetric.length; j++) {
                    if (symmetric[i].intersects(symmetric[j])) {
                        valid = false;
                        break;
                    }
                }
            }

            return valid ? symmetric : circles;
        }

        centerFreeCircles() {
            let circles = this.list;
            let numCircles = this.circles.length;
            let w = this.w;

            if ([7, 11].includes(numCircles)) {
                for (let i = 0; i < circles.length; i++) {
                    let circle = circles[i];
                    let candidates = [];

                    let gridSize = 30;
                    let stepX = w / gridSize;
                    let stepY = w / gridSize;

                    for (let x = -w/2 + stepX/2; x < w/2; x += stepX) {
                        for (let y = -w/2 + stepY/2; y < w/2; y += stepY) {
                            candidates.push(new Circle(circle.r, new Point(x, y)));
                        }
                    }

                    candidates.push(new Circle(circle.r, circle.c));

                    let bestCandidate = null;
                    let maxMinDistance = -1;

                    for (let c = 0; c < candidates.length; c++) {
                        let candidate = candidates[c];
                        let valid = true;

                        if (candidate.c.x - candidate.r <= -w/2 ||
                            candidate.c.x + candidate.r >= w/2 ||
                            candidate.c.y - candidate.r <= -w/2 ||
                            candidate.c.y + candidate.r >= w/2) {
                            continue;
                        }

                        let minDistance = Infinity;
                        for (let j = 0; j < circles.length; j++) {
                            if (i == j) continue;
                            let d = candidate.distance(circles[j]);
                            if (d <= 0) {
                                valid = false;
                                break;
                            }
                            if (d < minDistance) minDistance = d;
                        }

                        let boundaryDist = Math.min(
                            candidate.c.x + w/2 - candidate.r,
                            w/2 - candidate.c.x - candidate.r,
                            candidate.c.y + w/2 - candidate.r,
                            w/2 - candidate.c.y - candidate.r
                        );
                        minDistance = Math.min(minDistance, boundaryDist);

                        if (valid && minDistance > maxMinDistance) {
                            maxMinDistance = minDistance;
                            bestCandidate = candidate;
                        }
                    }

                    if (bestCandidate && maxMinDistance > circle.r * 0.05) {
                        circles[i] = bestCandidate;
                    }
                }
            } else if (numCircles !== 5) {
                for (let i = 0; i < circles.length; i++) {
                    let circle = circles[i];
                    let candidates = [];

                    let steps = 8;
                    let radiusStep = circle.r * 0.5;
                    let angleStep = Math.PI * 2 / steps;

                    candidates.push(new Circle(circle.r, circle.c));

                    for (let r = 1; r <= 3; r++) {
                        for (let a = 0; a < steps; a++) {
                            let x = circle.c.x + r * radiusStep * Math.cos(a * angleStep);
                            let y = circle.c.y + r * radiusStep * Math.sin(a * angleStep);
                            candidates.push(new Circle(circle.r, new Point(x, y)));
                        }
                    }

                    let bestCandidate = null;
                    let maxMinDistance = -1;

                    for (let c = 0; c < candidates.length; c++) {
                        let candidate = candidates[c];
                        let valid = true;

                        if (candidate.c.x - candidate.r <= -w/2 ||
                            candidate.c.x + candidate.r >= w/2 ||
                            candidate.c.y - candidate.r <= -w/2 ||
                            candidate.c.y + candidate.r >= w/2) {
                            continue;
                        }

                        let minDistance = Infinity;
                        for (let j = 0; j < circles.length; j++) {
                            if (i == j) continue;
                            let d = candidate.distance(circles[j]);
                            if (d <= 0) {
                                valid = false;
                                break;
                            }
                            if (d < minDistance) minDistance = d;
                        }

                        let boundaryDist = Math.min(
                            candidate.c.x + w/2 - candidate.r,
                            w/2 - candidate.c.x - candidate.r,
                            candidate.c.y + w/2 - candidate.r,
                            w/2 - candidate.c.y - candidate.r
                        );
                        minDistance = Math.min(minDistance, boundaryDist);

                        if (valid && minDistance > maxMinDistance) {
                            maxMinDistance = minDistance;
                            bestCandidate = candidate;
                        }
                    }

                    if (bestCandidate && maxMinDistance > circle.r * 0.05) {
                        circles[i] = bestCandidate;
                    }
                }
            }
        }

        centerFreeCircles13() {
            let circles = this.list;
            let w = this.w;
            let h = this.h;

            for (let i = 0; i < circles.length; i++) {
                let circle = circles[i];
                let candidates = [];
                let radiusStep = circle.r * 0.25;
                let steps = 16;
                let maxRadiusSteps = 4;

                candidates.push(new Circle(circle.r, circle.c));

                for (let r = 1; r <= maxRadiusSteps; r++) {
                    for (let a = 0; a < steps; a++) {
                        let angle = a * (Math.PI * 2 / steps);
                        let x = circle.c.x + r * radiusStep * Math.cos(angle);
                        let y = circle.c.y + r * radiusStep * Math.sin(angle);
                        let candidate = new Circle(circle.r, new Point(x, y));
                        if (candidate.c.x - candidate.r >= -w/2 &&
                            candidate.c.x + candidate.r <= w/2 &&
                            candidate.c.y - candidate.r >= -h/2 &&
                            candidate.c.y + candidate.r <= h/2) {
                            candidates.push(candidate);
                        }
                    }
                }

                let bestCandidate = null;
                let maxMinDistance = -Infinity;

                for (let c = 0; c < candidates.length; c++) {
                    let candidate = candidates[c];
                    let minDistance = Infinity;
                    let valid = true;

                    for (let j = 0; j < circles.length; j++) {
                        if (i == j) continue;
                        let d = candidate.distance(circles[j]);
                        if (d < 0) {
                            valid = false;
                            break;
                        }
                        if (d < minDistance) minDistance = d;
                    }

                    if (valid) {
                        let cx = candidate.c.x;
                        let cy = candidate.c.y;
                        let r = candidate.r;
                        let distToLeft = cx + w/2 - r;
                        let distToRight = w/2 - cx - r;
                        let distToTop = cy + h/2 - r;
                        let distToBottom = h/2 - cy - r;
                        let boundaryDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
                        if (boundaryDist < 0) {
                            valid = false;
                        } else {
                            minDistance = Math.min(minDistance, boundaryDist);
                        }
                    }

                    if (valid && minDistance > maxMinDistance) {
                        maxMinDistance = minDistance;
                        bestCandidate = candidate;
                    }
                }

                if (bestCandidate) {
                    let refinementSteps = 10;
                    let refineStep = radiusStep * 0.5;
                    let currentCandidate = bestCandidate;
                    let currentMinDistance = maxMinDistance;

                    for (let step = 0; step < refinementSteps; step++) {
                        let directions = [
                            new Point(refineStep, 0),
                            new Point(-refineStep, 0),
                            new Point(0, refineStep),
                            new Point(0, -refineStep),
                            new Point(refineStep, refineStep),
                            new Point(refineStep, -refineStep),
                            new Point(-refineStep, refineStep),
                            new Point(-refineStep, -refineStep)
                        ];

                        let bestRefinedCandidate = currentCandidate;
                        let bestRefinedDistance = currentMinDistance;

                        for (let dir of directions) {
                            let newPoint = currentCandidate.c.add(dir);
                            let candidate = new Circle(circle.r, newPoint);
                            let valid = true;
                            let minDistance = Infinity;

                            if (candidate.c.x - candidate.r < -w/2 ||
                                candidate.c.x + candidate.r > w/2 ||
                                candidate.c.y - candidate.r < -h/2 ||
                                candidate.c.y + candidate.r > h/2) {
                                continue;
                            }

                            for (let j = 0; j < circles.length; j++) {
                                if (i == j) continue;
                                let d = candidate.distance(circles[j]);
                                if (d < 0) {
                                    valid = false;
                                    break;
                                }
                                if (d < minDistance) minDistance = d;
                            }

                            if (valid) {
                                let cx = candidate.c.x;
                                let cy = candidate.c.y;
                                let r = candidate.r;
                                let distToLeft = cx + w/2 - r;
                                let distToRight = w/2 - cx - r;
                                let distToTop = cy + h/2 - r;
                                let distToBottom = h/2 - cy - r;
                                let boundaryDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
                                if (boundaryDist < 0) {
                                    valid = false;
                                } else {
                                    minDistance = Math.min(minDistance, boundaryDist);
                                }
                            }

                            if (valid && minDistance > bestRefinedDistance) {
                                bestRefinedDistance = minDistance;
                                bestRefinedCandidate = candidate;
                            }
                        }

                        if (bestRefinedDistance <= currentMinDistance) break;
                        currentCandidate = bestRefinedCandidate;
                        currentMinDistance = bestRefinedDistance;
                    }

                    circles[i] = currentCandidate;
                }
            }
        }

        solve(numCircles) {
            let surface = this.circles.length * Math.PI;
            let limit = surface / 1000;
            let step = surface / 2;
            let res = [];
            while (step > limit) {
                let placement = numCircles === 13 ? this.compute13(surface, numCircles) : this.compute(surface, numCircles);
                if (placement.length !== this.circles.length) {
                    surface += step;
                } else {
                    res = placement;
                    this.bounds = this.tmp_bounds;
                    surface -= step;
                }
                step /= 2;
            }

            if ([11].includes(numCircles)) {
                res = this.optimizeSymmetry(res);
            }

            return res;
        }
    }

    function calculateFreeAreas(packer, width, height, margin, zoom) {
        const gridSize = 5;
        const circles = packer.list.map(circle => ({
            x: margin + (circle.c.x + width / 2) * zoom,
            y: margin + (circle.c.y + height / 2) * zoom,
            r: circle.r * zoom + Math.min(0.3, zoom * 0.01)
        }));

        const border = {
            x: margin,
            y: margin,
            width: width * zoom,
            height: height * zoom
        };

        const cols = Math.ceil(border.width / gridSize);
        const rows = Math.ceil(border.height / gridSize);

        const visited = new Array(cols).fill().map(() => new Array(rows).fill(false));
        const regions = [];

        function isOutsideCircles(x, y) {
            const minDistanceThreshold = gridSize * 0.5;
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
                    const x = border.x + col * gridSize + gridSize / 2;
                    const y = border.y + row * gridSize + gridSize / 2;

                    if (isOutsideCircles(x, y)) {
                        bfs(
                            border.x + col * gridSize,
                            border.y + row * gridSize
                        );
                    } else {
                        visited[col][row] = true;
                    }
                }
            }
        }

        return { regions, gridSize };
    }

    function createRegionPaths(regions, svg, gridSize, border, n) {
        const regionsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        regionsGroup.setAttribute("class", "free-regions");

        const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipPath.setAttribute("id", "border-clip");
        const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        clipRect.setAttribute("x", border.x);
        clipRect.setAttribute("y", border.y);
        clipRect.setAttribute("width", border.width);
        clipRect.setAttribute("height", border.height);
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
        const minAreaThreshold = 0.06 * totalArea;

        try {
            regions.forEach((region, index) => {
                if (region.points.length < 3) return;

                let hull = convexHull(region.points);
                if (hull.length < 3) return;

                corners.forEach(corner => {
                    const [cx, cy] = corner;
                    if (hull.some(p => Math.sqrt((p[0] - cx) ** 2 + (p[1] - cy) ** 2) < gridSize)) {
                        let isValidCorner = true;
                        for (const circle of svg.querySelectorAll('circle')) {
                            const circleX = parseFloat(circle.getAttribute('cx'));
                            const circleY = parseFloat(circle.getAttribute('cy'));
                            const circleR = parseFloat(circle.getAttribute('r'));
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
                if (hull.length < 3) return;

                const xCoords = hull.map(p => p[0]);
                const yCoords = hull.map(p => p[1]);
                const width = Math.max(...xCoords) - Math.min(...xCoords);
                const height = Math.max(...yCoords) - Math.min(...yCoords);
                const approxArea = width * height;

                if (approxArea < minAreaThreshold) return;

                if (!processedHulls.some(existingHull => doRegionsIntersect(hull, existingHull))) {
                    validRegions.push({ points: region.points, hull });
                    processedHulls.push(hull);
                }
            });

            let regionsToRender = validRegions;

            if (n === 13) {
                // Выбираем области для n=13: правый нижний угол и самая большая область
                const regionsWithMetrics = validRegions.map(region => {
                    const hull = region.hull;
                    let cx = 0, cy = 0;
                    let signedArea = 0;
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
                    cx /= (6 * signedArea);
                    cy /= (6 * signedArea);
                    return { ...region, area: Math.abs(signedArea), centroid: [cx, cy] };
                });

                const largestRegion = regionsWithMetrics.reduce((max, region) =>
                    region.area > max.area ? region : max, regionsWithMetrics[0] || { area: 0 });

                const rightBottomRegion = regionsWithMetrics.reduce((max, region) => {
                    const sum = region.centroid[0] + region.centroid[1];
                    const maxSum = max.centroid[0] + max.centroid[1];
                    return sum > maxSum ? region : max;
                }, regionsWithMetrics[0] || { centroid: [0, 0] });

                regionsToRender = [largestRegion, rightBottomRegion].filter(r => r);

                } else if (n === 3) {
                    // Выбираем область для n=3: левый нижний угол
                    const regionsWithMetrics = validRegions.map(region => {
                        const hull = region.hull;
                        let cx = 0, cy = 0;
                        let signedArea = 0;
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
                        cx /= (6 * signedArea);
                        cy /= (6 * signedArea);
                        return { ...region, area: Math.abs(signedArea), centroid: [cx, cy] };
                    });

                    const leftBottomRegion = regionsWithMetrics.reduce((best, region) => {
                        // Минимизируем x (centroid[0]) и максимизируем y (centroid[1]) для левого нижнего угла
                        if (!best) return region;
                        if (region.centroid[0] < best.centroid[0] ||
                            (region.centroid[0] === best.centroid[0] && region.centroid[1] > best.centroid[1])) {
                            return region;
                        }
                        return best;
                    }, regionsWithMetrics[0] || null);

                    regionsToRender = [leftBottomRegion].filter(r => r);
                }

            regionsToRender.forEach((region, index) => {
                const hull = region.hull;
                if (hull.length < 3) return;

                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                let pathData = `M ${hull[0][0]} ${hull[0][1]}`;
                const controlPointDist = 0.1 * gridSize;

                for (let i = 0; i < hull.length; i++) {
                    const p1 = hull[i];
                    const p2 = hull[(i + 1) % hull.length];
                    const p3 = hull[(i + 2) % hull.length] || hull[0];

                    const cp1x = p1[0] + (p2[0] - p1[0]) * 0.2;
                    const cp1y = p1[1] + (p2[1] - p1[1]) * 0.2;
                    const cp2x = p2[0] - (p3[0] - p2[0]) * 0.2;
                    const cp2y = p2[1] - (p3[1] - p2[1]) * 0.2;

                    pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
                }

                pathData += " Z";
                path.setAttribute("d", pathData);
                path.setAttribute("fill", "#9cce88");
                path.setAttribute("opacity", "0.7");
                path.setAttribute("class", "free-region");

                path.addEventListener('mouseenter', function() {
                    this.setAttribute('opacity', '0.9');
                    this.setAttribute('fill', "#8ebb7c");
                });

                path.addEventListener('mouseleave', function() {
                    this.setAttribute('opacity', '0.7');
                    this.setAttribute('fill', "#9cce88");
                });

                regionsGroup.appendChild(path);

                let cx = 0, cy = 0;
                const hullLength = hull.length;
                let signedArea = 0;
                for (let i = 0; i < hullLength; i++) {
                    const x0 = hull[i][0];
                    const y0 = hull[i][1];
                    const x1 = hull[(i + 1) % hullLength][0];
                    const y1 = hull[(i + 1) % hullLength][1];
                    const a = x0 * y1 - x1 * y0;
                    signedArea += a;
                    cx += (x0 + x1) * a;
                    cy += (y0 + y1) * a;
                }
                signedArea *= 0.5;
                cx /= (6 * signedArea);
                cy /= (6 * signedArea);

                const xCoords = hull.map(p => p[0]);
                const yCoords = hull.map(p => p[1]);
                const width = Math.max(...xCoords) - Math.min(...xCoords);
                const height = Math.max(...yCoords) - Math.min(...yCoords);
                const minDimension = Math.min(width, height);
                const basePlusSize = gridSize * 2;
                const plusSize = Math.max(basePlusSize, minDimension * 0.2);

                // Для n=13 пропускаем плюс на самой большой области
                if (n !== 13 || (n === 13 && region !== regionsToRender[0])) {
                    const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line1.setAttribute("x1", cx - plusSize / 2);
                    line1.setAttribute("y1", cy);
                    line1.setAttribute("x2", cx + plusSize / 2);
                    line1.setAttribute("y2", cy);
                    line1.setAttribute("stroke", "#fedfd7");
                    line1.setAttribute("stroke-width", "4");
                    line1.setAttribute("stroke-linecap", "round");
                    line1.setAttribute("pointer-events", "none");
                    regionsGroup.appendChild(line1);

                    const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line2.setAttribute("x1", cx);
                    line2.setAttribute("y1", cy - plusSize / 2);
                    line2.setAttribute("x2", cx);
                    line2.setAttribute("y2", cy + plusSize / 2);
                    line2.setAttribute("stroke", "#fedfd7");
                    line2.setAttribute("stroke-width", "4");
                    line2.setAttribute("stroke-linecap", "round");
                    line2.setAttribute("pointer-events", "none");
                    regionsGroup.appendChild(line2);
                }
            });

            svg.insertBefore(regionsGroup, svg.firstChild);
        } catch (error) {
            console.error('Error in createRegionPaths:', error);
        }
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
        if (currentShapeIndex !== 1) return;
        if (!packer.list || packer.list.length === 0) return;

        const w = packer.w;
        const h = w;
        const margin = 20;
        const maxWidth = window.innerWidth * 0.7 - margin * 2;
        const maxHeight = window.innerHeight * 0.8 - margin * 2;
        const zoom = Math.min(maxWidth / w, maxHeight / h);
        const scaleFactor = n === 1 ? 0.6 : 1;

        // Компенсация толщины обводки для n=1
        const strokeWidth = n === 1 ? 4 / scaleFactor : 4;

        const border = {
            x: margin,
            y: margin,
            width: w * zoom,
            height: h * zoom
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

        // Border rectangle с компенсированной толщиной обводки
        const borderRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        borderRect.setAttribute("x", border.x);
        borderRect.setAttribute("y", border.y);
        borderRect.setAttribute("width", border.width);
        borderRect.setAttribute("height", border.height);
        borderRect.setAttribute("fill", "none");
        borderRect.setAttribute("stroke", "#fedfd7");
        borderRect.setAttribute("stroke-width", strokeWidth.toString());
        contentGroup.appendChild(borderRect);

        if (n !== 1) {
            try {
                const { regions, gridSize } = calculateFreeAreas(packer, w, h, margin, zoom);
                createRegionPaths(regions, contentGroup, gridSize, border, n);
            } catch (error) {
                console.error('Error rendering free areas:', error);
            }
        }

        packer.list.forEach(circle => {
            const cx = margin + (circle.c.x + w / 2) * zoom;
            const cy = margin + (circle.c.y + h / 2) * zoom;
            const radius = circle.r * zoom;

            const circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circleEl.setAttribute("cx", cx);
            circleEl.setAttribute("cy", cy);
            circleEl.setAttribute("r", radius);
            circleEl.setAttribute("fill", "#fd8262");
            circleEl.setAttribute("stroke", "#fedfd7");
            circleEl.setAttribute("stroke-width", strokeWidth.toString());
            contentGroup.appendChild(circleEl);

            const plusSize = radius * 0.4;
            const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line1.setAttribute("x1", cx - plusSize / 2);
            line1.setAttribute("y1", cy);
            line1.setAttribute("x2", cx + plusSize / 2);
            line1.setAttribute("y2", cy);
            line1.setAttribute("stroke", "#fedfd7");
            line1.setAttribute("stroke-width", strokeWidth.toString());
            line1.setAttribute("stroke-linecap", "round");
            line1.setAttribute("pointer-events", "none");
            contentGroup.appendChild(line1);

            const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line2.setAttribute("x1", cx);
            line2.setAttribute("y1", cy - plusSize / 2);
            line2.setAttribute("x2", cx);
            line2.setAttribute("y2", cy + plusSize / 2);
            line2.setAttribute("stroke", "#fedfd7");
            line2.setAttribute("stroke-width", strokeWidth.toString());
            line2.setAttribute("stroke-linecap", "round");
            line2.setAttribute("pointer-events", "none");
            contentGroup.appendChild(line2);
        });
    }

    window.addEventListener('resize', function() {
        if (currentShapeIndex === 1) {
            const count = parseInt(document.querySelector('.count').textContent) || 5;
            drawFlowers(count);
        }
    });

    document.querySelector('.next-btn-short')?.addEventListener('click', function() {
        if (currentShapeIndex === 1) {
            drawFlowers(selectedFlowerCount);
        }
    });
});