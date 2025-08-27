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
        console.log('Updated zoom:', zoom, 'ViewBox:', viewBox);

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
        .close-btn { cursor: pointer; display: none; z-index: 2000; }
        .hover-circle { fill: none !important; pointer-events: all; z-index: 1500; }
        .flower-image { pointer-events: none; z-index: 1000; }
        .flower-canvas { pointer-events: none; z-index: 1000; }
        .close-btn circle { fill: #fd8264 !important; transition: none !important; }
        .close-btn circle:hover { fill: #fd8264 !important; }
        .close-btn line { stroke: #ffffff !important; stroke-width: 5; stroke-linecap: butt; }
        .fill-all-container { position: absolute; bottom: 30px; left: calc(60vw - 30px); transform: translateX(-100%); display: none; gap: 25px; flex-direction: row; }
        .fill-all-btn, .clear-all-btn { position: relative; list-style: none; width: 60px; height: 60px; background: #fd8262; border-radius: 60px; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: width 0.5s; transform-origin: right; margin: 0 auto; }
        .fill-all-btn:hover, .clear-all-btn:hover { width: 240px; background: #fd8262; }
        .fill-all-btn .icon, .clear-all-btn .icon { width: 40px; height: 40px; position: absolute; left: 50%; transform: translateX(-50%); transition: transform 0.5s; }
        .fill-all-btn:hover .icon, .clear-all-btn:hover .icon { transform: translateX(-100%) scale(0); }
        .fill-all-btn .title, .clear-all-btn .title { color: #fff; font-family: 'Courier New', sans-serif; font-size: 27px; text-align: center; transform: scale(0); transition: transform 0.5s; }
        .fill-all-btn:hover .title, .clear-all-btn:hover .title { transform: scale(1); }
        .flower-group.removing { opacity: 0; transition: opacity 0.5s; }
        .flower-group.removing.close-btn-clicked { opacity: 0; transition: opacity 0.2s; }
        .left-section { overflow: visible !important; }
        .next-btn-short.disabled { opacity: 0.5; cursor: default; pointer-events: auto; }
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

    function updateFillAllButtonVisibility() {
        const selectedRadio = document.querySelector('.right-section .directory-item input[type="radio"]:checked');
        const isSecondStage = document.querySelector('.form-shape.active') !== null;
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
        const shouldDisplayFill = selectedRadio && isSecondStage && freeCellCount > 1;
        const shouldDisplayClear = isSecondStage && flowerGroups.length >= 2;
        fillAllButton.style.display = shouldDisplayFill ? 'flex' : 'none';
        clearAllButton.style.display = shouldDisplayClear ? 'flex' : 'none';
        fillAllContainer.style.display = (shouldDisplayFill || shouldDisplayClear) ? 'flex' : 'none';
        updateNextButtonState();
    }

    function updateNextButtonState() {
        const nextButtons = document.querySelectorAll('.step-2 .next-btn-short');
        const isComplete = isBouquetComplete();
        nextButtons.forEach(btn => btn.classList.toggle('disabled', !isComplete));
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

        const testImage = new Image();
        testImage.src = firstFrame;

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

        console.log('Restoring flowers. Zoom:', zoom, 'ViewBox:', viewBox);
        console.log('Stored flowers:', Array.from(flowerDataStore.entries()));
        console.log('Current circles:', circles.map(c => ({
            cx: parseFloat(c.getAttribute('cx')),
            cy: parseFloat(c.getAttribute('cy')),
            r: parseFloat(c.getAttribute('r')),
            index: c.getAttribute('data-index')
        })));

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
                console.log(`Restoring flower at (${scaledCx}, ${scaledCy}) with radius ${scaledRadius}, circleIndex: ${circleIndex}`);
                if (!targetCircle.getAttribute('data-index')) {
                    targetCircle.setAttribute('data-index', circleIndex);
                    circleIndexMap.set(targetCircle, circleIndex);
                }
                addFlowerToCircle(targetCircle, { flowerName, color, imgId, originalCx, originalCy, originalRadius, circleIndex });
            } else {
                console.warn(`No matching circle found for flower at (${scaledCx}, ${scaledCy}) with radius ${scaledRadius}, circleIndex: ${circleIndex}`);
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

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    fillAllButton.addEventListener('click', async () => {
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

        await delay(1000); // Additional 1-second delay for flower animations
        window.dispatchEvent(new Event('fillAllAnimationEnd'));
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
                flowerDataStore.delete(groupId);
            }
            if (flowerAnimation) flowerAnimation.forceStopAnimation();
        }
        updateFillAllButtonVisibility();
    });

    function clearSelectionOnStageChange() {
        const isSecondStage = document.querySelector('.step-2.active') !== null;
        const isThirdStage = document.querySelector('.step-3.active') !== null;

        if (!isSecondStage) {
            document.querySelectorAll('.step-2 .directory-item input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });
        }

        if (!isThirdStage) {
            document.querySelectorAll('.step-3 .directory-item input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });
        }

        updateFillAllButtonVisibility();
    }

    const stageObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                clearSelectionOnStageChange();
            }
        });
    });

    document.querySelectorAll('.step-1, .step-2, .step-3').forEach(element => {
        stageObserver.observe(element, { attributes: true });
    });

    clearSelectionOnStageChange();

    function isBouquetComplete() {
        const circles = svg.querySelectorAll('circle:not(.hover-circle)[fill]:not([fill="none"])');
        const flowerGroups = svg.querySelectorAll('g.flower-group');
        return circles.length === 0 && flowerGroups.length > 0;
    }

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
        console.log('Resize event triggered');
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
});