document.addEventListener('DOMContentLoaded', function() {
    const svgEllipse = document.getElementById('ellipse-svg');
    if (!svgEllipse) return;

    svgEllipse.style.width = '100%';
    svgEllipse.style.height = 'auto';

    const unitRadius = 30;
    const perspectiveScale = 0.58;
    const margin = 20;
    const scaleFactor = 5;

    const sizeMultipliers = {
        'carnation': 1.2, 'dahlia': 1.242, 'hippeastrum': 1.2, 'hydrangea': 1.5,
        'iris': 1.326, 'calla': 1.416, 'camellia': 1.2, 'crocus': 1.2,
        'lisianthus': 1.2, 'lily': 1.416, 'forget-me-not': 1.242, 'orchid': 1.326,
        'peony': 1.416, 'ranunculus': 1.242, 'rose': 1.242, 'lilac': 1.5,
        'tulip': 1.2, 'chrysanthemum': 1.326, 'cymbidium': 1.2, 'eustoma': 1.242
    };

    const flowersToRotate = ['iris', 'calla', 'crocus', 'orchid'];

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
        const [, , viewBoxWidth_old, viewBoxHeight_old] = viewBoxStr.split(' ').map(Number);
        const centerX_old = viewBoxWidth_old / 2;
        const centerY_old = viewBoxHeight_old / 2;

        const oldW = estimateContainerRadius(count) * 2;
        const oldZoom = (viewBoxWidth_old - margin * 2) / oldW;

        const viewBoxYOffset = scaleFactor;
        const extraLeftPadding = 800 * scaleFactor;
        const extraRightPadding = 100 * scaleFactor;
        const extraTopPadding = 100 * scaleFactor;
        const extraBottomPadding = 1300 * scaleFactor;

        const viewBoxWidth = w * zoom + margin * 2 + 50 + extraLeftPadding + extraRightPadding;
        const viewBoxHeight = h * zoom * perspectiveScale + margin * 2 + viewBoxYOffset + extraBottomPadding;
        svgEllipse.setAttribute('viewBox', `${-margin - extraLeftPadding} ${-viewBoxYOffset - extraTopPadding} ${viewBoxWidth} ${viewBoxHeight}`);
        svgEllipse.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        const backgroundGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const contentGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const foregroundGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const paperGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        svgEllipse.appendChild(backgroundGroup);
        svgEllipse.appendChild(paperGroup);
        svgEllipse.appendChild(contentGroup);
        svgEllipse.appendChild(foregroundGroup);

        const bgWidth = w * zoom * 3.3 * scaleFactor;
        const bgHeight = h * zoom * perspectiveScale * 3.3 * scaleFactor;

        const paperCenterY = (viewBoxHeight / 2 - extraTopPadding) - scaleFactor;
        const paperOffsetX = -200 * scaleFactor;

        const paper2 = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        paper2.setAttribute('href', 'img/texture/paper2/0001/white.png');
        paper2.setAttribute('width', bgWidth.toString());
        paper2.setAttribute('height', bgHeight.toString());
        paper2.setAttribute('x', (-bgWidth / 2).toString());
        paper2.setAttribute('y', (-bgHeight / 2).toString());
        paperGroup.appendChild(paper2);

        paperGroup.setAttribute('transform', `translate(${paperOffsetX}, ${paperCenterY})`);

        const paper1 = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        paper1.setAttribute('href', 'img/texture/paper1/0001/white.png');
        paper1.setAttribute('width', bgWidth.toString());
        paper1.setAttribute('height', bgHeight.toString());
        paper1.setAttribute('x', (paperOffsetX - bgWidth / 2).toString());
        paper1.setAttribute('y', (paperCenterY - bgHeight / 2).toString());
        foregroundGroup.appendChild(paper1);

        const tape = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        tape.setAttribute('href', 'img/texture/tape/0001.png');
        tape.setAttribute('width', bgWidth.toString());
        tape.setAttribute('height', bgHeight.toString());
        tape.setAttribute('x', (paperOffsetX - bgWidth / 2).toString());
        tape.setAttribute('y', (paperCenterY - bgHeight / 2).toString());
        foregroundGroup.appendChild(tape);

        const ellipseCenterX = paperOffsetX - 50 * scaleFactor;
        const ellipseCenterY = paperCenterY - 180 * scaleFactor;

        const sortedFlowerData = flowerData.sort((a, b) => a.cy - b.cy);

        sortedFlowerData.forEach(flower => {
            const relX = (flower.cx - centerX_old) / oldZoom;
            const relY = (flower.cy - centerY_old) / oldZoom;

            const newRelY = relY * perspectiveScale;

            const newCx = relX * zoom * scaleFactor + ellipseCenterX;
            const newCy = newRelY * zoom * scaleFactor + ellipseCenterY;

            const newImageSize = flower.imageSize * (zoom / oldZoom) * scaleFactor;

            const flowerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            flowerGroup.setAttribute('class', 'flower-group');

            if (flower.rotation || flowersToRotate.includes(flower.flowerName)) {
                const finalRotation = flower.rotation || 0;
                flowerGroup.setAttribute('transform', `rotate(${finalRotation}, ${newCx}, ${newCy})`);
            }

            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('href', `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flower.flowerName}/${flower.color}/0001.png`);
            image.setAttribute('width', newImageSize.toString());
            image.setAttribute('height', newImageSize.toString());
            image.setAttribute('x', (newCx - newImageSize / 2).toString());
            image.setAttribute('y', (newCy - newImageSize / 2).toString());
            image.setAttribute('class', 'flower-image');

            flowerGroup.appendChild(image);
            contentGroup.appendChild(flowerGroup);
        });

        const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        if (count === 1) {
            const singleFlower = sortedFlowerData[0];
            ellipse.setAttribute("cx", singleFlower ? ((singleFlower.cx - centerX_old) / oldZoom * zoom * scaleFactor + ellipseCenterX).toString() : ellipseCenterX.toString());
            ellipse.setAttribute("cy", singleFlower ? ((singleFlower.cy - centerY_old) / oldZoom * perspectiveScale * zoom * scaleFactor + ellipseCenterY).toString() : ellipseCenterY.toString());
            ellipse.setAttribute("rx", (unitRadius * 0.33 * zoom * scaleFactor).toString());
            ellipse.setAttribute("ry", (unitRadius * 0.33 * zoom * perspectiveScale * scaleFactor).toString());
        } else {
            ellipse.setAttribute("cx", ellipseCenterX.toString());
            ellipse.setAttribute("cy", ellipseCenterY.toString());
            ellipse.setAttribute("rx", (w / 2 * zoom * scaleFactor).toString());
            ellipse.setAttribute("ry", (h / 2 * zoom * perspectiveScale * scaleFactor).toString());
        }
        ellipse.setAttribute("fill", "none");
        ellipse.setAttribute("stroke", "transparent");
        ellipse.setAttribute("stroke-width", "0");
        contentGroup.appendChild(ellipse);
    }

    const saveButtonStyle = document.createElement('style');
    saveButtonStyle.textContent = `
        .save-btn-container {
            position: fixed;
            bottom: 30px;
            right: 50px;
            display: flex;
            flex-direction: row;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .step-3.active .save-btn-container {
            opacity: 1;
            visibility: visible;
        }

        .save-btn {
            position: relative;
            width: 60px;
            height: 60px;
            background: #ff957a;
            border-radius: 60px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: width 0.5s;
            transform-origin: right;
        }

        .save-btn:hover {
            width: 240px;
            background: #ff957a;
        }

        .save-btn .icon {
            width: 32px;
            height: 32px;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            transition: transform 0.5s;
        }

        .save-btn:hover .icon {
            transform: translateX(-100%) scale(0);
        }

        .save-btn .title {
            color: #fff;
            font-family: 'Courier New', sans-serif;
            font-size: 27px;
            text-align: center;
            transform: scale(0);
            transition: transform 0.5s;
            white-space: nowrap;
        }

        .save-btn:hover .title {
            transform: scale(1);
        }
    `;
    document.head.appendChild(saveButtonStyle);

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

    function updateSaveButtonVisibility() {
        const isThirdStageActive = document.querySelector('.step-3.active');
        if (isThirdStageActive) {
            saveButtonContainer.style.opacity = '1';
            saveButtonContainer.style.visibility = 'visible';
        } else {
            saveButtonContainer.style.opacity = '0';
            saveButtonContainer.style.visibility = 'hidden';
        }
    }

    function setupStageObserver() {
        const stages = document.querySelectorAll('.step-1, .step-2, .step-3');

        stages.forEach(stage => {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(mutation => {
                    if (mutation.attributeName === 'class') {
                        updateSaveButtonVisibility();
                    }
                });
            });

            observer.observe(stage, {
                attributes: true,
                attributeFilter: ['class']
            });
        });
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

        document.addEventListener('click', function(e) {
            if (e.target.closest('.next-btn-short, .next-btn, .arrow-left, .arrow-right')) {
                setTimeout(drawEllipse, 100);
            }
        });

        setTimeout(drawEllipse, 1000);
    }

    initialize();
});