document.addEventListener('DOMContentLoaded', function() {
    const stepper = document.querySelector('.stepper');
    const countElement = stepper.querySelector('.count');
    const arrowTop = document.querySelector('.arrow-top');
    const arrowBottom = document.querySelector('.arrow-bottom');
    const formDisplay = document.querySelector('.form-display');
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    const shapes = ['form-circle', 'form-square', 'form-rectangle'];

    let count = 5;
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

    function getOddNumber(num) {
        return Math.max(1, Math.min(15, num % 2 === 0 ? num - 1 : num));
    }

    function updateCount(newCount) {
        const validatedCount = getOddNumber(newCount);
        if (validatedCount !== count) {
            count = validatedCount;
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

    // Обобщенная логика перетаскивания
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

    // Перетаскивание для счетчика
    stepper.addEventListener('mousedown', function(e) {
        if (e.target.closest('.arrow-btn')) return;
        startDragging(e, stepper, true);
    });

    // Перетаскивание для переключателя форм
    formDisplay.addEventListener('mousedown', function(e) {
        if (e.target.closest('.arrow-btn')) return;
        startDragging(e, formDisplay, false);
    });

    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', stopDragging);

    // Обобщенная функция для изменения значений
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

    // Обработчики для стрелок (зажатие)
    function startContinuousChange(btn) {
        if (arrowInterval) return;
        changeValue(btn);
        arrowInterval = setInterval(() => changeValue(btn), 200);
    }

    function stopContinuousChange() {
        clearInterval(arrowInterval);
        arrowInterval = null;
    }

    // Назначение обработчиков
    [arrowTop, arrowBottom, arrowLeft, arrowRight].forEach(btn => {
        // Для кликов
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            changeValue(btn);
        });

        // Для зажатия
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startContinuousChange(btn);
        });

        btn.addEventListener('mouseup', stopContinuousChange);
        btn.addEventListener('mouseleave', stopContinuousChange);
    });
});