document.addEventListener('DOMContentLoaded', function () {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/save.css';
    document.head.appendChild(link);

    const saveButtonContainer = document.createElement('div');
    saveButtonContainer.className = 'save-btn-container';

    const saveButton = document.createElement('div');
    saveButton.className = 'save-btn';

    const saveIcon = document.createElement('img');
    saveIcon.className = 'icon';
    saveIcon.src = 'https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/save.svg';

    const saveTitle = document.createElement('span');
    saveTitle.className = 'title';
    saveTitle.textContent = 'Сохранить';

    saveButton.appendChild(saveIcon);
    saveButton.appendChild(saveTitle);
    saveButtonContainer.appendChild(saveButton);
    document.body.appendChild(saveButtonContainer);

    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.overflow = 'hidden';
    modalContent.style.display = 'flex';
    modalContent.style.flexDirection = 'row';
    modalContent.style.alignItems = 'center';
    modalContent.style.justifyContent = 'center';
    modalContent.style.position = 'relative';

    const closeButton = document.createElement('span');
    closeButton.className = 'close-btn';
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.fontSize = '30px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    };

    const modalSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    modalSvg.className = 'modal-svg';

    const btnPanel = document.createElement('div');
    btnPanel.className = 'modal-btn-panel';

    const downloadButton = document.createElement('button');
    downloadButton.className = 'modal-round-btn--save';
    downloadButton.title = 'Сохранить как PNG';
    downloadButton.innerHTML = `<img src="https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/download.svg" width="26" height="26" style="pointer-events:none;">`;

    const copyButton = document.createElement('button');
    copyButton.className = 'modal-round-btn--copy';
    copyButton.title = 'Копировать изображение';
    copyButton.innerHTML = `<img src="https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/copy.svg" width="26" height="26" style="pointer-events:none;">`;

    const wrapDownload = document.createElement('div');
    wrapDownload.className = 'btn-wrap';
    wrapDownload.appendChild(downloadButton);

    const wrapCopy = document.createElement('div');
    wrapCopy.className = 'btn-wrap';
    wrapCopy.appendChild(copyButton);

    btnPanel.appendChild(wrapDownload);
    btnPanel.appendChild(wrapCopy);

    modalContent.appendChild(closeButton);
    modalContent.appendChild(modalSvg);
    modalContent.appendChild(btnPanel);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    let toastTimeout = null;
    let isToastActive = false;
    let toastElement = null;

    function showSuccessToast() {
        if (isToastActive) {
            hideToast();
        }

        toastElement = document.createElement('div');
        toastElement.className = 'toast';
        toastElement.innerHTML = `
            <div class="toast-content">
                <img src="https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/copy.svg"
                     alt="Скопировано"
                     class="toast-icon">
                <div class="message">
                    <span class="text">Изображение успешно скопировано</span>
                    <span class="text">в буфер обмена.</span>
                </div>
            </div>
            <i class="fa-solid fa-xmark close"></i>
            <div class="progress"></div>
        `;
        document.body.appendChild(toastElement);

        const progress = toastElement.querySelector('.progress');

        toastElement.classList.add('active');
        progress.classList.add('active');
        isToastActive = true;

        toastTimeout = setTimeout(() => {
            hideToast();
        }, 4000);

        const closeBtn = toastElement.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', e => {
                e.stopPropagation();
                clearTimeout(toastTimeout);
                hideToast();
            });
        }
    }

    function hideToast() {
        if (!toastElement || !isToastActive) return;

        const progress = toastElement.querySelector('.progress');

        toastElement.classList.remove('active');
        progress.classList.remove('active');
        isToastActive = false;

        setTimeout(() => {
            if (toastElement && toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
            toastElement = null;
        }, 500);
    }

    const CDN = 'https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/';

    function getFlowerData() {
        const svg = document.getElementById('flowers-svg');
        if (!svg) return [];

        const flowerGroups = svg.querySelectorAll('g.flower-group');
        const flowerData = [];

        flowerGroups.forEach(group => {
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

    function getEllipseParameters() {
        const countElement = document.querySelector('.count');
        const count = countElement ? parseInt(countElement.textContent, 10) : 5;
        const unitRadius = 30;
        const perspectiveScale = 0.58;
        const margin = 20;

        function estimateContainerRadius(n) {
            if (n === 1) return unitRadius * 0.6;
            if (n === 3) return unitRadius * 2.0;
            return unitRadius * Math.sqrt(n / 0.9);
        }

        const containerRadius = estimateContainerRadius(count);
        const w = containerRadius * 2;
        const h = w;

        const maxHeight = 1200 * 0.8;
        const zoom = maxHeight / (h * perspectiveScale) * (0.6 / 0.7);

        const sourceSvg = document.getElementById('flowers-svg');
        const viewBoxStr = sourceSvg ? sourceSvg.getAttribute('viewBox') : '0 0 0 0';
        const [, , viewBoxWidth_old, viewBoxHeight_old] = viewBoxStr.split(' ').map(Number);
        const centerX_old = viewBoxWidth_old / 2;
        const centerY_old = viewBoxHeight_old / 2;

        const oldW = estimateContainerRadius(count) * 2;
        const oldZoom = (viewBoxWidth_old - margin * 2) / oldW;

        return {
            count,
            w,
            h,
            zoom,
            centerX_old,
            centerY_old,
            oldZoom,
            perspectiveScale,
            margin
        };
    }

    function isBoxMode() {
        const shapeClass = window.getSelectedShape ? window.getSelectedShape() : 'form-circle';
        if (shapeClass !== 'form-circle') return true;
        const boxRadio = document.getElementById('radio-3');
        return boxRadio && boxRadio.checked;
    }

    function getPrintInfo() {
        const printGrid = document.querySelector('.step-3 .directory-grid[data-type="print"]');
        const shapeClass = window.getSelectedShape ? window.getSelectedShape() : 'form-circle';
        const shape = shapeClass.replace('form-', '');
        const defaultInfo = { num: '0001', color: 'white', shape };
        if (!printGrid) return defaultInfo;

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

    function shouldDisableBottomGreen(count) {
        const shapeClass = window.getSelectedShape ? window.getSelectedShape() : 'form-circle';
        if (shapeClass === 'form-circle') {
            return [5, 9, 11, 13].includes(count);
        }
        if (shapeClass === 'form-rectangle') {
            return [7, 11].includes(count);
        }
        return false;
    }

    function buildModalContent() {
        modalSvg.innerHTML = '';
        const flowerData = getFlowerData();
        const greenItems = getGreenData();
        const params = getEllipseParameters();

        const backgroundGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const rackGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const foregroundGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const paperGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', 'backgroundClip');
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        const boxMode = isBoxMode();
        const shapeClass = window.getSelectedShape ? window.getSelectedShape() : 'form-circle';
        const boxShape = shapeClass.replace('form-', '');

        const background = document.createElementNS('http://www.w3.org/2000/svg', 'image');

        const bgImgPath = boxMode
            ? `${CDN}img/print/box/${boxShape}/background.png`
            : `${CDN}img/texture/background.png`;
        background.setAttribute('href', bgImgPath);
        background.setAttribute('width', '890');
        background.setAttribute('height', '1300');
        background.setAttribute('x', '0');
        background.setAttribute('y', '0');
        background.setAttribute('preserveAspectRatio', 'xMidYMid slice');

        if (boxMode) {
            // For box mode, clipPath must use viewBox coordinates so rounded corners
            // appear at the visible edges after zoom. Compute viewBox bounds here.
            const zoomFactor = 1.35;
            const vbW = 890 / zoomFactor;
            const vbH = 1300 / zoomFactor;
            const shiftRight = -20 / zoomFactor;
            const vbX = (890 - vbW) / 2 + shiftRight;
            const vbY = (1300 - vbH) / 2;
            // rx/ry scaled back to SVG-space: 60px on screen = 60/zoomFactor in SVG coords
            const rxSvg = 60 / zoomFactor;
            rect.setAttribute('x', vbX.toString());
            rect.setAttribute('y', vbY.toString());
            rect.setAttribute('width', vbW.toString());
            rect.setAttribute('height', vbH.toString());
            rect.setAttribute('rx', rxSvg.toString());
            rect.setAttribute('ry', rxSvg.toString());
        } else {
            rect.setAttribute('x', '0');
            rect.setAttribute('y', '0');
            rect.setAttribute('width', '890');
            rect.setAttribute('height', '1300');
            rect.setAttribute('rx', '60');
            rect.setAttribute('ry', '60');
        }
        clipPath.appendChild(rect);
        defs.appendChild(clipPath);
        background.setAttribute('clip-path', 'url(#backgroundClip)');
        backgroundGroup.appendChild(background);
        modalSvg.appendChild(defs);
        modalSvg.appendChild(backgroundGroup);

        const bouquetScale = 0.22;
        const originalBouquetHeight = params.h * params.zoom * params.perspectiveScale;
        const adjustedScaleFactor = (1300 * bouquetScale) / originalBouquetHeight;

        const bgWidth = params.w * params.zoom * 3.3 * adjustedScaleFactor;
        const bgHeight = params.h * params.zoom * params.perspectiveScale * 3.3 * adjustedScaleFactor;

        const paperCenterX = 890 / 2 + 50 * adjustedScaleFactor;
        const paperCenterY = 1300 / 2 - 160 * adjustedScaleFactor;

        function makeLayerImg(href, x, y, w, h) {
            const el = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            el.setAttribute('href', href);
            el.setAttribute('width', w.toString());
            el.setAttribute('height', h.toString());
            el.setAttribute('x', x.toString());
            el.setAttribute('y', y.toString());
            return el;
        }

        const layerX = paperCenterX - bgWidth / 2;
        const layerY = paperCenterY - bgHeight / 2;
        const tapeColor = window.currentTapeColor || 'white';

        if (boxMode) {
            const pi = getPrintInfo();

            paperGroup.appendChild(makeLayerImg(
                `${CDN}img/print/box/${boxShape}/${pi.num}/${pi.color}.png`,
                layerX, layerY, bgWidth, bgHeight
            ));

            paperGroup.appendChild(makeLayerImg(
                `${CDN}img/print/tape/${boxShape}/${tapeColor}.png`,
                layerX, layerY, bgWidth, bgHeight
            ));

            contentGroup.appendChild(makeLayerImg(
                `${CDN}img/print/box/${boxShape}/back.png`,
                layerX, layerY, bgWidth, bgHeight
            ));

        } else {
            rackGroup.appendChild(makeLayerImg(
                `${CDN}img/texture/rack.png`,
                layerX, layerY + 80 * adjustedScaleFactor, bgWidth, bgHeight
            ));

            paperGroup.appendChild(makeLayerImg(
                (() => {
                    const p2 = window.getPaperInfoForSave ? window.getPaperInfoForSave('paper2') : { num: '0001', color: 'white' };
                    return `${CDN}img/texture/paper2/${p2.num}/${p2.color}.png`;
                })(),
                layerX, layerY, bgWidth, bgHeight
            ));

            foregroundGroup.appendChild(makeLayerImg(
                (() => {
                    const p1 = window.getPaperInfoForSave ? window.getPaperInfoForSave('paper1') : { num: '0001', color: 'white' };
                    return `${CDN}img/texture/paper1/${p1.num}/${p1.color}.png`;
                })(),
                layerX, layerY, bgWidth, bgHeight
            ));

            foregroundGroup.appendChild(makeLayerImg(
                `${CDN}img/texture/tape/${tapeColor}.png`,
                layerX, layerY, bgWidth, bgHeight
            ));

            contentGroup.appendChild(makeLayerImg(
                `${CDN}img/texture/back.png`,
                layerX, layerY, bgWidth, bgHeight
            ));
        }

        const isBoxSquare = boxMode && boxShape === 'square';

        let ellipseCenterX = paperCenterX - 110 * adjustedScaleFactor;
        let ellipseCenterY = paperCenterY - 310 * adjustedScaleFactor;
        let flowersGreenScale = 1.0;

        if (isBoxSquare) {
            ellipseCenterX = 640;
            ellipseCenterY = paperCenterY - 310 * adjustedScaleFactor + 100;
            flowersGreenScale = 0.78;
        }

        // Вычисляем границы букета на основе НОВЫХ координат (после смещения и масштабирования)
        let minNewX = Infinity, maxNewX = -Infinity;
        const allNewPositions = [];

        // Сначала вычисляем все новые координаты X
        flowerData.forEach(flower => {
            const relX = (flower.cx - params.centerX_old) / params.oldZoom;
            const newCx = relX * params.zoom * adjustedScaleFactor * flowersGreenScale + ellipseCenterX;
            allNewPositions.push(newCx);
            if (newCx < minNewX) minNewX = newCx;
            if (newCx > maxNewX) maxNewX = newCx;
        });

        greenItems.forEach(green => {
            const relX = (green.cx - params.centerX_old) / params.oldZoom;
            const newCx = relX * params.zoom * adjustedScaleFactor * flowersGreenScale + ellipseCenterX;
            allNewPositions.push(newCx);
            if (newCx < minNewX) minNewX = newCx;
            if (newCx > maxNewX) maxNewX = newCx;
        });

        // Половина ширины букета от нового центра
        const halfWidth = allNewPositions.length > 0 ? (maxNewX - minNewX) / 2 : 100;
        // Центр букета (среднее между min и max)
        const bouquetCenterX = allNewPositions.length > 0 ? (minNewX + maxNewX) / 2 : ellipseCenterX;

        const maxRotation = 40;
        const maxRotationGreen = 60;

        const disableBottomGreen = shouldDisableBottomGreen(params.count);
        let bottomGreenItems = [];
        let otherGreenItems = greenItems;

        if (greenItems.length > 0 && !disableBottomGreen) {
            let minCy = Infinity, maxCy = -Infinity;
            greenItems.forEach(g => {
                if (g.cy < minCy) minCy = g.cy;
                if (g.cy > maxCy) maxCy = g.cy;
            });
            const bottomThreshold = minCy + (maxCy - minCy) * 0.66;
            bottomGreenItems = greenItems.filter(g => g.cy >= bottomThreshold);
            otherGreenItems = greenItems.filter(g => !bottomGreenItems.includes(g));
        }

        function computeFlowerCoords(flower) {
            const relX = (flower.cx - params.centerX_old) / params.oldZoom;
            const relY = (flower.cy - params.centerY_old) / params.oldZoom;
            const newRelY = relY * params.perspectiveScale;
            let newCx = relX * params.zoom * adjustedScaleFactor * flowersGreenScale + ellipseCenterX;
            let newCy = newRelY * params.zoom * adjustedScaleFactor * flowersGreenScale + ellipseCenterY;
            let newImageSize = flower.imageSize * (params.zoom / params.oldZoom) * adjustedScaleFactor * flowersGreenScale;
            return { newCx, newCy, newImageSize };
        }

        function renderFlower(flower) {
            const { newCx, newCy, newImageSize } = computeFlowerCoords(flower);

            // Вычисляем поворот на основе НОВОЙ координаты X относительно ЦЕНТРА БУКЕТА
            let rotation = 0;
            if (halfWidth > 0 && allNewPositions.length > 0) {
                // Смещение от центра букета
                const offsetFromBouquetCenter = newCx - bouquetCenterX;
                // Нормализуем от -1 до 1
                let t = offsetFromBouquetCenter / halfWidth;
                t = Math.max(-1, Math.min(1, t));
                rotation = t * maxRotation;
            }

            const flowerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            flowerGroup.setAttribute('class', 'flower-group');
            if (Math.abs(rotation) > 0.5) {
                flowerGroup.setAttribute('transform', `rotate(${rotation.toFixed(1)}, ${newCx}, ${newCy})`);
            }

            // Зеркалирование для левой половины (относительно центра букета)
            const imageGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            if (newCx < bouquetCenterX) {
                imageGroup.setAttribute('transform', `translate(${newCx}, ${newCy}) scale(-1, 1) translate(${-newCx}, ${-newCy})`);
            }

            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('href', `${CDN}img/animation/${encodeURIComponent(flower.flowerName)}/rotation/${encodeURIComponent(flower.color)}.png`);
            image.setAttribute('width', newImageSize.toString());
            image.setAttribute('height', newImageSize.toString());
            image.setAttribute('x', (newCx - newImageSize / 2).toString());
            image.setAttribute('y', (newCy - newImageSize / 2).toString());
            image.setAttribute('class', 'flower-image');

            imageGroup.appendChild(image);
            flowerGroup.appendChild(imageGroup);
            return flowerGroup;
        }

        function renderGreen(green, isBottomGreen) {
            const relX = (green.cx - params.centerX_old) / params.oldZoom;
            const relY = (green.cy - params.centerY_old) / params.oldZoom;
            const newRelY = relY * params.perspectiveScale;
            let newCx = relX * params.zoom * adjustedScaleFactor * flowersGreenScale + ellipseCenterX;
            let newCy = newRelY * params.zoom * adjustedScaleFactor * flowersGreenScale + ellipseCenterY;
            let newImageSize = green.imageSize * (params.zoom / params.oldZoom) * adjustedScaleFactor * flowersGreenScale;

            let shiftedCy = newCy - (newCy - ellipseCenterY) / 3;
            if (isBottomGreen) shiftedCy += 600 * (adjustedScaleFactor / 5) * flowersGreenScale;
            const greenY = shiftedCy - newImageSize / 2;

            const greenGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            greenGroup.setAttribute('class', 'green-item');

            if (isBottomGreen) {
                greenGroup.setAttribute('transform', `rotate(180, ${newCx}, ${shiftedCy})`);
            } else {
                let rotationGreen = 0;
                if (halfWidth > 0 && allNewPositions.length > 0) {
                    const offsetFromBouquetCenter = newCx - bouquetCenterX;
                    let t = offsetFromBouquetCenter / halfWidth;
                    t = Math.max(-1, Math.min(1, t));
                    rotationGreen = t * maxRotationGreen;
                }
                if (Math.abs(rotationGreen) > 0.5) {
                    greenGroup.setAttribute('transform', `rotate(${rotationGreen.toFixed(1)}, ${newCx}, ${shiftedCy})`);
                }
            }

            const imageGroupGreen = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            if (!isBottomGreen && newCx < bouquetCenterX) {
                imageGroupGreen.setAttribute('transform', `translate(${newCx}, ${shiftedCy}) scale(-1, 1) translate(${-newCx}, ${-shiftedCy})`);
            }

            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('href', `${CDN}img/green/${encodeURIComponent(green.greenName)}/rotate.png`);
            image.setAttribute('width', newImageSize.toString());
            image.setAttribute('height', newImageSize.toString());
            image.setAttribute('x', (newCx - newImageSize / 2).toString());
            image.setAttribute('y', greenY.toString());
            image.setAttribute('class', 'green-image');

            imageGroupGreen.appendChild(image);
            greenGroup.appendChild(imageGroupGreen);
            return greenGroup;
        }

        if (!disableBottomGreen) {
            bottomGreenItems.forEach(green => {
                contentGroup.appendChild(renderGreen(green, true));
            });
        }

        const flowersTyped = flowerData.map(f => ({ ...f, type: 'flower' }));
        const allItems = [...flowersTyped, ...otherGreenItems].sort((a, b) => a.cy - b.cy);

        allItems.forEach(item => {
            if (item.type === 'flower') {
                contentGroup.appendChild(renderFlower(item));
            } else {
                contentGroup.appendChild(renderGreen(item, false));
            }
        });

        modalSvg.appendChild(rackGroup);
        modalSvg.appendChild(paperGroup);
        modalSvg.appendChild(contentGroup);
        modalSvg.appendChild(foregroundGroup);

        if (boxMode) {
            const zoomFactor = 1.35;
            const vbW = 890 / zoomFactor;
            const vbH = 1300 / zoomFactor;
            const shiftRight = -20 / zoomFactor;
            const vbX = (890 - vbW) / 2 + shiftRight;
            const vbY = (1300 - vbH) / 2;
            modalSvg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
        } else {
            modalSvg.setAttribute('viewBox', '0 0 890 1300');
        }
        modalSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }

    async function rasteriseSvg() {
        // For box mode, render with the zoomed viewBox (1.5x) clipped to original canvas size
        const boxMode = isBoxMode();
        let svgString = new XMLSerializer().serializeToString(modalSvg);
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');

        // Ensure the correct viewBox is set for rasterization
        const svgEl = svgDoc.documentElement;
        if (boxMode) {
            const zoomFactor = 1.35;
            const vbW = 890 / zoomFactor;
            const vbH = 1300 / zoomFactor;
            const shiftRight = -20 / zoomFactor;
            const vbX = (890 - vbW) / 2 + shiftRight;
            const vbY = (1300 - vbH) / 2;
            svgEl.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
        } else {
            svgEl.setAttribute('viewBox', '0 0 890 1300');
        }
        svgEl.setAttribute('width', '890');
        svgEl.setAttribute('height', '1300');

        svgDoc.querySelectorAll('rect[rx]').forEach(r => {
            r.setAttribute('rx', '0');
            r.setAttribute('ry', '0');
        });

        const images = svgDoc.querySelectorAll('image');
        const promises = [];
        for (let img of images) {
            let href = img.getAttribute('href');
            if (!href || href.startsWith('data:')) continue;
            let fetchUrl = href.startsWith('http') ? href : new URL(href, document.baseURI).href;
            const promise = fetch(fetchUrl, { mode: 'cors' })
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch ${fetchUrl}: ${res.statusText}`);
                    return res.blob();
                })
                .then(blob => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => { img.setAttribute('href', reader.result); resolve(); };
                    reader.onerror = () => reject(new Error(`Error reading blob for ${fetchUrl}`));
                    reader.readAsDataURL(blob);
                }));
            promises.push(promise);
        }
        await Promise.all(promises);
        svgString = new XMLSerializer().serializeToString(svgDoc);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        return new Promise((resolve) => {
            const rasterImg = new Image();
            rasterImg.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 890;
                canvas.height = 1300;
                canvas.getContext('2d').drawImage(rasterImg, 0, 0, 890, 1300);
                URL.revokeObjectURL(url);
                resolve(canvas);
            };
            rasterImg.src = url;
        });
    }

    downloadButton.addEventListener('click', async () => {
        try {
            const canvas = await rasteriseSvg();
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = 'bouquet.png';
            a.click();
        } catch (e) {
            console.error('Download failed', e);
        }
    });

    copyButton.addEventListener('click', async () => {
        try {
            const canvas = await rasteriseSvg();
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    showSuccessToast();
                } catch (err) {
                    console.error('Copy to clipboard failed', err);
                }
            }, 'image/png');
        } catch (e) {
            console.error('Rasterization failed', e);
        }
    });

    function updateModalSizes() {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const isSmallScreen = vw < 500;
        const fixedModalHeight = 425;
        const fixedSvgHeight = 340;
        const fixedSvgWidth = 890 * (fixedSvgHeight / 1300);
        const fixedLeftPadding = 24;
        const fixedRightPadding = 110;
        const minHeightThreshold = 500;

        let scale = vh * 0.85 / fixedModalHeight;
        if (vh < minHeightThreshold) {
            scale = minHeightThreshold * 0.85 / fixedModalHeight;
        }

        scale = isSmallScreen ? Math.min(scale, 1) : scale;

        const svgHeight = fixedSvgHeight * scale;
        const svgWidth = fixedSvgWidth * scale;
        const modalHeight = svgHeight + 80;
        const modalWidth = svgWidth + fixedLeftPadding + fixedRightPadding;

        const effectiveModalHeight = Math.min(modalHeight, vh - 20);
        const effectiveModalWidth = Math.min(modalWidth, vw - 20);

        modalContent.style.height = `${effectiveModalHeight}px`;
        modalContent.style.width = `${effectiveModalWidth}px`;
        modalSvg.style.height = `${svgHeight}px`;
        modalSvg.style.width = `${svgWidth}px`;
    }

    saveButton.addEventListener('click', () => {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            buildModalContent();
            updateModalSizes();
        }, 50);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    window.addEventListener('resize', () => {
        if (modal.style.display === 'flex') {
            updateModalSizes();
        }
    });

    function updateSaveButtonVisibility() {
        const isThirdStageActive = document.querySelector('.step-3.active');
        saveButtonContainer.style.opacity = isThirdStageActive ? '1' : '0';
        saveButtonContainer.style.visibility = isThirdStageActive ? 'visible' : 'hidden';
    }

    function setupStageObserver() {
        const stages = document.querySelectorAll('.step-1, .step-2, .step-3');
        stages.forEach(stage => {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.attributeName === 'class') {
                        updateSaveButtonVisibility();
                    }
                });
            });
            observer.observe(stage, { attributes: true, attributeFilter: ['class'] });
        });
    }

    function initialize() {
        updateSaveButtonVisibility();
        setupStageObserver();
    }

    initialize();
});