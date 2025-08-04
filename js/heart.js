const items = [
    { key: 'a', text: 'Гвоздика', isActive: false },
    { key: 'b', text: 'Георгин', isActive: false },
    { key: 'c', text: 'Гиппеаструм', isActive: false },
    { key: 'd', text: 'Гортензия', isActive: false },
    { key: 'e', text: 'Ирис', isActive: false },
    { key: 'f', text: 'Калла', isActive: false },
    { key: 'g', text: 'Камелия', isActive: false },
    { key: 'h', text: 'Крокус', isActive: false },
    { key: 'i', text: 'Лизиантус', isActive: false },
    { key: 'j', text: 'Лилия', isActive: false },
    { key: 'k', text: 'Незабудка', isActive: false },
    { key: 'l', text: 'Орхидея', isActive: false },
    { key: 'm', text: 'Пион', isActive: false },
    { key: 'n', text: 'Ранункулюс', isActive: false },
    { key: 'o', text: 'Роза', isActive: false },
    { key: 'p', text: 'Сирень', isActive: false },
    { key: 'q', text: 'Тюльпан', isActive: false },
    { key: 'r', text: 'Хризантема', isActive: false },
    { key: 's', text: 'Цимбидиум', isActive: false },
    { key: 't', text: 'Эустома', isActive: false }
];

const itemsStep3Texture = [
    { key: 't1', id: 'texture-1', isActive: false },
    { key: 't2', id: 'texture-2', isActive: false },
    { key: 't3', id: 'texture-3', isActive: false },
    { key: 't4', id: 'texture-4', isActive: false },
    { key: 't5', id: 'texture-5', isActive: false },
    { key: 't6', id: 'texture-6', isActive: false },
    { key: 't7', id: 'texture-7', isActive: false },
    { key: 't8', id: 'texture-8', isActive: false },
    { key: 't9', id: 'texture-9', isActive: false },
    { key: 't10', id: 'texture-10', isActive: false }
];

const itemsStep3Print = [
    { key: 'p1', id: 'print-1', isActive: false },
    { key: 'p2', id: 'print-2', isActive: false },
    { key: 'p3', id: 'print-3', isActive: false },
    { key: 'p4', id: 'print-4', isActive: false },
    { key: 'p5', id: 'print-5', isActive: false },
    { key: 'p6', id: 'print-6', isActive: false },
    { key: 'p7', id: 'print-7', isActive: false },
    { key: 'p8', id: 'print-8', isActive: false },
    { key: 'p9', id: 'print-9', isActive: false },
    { key: 'p10', id: 'print-10', isActive: false }
];

const isCreatorPage = document.body.classList.contains('step-2-active') || document.body.classList.contains('step-3-active') || !!document.querySelector('.step-2 .right-section') || !!document.querySelector('.step-3 .right-section');

const ITEM_WIDTH = isCreatorPage ? 240 : 250;
const ITEM_HEIGHT = isCreatorPage ? 230 : 335;
const COLUMN_GAP = isCreatorPage ? 15 : 24;
const ROW_GAP = isCreatorPage ? 15 : 24;
const PADDING_TOP = isCreatorPage ? 5 : 0;
const PADDING_LEFT = isCreatorPage ? 10 : 0;
const MIN_COLS = 1;
const MAX_COLS = 10;
const BASE_ANIMATION_DURATION = 400;
const CONTAINER_MARGIN = isCreatorPage ? 0 : 440;
const RIGHT_SECTION_PADDING = isCreatorPage ? 85 : 0;

