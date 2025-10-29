document.addEventListener('DOMContentLoaded', function () {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/save.css';
    link.onerror = () => console.error('Ошибка загрузки CSS: css/save.css');
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

    const closeButton = document.createElement('span');
    closeButton.className = 'close-btn';
    closeButton.textContent = '×';
    closeButton.onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    };

    const modalSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    modalSvg.className = 'modal-svg';

    modalContent.appendChild(closeButton);
    modalContent.appendChild(modalSvg);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    function getFlowerData() {
        const svg = document.getElementById('flowers-svg');
        if (!svg) {
            console.error('SVG с id="flowers-svg" не найден');
            return [];
        }

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

    function buildModalContent() {
        modalSvg.innerHTML = '';
        const flowerData = getFlowerData();
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

        const background = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        const bgPath = 'img/background.png';
        background.setAttribute('href', bgPath);
        background.setAttribute('width', '890');
        background.setAttribute('height', '1300');
        background.setAttribute('x', '0');
        background.setAttribute('y', '0');
        background.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        background.onerror = () => console.error(`Ошибка загрузки фона: ${bgPath}`);

        rect.setAttribute('x', '0');
        rect.setAttribute('y', '0');
        rect.setAttribute('width', '890');
        rect.setAttribute('height', '1300');
        rect.setAttribute('rx', '60');
        rect.setAttribute('ry', '60');
        clipPath.appendChild(rect);
        defs.appendChild(clipPath);
        background.setAttribute('clip-path', 'url(#backgroundClip)');
        backgroundGroup.appendChild(background);
        modalSvg.appendChild(defs);
        modalSvg.appendChild(backgroundGroup);

        // Масштаб букета (внутри viewBox 890×1300)
        const bouquetScale = 0.22;
        const originalBouquetHeight = params.h * params.zoom * params.perspectiveScale;
        const adjustedScaleFactor = (1300 * bouquetScale) / originalBouquetHeight;

        const bgWidth = params.w * params.zoom * 3.3 * adjustedScaleFactor;
        const bgHeight = params.h * params.zoom * params.perspectiveScale * 3.3 * adjustedScaleFactor;

        const paperCenterX = 890 / 2 + 50 * adjustedScaleFactor;
        const paperCenterY = 1300 / 2 - 160 * adjustedScaleFactor;

        // rack
        const rack = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        rack.setAttribute('href', 'img/rack.png');
        rack.setAttribute('width', bgWidth.toString());
        rack.setAttribute('height', bgHeight.toString());
        rack.setAttribute('x', (paperCenterX - bgWidth / 2).toString());
        rack.setAttribute('y', (paperCenterY - bgHeight / 2 + 80 * adjustedScaleFactor).toString());
        rackGroup.appendChild(rack);

        // paper2
        const paper2 = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        paper2.setAttribute('href', 'img/texture/paper2/0001/white.png');
        paper2.setAttribute('width', bgWidth.toString());
        paper2.setAttribute('height', bgHeight.toString());
        paper2.setAttribute('x', (paperCenterX - bgWidth / 2).toString());
        paper2.setAttribute('y', (paperCenterY - bgHeight / 2).toString());
        paperGroup.appendChild(paper2);

        // paper1
        const paper1 = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        paper1.setAttribute('href', 'img/texture/paper1/0001/white.png');
        paper1.setAttribute('width', bgWidth.toString());
        paper1.setAttribute('height', bgHeight.toString());
        paper1.setAttribute('x', (paperCenterX - bgWidth / 2).toString());
        paper1.setAttribute('y', (paperCenterY - bgHeight / 2).toString());
        foregroundGroup.appendChild(paper1);

        // tape
        const tape = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        tape.setAttribute('href', 'img/texture/tape/0001.png');
        tape.setAttribute('width', bgWidth.toString());
        tape.setAttribute('height', bgHeight.toString());
        tape.setAttribute('x', (paperCenterX - bgWidth / 2).toString());
        tape.setAttribute('y', (paperCenterY - bgHeight / 2).toString());
        foregroundGroup.appendChild(tape);

        const ellipseCenterX = paperCenterX - 110 * adjustedScaleFactor;
        const ellipseCenterY = paperCenterY - 310 * adjustedScaleFactor;

        const sortedFlowerData = flowerData.sort((a, b) => a.cy - b.cy);
        const flowersToRotate = ['iris', 'calla', 'crocus', 'orchid'];

        sortedFlowerData.forEach(flower => {
            const relX = (flower.cx - params.centerX_old) / params.oldZoom;
            const relY = (flower.cy - params.centerY_old) / params.oldZoom;
            const newRelY = relY * params.perspectiveScale;
            const newCx = relX * params.zoom * adjustedScaleFactor + ellipseCenterX;
            const newCy = newRelY * params.zoom * adjustedScaleFactor + ellipseCenterY;
            const newImageSize = flower.imageSize * (params.zoom / params.oldZoom) * adjustedScaleFactor;

            const flowerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            flowerGroup.setAttribute('class', 'flower-group');

            if (flower.rotation || flowersToRotate.includes(flower.flowerName)) {
                flowerGroup.setAttribute('transform', `rotate(${flower.rotation || 0}, ${newCx}, ${newCy})`);
            }

            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            const flowerPath = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flower.flowerName}/${flower.color}/0001.png`;
            image.setAttribute('href', flowerPath);
            image.setAttribute('width', newImageSize.toString());
            image.setAttribute('height', newImageSize.toString());
            image.setAttribute('x', (newCx - newImageSize / 2).toString());
            image.setAttribute('y', (newCy - newImageSize / 2).toString());
            image.setAttribute('class', 'flower-image');
            flowerGroup.appendChild(image);
            contentGroup.appendChild(flowerGroup);
        });

        modalSvg.appendChild(rackGroup);
        modalSvg.appendChild(paperGroup);
        modalSvg.appendChild(contentGroup);
        modalSvg.appendChild(foregroundGroup);

        // Set fixed viewBox
        modalSvg.setAttribute('viewBox', '0 0 890 1300');
        modalSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }

    function updateModalSizes() {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const isSmallScreen = vw < 500;
        const fixedModalHeight = 425;
        const fixedSvgHeight = 340;
        const fixedSvgWidth = 890 * (fixedSvgHeight / 1300);
        const fixedLeftPadding = 40;
        const fixedRightPadding = 200;
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