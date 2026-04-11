<!-- js/insert.js -->
document.addEventListener('DOMContentLoaded', () => {
    let toastTimeout = null;
    let isToastActive = false;
    let toastElement = null;

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
        'iris': 1.1,
        'calla': 1.3,
        'camellia': 1.2,
        'crocus': 1.2,
        'lisianthus': 1.2,
        'lily': 1.256,
        'forget-me-not': 1.05,
        'orchid': 1.326,
        'peony': 1.05,
        'ranunculus': 1.242,
        'rose': 1.242,
        'lilac': 1.5,
        'tulip': 1.05,
        'chrysanthemum': 1.326,
        'cymbidium': 1.5,
        'eustoma': 1.242
    };

    const flowersToRotate = ['hippeastrum', 'iris', 'calla', 'camellia', 'crocus', 'lisianthus', 'lily', 'orchid', 'peony', 'ranunculus', 'forget-me-not', 'rose', 'tulip', 'cymbidium'];

    const svg = document.getElementById('flowers-svg');
    if (!svg) return;

    svg.setAttribute('overflow', 'visible');

    let viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
    let zoom = 1;
    let centerX, centerY;

    const selectedFlowerCount = parseInt(document.querySelector('.counter-container .count.active')?.dataset.count || '0');
    const activeShape = document.querySelector('.form-shape.active');
    const currentShapeIndex = activeShape ? ['form-circle', 'form-square', 'form-rectangle'].indexOf(activeShape.classList[1]) : 0;

    function updateViewBoxAndZoom() {
        viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
        const margin = 20;
        const maxWidth = window.innerWidth * 0.7 - margin * 2;
        const maxHeight = window.innerHeight * 0.8 - margin * 2 - (selectedFlowerCount === 3 ? 200 : selectedFlowerCount === 15 ? 100 : 0);
        zoom = Math.min(maxWidth / viewBox[2], maxHeight / viewBox[3]);

        if (currentShapeIndex === 0) {
            centerX = viewBox[2] / 2;
            centerY = viewBox[3] / 2;
        } else if (currentShapeIndex === 1) {
            centerX = 0;
            centerY = 0;
        } else if (currentShapeIndex === 2) {
            centerX = viewBox[2] / 2;
            centerY = viewBox[3] / 2;
        } else {
            centerX = viewBox[2] / 2;
            centerY = viewBox[3] / 2;
        }
    }

    updateViewBoxAndZoom();

    const circleDataStore = new Map();
    const flowerDataStore = new Map();
    let circleIndexCounter = 0;
    const circleIndexMap = new Map();

    const style = document.createElement('style');
    style.textContent = `
        .flower-group:hover .close-btn { display: block; }

        #flowers-svg.tab-flower circle:not(.hover-circle)[fill]:not([fill="none"]) {
            cursor: pointer;
            transition: fill 0.15s;
        }
        #flowers-svg.tab-flower circle:not(.hover-circle)[fill]:not([fill="none"]):hover {
            fill: #ff957a !important;
        }
        #flowers-svg.tab-green circle:not(.hover-circle)[fill]:not([fill="none"]) {
            pointer-events: none !important;
            cursor: default;
        }
        #flowers-svg.tab-flower path.free-region:not([data-green-filled="1"]) {
            pointer-events: none !important;
            cursor: default;
        }
        #flowers-svg.tab-green path.free-region {
            cursor: pointer;
        }

        /* === Стили для зелени === */
        .green-region-img {
            cursor: pointer;
            pointer-events: all;
        }
        .green-group:hover .close-btn-green {
            display: block;
        }
        .close-btn-green {
            cursor: pointer;
            z-index: 9999;
            pointer-events: all;
            display: none;
        }
        .green-group:hover .close-btn-green {
            display: block;
        }
        .close-btn-green circle {
            fill: #7aba65 !important;
        }
        .close-btn-green circle:hover {
            fill: #7aba65 !important;
        }
        .close-btn-green line {
            stroke: #ffffff !important;
            stroke-width: 5;
            stroke-linecap: butt;
        }
        /* ============================================== */

        .close-btn { cursor: pointer; display: none; z-index: 2000; }
        .hover-circle { fill: none !important; pointer-events: all; z-index: 1500; }
        .flower-image { pointer-events: none; z-index: 1000; }
        .flower-canvas { pointer-events: none; z-index: 1000; }
        .close-btn circle { fill: #fd8264 !important; transition: none !important; }
        .close-btn circle:hover { fill: #fd8264 !important; }
        .close-btn line { stroke: #ffffff !important; stroke-width: 5; stroke-linecap: butt; }
        .fill-all-container { position: absolute; bottom: 30px; left: calc(60vw - 30px); transform: translateX(-100%); display: none; gap: 25px; flex-direction: row; }
        .fill-all-btn, .clear-all-btn { position: relative; list-style: none; width: 60px; height: 60px; background: #fd8262; border-radius: 60px; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: width 0.5s, background 0.3s; transform-origin: right; margin: 0 auto; }
        .fill-all-btn:hover, .clear-all-btn:hover { width: 240px; background: #fd8262; }
        .fill-all-btn.green-mode, .clear-all-btn.green-mode { background: #7aba65; }
        .fill-all-btn.green-mode:hover, .clear-all-btn.green-mode:hover { background: #7aba65; width: 240px; }
        .fill-all-btn .icon, .clear-all-btn .icon { width: 40px; height: 40px; position: absolute; left: 50%; transform: translateX(-50%); transition: transform 0.5s; }
        .fill-all-btn:hover .icon, .clear-all-btn:hover .icon { transform: translateX(-100%) scale(0); }
        .fill-all-btn .title, .clear-all-btn .title { color: #fff; font-family: 'Courier New', sans-serif; font-size: 27px; text-align: center; transform: scale(0); transition: transform 0.5s; }
        .fill-all-btn:hover .title, .clear-all-btn:hover .title { transform: scale(1); }
        .flower-group.removing { opacity: 0; transition: opacity 0.5s; }
        .flower-group.removing.close-btn-clicked { opacity: 0; transition: opacity 0.2s; }
        .left-section { overflow: visible !important; }
        .next-btn-short.disabled { opacity: 0.5; cursor: default; pointer-events: auto; }
        .step-2 .tabs-container {
            position: absolute;
            top: 36px;
            left: 40px;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            z-index: 1000;
        }
        .step-2 .tabs {
            display: flex;
            position: relative;
            background-color: #fd8262;
            padding: 0.75rem;
            border-radius: 99px;
        }
        .step-2 .tabs * { z-index: 2; }
        .step-2 input[type="radio"] { display: none; }
        .step-2 .tab {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 54px;
            width: 170px;
            font-size: 1.25rem;
            font-weight: 500;
            border-radius: 99px;
            cursor: pointer;
            transition: color 0.15s ease-in;
            font-family: 'Inter', sans-serif;
            color: #333;
        }
        .step-2 input[type="radio"]:checked + label { color: #185ee0; }
        .step-2 input[id="radio-flower"]:checked ~ .glider { transform: translateX(0); }
        .step-2 input[id="radio-green"]:checked ~ .glider { transform: translateX(100%); }
        .step-2 .glider {
            position: absolute;
            display: flex;
            height: 54px;
            width: 170px;
            background-color: #ff957a;
            z-index: 1;
            border-radius: 99px;
            transition: 0.25s ease-out;
        }
        .step-2 .tab img {
            width: 45px;
            height: 45px;
        }
        @media (max-width: 700px) {
            .step-2 .tabs { transform: scale(0.6); }
        }
    `;
    document.head.appendChild(style);

    const fillAllContainer = document.createElement('ul');
    fillAllContainer.className = 'fill-all-container';

    const fillAllButton = document.createElement('li');
    fillAllButton.className = 'fill-all-btn';
    const fillIcon = document.createElement('img');
    fillIcon.className = 'icon';
    fillIcon.src = 'https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/fill.svg';
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
    clearIcon.src = 'https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/clear.svg';
    const clearTitle = document.createElement('span');
    clearTitle.className = 'title';
    clearTitle.textContent = 'Очистить всё';
    clearAllButton.appendChild(clearIcon);
    clearAllButton.appendChild(clearTitle);
    fillAllContainer.appendChild(clearAllButton);

    document.querySelector('.step-2 .left-section').appendChild(fillAllContainer);

    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    tabs.innerHTML = `
        <input type="radio" name="flower-tabs" id="radio-flower" checked>
        <label class="tab" for="radio-flower"><img src="https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/flower.svg"></label>
        <input type="radio" name="flower-tabs" id="radio-green">
        <label class="tab" for="radio-green"><img src="https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/green.svg"></label>
        <span class="glider"></span>
    `;
    tabsContainer.appendChild(tabs);
    const step2RightSection = document.querySelector('.step-2 .right-section');
    if (step2RightSection) {
        step2RightSection.insertBefore(tabsContainer, step2RightSection.firstChild);
    }

    let currentGridAnimation = null;
    let isAnimating = false;
    let currentTab = 'flower';
    const scrollPositions = { flower: 0, green: 0 };
    const directoryGrid = document.querySelector('.step-2 .right-section .directory-grid');

    window.state = window.state || {};
    window.state.step2 = window.state.step2 || { items: [] };
    window.state.step2.items = window.state.step2.items || [];

    function animateItemsNoSwap(grid) {
        if (grid.style.display === 'none') return;
        const items = Array.from(grid.querySelectorAll('.directory-item'));
        if (!items.length) return;

        if (currentGridAnimation) {
            currentGridAnimation.pause();
            isAnimating = false;
            currentGridAnimation = null;
        }
        anime.remove(items);

        items.forEach(item => {
            item.style.transform = 'rotateY(180deg)';
            item.style.transformStyle = 'preserve-3d';
            item.style.backfaceVisibility = 'hidden';
            item.offsetHeight;
        });

        return new Promise(resolve => {
            requestAnimationFrame(() => {
                currentGridAnimation = anime({
                    targets: items,
                    rotateY: [180, 0],
                    duration: 1000,
                    delay: anime.stagger(100),
                    easing: 'cubicBezier(0.5,1,0.5,1.3)',
                    begin: function() {
                        isAnimating = true;
                        items.forEach(item => {
                            item.style.transformStyle = 'preserve-3d';
                            item.style.backfaceVisibility = 'hidden';
                        });
                    },
                    complete: function() {
                        items.forEach(item => {
                            item.style.transform = 'rotateY(0deg)';
                            item.offsetHeight;
                        });
                        currentGridAnimation = null;
                        isAnimating = false;
                        resolve();
                    }
                });
            });
        });
    }

    function toggleGrids(showFlower, isInitial = false) {
        const flowerRadio = document.getElementById('radio-flower');
        const greenRadio = document.getElementById('radio-green');

        if (currentGridAnimation) {
            currentGridAnimation.pause();
            isAnimating = false;
            currentGridAnimation = null;
        }
        const items = directoryGrid.querySelectorAll('.directory-item');
        anime.remove(items);
        items.forEach(item => {
            item.style.transform = 'rotateY(180deg)';
            item.style.transformStyle = 'preserve-3d';
            item.style.backfaceVisibility = 'hidden';
            item.offsetHeight;
        });

        requestAnimationFrame(() => {
            if (typeof window.hideColorIconsImmediately === 'function') {
                window.hideColorIconsImmediately();
            }

            if (showFlower) {
                currentTab = 'flower';
                directoryGrid.dataset.type = 'flower';
                directoryGrid.scrollTop = scrollPositions.flower;
                if (!isInitial) {
                    requestAnimationFrame(() => {
                        directoryGrid.scrollTo({ top: 0, behavior: 'smooth' });
                        animateItemsNoSwap(directoryGrid);
                    });
                }
            } else {
                currentTab = 'green';
                directoryGrid.dataset.type = 'green';
                directoryGrid.scrollTop = scrollPositions.green;
                if (!isInitial) {
                    requestAnimationFrame(() => {
                        directoryGrid.scrollTo({ top: 0, behavior: 'smooth' });
                        animateItemsNoSwap(directoryGrid);
                    });
                }
            }

            updateFillAllButtonVisibility();
        });
    }

    function initializeGrids() {
        requestAnimationFrame(() => {
            directoryGrid.style.marginTop = '100px';
            directoryGrid.style.paddingTop = '20px';
            if (document.querySelector('.step-2.active')) {
                toggleGrids(document.getElementById('radio-flower').checked, true);
            }
            updateSvgTabClass();
        });
    }

    const flowerRadio = document.getElementById('radio-flower');
    const greenRadio = document.getElementById('radio-green');

    function updateSvgTabClass() {
        const isFlower = document.getElementById('radio-flower')?.checked;
        svg.classList.toggle('tab-flower', !!isFlower);
        svg.classList.toggle('tab-green', !isFlower);
    }

    if (flowerRadio && greenRadio) {
        flowerRadio.addEventListener('change', () => {
            if (typeof window.hideColorIconsImmediately === 'function') {
                window.hideColorIconsImmediately();
            }
            scrollPositions[currentTab] = directoryGrid.scrollTop;
            toggleGrids(true);
            updateSvgTabClass();
        });
        greenRadio.addEventListener('change', () => {
            if (typeof window.hideColorIconsImmediately === 'function') {
                window.hideColorIconsImmediately();
            }
            scrollPositions[currentTab] = directoryGrid.scrollTop;
            toggleGrids(false);
            updateSvgTabClass();
        });
    }

    directoryGrid.addEventListener('scroll', () => {
        scrollPositions[currentTab] = directoryGrid.scrollTop;
    });

    directoryGrid.addEventListener('click', (event) => {
        const directoryItem = event.target.closest('.directory-item');
        if (!directoryItem) return;
        updateFillAllButtonVisibility();
    });

    document.addEventListener('transitionEnd', (e) => {
        if (e.detail?.step === 'step-2') {
            toggleGrids(document.getElementById('radio-flower').checked, true);
        }
    });

    document.addEventListener('transitionStart', () => {
        scrollPositions[currentTab] = directoryGrid.scrollTop;
    });

    function isBouquetComplete() {
        const circles = svg.querySelectorAll('circle:not(.hover-circle)[fill]:not([fill="none"])');
        const flowerGroups = svg.querySelectorAll('g.flower-group');
        const allFlowersPlaced = (circles.length === 0 && flowerGroups.length > 0);

        if (!allFlowersPlaced) return false;

        const freeRegions = svg.querySelectorAll('path.free-region');
        for (let i = 0; i < freeRegions.length; i++) {
            if (!greenImageStore.has(freeRegions[i])) {
                return false;
            }
        }
        return true;
    }

    function updateNextButtonState() {
        const nextButtons = document.querySelectorAll('.step-2 .next-btn-short');
        const isComplete = isBouquetComplete();
        nextButtons.forEach(btn => btn.classList.toggle('disabled', !isComplete));
    }

    function updateFillAllButtonVisibility() {
        const isSecondStage = document.querySelector('.step-2.active') !== null;
        const isGreenTab = document.getElementById('radio-green')?.checked;

        if (isGreenTab) {
            const freeRegions = Array.from(svg.querySelectorAll('path.free-region'));
            const emptyRegions = freeRegions.filter(p => !greenImageStore.has(p));
            const filledRegions = freeRegions.filter(p => greenImageStore.has(p));

            const selectedGreenRadio = document.querySelector('.directory-grid[data-type="green"] .item-content__input[type="radio"]:checked');
            const hasGreenSelection = !!selectedGreenRadio;

            const shouldDisplayFill = hasGreenSelection && isSecondStage && emptyRegions.length > 1;
            const shouldDisplayClear = isSecondStage && filledRegions.length >= 2;

            fillAllButton.style.display = shouldDisplayFill ? 'flex' : 'none';
            clearAllButton.style.display = shouldDisplayClear ? 'flex' : 'none';
            fillAllContainer.style.display = (shouldDisplayFill || shouldDisplayClear) ? 'flex' : 'none';

            fillAllButton.classList.add('green-mode');
            clearAllButton.classList.add('green-mode');
        } else {
            const selectedRadio = document.querySelector('.right-section .directory-item input[type="radio"]:checked');
            const circles = svg.querySelectorAll('circle:not(.hover-circle)[fill]:not([fill="none"])');
            const flowerGroups = svg.querySelectorAll('g.flower-group');
            let freeCellCount = 0;
            circles.forEach(circle => {
                const cx = parseFloat(circle.getAttribute('cx'));
                const cy = parseFloat(circle.getAttribute('cy'));
                const existingGroup = Array.from(flowerGroups).find(group => {
                    const groupCircle = group.querySelector('circle.hover-circle');
                    if (!groupCircle) return false;
                    const groupCx = parseFloat(groupCircle.getAttribute('cx'));
                    const groupCy = parseFloat(groupCircle.getAttribute('cy'));
                    return Math.abs(groupCx - cx) < 15 && Math.abs(groupCy - cy) < 15;
                });
                if (!existingGroup && circle.getAttribute('fill') !== 'none') freeCellCount++;
            });
            const hasSelection = !!selectedRadio;
            const shouldDisplayFill = hasSelection && isSecondStage && freeCellCount > 1;
            const shouldDisplayClear = isSecondStage && flowerGroups.length >= 2;

            fillAllButton.style.display = shouldDisplayFill ? 'flex' : 'none';
            clearAllButton.style.display = shouldDisplayClear ? 'flex' : 'none';
            fillAllContainer.style.display = (shouldDisplayFill || shouldDisplayClear) ? 'flex' : 'none';
            if (!hasSelection) fillAllButton.style.display = 'none';

            fillAllButton.classList.remove('green-mode');
            clearAllButton.classList.remove('green-mode');
        }

        updateNextButtonState();
    }

    const radioButtons = document.querySelectorAll('.right-section .directory-item input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', updateFillAllButtonVisibility);
        radio.addEventListener('click', updateFillAllButtonVisibility);
    });

    const observer = new MutationObserver(updateFillAllButtonVisibility);
    observer.observe(document.body, { childList: true, subtree: true });

    let groupCounter = 0;

    function addFlowerToCircle(circle, flowerData = null) {
        if (!circle || circle.classList.contains('hover-circle') || circle.getAttribute('fill') === 'none') return;

        const cx = parseFloat(circle.getAttribute('cx'));
        const cy = parseFloat(circle.getAttribute('cy'));

        const existingGroup = Array.from(svg.querySelectorAll('g.flower-group')).find(group => {
            const groupCircle = group.querySelector('circle.hover-circle');
            if (!groupCircle) return false;
            const groupCx = parseFloat(groupCircle.getAttribute('cx'));
            const groupCy = parseFloat(groupCircle.getAttribute('cy'));
            return Math.abs(groupCx - cx) < 15 && Math.abs(groupCy - cy) < 15;
        });

        if (existingGroup) return;

        let flowerName, color, imgId, originalCx, originalCy, originalRadius, circleIndex;
        if (flowerData) {
            ({ flowerName, color, imgId, originalCx, originalCy, originalRadius, circleIndex } = flowerData);
        } else {
            const selectedRadio = document.querySelector('.right-section .directory-item input[type="radio"]:checked');
            if (!selectedRadio) return;

            const parentItem = selectedRadio.closest('.directory-item');
            if (!parentItem) return;

            const imgElement = parentItem.querySelector('img');
            if (!imgElement) return;

            imgId = imgElement.id;
            const index = parseInt(imgId.replace('img', '')) - 1;
            if (isNaN(index) || index < 0 || index >= flowerList.length) return;
            flowerName = flowerList[index];
            color = parentItem.dataset.currentColor || 'white';
            originalCx = (cx - viewBox[0]) / zoom;
            originalCy = (cy - viewBox[1]) / zoom;
            originalRadius = parseFloat(circle.getAttribute('r')) / zoom;
            circleIndex = circle.getAttribute('data-index') || circleIndexCounter++;
            circle.setAttribute('data-index', circleIndex);
            circleIndexMap.set(circle, circleIndex);
        }

        const sizeMultiplier = sizeMultipliers[flowerName] || 1;
        const firstFrame = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${color}/0001.png`;

        const radius = parseFloat(circle.getAttribute('r')) * zoom;
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
            lines: [],
            circleIndex
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
        flowerDataStore.set(groupId, { originalCx, originalCy, originalRadius, flowerName, color, imgId, circleIndex });

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
                    flowerDataStore.delete(groupId);
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

    function restoreFlowers() {
        updateViewBoxAndZoom();
        const circles = Array.from(svg.querySelectorAll('circle:not(.hover-circle)[fill]:not([fill="none"])'));
        const flowerGroups = Array.from(svg.querySelectorAll('g.flower-group'));

        flowerGroups.forEach(group => group.remove());

        flowerDataStore.forEach((flowerData, groupId) => {
            const { originalCx, originalCy, originalRadius, flowerName, color, imgId, circleIndex } = flowerData;
            const scaledCx = originalCx * zoom + viewBox[0];
            const scaledCy = originalCy * zoom + viewBox[1];
            const scaledRadius = originalRadius * zoom;

            let targetCircle = circles.find(circle => circle.getAttribute('data-index') === circleIndex);

            if (!targetCircle) {
                targetCircle = circles.find(circle => {
                    const circleCx = parseFloat(circle.getAttribute('cx'));
                    const circleCy = parseFloat(circle.getAttribute('cy'));
                    const circleRadius = parseFloat(circle.getAttribute('r'));
                    return Math.abs(circleCx - scaledCx) < 15 && Math.abs(circleCy - scaledCy) < 15 && Math.abs(circleRadius - scaledRadius) < 15;
                });
            }

            if (targetCircle) {
                if (!targetCircle.getAttribute('data-index')) {
                    targetCircle.setAttribute('data-index', circleIndex);
                    circleIndexMap.set(targetCircle, circleIndex);
                }
                addFlowerToCircle(targetCircle, { flowerName, color, imgId, originalCx, originalCy, originalRadius, circleIndex });
            }
        });

        updateFillAllButtonVisibility();
    }

    svg.addEventListener('click', (event) => {
        const circle = event.target.closest('circle');
        if (!circle) return;
        event.stopPropagation();
        addFlowerToCircle(circle);
    });

    function linkPlusLinesToPaths() {
        const regionsGroup = svg.querySelector('g.free-regions');
        if (!regionsGroup) return;
        const children = Array.from(regionsGroup.children);
        let lastPath = null;
        children.forEach(el => {
            if (el.tagName === 'path' && el.classList.contains('free-region')) {
                lastPath = el;
                if (!lastPath._plusLines) lastPath._plusLines = [];
            } else if (el.tagName === 'line' && lastPath) {
                if (!lastPath._plusLines) lastPath._plusLines = [];
                lastPath._plusLines.push(el);
            }
        });
    }

    const greenImageStore = new Map();

    function addGreenToRegion(pathEl) {
        if (greenImageStore.has(pathEl)) {
            removeGreenFromRegion(pathEl);
            return;
        }

        const selectedGreenRadio = document.querySelector(
            '.directory-grid[data-type="green"] .item-content__input[type="radio"]:checked'
        );
        if (!selectedGreenRadio) return;

        const parentItem = selectedGreenRadio.closest('.directory-item');
        if (!parentItem) return;
        const greenName = parentItem.dataset.greenName;
        if (!greenName) return;

        const imgElement = parentItem.querySelector('img.item-content-cover-image');
        const imgSrc = imgElement ? imgElement.src : 'img/green/' + greenName + '/0001.png';

        const bbox = pathEl.getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;

        const vb = svg.getAttribute('viewBox') ? svg.getAttribute('viewBox').split(' ').map(Number) : [0,0,500,500];
        const svgArea = vb[2] * vb[3];
        const maxSizeByArea = Math.sqrt(svgArea * 0.30);
        const size = Math.min(Math.min(bbox.width, bbox.height) * 2.0, maxSizeByArea);

        const svgCx = viewBox[0] + viewBox[2] / 2;
        const svgCy = viewBox[1] + viewBox[3] / 2;
        const dx = cx - svgCx;
        const dy = cy - svgCy;
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = angleRad * 180 / Math.PI + 90;

        // Картинка зелени вставляется первой (позади цветов)
        const svgImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        svgImg.setAttribute('href', imgSrc);
        svgImg.setAttribute('x', cx - size / 2);
        svgImg.setAttribute('y', cy - size / 2);
        svgImg.setAttribute('width', size);
        svgImg.setAttribute('height', size);
        svgImg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svgImg.setAttribute('class', 'green-region-img');
        svgImg.setAttribute('transform', `rotate(${angleDeg}, ${cx}, ${cy})`);

        svg.insertBefore(svgImg, svg.firstChild);

        // Группа для кнопки удаления (отдельно, чтобы была поверх всего)
        const closeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        closeGroup.setAttribute('class', 'green-group');

        const closeBtnGreen = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        closeBtnGreen.setAttribute('class', 'close-btn-green');

        // Ещё ближе к центру правого верхнего угла
        const offsetX = size * 0.32;
        const offsetY = -size * 0.32;

        closeBtnGreen.setAttribute('transform', `translate(${cx + offsetX}, ${cy + offsetY})`);

        const closeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        closeCircle.setAttribute('cx', 0);
        closeCircle.setAttribute('cy', 0);
        closeCircle.setAttribute('r', 19);

        const closeLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        closeLine1.setAttribute('x1', -6);
        closeLine1.setAttribute('y1', -6);
        closeLine1.setAttribute('x2', 6);
        closeLine1.setAttribute('y2', 6);

        const closeLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        closeLine2.setAttribute('x1', -6);
        closeLine2.setAttribute('y1', 6);
        closeLine2.setAttribute('x2', 6);
        closeLine2.setAttribute('y2', -6);

        closeBtnGreen.appendChild(closeCircle);
        closeBtnGreen.appendChild(closeLine1);
        closeBtnGreen.appendChild(closeLine2);

        closeGroup.appendChild(closeBtnGreen);
        svg.appendChild(closeGroup);   // кнопка поверх всего

        greenImageStore.set(pathEl, { img: svgImg, closeGroup: closeGroup });

        pathEl.dataset.greenFilled = '1';

        if (pathEl._plusLines) {
            pathEl._plusLines.forEach(l => { l.style.display = 'none'; });
        }

        pathEl._origFill      = pathEl.getAttribute('fill');
        pathEl._origOpacity   = pathEl.getAttribute('opacity');
        pathEl._origStyleFill = pathEl.style.fill;
        pathEl._origStyleOpacity = pathEl.style.opacity;
        pathEl.setAttribute('fill', 'none');
        pathEl.setAttribute('opacity', '0');
        pathEl.style.fill    = 'none';
        pathEl.style.opacity = '0';
        pathEl.style.pointerEvents = 'all';

        const removeGreen = (e) => {
            e.stopPropagation();
            svgImg.remove();
            closeGroup.remove();
            greenImageStore.delete(pathEl);
            delete pathEl.dataset.greenFilled;

            if (pathEl._plusLines) {
                pathEl._plusLines.forEach(l => { l.style.display = ''; });
            }

            pathEl.setAttribute('fill',    pathEl._origFill    || '#9cce88');
            pathEl.setAttribute('opacity', pathEl._origOpacity || '0.7');
            pathEl.style.fill    = pathEl._origStyleFill    || '';
            pathEl.style.opacity = pathEl._origStyleOpacity || '';

            updateFillAllButtonVisibility();
        };

        closeBtnGreen.addEventListener('click', removeGreen);
        svgImg.addEventListener('click', removeGreen);

        updateFillAllButtonVisibility();
    }

    function removeGreenFromRegion(pathEl) {
        const data = greenImageStore.get(pathEl);
        if (data) {
            if (data.img && data.img.parentNode) data.img.parentNode.removeChild(data.img);
            if (data.closeGroup && data.closeGroup.parentNode) data.closeGroup.parentNode.removeChild(data.closeGroup);
        }
        greenImageStore.delete(pathEl);

        delete pathEl.dataset.greenFilled;

        if (pathEl._plusLines) {
            pathEl._plusLines.forEach(l => { l.style.display = ''; });
        }

        pathEl.setAttribute('fill',    pathEl._origFill    || '#9cce88');
        pathEl.setAttribute('opacity', pathEl._origOpacity || '0.7');
        pathEl.style.fill    = pathEl._origStyleFill    || '';
        pathEl.style.opacity = pathEl._origStyleOpacity || '';

        updateFillAllButtonVisibility();
    }

    svg.addEventListener('click', function(event) {
        const pathEl = event.target.closest('path.free-region');
        if (!pathEl) return;

        const greenRadioTab = document.getElementById('radio-green');
        const isGreenTab = greenRadioTab && greenRadioTab.checked;

        if (!isGreenTab) {
            if (pathEl.dataset.greenFilled === '1') {
                event.stopPropagation();
                removeGreenFromRegion(pathEl);
                updateFillAllButtonVisibility();
            }
            return;
        }

        event.stopPropagation();
        addGreenToRegion(pathEl);
        updateFillAllButtonVisibility();
    });

    setTimeout(linkPlusLinesToPaths, 500);

    const svgChildObserver = new MutationObserver(() => {
        setTimeout(linkPlusLinesToPaths, 100);
    });
    svgChildObserver.observe(svg, { childList: true, subtree: false });

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    fillAllButton.addEventListener('click', async () => {
        const isGreenTab = document.getElementById('radio-green')?.checked;

        if (isGreenTab) {
            const freeRegions = Array.from(svg.querySelectorAll('path.free-region'))
                .filter(p => !greenImageStore.has(p));
            for (const pathEl of freeRegions) {
                addGreenToRegion(pathEl);
                await delay(120);
            }
            updateFillAllButtonVisibility();
            return;
        }

        window.dispatchEvent(new Event('fillAllAnimationStart'));
        const circles = Array.from(svg.querySelectorAll('circle:not(.hover-circle)[fill]:not([fill="none"])'));
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

        const otherCircles = circles.filter(circle => circle !== centralCircle);
        otherCircles.sort((a, b) => {
            const ay = parseFloat(a.getAttribute('cy'));
            const by = parseFloat(b.getAttribute('cy'));
            const ax = parseFloat(a.getAttribute('cx'));
            const bx = parseFloat(b.getAttribute('cx'));
            if (Math.abs(ay - by) > 0.1) return ay - by;
            return ax - bx;
        });

        if (centralCircle) otherCircles.push(centralCircle);

        const selectedRadio = document.querySelector('.right-section .directory-item input[type="radio"]:checked');
        let flowerData = null;
        if (selectedRadio) {
            const parentItem = selectedRadio.closest('.directory-item');
            const imgElement = parentItem.querySelector('img');
            const imgId = imgElement.id;
            const index = parseInt(imgId.replace('img', '')) - 1;
            const flowerName = flowerList[index];
            const color = parentItem.dataset.currentColor || 'white';
            flowerData = { flowerName, color, imgId };
        }

        for (const circle of otherCircles) {
            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            const existingGroup = Array.from(svg.querySelectorAll('g.flower-group')).find(group => {
                const groupCircle = group.querySelector('circle.hover-circle');
                if (!groupCircle) return false;
                const groupCx = parseFloat(groupCircle.getAttribute('cx'));
                const groupCy = parseFloat(groupCircle.getAttribute('cy'));
                return Math.abs(groupCx - cx) < 15 && Math.abs(groupCy - cy) < 15;
            });

            if (!existingGroup && circle.getAttribute('fill') !== 'none') {
                flowerData.originalCx = (cx - viewBox[0]) / zoom;
                flowerData.originalCy = (cy - viewBox[1]) / zoom;
                flowerData.originalRadius = parseFloat(circle.getAttribute('r')) / zoom;
                flowerData.circleIndex = circle.getAttribute('data-index') || circleIndexCounter++;
                circle.setAttribute('data-index', flowerData.circleIndex);
                circleIndexMap.set(circle, flowerData.circleIndex);
                addFlowerToCircle(circle, flowerData);
                await delay(120);
            }
        }

        await delay(1000);
        window.dispatchEvent(new Event('fillAllAnimationEnd'));
        updateFillAllButtonVisibility();
    });

    clearAllButton.addEventListener('click', async () => {
        const isGreenTab = document.getElementById('radio-green')?.checked;

        if (isGreenTab) {
            const filledPaths = Array.from(greenImageStore.keys());
            for (const pathEl of filledPaths) {
                removeGreenFromRegion(pathEl);
                await delay(120);
            }
            updateFillAllButtonVisibility();
            return;
        }

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
                flowerDataStore.delete(groupId);
            }
            if (flowerAnimation) flowerAnimation.forceStopAnimation();
        }
        updateFillAllButtonVisibility();
    });

    const stageObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                updateFillAllButtonVisibility();
            }
        });
    });

    document.querySelectorAll('.step-1, .step-2, .step-3').forEach(element => {
        stageObserver.observe(element, { attributes: true });
    });

    function showWarningToast() {
        if (isToastActive) return;

        toastElement = document.querySelector('.toast');
        if (!toastElement) {
            toastElement = document.createElement('div');
            toastElement.className = 'toast';
            toastElement.innerHTML = `
                <div class="toast-content">
                    <div class="check">
                        <img src="https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/attention.svg" alt="Attention" class="check-icon">
                    </div>
                    <div class="message">
                        <span class="text text-2">Заполните букет полностью,</span>
                        <span class="text text-2">чтобы перейти далее</span>
                    </div>
                </div>
                <i class="fa-solid fa-xmark close"></i>
                <div class="progress"></div>
            `;
            document.body.appendChild(toastElement);
        }

        const progress = toastElement.querySelector('.progress');

        if (toastTimeout) clearTimeout(toastTimeout);

        toastElement.classList.add('active');
        progress.classList.add('active');
        isToastActive = true;

        toastTimeout = setTimeout(() => {
            hideToast();
        }, 5000);

        const closeBtn = toastElement.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = null;
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

    window.addEventListener('beforeunload', () => {
        if (toastTimeout) clearTimeout(toastTimeout);
    });

    window.addEventListener('resize', () => {
        restoreFlowers();
    });

    document.querySelectorAll('.step-2 .next-btn-short').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!isBouquetComplete()) {
                e.preventDefault();
                e.stopPropagation();
                showWarningToast();
                return false;
            }
        }, { capture: true });
    });

    updateNextButtonState();

    initializeGrids();

    (function() {
        const guardObserver = new MutationObserver(() => {
            const fillAllBtn = document.querySelector('.fill-all-btn');
            if (!fillAllBtn) return;
            const selectedRadio = document.querySelector('.right-section .directory-item input[type="radio"]:checked');
            if (!selectedRadio && fillAllBtn.style.display !== 'none') {
                fillAllBtn.style.display = 'none';
                const container = fillAllBtn.closest('.fill-all-container');
                const clearBtn = container?.querySelector('.clear-all-btn');
                if (container && (!clearBtn || clearBtn.style.display === 'none')) {
                    container.style.display = 'none';
                }
            }
            updateNextButtonState();
        });
        guardObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    })();
});