const state = {
    directory: {
        container: document.querySelector('.directory-grid:not(.step-2 .directory-grid):not(.step-3 .directory-grid)'),
        items: items,
        order: items.map((_, i) => i),
        isAnimating: false,
        lastGridCols: null,
        lastPos: null,
        savedRightSectionWidth: null
    },
    step2: {
        container: document.querySelector('.step-2 .directory-grid'),
        items: items,
        order: items.map((_, i) => i),
        isAnimating: false,
        lastGridCols: null,
        lastPos: null,
        savedRightSectionWidth: null
    },
    step3: {
        container: document.querySelector('.step-3 .right-section .directory-grid:not([data-type="print"])'),
        items: itemsStep3Texture,
        order: itemsStep3Texture.map((_, i) => i),
        isAnimating: false,
        lastGridCols: null,
        lastPos: null,
        savedRightSectionWidth: null
    },
    prints: {
        container: document.querySelector('.step-3 .right-section .directory-grid[data-type="print"]'),
        items: itemsStep3Print,
        order: itemsStep3Print.map((_, i) => i),
        isAnimating: false,
        lastGridCols: null,
        lastPos: null,
        savedRightSectionWidth: null
    }
};

function triggerBackgroundWidthUpdate(step) {
    if (isCreatorPage && typeof updateBackgroundWidth === 'function') {
        const rightSection = step !== 'directory' ? document.querySelector(`.step-${step === 'prints' ? 3 : step} .right-section`) : null;
        const stateKey = step;
        if (state[stateKey].isAnimating && state[stateKey].savedRightSectionWidth && rightSection) {
            rightSection.style.width = state[stateKey].savedRightSectionWidth;
        } else {
            requestAnimationFrame(updateBackgroundWidth);
        }
    }
}

function saveStateToLocalStorage(step) {
    const items = state[step].items;
    const stateKey = step === 'step3' ? 'gridStateStep3Texture' : step === 'prints' ? 'gridStateStep3Print' : 'gridState';
    const stateData = items.map(item => ({ key: item.key, isActive: item.isActive }));
    localStorage.setItem(stateKey, JSON.stringify(stateData));
}

function restoreStateFromLocalStorage(step) {
    const items = state[step].items;
    const stateKey = step === 'step3' ? 'gridStateStep3Texture' : step === 'prints' ? 'gridStateStep3Print' : 'gridState';
    const savedState = localStorage.getItem(stateKey);
    if (savedState) {
        const stateData = JSON.parse(savedState);
        items.forEach(item => {
            const savedItem = stateData.find(saved => saved.key === item.key);
            if (savedItem) {
                item.isActive = savedItem.isActive;
            }
        });
    }
}

function updateOrder(step) {
    const items = state[step].items;
    const stateKey = step;
    const activeItems = items
        .map((item, i) => ({ item, index: i }))
        .filter(({ item }) => item.isActive)
        .map(({ index }) => index);

    let inactiveItems;
    if (step === 'step3' || step === 'prints') {
        inactiveItems = items
            .map((item, i) => ({ item, index: i }))
            .filter(({ item }) => !item.isActive)
            .sort((a, b) => parseInt(a.item.id.split('-')[1], 10) - parseInt(b.item.id.split('-')[1], 10))
            .map(({ index }) => index);
    } else {
        inactiveItems = items
            .map((item, i) => ({ item, index: i }))
            .filter(({ item }) => !item.isActive)
            .sort((a, b) => a.item.text.localeCompare(b.item.text))
            .map(({ index }) => index);
    }

    state[stateKey].order = [...activeItems, ...inactiveItems];
}

function syncDomWithOrder(grid, step) {
    const stateKey = step;
    const items = state[step].items;
    const itemsInDom = Array.from(grid.querySelectorAll('.directory-item'));
    const sortedItems = state[stateKey].order.map(index =>
        itemsInDom.find(item => parseInt(item.dataset.index, 10) === index)
    ).filter(item => item);

    grid.innerHTML = '';
    sortedItems.forEach(item => grid.appendChild(item));
}

function getGridCols(step) {
    if (isCreatorPage) {
        const availableWidth = Math.min(window.innerWidth * 0.45, window.innerWidth) - RIGHT_SECTION_PADDING;
        return Math.min(
            MAX_COLS,
            Math.max(MIN_COLS, Math.floor((availableWidth + COLUMN_GAP) / (ITEM_WIDTH + COLUMN_GAP)))
        );
    } else {
        const containerWidth = window.innerWidth - CONTAINER_MARGIN;
        return Math.min(
            MAX_COLS,
            Math.max(MIN_COLS, Math.floor((containerWidth + COLUMN_GAP) / (ITEM_WIDTH + COLUMN_GAP)))
        );
    }
}

