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
            selectedFlowerCount = count; // Сохраняем выбранное количество
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

    // Функция отрисовки кругов на втором этапе
    function drawFlowers(n) {
        const packer = new Packer(n);
        const svg = document.getElementById('flowers-svg');
        if (!svg) return;

        svg.innerHTML = ''; // Очищаем SVG в любом случае

        // Проверяем, выбрана ли форма "прямоугольник" (currentShapeIndex === 3)
        if (currentShapeIndex !== 3) return; // Если не прямоугольник, ничего не рисуем

        if (!packer.list || packer.list.length === 0) return;

        const w = packer.w;
        const h = packer.h;
        const r = packer.radius;

        // Настройки отступов и масштабирования
        const margin = 20;
        const maxWidth = window.innerWidth * 0.7 - margin * 2;
        const maxHeight = window.innerHeight * 0.8 - margin * 2;

        // Рассчитываем масштаб, чтобы вписать в доступную область
        const zoom = Math.min(
            maxWidth / w,
            maxHeight / h
        );

        const scaledWidth = w * zoom;
        const scaledHeight = h * zoom;

        // Устанавливаем viewBox для правильного масштабирования
        const viewBoxHeight = scaledHeight + margin * 2 + (n === 3 ? 100 : 0);
        const offsetY = (maxHeight - scaledHeight) / 2; // Центрирование по вертикали
        svg.setAttribute('viewBox', `0 ${-offsetY} ${scaledWidth + margin * 2} ${viewBoxHeight}`);
        svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');

        // Контур прямоугольника
        const border = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const scaleFactor = n === 1 ? 0.7 : 1; // Уменьшаем размер для n = 1
        const borderWidth = scaledWidth * scaleFactor;
        const borderHeight = scaledHeight * scaleFactor;
        const borderX = margin + (scaledWidth - borderWidth) / 2; // Центрируем прямоугольник
        const borderY = margin + (scaledHeight - borderHeight) / 2; // Центрируем прямоугольник
        border.setAttribute("x", borderX);
        border.setAttribute("y", borderY);
        border.setAttribute("width", borderWidth);
        border.setAttribute("height", borderHeight);
        border.setAttribute("fill", "none");
        border.setAttribute("stroke", "#fedfd7");
        border.setAttribute("stroke-width", "4");
        svg.appendChild(border);

        // Рисуем круги
        packer.list.forEach(circle => {
            const cx = margin + circle.c.x * zoom; // Сохраняем оригинальные координаты
            const cy = margin + circle.c.y * zoom; // Сохраняем оригинальные координаты
            const radius = circle.r * zoom * scaleFactor; // Уменьшаем радиус для n = 1

            // Круг
            const circleEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circleEl.setAttribute("cx", cx);
            circleEl.setAttribute("cy", cy);
            circleEl.setAttribute("r", radius);
            circleEl.setAttribute("fill", "#fd8262");
            circleEl.setAttribute("stroke", "#fedfd7");
            circleEl.setAttribute("stroke-width", "4");
            svg.appendChild(circleEl);

            // Плюсик
            const plusSize = radius * 0.4;

            const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line1.setAttribute("x1", cx - plusSize/2);
            line1.setAttribute("y1", cy);
            line1.setAttribute("x2", cx + plusSize/2);
            line1.setAttribute("y2", cy);
            line1.setAttribute("stroke", "#fedfd7");
            line1.setAttribute("stroke-width", "4");
            line1.setAttribute("stroke-linecap", "round");

            const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line2.setAttribute("x1", cx);
            line2.setAttribute("y1", cy - plusSize/2);
            line2.setAttribute("x2", cx);
            line2.setAttribute("y2", cy + plusSize/2);
            line2.setAttribute("stroke", "#fedfd7");
            line2.setAttribute("stroke-width", "4");
            line2.setAttribute("stroke-linecap", "round");

            svg.appendChild(line1);
            svg.appendChild(line2);
        });
    }

    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', function() {
        const count = parseInt(document.querySelector('.count').textContent) || 5;
        drawFlowers(count);
    });

    // Обработчик кнопки "Продолжить"
    document.querySelector('.next-btn-short')?.addEventListener('click', function() {
        drawFlowers(selectedFlowerCount);
    });
});