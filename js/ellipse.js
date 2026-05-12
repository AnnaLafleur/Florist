document.addEventListener('DOMContentLoaded', function() {
    const svgEllipse = document.getElementById('ellipse-svg');
    if (!svgEllipse) return;

    // Не меняем размер на ПК - он зафиксирован в CSS
    if (window.innerWidth <= 768) {
        svgEllipse.style.width = '100%';
        svgEllipse.style.height = 'auto';
    }

    // Preload paper/box/tape images
    (function preloadPaperImages() {
        const shapes = ['circle', 'square', 'rectangle'];
        const nums = ['0001', '0002', '0003', '0004', '0005', '0006', '0007', '0008', '0009', '0010'];
        const colors = ['white', 'red', 'pink', 'orange', 'yellow', 'purple', 'blue', 'green', 'brown'];
        const tapeColors = ['white', 'red', 'pink', 'orange', 'yellow', 'purple', 'blue', 'green'];

        const preload = (src) => { const img = new Image(); img.src = src; };

        shapes.forEach(shape => {
            nums.forEach(num => {
                colors.forEach(color => {
                    preload(`https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/print/box/${shape}/${num}/${color}.png`);
                });
            });
        });

        nums.forEach(num => {
            colors.forEach(color => {
                preload(`https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/texture/paper1/${num}/${color}.png`);
                preload(`https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/texture/paper2/${num}/${color}.png`);
            });
            tapeColors.forEach(color => {
                preload(`https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/texture/tape/${color}.png`);
            });
        });
    })();

    const unitRadius = 30;
    const perspectiveScale = 0.58;
    const margin = 20;
    const scaleFactor = 5;

    const CDN = "https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/";

    function estimateContainerRadius(n) {
        if (n === 1) return unitRadius * 0.6;
        if (n === 3) return unitRadius * 2.0;
        return unitRadius * Math.sqrt(n / 0.9);
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

        flowerGroups.forEach((group) => {
            const hoverCircle = group.querySelector('circle.hover-circle');
            if (!hoverCircle) return;

            const cx = parseFloat(hoverCircle.getAttribute('cx'));
            const cy = parseFloat(hoverCircle.getAttribute('cy'));

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
            const imageSize = parseFloat(image.getAttribute('width'));

            flowerData.push({
                flowerName,
                color,
                rotation,
                cx,
                cy,
                imageSize
            });
        });

        return flowerData;
    }

    function getGreenData() {
        const svg = document.getElementById('flowers-svg');
        if (!svg) return [];

        const greenImgs = svg.querySelectorAll('image.green-region-img');
        const greenData = [];

        greenImgs.forEach((img) => {
            const x = parseFloat(img.getAttribute('x'));
            const y = parseFloat(img.getAttribute('y'));
            const iw = parseFloat(img.getAttribute('width'));
            const ih = parseFloat(img.getAttribute('height'));
            if (isNaN(x) || isNaN(y) || isNaN(iw)) return;

            const cx = x + iw / 2;
            const cy = y + ih / 2;

            const href = img.getAttribute('href') || img.getAttribute('xlink:href') || '';
            const match = href.match(/green\/([^\/]+)\//);
            const greenName = match ? match[1] : null;
            if (!greenName) return;

            greenData.push({ type: 'green', greenName, cx, cy, imageSize: iw });
        });

        return greenData;
    }

    function getPaperInfo(paperSlot) {
        const textureGrid = document.querySelector('.step-3 .directory-grid[data-type="texture"]');
        const defaultInfo = { num: '0001', color: 'white' };
        if (!textureGrid) return defaultInfo;

        const btn = document.querySelector(`.paper-btn[data-button-id="${paperSlot}"]`);

        function infoFromItem(item) {
            if (!item) return null;
            const textureName = item.dataset.textureName || 'texture-1';
            const numMatch = textureName.match(/(\d+)$/);
            const num = numMatch ? numMatch[1].padStart(4, '0') : '0001';
            const color = item.dataset.currentColor || 'white';
            return { num, color };
        }

        const activeBtn = document.querySelector('.paper-btn.active');
        if (activeBtn && activeBtn.dataset.buttonId === paperSlot) {
            const selected = textureGrid.querySelector('.item-content.selected');
            if (selected) {
                const info = infoFromItem(selected.closest('.directory-item'));
                if (info) {
                    if (btn) { btn.dataset.savedNum = info.num; btn.dataset.savedColor = info.color; }
                    return info;
                }
            }
            const checked = textureGrid.querySelector('input[type="radio"]:checked');
            if (checked) {
                const info = infoFromItem(checked.closest('.directory-item'));
                if (info) {
                    if (btn) { btn.dataset.savedNum = info.num; btn.dataset.savedColor = info.color; }
                    return info;
                }
            }
        }

        if (btn && btn.dataset.savedNum) {
            return { num: btn.dataset.savedNum, color: btn.dataset.savedColor || 'white' };
        }

        const slotIndex = paperSlot === 'paper1' ? 0 : 1;
        const items = textureGrid.querySelectorAll('.directory-item');
        if (items[slotIndex]) {
            return infoFromItem(items[slotIndex]) || defaultInfo;
        }

        return defaultInfo;
    }

    function isBoxMode() {
        const shapeClass = window.getSelectedShape ? window.getSelectedShape() : 'form-circle';
        if (shapeClass !== 'form-circle') return true;
        const boxRadio = document.getElementById('radio-3');
        return boxRadio && boxRadio.checked;
    }

    function getPrintInfo() {
        const printGrid = document.querySelector('.step-3 .directory-grid[data-type="print"]');
        const defaultInfo = { num: '0001', color: 'white', shape: 'circle' };
        if (!printGrid) return defaultInfo;

        const shapeClass = window.getSelectedShape ? window.getSelectedShape() : 'form-circle';
        const shape = shapeClass.replace('form-', '');

        let item = null;
        const selected = printGrid.querySelector('.item-content.selected');
        if (selected) item = selected.closest('.directory-item');
        else {
            const checked = printGrid.querySelector('input[type="radio"]:checked');
            if (checked) item = checked.closest('.directory-item');
        }

        if (!item && window.step3State?.lastSelectedPrint) {
            item = printGrid.querySelector(`[data-texture-name="${window.step3State.lastSelectedPrint}"]`);
        }
        if (!item) item = printGrid.querySelector('.directory-item');

        if (!item) return defaultInfo;

        const textureName = item.dataset.textureName || 'print-0001';
        const numMatch = textureName.match(/(\d+)$/);
        const num = numMatch ? numMatch[1].padStart(4, '0') : '0001';
        const color = item.dataset.currentColor || 'white';

        return { num, color, shape };
    }

    // Функция для проверки, нужно ли отключить нижнюю зелень для текущей формы и количества цветов
    function shouldDisableBottomGreen() {
        const shapeClass = window.getSelectedShape ? window.getSelectedShape() : 'form-circle';
        const flowerCount = getFlowerCount();

        // Форма circle: исключаем для 5, 9, 11, 13
        if (shapeClass === 'form-circle') {
            const disabledCounts = [5, 9, 11, 13];
            return disabledCounts.includes(flowerCount);
        }

        // Форма rectangle: исключаем для 7, 11
        if (shapeClass === 'form-rectangle') {
            const disabledCounts = [7, 11];
            return disabledCounts.includes(flowerCount);
        }

        return false;
    }

    function updatePaperHrefs() {
        const paper1El = svgEllipse.querySelector('#svg-paper1');
        const paper2El = svgEllipse.querySelector('#svg-paper2');
        const tapeEl  = svgEllipse.querySelector('#svg-tape');

        if (!paper2El || !tapeEl) {
            drawEllipse();
            return;
        }

        const boxMode = isBoxMode();

        if (boxMode) {
            const pi = getPrintInfo();
            paper2El.setAttribute('href', `${CDN}img/print/box/${pi.shape}/${pi.num}/${pi.color}.png`);
            if (paper1El) paper1El.setAttribute('href', '');
            tapeEl.setAttribute('href', `${CDN}img/print/tape/${pi.shape}/${tapeColors[tapeColorIndex]}.png`);
        } else {
            const p1 = getPaperInfo('paper1');
            const p2 = getPaperInfo('paper2');
            if (paper1El) paper1El.setAttribute('href', `${CDN}img/texture/paper1/${p1.num}/${p1.color}.png`);
            paper2El.setAttribute('href', `${CDN}img/texture/paper2/${p2.num}/${p2.color}.png`);
            tapeEl.setAttribute('href', `${CDN}img/texture/tape/${tapeColors[tapeColorIndex]}.png`);
        }

        const flowerData = getFlowerData();
        const flowerImages = svgEllipse.querySelectorAll('.flower-image');
        const sortedFlowerData = [...flowerData].sort((a, b) => a.cy - b.cy);
        flowerImages.forEach((img, i) => {
            if (sortedFlowerData[i]) {
                const flower = sortedFlowerData[i];
                img.setAttribute('href', `${CDN}img/animation/${flower.flowerName}/rotation/${flower.color}.png`);
            }
        });

    }

    function drawEllipse() {
        svgEllipse.innerHTML = '';

        const count = getFlowerCount();
        const flowerData = getFlowerData();
        if (flowerData.length === 0) return;

        const containerRadius = estimateContainerRadius(count);
        const w = containerRadius * 2;
        const h = w;

        const maxHeight = window.innerHeight * 0.8 - margin * 2;
        const zoom = (maxHeight / (h * perspectiveScale)) * (0.6 / 0.7);

        const sourceSvg = document.getElementById('flowers-svg');
        const viewBoxStr = sourceSvg ? sourceSvg.getAttribute('viewBox') : '0 0 0 0';
        const [vbMinX, vbMinY, viewBoxWidth_old, viewBoxHeight_old] = viewBoxStr.split(' ').map(Number);

        const shapeClassForCoords = window.getSelectedShape ? window.getSelectedShape() : 'form-circle';
        let centerX_old, centerY_old, oldZoom;
        const oldW = estimateContainerRadius(count) * 2;

        if (shapeClassForCoords === 'form-square') {
            centerX_old = 0;
            centerY_old = 0;
            const maxWidth_old = window.innerWidth * 0.7 - margin * 2;
            const maxHeight_old = window.innerHeight * 0.8 - margin * 2;
            oldZoom = Math.min(maxWidth_old / oldW, maxHeight_old / oldW);
        } else {
            centerX_old = viewBoxWidth_old / 2;
            centerY_old = viewBoxHeight_old / 2;
            oldZoom = (viewBoxWidth_old - margin * 2) / oldW;
        }

        const viewBoxYOffset = scaleFactor;
        const extraLeftPadding  = 800  * scaleFactor;
        const extraRightPadding = 100  * scaleFactor;
        const extraTopPadding   = 100  * scaleFactor;
        const extraBottomPadding= 1300 * scaleFactor;

        const viewBoxWidth  = w * zoom + margin * 2 + 50 + extraLeftPadding + extraRightPadding;
        const viewBoxHeight = h * zoom * perspectiveScale + margin * 2 + viewBoxYOffset + extraBottomPadding;

        svgEllipse.setAttribute('viewBox', `${-margin - extraLeftPadding} ${-viewBoxYOffset - extraTopPadding} ${viewBoxWidth} ${viewBoxHeight}`);
        svgEllipse.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        const backgroundGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const contentGroup    = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const foregroundGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const paperGroup      = document.createElementNS("http://www.w3.org/2000/svg", "g");

        svgEllipse.appendChild(backgroundGroup);
        svgEllipse.appendChild(paperGroup);
        svgEllipse.appendChild(contentGroup);
        svgEllipse.appendChild(foregroundGroup);

        const bgWidth  = w * zoom * 3.3 * scaleFactor;
        const bgHeight = h * zoom * perspectiveScale * 3.3 * scaleFactor;

        const paperCenterY = (viewBoxHeight / 2 - extraTopPadding) - scaleFactor;
        const shapeClass = window.getSelectedShape ? window.getSelectedShape() : 'form-circle';
        const paperOffsetX = (shapeClass === 'form-rectangle') ? -200 * scaleFactor : -200 * scaleFactor;

        let globalScale = 1.0;
        if (shapeClass === 'form-rectangle' || shapeClass === 'form-square') {
            globalScale = 1.3;
        }

        const boxMode = isBoxMode();
        const pi = boxMode ? getPrintInfo() : null;

        // Paper 2
        const paper2 = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        paper2.setAttribute('id', 'svg-paper2');
        paper2.setAttribute('width', (bgWidth * globalScale).toString());
        paper2.setAttribute('height', (bgHeight * globalScale).toString());
        paper2.setAttribute('x', (-bgWidth * globalScale / 2).toString());
        paper2.setAttribute('y', (-bgHeight * globalScale / 2).toString());

        if (boxMode) {
            paper2.setAttribute('href', `${CDN}img/print/box/${pi.shape}/${pi.num}/${pi.color}.png`);
        } else {
            const p2 = getPaperInfo('paper2');
            paper2.setAttribute('href', `${CDN}img/texture/paper2/${p2.num}/${p2.color}.png`);
        }
        paperGroup.appendChild(paper2);
        paperGroup.setAttribute('transform', `translate(${paperOffsetX}, ${paperCenterY})`);

        // Paper 1
        if (!boxMode) {
            const paper1 = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            paper1.setAttribute('id', 'svg-paper1');
            const p1 = getPaperInfo('paper1');
            paper1.setAttribute('href', `${CDN}img/texture/paper1/${p1.num}/${p1.color}.png`);
            paper1.setAttribute('width', (bgWidth * globalScale).toString());
            paper1.setAttribute('height', (bgHeight * globalScale).toString());
            paper1.setAttribute('x', (paperOffsetX - bgWidth * globalScale / 2).toString());
            paper1.setAttribute('y', (paperCenterY - bgHeight * globalScale / 2).toString());
            foregroundGroup.appendChild(paper1);
        }

        // ЛЕНТА
        const tape = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        tape.setAttribute('id', 'svg-tape');
        tape.setAttribute('width', (bgWidth * globalScale).toString());
        tape.setAttribute('height', (bgHeight * globalScale).toString());
        tape.setAttribute('x', (paperOffsetX - bgWidth * globalScale / 2).toString());
        tape.setAttribute('y', (paperCenterY - bgHeight * globalScale / 2).toString());

        if (boxMode) {
            tape.setAttribute('href', `${CDN}img/print/tape/${pi.shape}/${tapeColors[tapeColorIndex]}.png`);
        } else {
            tape.setAttribute('href', `${CDN}img/texture/tape/${tapeColors[tapeColorIndex]}.png`);
        }

        if (boxMode && shapeClass === 'form-circle') {
            const tapeShiftX = 200 * scaleFactor;
            const tapeShiftY = -600 * scaleFactor;
            tape.setAttribute('x', (paperOffsetX - bgWidth / 2 + tapeShiftX).toString());
            tape.setAttribute('y', (paperCenterY - bgHeight / 2 + tapeShiftY).toString());
            paperGroup.appendChild(tape);
        } else {
            foregroundGroup.appendChild(tape);
        }

        // BACK
        const backImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        backImg.setAttribute('id', 'svg-back');
        backImg.setAttribute('width', (bgWidth * globalScale).toString());
        backImg.setAttribute('height', (bgHeight * globalScale).toString());
        backImg.setAttribute('x', (paperOffsetX - bgWidth * globalScale / 2).toString());
        backImg.setAttribute('y', (paperCenterY - bgHeight * globalScale / 2).toString());
        const backShape = shapeClass.replace('form-', '');
        backImg.setAttribute('href', `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/print/box/${backShape}/back.png`);
        if (boxMode) {
            contentGroup.appendChild(backImg);
        } else {
            contentGroup.appendChild(backImg);
        }

        // ====================== ЦВЕТЫ И ЗЕЛЕНЬ ======================
        const ellipseCenterX = paperOffsetX - 50 * scaleFactor;
        const ellipseCenterY = paperCenterY - 180 * scaleFactor;

        let flowerScale = 1.0;
        if (shapeClass === 'form-square') {
            flowerScale = 0.8;
        }

        const flowersTyped = flowerData.map(f => ({ ...f, type: 'flower' }));
        const greenItems = getGreenData();

        // Проверяем, нужно ли отключить нижнюю зелень
        const disableBottomGreen = shouldDisableBottomGreen();

        // Определяем диапазон для нижней трети макета
        let bottomGreenItems = [];
        if (greenItems.length > 0 && !disableBottomGreen) {
            // Находим минимальное и максимальное значение cy среди зелени
            let minCy = Infinity;
            let maxCy = -Infinity;
            greenItems.forEach(g => {
                if (g.cy < minCy) minCy = g.cy;
                if (g.cy > maxCy) maxCy = g.cy;
            });

            // Нижняя треть диапазона (самые нижние элементы)
            const bottomThreshold = minCy + (maxCy - minCy) * 0.66;
            bottomGreenItems = greenItems.filter(g => g.cy >= bottomThreshold);
        }

        // Остальная зелень (не в нижней трети)
        const otherGreenItems = greenItems.filter(g => !bottomGreenItems.includes(g));

        // Объединяем цветы и остальную зелень, сортируем по cy
        const allItems = [...flowersTyped, ...otherGreenItems].sort((a, b) => a.cy - b.cy);

        function renderItem(item, isBottomGreen = false) {
            const relX = (item.cx - centerX_old) / oldZoom;
            const relY = (item.cy - centerY_old) / oldZoom;
            const newRelY = relY * perspectiveScale;

            const itemOffsetX = (shapeClass === 'form-rectangle') ? -150 : 0;
            const itemOffsetY = (shapeClass === 'form-rectangle') ? -300 :
                                (shapeClass === 'form-square') ? -400 : 0;

            const newCx = (relX * zoom * scaleFactor * globalScale * flowerScale) + ellipseCenterX + itemOffsetX;
            const newCy = (newRelY * zoom * scaleFactor * globalScale * flowerScale) + ellipseCenterY + itemOffsetY;

            if (item.type === 'green') {
                const newImageSize = item.imageSize * (zoom / oldZoom) * scaleFactor * globalScale * flowerScale;
                const greenOffsetX = newCx - ellipseCenterX;

                let shiftedCy = newCy - (newCy - ellipseCenterY) / 3;
                if (isBottomGreen) {
                    shiftedCy += 600;
                }
                let greenY = shiftedCy - newImageSize / 2;

                const greenGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                greenGroup.setAttribute('class', 'green-item');

                // ДЛЯ НИЖНЕЙ ЗЕЛЕНИ:
                // 1. Убираем градацию поворота (maxRotationGreen не применяется)
                // 2. Оставляем только фиксированный разворот на 180° (baseRotationGreen + 180)
                // Для обычной зелени оставляем как было - градация от -60 до +60
                if (isBottomGreen) {
                    // Для нижней зелени: ТОЛЬКО разворот на 180°, без градации
                    // baseRotationGreen не вычисляем, просто добавляем 180 к нулю
                    const rotationGreen = 180;
                    const rotateTransformGreen = `rotate(${rotationGreen}, ${newCx}, ${shiftedCy})`;
                    greenGroup.setAttribute('transform', rotateTransformGreen);
                } else {
                    // Для обычной зелени применяем поворот с градацией
                    const maxRotationGreen = 60;
                    const bouquetHalfWidthGreen = w / 2 * zoom * scaleFactor * globalScale;
                    const baseRotationGreen = bouquetHalfWidthGreen > 0
                        ? Math.max(-maxRotationGreen, Math.min(maxRotationGreen, (greenOffsetX / bouquetHalfWidthGreen) * maxRotationGreen))
                        : 0;
                    const rotationGreen = baseRotationGreen;
                    const rotateTransformGreen = Math.abs(rotationGreen) > 0.5 ? `rotate(${rotationGreen.toFixed(1)}, ${newCx}, ${shiftedCy})` : '';

                    if (rotateTransformGreen) {
                        greenGroup.setAttribute('transform', rotateTransformGreen);
                    }
                }

                const imageGroupGreen = document.createElementNS('http://www.w3.org/2000/svg', 'g');

                // Зеркалирование по позиции для обычной зелени (не нижней)
                if (!isBottomGreen && greenOffsetX < 0) {
                    imageGroupGreen.setAttribute('transform', `translate(${newCx}, ${shiftedCy}) scale(-1, 1) translate(${-newCx}, ${-shiftedCy})`);
                }

                const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                image.setAttribute('href', `${CDN}img/green/${item.greenName}/rotate.png`);
                image.setAttribute('width', newImageSize.toString());
                image.setAttribute('height', newImageSize.toString());
                image.setAttribute('x', (newCx - newImageSize / 2).toString());
                image.setAttribute('y', greenY.toString());
                image.setAttribute('class', 'green-image');

                imageGroupGreen.appendChild(image);
                greenGroup.appendChild(imageGroupGreen);
                return greenGroup;
            } else {
                const newImageSize = item.imageSize * (zoom / oldZoom) * scaleFactor * globalScale * flowerScale;
                const flowerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                flowerGroup.setAttribute('class', 'flower-group');

                const maxRotation = 40;
                const bouquetHalfWidth = w / 2 * zoom * scaleFactor * globalScale;
                const offsetX = newCx - ellipseCenterX;
                const rotation = bouquetHalfWidth > 0
                    ? Math.max(-maxRotation, Math.min(maxRotation, (offsetX / bouquetHalfWidth) * maxRotation))
                    : 0;

                const rotateTransform = Math.abs(rotation) > 0.5 ? `rotate(${rotation.toFixed(1)}, ${newCx}, ${newCy})` : '';
                if (rotateTransform) flowerGroup.setAttribute('transform', rotateTransform);

                const imageGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                if (offsetX < 0) {
                    imageGroup.setAttribute('transform', `translate(${newCx}, ${newCy}) scale(-1, 1) translate(${-newCx}, ${-newCy})`);
                }

                const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                image.setAttribute('href', `${CDN}img/animation/${item.flowerName}/rotation/${item.color}.png`);
                image.setAttribute('width', newImageSize.toString());
                image.setAttribute('height', newImageSize.toString());
                image.setAttribute('x', (newCx - newImageSize / 2).toString());
                image.setAttribute('y', (newCy - newImageSize / 2).toString());
                image.setAttribute('class', 'flower-image');

                imageGroup.appendChild(image);
                flowerGroup.appendChild(imageGroup);
                return flowerGroup;
            }
        }

        // Сначала рендерим всю зелень из нижней трети (позади цветов) - только если не отключена
        if (!disableBottomGreen) {
            bottomGreenItems.forEach(green => {
                const bottomGreenElement = renderItem(green, true);
                contentGroup.appendChild(bottomGreenElement);
            });
        }

        // Потом все цветы и остальную зелень (в порядке сортировки по cy)
        allItems.forEach(item => {
            const element = renderItem(item, false);
            contentGroup.appendChild(element);
        });

        // Эллипс
        const sortedFlowerDataForEllipse = [...flowerData].sort((a, b) => a.cy - b.cy);
        const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        if (count === 1) {
            const singleFlower = sortedFlowerDataForEllipse[0];
            ellipse.setAttribute("cx", singleFlower ? ((singleFlower.cx - centerX_old) / oldZoom * zoom * scaleFactor * globalScale + ellipseCenterX).toString() : ellipseCenterX.toString());
            ellipse.setAttribute("cy", singleFlower ? ((singleFlower.cy - centerY_old) / oldZoom * perspectiveScale * zoom * scaleFactor * globalScale + ellipseCenterY).toString() : ellipseCenterY.toString());
            ellipse.setAttribute("rx", (unitRadius * 0.33 * zoom * scaleFactor * globalScale).toString());
            ellipse.setAttribute("ry", (unitRadius * 0.33 * zoom * perspectiveScale * scaleFactor * globalScale).toString());
        } else {
            ellipse.setAttribute("cx", ellipseCenterX.toString());
            ellipse.setAttribute("cy", ellipseCenterY.toString());
            ellipse.setAttribute("rx", (w / 2 * zoom * scaleFactor * globalScale).toString());
            ellipse.setAttribute("ry", (h / 2 * zoom * perspectiveScale * scaleFactor * globalScale).toString());
        }
        ellipse.setAttribute("fill", "none");
        ellipse.setAttribute("stroke", "transparent");
        ellipse.setAttribute("stroke-width", "0");
        contentGroup.appendChild(ellipse);
    }

    // ==================== Стили и кнопки ====================
    const saveButtonStyle = document.createElement('style');
    saveButtonStyle.textContent = `
        .save-btn-container { position: fixed; bottom: 30px; right: 50px; display: flex; flex-direction: row; gap: 15px; z-index: 1000; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease; }
        .step-3.active .save-btn-container { opacity: 1; visibility: visible; }

        .tape-btn-container { position: fixed; bottom: 30px; left: calc(67vw + 20px); z-index: 1000; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease; }
        .step-3.active .tape-btn-container { opacity: 1; visibility: visible; }

        .tape-btn { width: 58px; height: 58px; background: transparent !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; padding: 0 !important; cursor: pointer; display: flex; justify-content: center; align-items: center; transform-origin: center center; transition: transform 0.18s ease; transform: scale(1.75) rotate(-10deg); }
        .tape-btn:hover { transform: scale(1.9) rotate(-10deg); }
        .tape-btn:active { transform: scale(1.8) rotate(-10deg); }
        .tape-btn img { width: 58px; height: 58px; display: block; pointer-events: none; }

        .save-btn { position: relative; width: 60px; height: 60px; background: #ff957a; border-radius: 60px; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: width 0.5s; transform-origin: right; }
        .save-btn:hover { width: 240px; background: #ff957a; }
        .save-btn .icon { width: 32px; height: 32px; position: absolute; left: 50%; transform: translateX(-50%); transition: transform 0.5s; }
        .save-btn:hover .icon { transform: translateX(-100%) scale(0); }
        .save-btn .title { color: #fff; font-family: 'Courier New', sans-serif; font-size: 27px; text-align: center; transform: scale(0); transition: transform 0.5s; white-space: nowrap; }
        .save-btn:hover .title { transform: scale(1); }
    `;
    document.head.appendChild(saveButtonStyle);

    const tapeColors = ['white', 'green', 'pink', 'purple', 'red'];
    let tapeColorIndex = 0;

    // Создаем контейнер для кнопки ленты
    let tapeBtnContainer = document.querySelector('.tape-btn-container');
    if (!tapeBtnContainer) {
        tapeBtnContainer = document.createElement('div');
        tapeBtnContainer.className = 'tape-btn-container';
        const tapeButton = document.createElement('div');
        tapeButton.className = 'tape-btn';
        const tapeIcon = document.createElement('img');
        tapeIcon.src = `${CDN}img/texture/tape/${tapeColors[tapeColorIndex]}.svg`;
        tapeButton.appendChild(tapeIcon);
        tapeBtnContainer.appendChild(tapeButton);
        document.body.appendChild(tapeBtnContainer);

        tapeButton.addEventListener('click', function() {
            tapeColorIndex = (tapeColorIndex + 1) % tapeColors.length;
            const color = tapeColors[tapeColorIndex];
            tapeIcon.src = `${CDN}img/texture/tape/${color}.svg`;

            const tapeEl = svgEllipse.querySelector('#svg-tape');
            if (tapeEl) {
                const isBox = isBoxMode();
                let tapePath = isBox
                    ? `${CDN}img/print/tape/${getPrintInfo().shape}/${color}.png`
                    : `${CDN}img/texture/tape/${color}.png`;
                tapeEl.setAttribute('href', tapePath);
            }
            window.currentTapeColor = color;
        });
    }

    window.currentTapeColor = tapeColors[tapeColorIndex];
    window.getPaperInfoForSave = getPaperInfo;

    // Создаем контейнер для кнопки сохранения
    let saveButtonContainer = document.querySelector('.save-btn-container');
    if (!saveButtonContainer) {
        saveButtonContainer = document.createElement('div');
        saveButtonContainer.className = 'save-btn-container';
        const saveButton = document.createElement('div');
        saveButton.className = 'save-btn';
        const saveIcon = document.createElement('img');
        saveIcon.className = 'icon';
        saveIcon.src = `${CDN}img/save.svg`;
        const saveTitle = document.createElement('span');
        saveTitle.className = 'title';
        saveTitle.textContent = 'Сохранить';
        saveButton.appendChild(saveIcon);
        saveButton.appendChild(saveTitle);
        saveButtonContainer.appendChild(saveButton);
        document.body.appendChild(saveButtonContainer);
    }

    function updateSaveButtonVisibility() {
        const isThirdStageActive = document.querySelector('.step-3.active');
        const saveContainer = document.querySelector('.save-btn-container');
        const tapeContainer = document.querySelector('.tape-btn-container');

        if (saveContainer) {
            saveContainer.style.opacity = isThirdStageActive ? '1' : '0';
            saveContainer.style.visibility = isThirdStageActive ? 'visible' : 'hidden';
        }

        if (tapeContainer) {
            tapeContainer.style.opacity = isThirdStageActive ? '1' : '0';
            tapeContainer.style.visibility = isThirdStageActive ? 'visible' : 'hidden';
        }
    }

    function setupStageObserver() {
        const stages = document.querySelectorAll('.step-1, .step-2, .step-3');
        stages.forEach(stage => {
            const observer = new MutationObserver(updateSaveButtonVisibility);
            observer.observe(stage, { attributes: true, attributeFilter: ['class'] });
        });
    }

    function initBothPaperSlots() {
        const textureGrid = document.querySelector('.step-3 .directory-grid[data-type="texture"]');
        if (!textureGrid) return;

        function infoFromItem(item) {
            if (!item) return null;
            const textureName = item.dataset.textureName || 'texture-1';
            const numMatch = textureName.match(/(\d+)$/);
            const num = numMatch ? numMatch[1].padStart(4, '0') : '0001';
            const color = item.dataset.currentColor || 'white';
            return { num, color };
        }

        const slotTextureNames = {
            paper1: window.step3State?.lastSelectedPaper1,
            paper2: window.step3State?.lastSelectedPaper2
        };

        ['paper1', 'paper2'].forEach(slot => {
            const btn = document.querySelector(`.paper-btn[data-button-id="${slot}"]`);
            if (!btn || btn.dataset.savedNum) return;

            let item = null;
            if (slotTextureNames[slot]) {
                item = textureGrid.querySelector(`[data-texture-name="${slotTextureNames[slot]}"]`);
            }
            if (!item) {
                const items = textureGrid.querySelectorAll('.directory-item');
                item = slot === 'paper1' ? items[0] : items[1];
            }
            const info = infoFromItem(item);
            if (info) {
                btn.dataset.savedNum = info.num;
                btn.dataset.savedColor = info.color;
            }
        });
    }

    function saveActivePaperSlotAndRedraw() {
        const textureGrid = document.querySelector('.step-3 .directory-grid[data-type="texture"]');
        if (!textureGrid) return;
        const activeBtn = document.querySelector('.paper-btn.active');
        if (!activeBtn) return;
        const slot = activeBtn.dataset.buttonId;

        let item = null;
        const selectedContent = textureGrid.querySelector('.item-content.selected');
        if (selectedContent) item = selectedContent.closest('.directory-item');
        else {
            const checkedRadio = textureGrid.querySelector('input[type="radio"]:checked');
            if (checkedRadio) item = checkedRadio.closest('.directory-item');
        }

        if (item) {
            const textureName = item.dataset.textureName || 'texture-1';
            const numMatch = textureName.match(/(\d+)$/);
            const num = numMatch ? numMatch[1].padStart(4, '0') : '0001';
            const color = item.dataset.currentColor || 'white';
            const btn = document.querySelector(`.paper-btn[data-button-id="${slot}"]`);
            if (btn) {
                btn.dataset.savedNum = num;
                btn.dataset.savedColor = color;
            }
        }
        updatePaperHrefs();
    }

    function initialize() {
        updateSaveButtonVisibility();
        setupStageObserver();

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
            if (thirdStage) new MutationObserver(checkVisibility).observe(thirdStage, { attributes: true, attributeFilter: ['style'] });
        }

        document.addEventListener('click', function(e) {
            if (e.target.closest('.next-btn-short, .next-btn, .arrow-left, .arrow-right')) setTimeout(drawEllipse, 100);
        });

        document.addEventListener('click', function(e) {
            if (!document.querySelector('.step-3.active')) return;
            if (e.target.closest('.step-3 .directory-grid[data-type="texture"]') || e.target.closest('.color-icon-container')) {
                setTimeout(saveActivePaperSlotAndRedraw, 50);
            }
        });

        document.addEventListener('click', function(e) {
            if (e.target.closest('.paper-btn')) setTimeout(updatePaperHrefs, 50);
        });

        document.addEventListener('click', function(e) {
            if (!document.querySelector('.step-3.active')) return;
            if (e.target.closest('.step-3 .directory-grid[data-type="print"]') || e.target.closest('.color-icon-container')) {
                setTimeout(updatePaperHrefs, 50);
            }
        });

        const boxRadioEl = document.getElementById('radio-3');
        const paperRadioEl = document.getElementById('radio-2');

        // Конвертируем все <image href> в base64 через fetch, потом рисуем в canvas
        async function snapshotSvgToCanvas(svgEl) {
            var rect = svgEl.getBoundingClientRect();
            var svgClone = svgEl.cloneNode(true);
            svgClone.setAttribute('width', rect.width);
            svgClone.setAttribute('height', rect.height);

            // Собираем все href из image-тегов и инлайним их как base64
            var images = Array.from(svgClone.querySelectorAll('image'));
            await Promise.all(images.map(async function(img) {
                var href = img.getAttribute('href') || img.getAttribute('xlink:href') || '';
                if (!href || href.startsWith('data:')) return;
                try {
                    var resp = await fetch(href, { mode: 'cors' });
                    var blob = await resp.blob();
                    var b64 = await new Promise(function(res) {
                        var r = new FileReader();
                        r.onload = function() { res(r.result); };
                        r.readAsDataURL(blob);
                    });
                    img.setAttribute('href', b64);
                } catch(e) { /* пропускаем если не загрузилось */ }
            }));

            var svgStr = new XMLSerializer().serializeToString(svgClone);
            var blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
            var url = URL.createObjectURL(blob);

            return new Promise(function(resolve) {
                var img = new Image();
                img.onload = function() {
                    var canvas = document.createElement('canvas');
                    canvas.width = rect.width;
                    canvas.height = rect.height;
                    canvas.getContext('2d').drawImage(img, 0, 0, rect.width, rect.height);
                    URL.revokeObjectURL(url);
                    resolve({ canvas: canvas, rect: rect });
                };
                img.onerror = function() {
                    URL.revokeObjectURL(url);
                    resolve(null);
                };
                img.src = url;
            });
        }

        function runSlideAnimation(snapshotResult) {
            var rect = snapshotResult.rect;
            var canvas = snapshotResult.canvas;

            // Сначала прячем SVG — чтобы drawEllipse() не мелькнул на экране
            svgEllipse.style.visibility = 'hidden';
            svgEllipse.style.opacity = '0';
            svgEllipse.style.transform = 'translateX(120%)';

            // Накладываем canvas поверх страницы точно на месте SVG
            canvas.style.position = 'fixed';
            canvas.style.top = rect.top + 'px';
            canvas.style.left = rect.left + 'px';
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '9999';
            document.body.appendChild(canvas);

            // Перерисовываем SVG с новым контентом — он уже скрыт, мигания нет
            drawEllipse();
            svgEllipse.style.visibility = 'visible';

            // Canvas со старым контентом улетает влево
            anime({
                targets: canvas,
                translateX: ['0%', '-120%'],
                opacity: [1, 0],
                duration: 420,
                easing: 'easeInQuad',
                complete: function() {
                    canvas.remove();
                }
            });

            // Новый SVG вылетает справа
            anime({
                targets: svgEllipse,
                translateX: ['120%', '0%'],
                opacity: [0, 1],
                duration: 420,
                easing: 'easeOutQuad',
                complete: function() {
                    svgEllipse.style.transform = '';
                }
            });
        }

        // Снимок начинаем делать на pointerdown — ДО любых change-обработчиков
        var pendingSnapshot = null;

        function startSnapshot() {
            // Начинаем fetch заранее, сохраняем Promise
            pendingSnapshot = snapshotSvgToCanvas(svgEllipse);
        }

        async function animatedRedraw() {
            // Ждём уже запущенный snapshot (он стартовал на pointerdown)
            var snapshot = pendingSnapshot ? await pendingSnapshot : await snapshotSvgToCanvas(svgEllipse);
            pendingSnapshot = null;
            if (snapshot) {
                runSlideAnimation(snapshot);
            } else {
                drawEllipse();
            }
        }

        // Вешаем startSnapshot на label-элементы radio через pointerdown (раньше change)
        var tabLabels = document.querySelectorAll('.step-3 .tabs label[for="radio-2"], .step-3 .tabs label[for="radio-3"]');
        tabLabels.forEach(function(label) {
            label.addEventListener('pointerdown', startSnapshot, { capture: true });
        });
        // Также на сами radio на случай клика по ним напрямую
        if (boxRadioEl) boxRadioEl.addEventListener('pointerdown', startSnapshot, { capture: true });
        if (paperRadioEl) paperRadioEl.addEventListener('pointerdown', startSnapshot, { capture: true });

        if (boxRadioEl) boxRadioEl.addEventListener('change', function() { animatedRedraw(); });
        if (paperRadioEl) paperRadioEl.addEventListener('change', function() { animatedRedraw(); });

        const printGridEl = document.querySelector('.step-3 .directory-grid[data-type="print"]');
        if (printGridEl) {
            const printObserver = new MutationObserver(() => {
                if (document.querySelector('.step-3.active')) setTimeout(updatePaperHrefs, 50);
            });
            printObserver.observe(printGridEl, { attributes: true, attributeFilter: ['data-current-color', 'class'], subtree: true });
        }

        document.addEventListener('transitionEnd', function(e) {
            if (e.detail?.step === 'step-3') {
                setTimeout(() => { initBothPaperSlots(); drawEllipse(); }, 600);
            }
        });

        const textureGridEl = document.querySelector('.step-3 .directory-grid[data-type="texture"]');
        if (textureGridEl) {
            const colorObserver = new MutationObserver(() => {
                if (document.querySelector('.step-3.active')) setTimeout(saveActivePaperSlotAndRedraw, 30);
            });
            colorObserver.observe(textureGridEl, { attributes: true, attributeFilter: ['data-current-color', 'class'], subtree: true });
        }

        setTimeout(() => { initBothPaperSlots(); drawEllipse(); }, 1000);
    }

    initialize();
});