function getGridRows(step) {
    return Math.ceil(state[step].items.length / getGridCols(step));
}

function calculateContainerDimensions(cols, step) {
    return {
        width: (ITEM_WIDTH * cols) + (COLUMN_GAP * (cols - 1)) + (isCreatorPage ? RIGHT_SECTION_PADDING : 0),
        height: (ITEM_HEIGHT * getGridRows(step)) + (ROW_GAP * (getGridRows(step) - 1)) + (isCreatorPage ? PADDING_TOP : 0)
    };
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function findNumericalPosition(index, step) {
    const items = state[step].items;
    const currentId = items[index].id;
    const currentNum = parseInt(currentId.split('-')[1], 10);
    const inactiveItems = items
        .map((item, i) => ({ id: item.id, index: i }))
        .filter(item => !items[item.index].isActive && item.index !== index)
        .sort((a, b) => {
            const numA = parseInt(a.id.split('-')[1], 10);
            const numB = parseInt(b.id.split('-')[1], 10);
            return numA - numB;
        });

    let insertPos = 0;
    for (let i = 0; i < inactiveItems.length; i++) {
        const num = parseInt(inactiveItems[i].id.split('-')[1], 10);
        if (currentNum < num) break;
        insertPos++;
    }

    return insertPos + items.filter(item => item.isActive).length;
}

function findAlphabeticalPosition(index, step) {
    const items = state[step].items;
    const currentItem = items[index];
    const inactiveItems = items
        .map((item, i) => ({ item, index: i }))
        .filter(item => !item.item.isActive && item.index !== index)
        .sort((a, b) => a.item.text.localeCompare(b.item.text));

    let insertPos = 0;
    for (let i = 0; i < inactiveItems.length; i++) {
        if (currentItem.text.localeCompare(inactiveItems[i].item.text) < 0) break;
        insertPos++;
    }
    return insertPos + items.filter(item => item.isActive).length;
}

function prepareAnimation(itemEl) {
    itemEl.style.transform = 'translate(0, 0)';
    itemEl.style.boxShadow = 'none';
    itemEl.style.opacity = '1';
    itemEl.classList.add('animating');
    itemEl.style.position = 'absolute';
    itemEl.style.width = `${ITEM_WIDTH}px`;
    itemEl.style.height = `${ITEM_HEIGHT}px`;
    itemEl.style.zIndex = '1000';
    itemEl.style.pointerEvents = 'none';
    itemEl.style.transition = 'none';
    itemEl.style.willChange = 'transform';
    itemEl.style.left = '0';
    itemEl.style.top = '0';
}

function finalizeAnimation(itemEl) {
    itemEl.classList.remove('animating');
    itemEl.style.position = '';
    itemEl.style.width = '';
    itemEl.style.height = '';
    itemEl.style.zIndex = '';
    itemEl.style.left = '';
    itemEl.style.top = '';
    itemEl.style.transform = '';
    itemEl.style.pointerEvents = '';
    itemEl.style.transition = '';
    itemEl.style.opacity = '';
    itemEl.style.willChange = '';
    itemEl.style.boxShadow = '';
}

function animateItem(itemEl, startX, startY, endX, endY, duration, onUpdate, onComplete) {
    const startTime = performance.now();

    function animate(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        const currentX = startX + (endX - startX) * easedProgress;
        const currentY = startY + (endY - startY) * easedProgress;

        itemEl.style.transform = `translate(${currentX}px, ${currentY}px)`;

        if (onUpdate) onUpdate(currentX, currentY, progress);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (onComplete) onComplete();
        }
    }

    requestAnimationFrame(animate);
}

