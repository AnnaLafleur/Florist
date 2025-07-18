document.addEventListener('DOMContentLoaded', () => {
    const flowerList = [
        'carnation', 'dahlia', 'hippeastrum', 'hydrangea', 'iris',
        'calla', 'camellia', 'crocus', 'lisianthus', 'lily',
        'forget-me-not', 'orchid', 'peony', 'ranunculus', 'rose',
        'lilac', 'tulip', 'chrysanthemum', 'cymbidium', 'eustoma'
    ];

    const sizeMultipliers = {
        'carnation': 1.2,
        'dahlia': 1.242,
        'hippeastrum': 1.2,
        'hydrangea': 1.5,
        'iris': 1.326,
        'calla': 1.416,
        'camellia': 1.2,
        'crocus': 1.2,
        'lisianthus': 1.2,
        'lily': 1.416,
        'forget-me-not': 1.242,
        'orchid': 1.326,
        'peony': 1.416,
        'ranunculus': 1.242,
        'rose': 1.242,
        'lilac': 1.5,
        'tulip': 1.2,
        'chrysanthemum': 1.326,
        'cymbidium': 1.2,
        'eustoma': 1.242
    };

    const flowersToRotate = ['iris', 'calla', 'crocus', 'orchid'];

    const svg = document.getElementById('flowers-svg');
    if (!svg) return;

    svg.setAttribute('overflow', 'visible');

    const activeShape = document.querySelector('.form-shape.active');
    const currentShapeIndex = activeShape ? ['form-circle', 'form-square', 'form-rectangle'].indexOf(activeShape.classList[1]) : 0;

    const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
    let centerX, centerY;

    const selectedFlowerCount = parseInt(document.querySelector('.counter-container .count.active')?.dataset.count || '0');

    if (currentShapeIndex === 0) {
        centerX = viewBox[2] / 2;
        centerY = viewBox[3] / 2;
    } else if (currentShapeIndex === 1) {
        centerX = 0;
        centerY = 0;
    } else if (currentShapeIndex === 2) {
        const margin = 20;
        const zoom = Math.min((window.innerWidth * 0.7 - margin * 2) / viewBox[2], (window.innerHeight * 0.8 - margin * 2) / viewBox[3]);
        const w = (viewBox[2] - margin * 2) / zoom;
        const h = (viewBox[3] - margin * 2 - (selectedFlowerCount === 3 ? 200 : selectedFlowerCount === 15 ? 100 : 0)) / zoom;
        centerX = w / 2;
        centerY = h / 2;
    } else {
        centerX = viewBox[2] / 2;
        centerY = viewBox[3] / 2;
    }

    const circleDataStore = new Map();

    const style = document.createElement('style');
    style.textContent = `
        .flower-group:hover .close-btn {
            display: block;
        }
        .close-btn {
            cursor: pointer;
            display: none;
            z-index: 2000;
        }
        .hover-circle {
            fill: none !important;
            pointer-events: all;
            z-index: 1500;
        }
        .flower-image {
            pointer-events: none;
            z-index: 1000;
        }
        .flower-canvas {
            pointer-events: none;
            z-index: 1000;
        }
        .close-btn circle {
            fill: #fd8264 !important;
            transition: none !important;
        }
        .close-btn circle:hover {
            fill: #fd8264 !important;
        }
        .close-btn line {
            stroke: #ffffff !important;
            stroke-width: 5;
            stroke-linecap: butt;
        }
        .fill-all-container {
            position: absolute;
            bottom: 30px;
            left: calc(60vw - 30px);
            transform: translateX(-100%);
            display: none;
            gap: 25px;
            flex-direction: row;
        }
        .fill-all-btn, .clear-all-btn {
            position: relative;
            list-style: none;
            width: 60px;
            height: 60px;
            background: #fd8262;
            border-radius: 60px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: width 0.5s;
            transform-origin: right;
            margin: 0 auto;
        }
        .fill-all-btn:hover, .clear-all-btn:hover {
            width: 240px;
            background: #fd8262;
        }
        .fill-all-btn .icon, .clear-all-btn .icon {
            width: 40px;
            height: 40px;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            transition: transform 0.5s;
        }
        .fill-all-btn:hover .icon, .clear-all-btn:hover .icon {
            transform: translateX(-100%) scale(0);
        }
        .fill-all-btn .title, .clear-all-btn .title {
            color: #fff;
            font-family: 'Courier New', sans-serif;
            font-size: 27px;
            text-align: center;
            transform: scale(0);
            transition: transform 0.5s;
        }
        .fill-all-btn:hover .title, .clear-all-btn:hover .title {
            transform: scale(1);
        }
        .flower-group.removing {
            opacity: 0;
            transition: opacity 0.5s;
        }
        .flower-group.removing.close-btn-clicked {
            opacity: 0;
            transition: opacity 0.2s;
        }
        .left-section {
            overflow: visible !important;
        }
    `;
    document.head.appendChild(style);

    const fillAllContainer = document.createElement('ul');
    fillAllContainer.className = 'fill-all-container';

    const fillAllButton = document.createElement('li');
    fillAllButton.className = 'fill-all-btn';
    const fillIcon = document.createElement('img');
    fillIcon.className = 'icon';
    fillIcon.src = 'https://raw.githubusercontent.com/AnnaLafleur/Florist/2ec41321e721d7628b3d2e49edb2a2c99074e0d8/img/fill.svg';
    const fillTitle = document.createElement('span');
    fillTitle.className = 'title';
    fillTitle.textContent = 'Заполнить всё';
    fillAllButton.appendChild(fillIcon);
    fillAllButton.appendChild(fillTitle);
    fillAllContainer.appendChild(fillAllButton);

    const clearAllButton = document.createElement('li');
    clearAllButton.className = 'clear-all-btn';
    const clearIcon = document.createElement('img');
    clearIcon.className = 'icon';
    clearIcon.src = 'https://raw.githubusercontent.com/AnnaLafleur/Florist/2ec41321e721d7628b3d2e49edb2a2c99074e0d8/img/clear.svg';
    const clearTitle = document.createElement('span');
    clearTitle.className = 'title';
    clearTitle.textContent = 'Очистить всё';
    clearAllButton.appendChild(clearIcon);
    clearAllButton.appendChild(clearTitle);
    fillAllContainer.appendChild(clearAllButton);

    document.querySelector('.step-2 .left-section').appendChild(fillAllContainer);

    function updateFillAllButtonVisibility() {
        const selectedRadio = document.querySelector('.right-section .directory-item input[type="radio"]:checked');
        const isSecondStage = document.querySelector('.form-shape.active') !== null;
        const circles = svg.querySelectorAll('circle:not(.hover-circle)[fill]:not([fill="none"])');
        const flowerGroups = svg.querySelectorAll('g.flower-group');
        let freeCellCount = 0;
        circles.forEach(circle => {
            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            const existingGroup = Array.from(svg.querySelectorAll('g.flower-group')).find(group => {
                const groupCircle = group.querySelector('circle.hover-circle');
                if (!groupCircle) return false;
                const groupCx = parseFloat(groupCircle.getAttribute('cx'));
                const groupCy = parseFloat(groupCircle.getAttribute('cy'));
                return Math.abs(groupCx - cx) < 0.1 && Math.abs(groupCy - cy) < 0.1;
            });
            if (!existingGroup && circle.getAttribute('fill') !== 'none') {
                freeCellCount++;
            }
        });
        const shouldDisplayFill = selectedRadio && isSecondStage && freeCellCount > 1;
        const shouldDisplayClear = isSecondStage && flowerGroups.length >= 2;
        fillAllButton.style.display = shouldDisplayFill ? 'flex' : 'none';
        clearAllButton.style.display = shouldDisplayClear ? 'flex' : 'none';
        fillAllContainer.style.display = (shouldDisplayFill || shouldDisplayClear) ? 'flex' : 'none';
    }

    updateFillAllButtonVisibility();

    const radioButtons = document.querySelectorAll('.right-section .directory-item input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', updateFillAllButtonVisibility);
        radio.addEventListener('click', updateFillAllButtonVisibility);
    });

    const observer = new MutationObserver(updateFillAllButtonVisibility);
    observer.observe(document.body, { childList: true, subtree: true });

    let groupCounter = 0;

    function addFlowerToCircle(circle) {
        if (!circle || circle.classList.contains('hover-circle') || circle.getAttribute('fill') === 'none') return;

        const cx = parseFloat(circle.getAttribute('cx'));
        const cy = parseFloat(circle.getAttribute('cy'));

        const existingGroup = Array.from(svg.querySelectorAll('g.flower-group')).find(group => {
            const groupCircle = group.querySelector('circle.hover-circle');
            if (!groupCircle) return false;
            const groupCx = parseFloat(groupCircle.getAttribute('cx'));
            const groupCy = parseFloat(groupCircle.getAttribute('cy'));
            return Math.abs(groupCx - cx) < 0.1 && Math.abs(groupCy - cy) < 0.1;
        });

        if (existingGroup) return;

        const selectedRadio = document.querySelector('.right-section .directory-item input[type="radio"]:checked');
        if (!selectedRadio) return;

        const parentItem = selectedRadio.closest('.directory-item');
        if (!parentItem) return;

        const imgElement = parentItem.querySelector('img');
        if (!imgElement) return;

        const imgId = imgElement.id;
        const index = parseInt(imgId.replace('img', '')) - 1;
        if (isNaN(index) || index < 0 || index >= flowerList.length) return;
        const flowerName = flowerList[index];

        const sizeMultiplier = sizeMultipliers[flowerName] || 1;
        const color = parentItem.dataset.currentColor || 'white';
        const firstFrame = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${color}/0001.png`;

        const testImage = new Image();
        testImage.src = firstFrame;

        const radius = parseFloat(circle.getAttribute('r'));
        const imageSize = radius * 2 * sizeMultiplier;

        const flowerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        flowerGroup.setAttribute('class', 'flower-group');
        const groupId = `flower-group-${groupCounter++}`;
        flowerGroup.setAttribute('id', groupId);

        let rotationAngle = 0;
        if (flowersToRotate.includes(flowerName)) {
            const tolerance = 0.5;
            const distanceToCenter = Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2);
            if (distanceToCenter > tolerance) {
                const dx = centerX - cx;
                const dy = centerY - cy;
                const angleToCenter = Math.atan2(dy, dx);
                rotationAngle = (angleToCenter - Math.PI / 2) * (180 / Math.PI);
                rotationAngle = (rotationAngle + 360) % 360;
                flowerGroup.setAttribute('transform', `rotate(${rotationAngle}, ${cx}, ${cy})`);
            }
        }

        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('href', firstFrame);
        image.setAttribute('width', imageSize);
        image.setAttribute('height', imageSize);
        image.setAttribute('x', cx - imageSize / 2);
        image.setAttribute('y', cy - imageSize / 2);
        image.setAttribute('class', 'flower-image');

        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('x', cx - imageSize / 2);
        foreignObject.setAttribute('y', cy - imageSize / 2);
        foreignObject.setAttribute('width', imageSize);
        foreignObject.setAttribute('height', imageSize);
        foreignObject.setAttribute('class', 'flower-canvas');

        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', imageSize);
        canvas.setAttribute('height', imageSize);
        canvas.style.width = `${imageSize}px`;
        canvas.style.height = `${imageSize}px`;
        foreignObject.appendChild(canvas);

        const hoverCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hoverCircle.setAttribute('class', 'hover-circle');
        hoverCircle.setAttribute('cx', cx);
        hoverCircle.setAttribute('cy', cy);
        hoverCircle.setAttribute('r', imageSize / 2 * 0.9);
        hoverCircle.setAttribute('data-group-id', groupId);

        const closeBtn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        closeBtn.setAttribute('class', 'close-btn');
        const btnOffset = imageSize / 2 * 0.607;
        const closeBtnTransform = rotationAngle ? `rotate(${-rotationAngle}, ${cx}, ${cy}) translate(${cx + btnOffset}, ${cy - btnOffset})` : `translate(${cx + btnOffset}, ${cy - btnOffset})`;
        closeBtn.setAttribute('transform', closeBtnTransform);
        const closeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        closeCircle.setAttribute('cx', 0);
        closeCircle.setAttribute('cy', 0);
        closeCircle.setAttribute('r', 22);
        const closeLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        closeLine1.setAttribute('x1', -7);
        closeLine1.setAttribute('y1', -7);
        closeLine1.setAttribute('x2', 7);
        closeLine1.setAttribute('y2', 7);
        const closeLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        closeLine2.setAttribute('x1', -7);
        closeLine2.setAttribute('y1', 7);
        closeLine2.setAttribute('x2', 7);
        closeLine2.setAttribute('y2', -7);
        closeBtn.appendChild(closeCircle);
        closeBtn.appendChild(closeLine1);
        closeBtn.appendChild(closeLine2);

        const circleData = {
            element: circle,
            fill: circle.getAttribute('fill'),
            stroke: circle.getAttribute('stroke'),
            lines: []
        };
        let nextSibling = circle.nextSibling;
        while (nextSibling && nextSibling.tagName === 'line') {
            circleData.lines.push({
                element: nextSibling,
                stroke: nextSibling.getAttribute('stroke')
            });
            nextSibling = nextSibling.nextSibling;
        }
        circleDataStore.set(groupId, circleData);

        flowerGroup.appendChild(foreignObject);
        flowerGroup.appendChild(image);
        flowerGroup.appendChild(hoverCircle);
        flowerGroup.appendChild(closeBtn);

        const contentGroup = svg.querySelector('g:not(.free-regions)') || svg;
        contentGroup.appendChild(flowerGroup);

        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', 'none');
        circleData.lines.forEach(line => line.element.setAttribute('stroke', 'none'));

        const flowerAnimation = new FlowerAnimation(flowerName, imgId);
        flowerAnimation.color = color;
        flowerAnimation.updateSprite();
        image.style.display = 'none';
        flowerAnimation.playAnimation(40, foreignObject, canvas, imageSize, imageSize);
        flowerGroup.__flowerAnimation = flowerAnimation;

        const removeFlower = (e) => {
            e.stopPropagation();
            flowerGroup.classList.add('removing', 'close-btn-clicked');
            setTimeout(() => {
                flowerGroup.remove();
                const data = circleDataStore.get(groupId);
                if (data) {
                    data.element.setAttribute('fill', data.fill);
                    data.element.setAttribute('stroke', data.stroke);
                    data.lines.forEach(line => line.element.setAttribute('stroke', line.stroke));
                    circleDataStore.delete(groupId);
                }
                flowerAnimation.forceStopAnimation();
                updateFillAllButtonVisibility();
            }, 200);
        };

        closeBtn.addEventListener('click', removeFlower);
        hoverCircle.addEventListener('click', removeFlower);

        flowerAnimation.finishAnimation = function(originalFinishAnimation) {
            return function(insertTarget) {
                originalFinishAnimation.call(this, insertTarget);
                image.style.display = 'block';
                if (foreignObject && foreignObject.parentNode) {
                    foreignObject.parentNode.removeChild(foreignObject);
                }
                updateFillAllButtonVisibility();
            };
        }(flowerAnimation.finishAnimation);

        updateFillAllButtonVisibility();
    }

    svg.addEventListener('click', (event) => {
        const circle = event.target.closest('circle');
        if (!circle) return;
        event.stopPropagation();
        addFlowerToCircle(circle);
    });

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    fillAllButton.addEventListener('click', async (e) => {
        const circles = Array.from(svg.querySelectorAll('circle:not(.hover-circle)[fill]:not([fill="none"])'));

        // Найти центральный круг
        let centralCircle = null;
        let minDistance = Infinity;
        circles.forEach(circle => {
            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            const distance = Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2);
            if (distance < minDistance) {
                minDistance = distance;
                centralCircle = circle;
            }
        });

        // Сортировка остальных кругов: слева направо, сверху вниз
        const otherCircles = circles.filter(circle => circle !== centralCircle);
        otherCircles.sort((a, b) => {
            const ay = parseFloat(a.getAttribute('cy'));
            const by = parseFloat(b.getAttribute('cy'));
            const ax = parseFloat(a.getAttribute('cx'));
            const bx = parseFloat(b.getAttribute('cx'));
            if (Math.abs(ay - by) > 0.1) return ay - by;
            return ax - bx;
        });

        // Центральный круг в конец
        if (centralCircle) {
            otherCircles.push(centralCircle);
        }

        for (const circle of otherCircles) {
            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            const existingGroup = Array.from(svg.querySelectorAll('g.flower-group')).find(group => {
                const groupCircle = group.querySelector('circle.hover-circle');
                if (!groupCircle) return false;
                const groupCx = parseFloat(groupCircle.getAttribute('cx'));
                const groupCy = parseFloat(groupCircle.getAttribute('cy'));
                return Math.abs(groupCx - cx) < 0.1 && Math.abs(groupCy - cy) < 0.1;
            });

            if (!existingGroup && circle.getAttribute('fill') !== 'none') {
                addFlowerToCircle(circle);
                await delay(120);
            }
        }

        updateFillAllButtonVisibility();
    });

    clearAllButton.addEventListener('click', async () => {
        const flowerGroups = Array.from(svg.querySelectorAll('g.flower-group'));
        flowerGroups.sort((a, b) => {
            const aCircle = a.querySelector('circle.hover-circle');
            const bCircle = b.querySelector('circle.hover-circle');
            const ax = parseFloat(aCircle.getAttribute('cx'));
            const ay = parseFloat(aCircle.getAttribute('cy'));
            const bx = parseFloat(bCircle.getAttribute('cx'));
            const by = parseFloat(bCircle.getAttribute('cy'));
            if (ax === bx) return by - ay;
            return bx - ax;
        });
        for (const group of flowerGroups) {
            const groupId = group.getAttribute('id');
            const flowerAnimation = group.__flowerAnimation;
            group.classList.add('removing');
            await delay(120);
            group.remove();
            const data = circleDataStore.get(groupId);
            if (data) {
                data.element.setAttribute('fill', data.fill);
                data.element.setAttribute('stroke', data.stroke);
                data.lines.forEach(line => line.element.setAttribute('stroke', line.stroke));
                circleDataStore.delete(groupId);
            }
            if (flowerAnimation) flowerAnimation.forceStopAnimation();
        }
        updateFillAllButtonVisibility();
    });
});