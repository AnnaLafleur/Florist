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

// Определяем, находимся ли на странице creator
const isCreatorPage = document.body.classList.contains('step-2-active') || !!document.querySelector('.step-2 .right-section');

// Константы в зависимости от страницы
const ITEM_WIDTH = isCreatorPage ? 240 : 250;
const ITEM_HEIGHT = isCreatorPage ? 230 : 335;
const COLUMN_GAP = isCreatorPage ? 25 : 24;
const ROW_GAP = isCreatorPage ? 15 : 24;
const MIN_COLS = 1;
const MAX_COLS = 10;
const BASE_ANIMATION_DURATION = 400;
const CONTAINER_MARGIN = isCreatorPage ? 0 : 440;
const RIGHT_SECTION_PADDING = isCreatorPage ? 55 : 0; // padding-right: 30px (.right-section) + 25px (.directory-grid)
const container = document.querySelector('.directory-grid');

// Состояние
let order = items.map((_, i) => i);
let isAnimating = false;
let lastGridCols = null;
let lastPos = null;
let savedRightSectionWidth = null;

// Функция для вызова updateBackgroundWidth из background-width.js
function triggerBackgroundWidthUpdate() {
    if (isCreatorPage && typeof updateBackgroundWidth === 'function') {
        if (isAnimating && savedRightSectionWidth) {
            const rightSection = document.querySelector('.step-2 .right-section');
            if (rightSection) rightSection.style.width = savedRightSectionWidth;
        } else {
            requestAnimationFrame(updateBackgroundWidth);
        }
    }
}

// Функция для сохранения состояния в localStorage
function saveStateToLocalStorage() {
    const state = items.map(item => ({ key: item.key, isActive: item.isActive }));
    localStorage.setItem('gridState', JSON.stringify(state));
}

// Функция для восстановления состояния из localStorage
function restoreStateFromLocalStorage() {
    const savedState = localStorage.getItem('gridState');
    if (savedState) {
        const state = JSON.parse(savedState);
        items.forEach(item => {
            const savedItem = state.find(saved => saved.key === item.key);
            if (savedItem) {
                item.isActive = savedItem.isActive;
            }
        });
    }
}

// Функция для обновления порядка элементов (активные в начало, неактивные по алфавиту А→Я)
function updateOrder() {
    const activeItems = items
        .map((item, i) => ({ item, index: i }))
        .filter(({ item }) => item.isActive)
        .map(({ index }) => index);

    const inactiveItems = items
        .map((item, i) => ({ item, index: i }))
        .filter(({ item }) => !item.isActive)
        .sort((a, b) => a.item.text.localeCompare(b.item.text))
        .map(({ index }) => index);

    order = [...activeItems, ...inactiveItems];
    console.log('Initial order:', order.map(i => items[i].text)); // Отладочный вывод
}

// Функция для синхронизации DOM с массивом order
function syncDomWithOrder(grid) {
    const itemsInDom = Array.from(grid.querySelectorAll('.directory-item'));
    const sortedItems = order.map(index =>
        itemsInDom.find(item => parseInt(item.dataset.index, 10) === index)
    ).filter(item => item);

    grid.innerHTML = '';
    sortedItems.forEach(item => grid.appendChild(item));
}