function moveToFirst(index, grid, itemEl, step) {
    const stateKey = step;
    if (state[stateKey].isAnimating) return;
    state[stateKey].isAnimating = true;

    const rightSection = isCreatorPage && step !== 'directory' ? document.querySelector(`.step-${step === 'prints' ? 3 : step} .right-section`) : null;
    if (rightSection) {
        state[stateKey].savedRightSectionWidth = rightSection.style.width || getComputedStyle(rightSection).width;
    }

    grid.style.display = 'block';

    const cols = getGridCols(step);
    const rows = getGridRows(step);
    const currentPos = state[stateKey].order.indexOf(index);
    if (currentPos === 0) {
        state[stateKey].isAnimating = false;
        grid.style.display = 'grid';
        updatePositions(step);
        triggerBackgroundWidthUpdate(step);
        state[stateKey].savedRightSectionWidth = null;
        return;
    }

    prepareAnimation(itemEl);

    const startRow = Math.floor(currentPos / cols);
    const startCol = currentPos % cols;
    const startX = startCol * (ITEM_WIDTH + COLUMN_GAP) + PADDING_LEFT;
    const startY = startRow * (ITEM_HEIGHT + ROW_GAP) + PADDING_TOP;
    const endX = PADDING_LEFT;
    const endY = PADDING_TOP;

    const distance = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
    const maxDistance = Math.sqrt(
        Math.pow((cols - 1) * (ITEM_WIDTH + COLUMN_GAP), 2) +
        Math.pow((rows - 1) * (ITEM_HEIGHT + ROW_GAP), 2)
    );
    const duration = BASE_ANIMATION_DURATION + (distance / maxDistance) * 600;

    state[stateKey].lastPos = currentPos;

    animateItem(
        itemEl,
        startX,
        startY,
        endX,
        endY,
        duration,
        (currentX, currentY) => {
            const newCol = Math.max(0, Math.min(cols - 1, Math.round((currentX - PADDING_LEFT) / (ITEM_WIDTH + COLUMN_GAP))));
            const newRow = Math.max(0, Math.min(rows - 1, Math.round((currentY - PADDING_TOP) / (ITEM_HEIGHT + ROW_GAP))));
            const newPos = newRow * cols + newCol;

            if (newPos !== state[stateKey].lastPos && newPos >= 0 && newPos < state[step].items.length) {
                const newOrder = [...state[stateKey].order];
                newOrder.splice(state[stateKey].lastPos, 1);
                newOrder.splice(newPos, 0, index);
                state[stateKey].order = newOrder;
                state[stateKey].lastPos = newPos;
                updatePositions(step, index);
                triggerBackgroundWidthUpdate(step);
            }
        },
        () => {
            const newOrder = [...state[stateKey].order];
            newOrder.splice(state[stateKey].lastPos, 1);
            newOrder.unshift(index);
            state[stateKey].order = newOrder;

            finalizeAnimation(itemEl);
            grid.insertBefore(itemEl, grid.firstChild);
            grid.style.display = 'grid';
            updatePositions(step);
            triggerBackgroundWidthUpdate(step);
            state[stateKey].isAnimating = false;
            state[stateKey].lastPos = null;
            state[stateKey].savedRightSectionWidth = null;

            if (step === 'directory' || step === 'step2') {
                const otherStep = step === 'directory' ? 'step2' : 'directory';
                if (state[otherStep].container) {
                    state[otherStep].items[index].isActive = state[step].items[index].isActive;
                    updateOrder(otherStep);
                    syncDomWithOrder(state[otherStep].container, otherStep);
                    const otherGrid = state[otherStep].container;
                    Array.from(otherGrid.querySelectorAll('.directory-item')).forEach(itemEl => {
                        const itemIndex = parseInt(itemEl.dataset.index, 10);
                        const checkbox = itemEl.querySelector('.hackyBox');
                        if (checkbox) {
                            checkbox.checked = state[otherStep].items[itemIndex].isActive;
                        }
                    });
                    updatePositions(otherStep);
                    triggerBackgroundWidthUpdate(otherStep);
                }
            }
        }
    );
}

