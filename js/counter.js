document.addEventListener('DOMContentLoaded', function() {
    const stepper = document.querySelector('.stepper');
    const countElement = stepper.querySelector('.count');
    const arrowTop = document.querySelector('.arrow-top');
    const arrowBottom = document.querySelector('.arrow-bottom');
    const formDisplay = document.querySelector('.form-display');
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    const shapes = ['form-circle', 'form-square', 'form-oval', 'form-rectangle'];

    let count = 1;
    let isDragging = false;
    let dragTarget = null;
    let startY = 0;
    let startX = 0;
    let arrowInterval = null;
    const sensitivity = 80;
    const maxOffset = 10;
    let currentShapeIndex = 0;

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

    // Инициализация - исправлено отображение начального значения
    countElement.textContent = '1';
    updateCount(1);
    updateShape(0);
    updateArrowVisibility();

    // Обобщенная логика перетаскивания
    function startDragging(e, element, isVertical = true) {
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

    // Обобщенная логика для стрелок
    function startArrowChange(direction, isCounter = true) {
        const change = isCounter
            ? (direction === 'up' ? 2 : -2)
            : (direction === 'right' ? 1 : -1);
        const element = isCounter ? stepper : formDisplay;
        const transformProp = isCounter ? 'translateY' : 'translateX';
        const offset = isCounter ? (direction === 'up' ? -6 : 6) : (direction === 'right' ? 6 : -6);

        // Первое изменение
        if (isCounter) {
            updateCount(count + change);
        } else {
            const newIndex = currentShapeIndex + change;
            if (newIndex >= 0 && newIndex < shapes.length) {
                updateShape(newIndex);
            }
        }

        // Анимация
        element.style.transition = 'transform 0.1s ease-out';
        element.style.transform = `${transformProp}(${offset}px)`;

        // Интервал для повторных изменений
        arrowInterval = setInterval(() => {
            if (isCounter) {
                updateCount(count + change);
            } else {
                const newIndex = currentShapeIndex + change;
                if (newIndex >= 0 && newIndex < shapes.length) {
                    updateShape(newIndex);
                }
            }
        }, 200);
    }

    function stopArrowChange(element, isVertical = true) {
        clearInterval(arrowInterval);
        arrowInterval = null;
        element.style.transition = 'transform 0.3s ease-out';
        element.style.transform = isVertical ? 'translateY(0)' : 'translateX(0)';
    }

    // Обработчики для стрелок счетчика
    arrowTop.addEventListener('mousedown', () => startArrowChange('up', true));
    arrowBottom.addEventListener('mousedown', () => startArrowChange('down', true));

    // Обработчики для стрелок форм
    arrowLeft.addEventListener('mousedown', () => startArrowChange('left', false));
    arrowRight.addEventListener('mousedown', () => startArrowChange('right', false));

    [arrowTop, arrowBottom, arrowLeft, arrowRight].forEach(btn => {
        btn.addEventListener('mouseup', () => {
            stopArrowChange(btn === arrowTop || btn === arrowBottom ? stepper : formDisplay, btn === arrowTop || btn === arrowBottom);
        });
        btn.addEventListener('mouseleave', () => {
            stopArrowChange(btn === arrowTop || btn === arrowBottom ? stepper : formDisplay, btn === arrowTop || btn === arrowBottom);
        });

        // Исправленный обработчик клика для одиночных нажатий
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!arrowInterval) {
                const isCounter = btn === arrowTop || btn === arrowBottom;
                const element = isCounter ? stepper : formDisplay;
                const isVertical = isCounter;
                const change = isCounter
                    ? (btn === arrowTop ? 0 : 0)
                    : (btn === arrowRight ? 0 : 0);
                const offset = isCounter
                    ? (btn === arrowTop ? -6 : 6)
                    : (btn === arrowRight ? 6 : -6);
                const transformProp = isVertical ? 'translateY' : 'translateX';

                if (isCounter) {
                    updateCount(count + change);
                } else {
                    const newIndex = currentShapeIndex + change;
                    if (newIndex >= 0 && newIndex < shapes.length) {
                        updateShape(newIndex);
                    }
                }

                // Мини-анимация
                element.style.transition = 'transform 0.1s ease-out';
                element.style.transform = `${transformProp}(${offset}px)`;
                setTimeout(() => {
                    element.style.transition = 'transform 0.3s ease-out';
                    element.style.transform = `${transformProp}(0)`;
                }, 100);
            }
        });
    });
});