function getGridCols() {
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

function getGridRows() {
    return Math.ceil(items.length / getGridCols());
}

function calculateContainerDimensions(cols) {
    return {
        width: (ITEM_WIDTH * cols) + (COLUMN_GAP * (cols - 1)) + (isCreatorPage ? RIGHT_SECTION_PADDING : 0),
        height: (ITEM_HEIGHT * getGridRows()) + (ROW_GAP * (getGridRows() - 1))
    };
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function findAlphabeticalPosition(index) {
    const currentText = items[index].text;
    const inactiveItems = items
        .map((item, i) => ({ text: item.text, index: i }))
        .filter(item => !items[item.index].isActive && item.index !== index)
        .sort((a, b) => a.text.localeCompare(b.text));

    let insertPos = 0;
    for (let i = 0; i < inactiveItems.length; i++) {
        if (currentText.localeCompare(inactiveItems[i].text) < 0) break;
        insertPos++;
    }

    return insertPos + items.filter(item => item.isActive).length;
}

function prepareAnimation(itemEl) {
    itemEl.style.transform = 'translate(0, 0)';
    itemEl.style.boxShadow = 'none'; // Отключаем тень во время анимации для обеих страниц
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
    itemEl.style.boxShadow = ''; // Восстанавливаем box-shadow для directory
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

function moveToFirst(index, grid, itemEl) {
    if (isAnimating) return;
    isAnimating = true;

    const rightSection = isCreatorPage ? document.querySelector('.step-2 .right-section') : null;
    if (rightSection) {
        savedRightSectionWidth = rightSection.style.width || getComputedStyle(rightSection).width;
    }

    grid.style.display = 'block';

    const cols = getGridCols();
    const rows = getGridRows();
    const currentPos = order.indexOf(index);
    if (currentPos === 0) {
        isAnimating = false;
        grid.style.display = 'grid';
        updatePositions();
        triggerBackgroundWidthUpdate();
        savedRightSectionWidth = null;
        return;
    }

    prepareAnimation(itemEl);

    const startRow = Math.floor(currentPos / cols);
    const startCol = currentPos % cols;
    const startX = startCol * (ITEM_WIDTH + COLUMN_GAP);
    const startY = startRow * (ITEM_HEIGHT + ROW_GAP);
    const endX = 0;
    const endY = 0;

    const distance = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
    const maxDistance = Math.sqrt(
        Math.pow((cols - 1) * (ITEM_WIDTH + COLUMN_GAP), 2) +
        Math.pow((rows - 1) * (ITEM_HEIGHT + ROW_GAP), 2)
    );
    const duration = BASE_ANIMATION_DURATION + (distance / maxDistance) * 600;

    lastPos = currentPos;

    animateItem(
        itemEl,
        startX,
        startY,
        endX,
        endY,
        duration,
        (currentX, currentY) => {
            const newCol = Math.max(0, Math.min(cols - 1, Math.round(currentX / (ITEM_WIDTH + COLUMN_GAP))));
            const newRow = Math.max(0, Math.min(rows - 1, Math.round(currentY / (ITEM_HEIGHT + ROW_GAP))));
            const newPos = newRow * cols + newCol;

            if (newPos !== lastPos && newPos >= 0 && newPos < items.length) {
                const newOrder = [...order];
                newOrder.splice(lastPos, 1);
                newOrder.splice(newPos, 0, index);
                order = newOrder;
                lastPos = newPos;
                updatePositions(index);
                triggerBackgroundWidthUpdate();
            }
        },
        () => {
            const newOrder = [...order];
            newOrder.splice(lastPos, 1);
            newOrder.unshift(index);
            order = newOrder;

            finalizeAnimation(itemEl);
            grid.insertBefore(itemEl, grid.firstChild);
            grid.style.display = 'grid';
            updatePositions();
            triggerBackgroundWidthUpdate();
            isAnimating = false;
            lastPos = null;
            savedRightSectionWidth = null;
        }
    );
}

function returnToAlphabeticalPosition(index, grid, itemEl) {
    if (isAnimating) return;
    isAnimating = true;

    const rightSection = isCreatorPage ? document.querySelector('.step-2 .right-section') : null;
    if (rightSection) {
        savedRightSectionWidth = rightSection.style.width || getComputedStyle(rightSection).width;
    }

    grid.style.display = 'block';

    const cols = getGridCols();
    const rows = getGridRows();
    const currentPos = order.indexOf(index);
    const targetPos = findAlphabeticalPosition(index);

    prepareAnimation(itemEl);

    const startRow = Math.floor(currentPos / cols);
    const startCol = currentPos % cols;
    const startX = startCol * (ITEM_WIDTH + COLUMN_GAP);
    const startY = startRow * (ITEM_HEIGHT + ROW_GAP);
    const endRow = Math.floor(targetPos / cols);
    const endCol = targetPos % cols;
    const endX = endCol * (ITEM_WIDTH + COLUMN_GAP);
    const endY = endRow * (ITEM_HEIGHT + ROW_GAP);

    const distance = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
    const maxDistance = Math.sqrt(
        Math.pow((cols - 1) * (ITEM_WIDTH + COLUMN_GAP), 2) +
        Math.pow((rows - 1) * (ITEM_HEIGHT + ROW_GAP), 2)
    );
    const duration = BASE_ANIMATION_DURATION + (distance / maxDistance) * 600;

    lastPos = currentPos;

    animateItem(
        itemEl,
        startX,
        startY,
        endX,
        endY,
        duration,
        (currentX, currentY) => {
            const newCol = Math.max(0, Math.min(cols - 1, Math.round(currentX / (ITEM_WIDTH + COLUMN_GAP))));
            const newRow = Math.max(0, Math.min(rows - 1, Math.round(currentY / (ITEM_HEIGHT + ROW_GAP))));
            const newPos = newRow * cols + newCol;

            if (newPos !== lastPos && newPos >= 0 && newPos < items.length) {
                const newOrder = [...order];
                newOrder.splice(lastPos, 1);
                newOrder.splice(newPos, 0, index);
                order = newOrder;
                lastPos = newPos;

                const items = Array.from(grid.querySelectorAll('.directory-item:not(.animating)'));
                if (newPos === 0) {
                    grid.prepend(itemEl);
                } else {
                    const prevItemIndex = order[newPos - 1];
                    const prevItem = items.find(item => parseInt(item.dataset.index, 10) === prevItemIndex);
                    if (prevItem && prevItem.nextSibling) {
                        grid.insertBefore(itemEl, prevItem.nextSibling);
                    } else {
                        grid.appendChild(itemEl);
                    }
                }

                updatePositions(index);
                triggerBackgroundWidthUpdate();
            }
        },
        () => {
            const newOrder = [...order];
            newOrder.splice(lastPos, 1);
            newOrder.splice(targetPos, 0, index);
            order = newOrder;

            const items = Array.from(grid.querySelectorAll('.directory-item:not(.animating)'));
            if (targetPos === 0) {
                grid.prepend(itemEl);
            } else {
                const prevItemIndex = order[targetPos - 1];
                const prevItem = items.find(item => parseInt(item.dataset.index, 10) === prevItemIndex);
                if (prevItem && prevItem.nextSibling) {
                    grid.insertBefore(itemEl, prevItem.nextSibling);
                } else {
                    grid.appendChild(itemEl);
                }
            }

            finalizeAnimation(itemEl);
            grid.style.display = 'grid';
            updatePositions();
            triggerBackgroundWidthUpdate();
            isAnimating = false;
            lastPos = null;
            savedRightSectionWidth = null;
        }
    );
}

function updatePositions(excludeIndex = null) {
    const cols = getGridCols();
    const rows = getGridRows();

    if (!isCreatorPage) {
        const { width, height } = calculateContainerDimensions(cols);
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        container.style.overflow = 'hidden';
    } else {
        container.style.width = '';
        container.style.height = '';
        container.style.overflow = '';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${cols}, ${ITEM_WIDTH}px)`;
        container.style.columnGap = `${COLUMN_GAP}px`;
        container.style.rowGap = `${ROW_GAP}px`;
    }

    const items = Array.from(container.querySelectorAll('.directory-item:not(.animating)'));
    items.forEach(itemEl => {
        const index = parseInt(itemEl.dataset.index, 10);
        if (index !== excludeIndex) {
            const pos = order.indexOf(index);
            const row = Math.floor(pos / cols);
            const col = pos % cols;

            itemEl.style.position = 'absolute';
            itemEl.style.left = `${col * (ITEM_WIDTH + COLUMN_GAP)}px`;
            itemEl.style.top = `${row * (ITEM_HEIGHT + ROW_GAP)}px`;
            itemEl.style.width = `${ITEM_WIDTH}px`;
            itemEl.style.height = isCreatorPage ? '' : `${ITEM_HEIGHT}px`;
            itemEl.style.margin = '0';
            itemEl.style.zIndex = '0';
            itemEl.style.transition = 'left 0.4s cubic-bezier(0.33, 1, 0.68, 1), top 0.4s cubic-bezier(0.33, 1, 0.68, 1)';
        }
    });

    triggerBackgroundWidthUpdate();
}

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.directory-grid');
    Array.from(grid.querySelectorAll('.directory-item')).forEach((item, i) => {
        item.dataset.index = i;
    });

    restoreStateFromLocalStorage();
    updateOrder();
    syncDomWithOrder(grid);

    // Синхронизируем чекбоксы по dataset.index
    Array.from(grid.querySelectorAll('.directory-item')).forEach(itemEl => {
        const index = parseInt(itemEl.dataset.index, 10);
        const checkbox = itemEl.querySelector('.hackyBox');
        if (checkbox) {
            checkbox.checked = items[index].isActive;
        }
    });

    lastGridCols = getGridCols();
    updatePositions();
    requestAnimationFrame(triggerBackgroundWidthUpdate);
});

window.addEventListener('resize', () => {
    const currentGridCols = getGridCols();
    if (currentGridCols !== lastGridCols && !isAnimating) {
        lastGridCols = currentGridCols;
        updatePositions();
        syncDomWithOrder(document.querySelector('.directory-grid'));
        requestAnimationFrame(triggerBackgroundWidthUpdate);
    }
});

document.querySelectorAll('.hackyBox').forEach(checkbox => {
    checkbox.addEventListener('click', (event) => {
        event.stopPropagation();
        if (isAnimating) return;

        const directoryItem = checkbox.closest('.directory-item');
        const grid = directoryItem.closest('.directory-grid');
        const index = parseInt(directoryItem.dataset.index, 10);

        if (checkbox.checked) {
            items[index].isActive = true;
            setTimeout(() => moveToFirst(index, grid, directoryItem), 450);
        } else {
            items[index].isActive = false;
            returnToAlphabeticalPosition(index, grid, directoryItem);
        }
        saveStateToLocalStorage();
    });
});