function returnToPosition(index, grid, itemEl, step) {
    const stateKey = step;
    if (state[stateKey].isAnimating) return;
    state[stateKey].isAnimating = true;

    const rightSection = isCreatorPage && step !== 'directory' ? document.querySelector(`.step-${step === 'prints' ? 3 : step} .right-section`) : null;
    if (rightSection) {
        state[stateKey].savedRightSectionWidth = rightSection.style.width || getComputedStyle(rightSection).width;
    }

    grid.style.display = 'block';

    const cols = getGridCols(step);
    const rows = getGridRows(step);
    const currentPos = state[stateKey].order.indexOf(index);
    const targetPos = step === 'step3' || step === 'prints' ? findNumericalPosition(index, step) : findAlphabeticalPosition(index, step);

    prepareAnimation(itemEl);

    const startRow = Math.floor(currentPos / cols);
    const startCol = currentPos % cols;
    const startX = startCol * (ITEM_WIDTH + COLUMN_GAP) + PADDING_LEFT;
    const startY = startRow * (ITEM_HEIGHT + ROW_GAP) + PADDING_TOP;
    const endRow = Math.floor(targetPos / cols);
    const endCol = targetPos % cols;
    const endX = endCol * (ITEM_WIDTH + COLUMN_GAP) + PADDING_LEFT;
    const endY = endRow * (ITEM_HEIGHT + ROW_GAP) + PADDING_TOP;

    const distance = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
    const maxDistance = Math.sqrt(
        Math.pow((cols - 1) * (ITEM_WIDTH + COLUMN_GAP), 2) +
        Math.pow((rows - 1) * (ITEM_HEIGHT + ROW_GAP), 2)
    );
    const duration = BASE_ANIMATION_DURATION + (distance / maxDistance) * 600;

    state[stateKey].lastPos = currentPos;

    animateItem(
        itemEl,
        startX,
        startY,
        endX,
        endY,
        duration,
        (currentX, currentY) => {
            const newCol = Math.max(0, Math.min(cols - 1, Math.round((currentX - PADDING_LEFT) / (ITEM_WIDTH + COLUMN_GAP))));
            const newRow = Math.max(0, Math.min(rows - 1, Math.round((currentY - PADDING_TOP) / (ITEM_HEIGHT + ROW_GAP))));
            const newPos = newRow * cols + newCol;

            if (newPos !== state[stateKey].lastPos && newPos >= 0 && newPos < state[step].items.length) {
                const newOrder = [...state[stateKey].order];
                newOrder.splice(state[stateKey].lastPos, 1);
                newOrder.splice(newPos, 0, index);
                state[stateKey].order = newOrder;
                state[stateKey].lastPos = newPos;

                const items = Array.from(grid.querySelectorAll('.directory-item:not(.animating)'));
                if (newPos === 0) {
                    grid.prepend(itemEl);
                } else {
                    const prevItemIndex = state[stateKey].order[newPos - 1];
                    const prevItem = items.find(item => parseInt(item.dataset.index, 10) === prevItemIndex);
                    if (prevItem && prevItem.nextSibling) {
                        grid.insertBefore(itemEl, prevItem.nextSibling);
                    } else {
                        grid.appendChild(itemEl);
                    }
                }

                updatePositions(step, index);
                triggerBackgroundWidthUpdate(step);
            }
        },
        () => {
            const newOrder = [...state[stateKey].order];
            newOrder.splice(state[stateKey].lastPos, 1);
            newOrder.splice(targetPos, 0, index);
            state[stateKey].order = newOrder;

            const items = Array.from(grid.querySelectorAll('.directory-item:not(.animating)'));
            if (targetPos === 0) {
                grid.prepend(itemEl);
            } else {
                const prevItemIndex = state[stateKey].order[targetPos - 1];
                const prevItem = items.find(item => parseInt(item.dataset.index, 10) === prevItemIndex);
                if (prevItem && prevItem.nextSibling) {
                    grid.insertBefore(itemEl, prevItem.nextSibling);
                } else {
                    grid.appendChild(itemEl);
                }
            }

            finalizeAnimation(itemEl);
            grid.style.display = 'grid';
            updatePositions(step);
            triggerBackgroundWidthUpdate(step);
            state[stateKey].isAnimating = false;
            state[stateKey].lastPos = null;
            state[stateKey].savedRightSectionWidth = null;

            if (step === 'directory' || step === 'step2') {
                const otherStep = step === 'directory' ? 'step2' : 'directory';
                if (state[otherStep].container) {
                    state[otherStep].items[index].isActive = state[step].items[index].isActive;
                    updateOrder(otherStep);
                    syncDomWithOrder(state[otherStep].container, otherStep);
                    const otherGrid = state[otherStep].container;
                    Array.from(otherGrid.querySelectorAll('.directory-item')).forEach(itemEl => {
                        const itemIndex = parseInt(itemEl.dataset.index, 10);
                        const checkbox = itemEl.querySelector('.hackyBox');
                        if (checkbox) {
                            checkbox.checked = state[otherStep].items[itemIndex].isActive;
                        }
                    });
                    updatePositions(otherStep);
                    triggerBackgroundWidthUpdate(otherStep);
                }
            }
        }
    );
}

function updatePositions(step, excludeIndex = null) {
    const stateKey = step;
    const container = state[stateKey].container;
    if (!container) return;

    const cols = getGridCols(step);
    const rows = getGridRows(step);

    if (!isCreatorPage || step === 'directory') {
        const { width, height } = calculateContainerDimensions(cols, step);
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        container.style.overflow = 'hidden';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${cols}, ${ITEM_WIDTH}px)`;
        container.style.columnGap = `${COLUMN_GAP}px`;
        container.style.rowGap = `${ROW_GAP}px`;
    } else if (step === 'step2') {
        container.style.width = '100%';
        container.style.height = 'calc(100% - 250px)';
        container.style.overflowY = 'auto';
        container.style.overflowX = 'hidden';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(auto-fill, minmax(${ITEM_WIDTH}px, 1fr))`;
        container.style.columnGap = `${COLUMN_GAP}px`;
        container.style.rowGap = `${ROW_GAP}px`;
        container.style.paddingLeft = '30px';
        container.style.paddingRight = '25px';
        container.style.paddingTop = '30px';
        container.style.paddingBottom = '110px';
        container.style.marginTop = '140px';
        container.style.position = 'relative';
        container.style.scrollbarGutter = 'stable';
    } else {
        container.style.width = '100%';
        container.style.height = 'calc(100% - 115px)';
        container.style.overflowY = 'auto';
        container.style.overflowX = 'hidden';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(auto-fill, minmax(${ITEM_WIDTH}px, 1fr))`;
        container.style.columnGap = `${COLUMN_GAP}px`;
        container.style.rowGap = step === 'prints' ? '40px' : `${ROW_GAP}px`;
        container.style.paddingLeft = `${PADDING_LEFT}px`;
        container.style.paddingRight = '15px';
        container.style.paddingBottom = '10px';
        container.style.marginTop = '25px';
        container.style.position = 'relative';
    }

    const items = Array.from(container.querySelectorAll('.directory-item:not(.animating)'));
    items.forEach(itemEl => {
        const index = parseInt(itemEl.dataset.index, 10);
        if (index !== excludeIndex) {
            const pos = state[stateKey].order.indexOf(index);
            const row = Math.floor(pos / cols);
            const col = pos % cols;

            itemEl.style.position = 'absolute';
            itemEl.style.left = `${col * (ITEM_WIDTH + COLUMN_GAP) + PADDING_LEFT}px`;
            itemEl.style.top = `${row * (ITEM_HEIGHT + ROW_GAP) + PADDING_TOP}px`;
            itemEl.style.width = `${ITEM_WIDTH}px`;
            itemEl.style.height = isCreatorPage && step !== 'prints' ? '' : `${ITEM_HEIGHT}px`;
            itemEl.style.margin = '0';
            itemEl.style.zIndex = '0';
            itemEl.style.transition = 'left 0.4s cubic-bezier(0.33, 1, 0.68, 1), top 0.4s cubic-bezier(0.33, 1, 0.68, 1)';
        }
    });

    triggerBackgroundWidthUpdate(step);
}

document.addEventListener('DOMContentLoaded', () => {
    ['directory', 'step2', 'step3', 'prints'].forEach(step => {
        const grid = state[step].container;
        if (grid) {
            Array.from(grid.querySelectorAll('.directory-item')).forEach((item, i) => {
                item.dataset.index = i;
            });

            restoreStateFromLocalStorage(step);

            updateOrder(step);
            syncDomWithOrder(grid, step);

            Array.from(grid.querySelectorAll('.directory-item')).forEach(itemEl => {
                const index = parseInt(itemEl.dataset.index, 10);
                const checkbox = itemEl.querySelector('.hackyBox');
                if (checkbox) {
                    checkbox.checked = state[step].items[index].isActive;
                }
            });

            state[step].lastGridCols = getGridCols(step);
            updatePositions(step);
            requestAnimationFrame(() => triggerBackgroundWidthUpdate(step));
        }
    });
});

window.addEventListener('resize', () => {
    ['directory', 'step2', 'step3', 'prints'].forEach(step => {
        const stateKey = step;
        const currentGridCols = getGridCols(step);
        if (currentGridCols !== state[stateKey].lastGridCols && !state[stateKey].isAnimating && state[stateKey].container) {
            state[stateKey].lastGridCols = currentGridCols;
            updatePositions(step);
            syncDomWithOrder(state[stateKey].container, step);
            requestAnimationFrame(() => triggerBackgroundWidthUpdate(step));
        }
    });
});

document.querySelectorAll('.directory-item .hackyBox').forEach(checkbox => {
    checkbox.addEventListener('click', (event) => {
        event.stopPropagation();
        const step = checkbox.closest('.step-2') ? 'step2' : checkbox.closest('.step-3 .directory-grid[data-type="print"]') ? 'prints' : checkbox.closest('.step-3') ? 'step3' : 'directory';
        const stateKey = step;
        if (state[stateKey].isAnimating) return;

        const directoryItem = checkbox.closest('.directory-item');
        const grid = directoryItem.closest('.directory-grid');
        const index = parseInt(directoryItem.dataset.index, 10);

        if (checkbox.checked) {
            state[step].items[index].isActive = true;
            setTimeout(() => moveToFirst(index, grid, directoryItem, step), 450);
        } else {
            state[step].items[index].isActive = false;
            returnToPosition(index, grid, directoryItem, step);
        }
        saveStateToLocalStorage(step);

        if (step === 'directory' || step === 'step2') {
            const otherStep = step === 'directory' ? 'step2' : 'directory';
            if (state[otherStep].container) {
                state[otherStep].items[index].isActive = state[step].items[index].isActive;
                saveStateToLocalStorage(otherStep);
                updateOrder(otherStep);
                syncDomWithOrder(state[otherStep].container, otherStep);
                const otherGrid = state[otherStep].container;
                const otherItem = otherGrid.querySelector(`.directory-item[data-index="${index}"]`);
                if (otherItem) {
                    const otherCheckbox = otherItem.querySelector('.hackyBox');
                    if (otherCheckbox) {
                        otherCheckbox.checked = state[otherStep].items[index].isActive;
                    }
                    if (checkbox.checked) {
                        setTimeout(() => moveToFirst(index, otherGrid, otherItem, otherStep), 450);
                    } else {
                        returnToPosition(index, otherGrid, otherItem, otherStep);
                    }
                }
                updatePositions(otherStep);
                triggerBackgroundWidthUpdate(otherStep);
            }
        }
    });
});