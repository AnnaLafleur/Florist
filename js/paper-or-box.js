document.addEventListener('DOMContentLoaded', function() {
    const boxRadio = document.getElementById('radio-3');
    const paperRadio = document.getElementById('radio-2');
    const packagingContainer = document.querySelector('.step-3 .right-section');
    const textureGrid = packagingContainer?.querySelector('.directory-grid[data-type="texture"]');
    const printGrid = packagingContainer?.querySelector('.directory-grid[data-type="print"]');
    const step2Grid = document.querySelector('.step-2 .right-section .directory-grid');

    if (!textureGrid || !printGrid) {
        return;
    }

    // 1. Контейнер для кнопок paper1 и paper2
    const paperButtonsContainer = document.createElement('div');
    paperButtonsContainer.className = 'paper-buttons-container';
    paperButtonsContainer.style.display = 'none'; // Ensure initially hidden

    // Переменные для управления анимациями
    let currentAnimation = null;
    let buttonsVisible = false;
    let isAnimating = false;
    let isTransitioning = false;

    // 2. Инициализация сеток с requestAnimationFrame
    function initializeGrids() {
        requestAnimationFrame(() => {
            const commonStylesStep3 = {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                columnGap: '15px',
                width: '100%',
                paddingRight: '15px',
                paddingBottom: '10px',
                boxSizing: 'border-box',
                height: 'calc(100% - 115px)',
                overflowY: 'auto',
                scrollbarGutter: 'stable',
                marginTop: '25px',
                paddingLeft: '10px',
                position: 'relative',
                willChange: 'transform'
            };

            const printGridStyles = {
                ...commonStylesStep3,
                columnGap: '10px',
                rowGap: '40px',
                gridAutoRows: 'minmax(205px, auto)'
            };

            // Apply styles to step-3 grids
            Object.assign(textureGrid.style, commonStylesStep3);
            Object.assign(printGrid.style, printGridStyles);

            // Ensure step-2 grid retains its original CSS styles with scrolling
            if (step2Grid) {
                step2Grid.style.height = 'calc(100% - 250px)';
                step2Grid.style.paddingBottom = '110px';
                step2Grid.style.marginTop = '140px';
                step2Grid.style.paddingLeft = '30px';
                step2Grid.style.paddingRight = '25px';
                step2Grid.style.paddingTop = '30px';
                step2Grid.style.overflowY = 'auto';
                step2Grid.style.scrollbarGutter = 'stable';
            }

            // Синхронизация print grid с heart.js
            const printItems = Array.from(printGrid.querySelectorAll('.directory-item'));
            printItems.forEach((item, index) => {
                item.dataset.index = index;
                let checkbox = item.querySelector('.hackyBox');
                if (!checkbox) {
                    checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'hackyBox';
                    item.appendChild(checkbox);
                }
                if (window.state?.prints?.items[index]) {
                    checkbox.checked = window.state.prints.items[index].isActive;
                }
            });

            // Начальное состояние
            if (boxRadio.checked) {
                textureGrid.style.display = 'none';
                printGrid.style.display = 'grid';
                paperButtonsContainer.style.display = 'none';
                buttonsVisible = false;
            } else {
                printGrid.style.display = 'none';
                textureGrid.style.display = 'grid';
                paperButtonsContainer.style.display = 'none';
                buttonsVisible = false;
                setTimeout(() => showButtons(), 800); // Show buttons with delay if paper is selected initially
            }

            // Обновляем позиции print grid
            if (window.updatePositions && boxRadio.checked) {
                window.updatePositions('prints');
            }
        });
    }

    initializeGrids();

    // 3. Анимация переворота
    function animateItems(grid) {
        if (grid.style.display === 'none') return;
        const items = Array.from(grid.querySelectorAll('.directory-item'));
        if (!items.length) return;
        requestAnimationFrame(() => {
            anime({
                targets: items,
                rotateY: [140, 0],
                duration: 1000,
                delay: anime.stagger(100),
                easing: 'cubicBezier(0.5,1,0.5,1.3)',
                begin: function() {
                    items.forEach(item => {
                        item.style.transformStyle = 'preserve-3d';
                        item.style.backfaceVisibility = 'hidden';
                    });
                },
                complete: function() {
                    items.forEach(item => {
                        const frontImg = item.querySelector('img:not(.backface-img)');
                        const backImg = item.querySelector('.backface-img');
                        if (frontImg && backImg) {
                            [frontImg.src, backImg.src] = [backImg.src, frontImg.src];
                        }
                    });
                }
            });
        });
    }

    // 4. Функция для показа кнопок
    function showButtons() {
        if (currentAnimation) currentAnimation.pause();

        buttonsVisible = true;
        paperButtonsContainer.style.display = 'flex';

        const buttons = paperButtonsContainer.querySelectorAll('.paper-btn');
        buttons.forEach(btn => btn.style.transform = 'translateY(100%)');

        currentAnimation = anime({
            targets: buttons,
            translateY: ['100%', '0%'],
            easing: 'spring(1, 80, 10, 0)',
            delay: anime.stagger(100),
            duration: 500
        });
    }

    // 5. Функция для скрытия кнопок
    function hideButtons() {
        if (currentAnimation) currentAnimation.pause();

        const buttons = paperButtonsContainer.querySelectorAll('.paper-btn');
        currentAnimation = anime({
            targets: buttons,
            translateY: ['0%', '100%'],
            easing: 'easeInOutQuad',
            delay: anime.stagger(100),
            duration: 300,
            complete: () => {
                if (!buttonsVisible) {
                    paperButtonsContainer.style.display = 'none';
                }
            }
        });
        buttonsVisible = false;
    }

    // 6. Переключение режимов
    function toggleGrids(showTexture) {
        if (isAnimating || isTransitioning) return;
        isAnimating = true;
        boxRadio.disabled = true;
        paperRadio.disabled = true;

        requestAnimationFrame(() => {
            if (typeof window.hideColorIconsImmediately === 'function') {
                window.hideColorIconsImmediately();
            }

            if (showTexture) {
                textureGrid.style.display = 'grid';
                printGrid.style.display = 'none';
                if (!buttonsVisible) {
                    setTimeout(() => showButtons(), 500); // Show buttons with delay
                }
                if (textureGrid.scrollTop !== 0) {
                    textureGrid.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
                animateItems(textureGrid);
            } else {
                buttonsVisible = false;
                hideButtons();
                printGrid.style.display = 'grid';
                textureGrid.style.display = 'none';
                if (printGrid.scrollTop !== 0) {
                    printGrid.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
                animateItems(printGrid);
            }

            if (typeof updateBackgroundWidth === 'function') {
                updateBackgroundWidth();
            }

            setTimeout(() => {
                isAnimating = false;
                boxRadio.disabled = false;
                paperRadio.disabled = false;
            }, 1000);
        });
    }

    // 7. Обработчик изменения размера окна
    window.addEventListener('resize', () => {
        requestAnimationFrame(() => {
            if (boxRadio.checked) {
                printGrid.style.display = 'grid';
                textureGrid.style.display = 'none';
                if (buttonsVisible) {
                    buttonsVisible = false;
                    paperButtonsContainer.style.display = 'none';
                }
            } else {
                textureGrid.style.display = 'grid';
                printGrid.style.display = 'none';
                if (!buttonsVisible && document.querySelector('.step-3.active')) {
                    setTimeout(() => showButtons(), 800);
                }
            }

            if (step2Grid) {
                step2Grid.style.height = 'calc(100% - 250px)';
                step2Grid.style.paddingBottom = '110px';
                step2Grid.style.marginTop = '140px';
                step2Grid.style.paddingLeft = '30px';
                step2Grid.style.paddingRight = '25px';
                step2Grid.style.paddingTop = '30px';
                step2Grid.style.overflowY = 'auto';
                step2Grid.style.scrollbarGutter = 'stable';
            }

            if (typeof updateBackgroundWidth === 'function') {
                updateBackgroundWidth();
            }

            if (window.updatePositions && boxRadio.checked) {
                window.updatePositions('prints');
            }
        });
    });

    // 8. Создание кнопок paper1/paper2
    function createPaperButton(iconSrc) {
        const button = document.createElement('button');
        button.className = 'paper-btn';
        button.setAttribute('type', 'button');
        button.setAttribute('aria-pressed', 'false');
        button.style.transform = 'translateY(100%)'; // Ensure buttons are off-screen initially

        const icon = document.createElement('img');
        icon.className = 'paper-btn-icon';
        icon.src = `https://raw.githubusercontent.com/AnnaLafleur/Florist/0b1a00087d550d9ddbf917eb0cd6b439ea34a708/img/${iconSrc}`;
        icon.alt = '';
        icon.loading = 'lazy';

        button.appendChild(icon);

        const outline = document.createElement('div');
        outline.className = 'paper-btn-outline';
        button.appendChild(outline);

        button.addEventListener('click', function(e) {
            if (this.classList.contains('active')) return;

            e.stopPropagation();

            document.querySelectorAll('.paper-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.style.boxShadow = 'none';
                btn.setAttribute('aria-pressed', 'false');
            });

            this.classList.add('active');
            this.style.boxShadow = '0 0 0 4px #fedfd7';
            this.setAttribute('aria-pressed', 'true');

            anime({
                targets: this,
                scale: [1.1, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        button.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.1,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });

        button.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: this.classList.contains('active') ? 1 : 1,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });

        return button;
    }

    // 9. Инициализация кнопок
    function createPaperButtons() {
        paperButtonsContainer.innerHTML = '';

        const paperButton1 = createPaperButton('paper1.svg');
        const paperButton2 = createPaperButton('paper2.svg');

        paperButton1.classList.add('active');
        paperButton1.style.boxShadow = '0 0 0 4px #fedfd7';

        paperButtonsContainer.appendChild(paperButton1);
        paperButtonsContainer.appendChild(paperButton2);

        const step3Section = document.querySelector('.step-3');
        if (step3Section) {
            const existingContainer = step3Section.querySelector('.paper-buttons-container');
            if (existingContainer) existingContainer.remove();
            step3Section.appendChild(paperButtonsContainer);
        }
    }

    // 10. Стили
    const style = document.createElement('style');
    style.textContent = `
        .step-3 .paper-buttons-container {
            position: fixed;
            left: calc(45vw - 30px);
            bottom: 30px;
            display: none;
            flex-direction: row;
            gap: 20px;
            z-index: 1000;
            will-change: transform;
        }

        .paper-btn {
            width: 65px;
            height: 65px;
            border-radius: 50%;
            background: #fd8262;
            border: none;
            cursor: pointer;
            padding: 0;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
            transform: translateY(100%);
            transform-origin: center;
            will-change: transform;
            transition: box-shadow 0.2s ease;
            pointer-events: auto;
        }

        .paper-btn.active {
            cursor: pointer;
        }

        .paper-btn-outline {
            position: absolute;
            top: -8px;
            left: -8px;
            right: -8px;
            bottom: -8px;
            border: 4px solid #fedfd7;
            border-radius: 50%;
            display: none;
            pointer-events: none;
        }

        .paper-btn.active .paper-btn-outline {
            display: block;
        }

        .paper-btn-icon {
            width: 40px;
            height: 40px;
            object-fit: contain;
            pointer-events: none;
            position: relative;
            z-index: 1;
        }

        .directory-item {
            perspective: 1000px;
            transform-style: preserve-3d;
            backface-visibility: hidden;
            cursor: pointer;
            min-width: 230px;
            max-width: 230px;
            flex-shrink: 0;
            user-select: none;
            margin: 0;
            min-height: auto;
            margin-top: 5px;
            position: relative;
        }

        .step-3 .right-section .directory-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
            row-gap: 15px;
            column-gap: 15px;
            width: 100%;
            min-width: 230px;
            margin-top: 25px;
            padding-left: 10px;
            padding-right: 15px;
            padding-bottom: 10px;
            box-sizing: border-box;
            height: calc(100% - 115px);
            overflow-y: auto;
            scrollbarGutter: stable;
            position: relative;
        }

        .step-3 .right-section .directory-grid[data-type="print"] {
            grid-row-gap: 40px;
            grid-auto-rows: minmax(205px, auto);
            column-gap: 10px;
        }

        .step-3 .right-section .directory-grid::-webkit-scrollbar {
            width: 8px;
        }

        .step-3 .right-section .directory-grid::-webkit-scrollbar-track {
            background: transparent;
        }

        .step-3 .right-section .directory-grid::-webkit-scrollbar-thumb {
            background: #ffffff;
            border-radius: 4px;
        }

        .step-3 .right-section .directory-grid::-webkit-scrollbar-thumb:hover {
            background: #fed7cd;
        }

        .hackyBox {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 10;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // 11. Инициализация системы
    createPaperButtons();

    // 12. Добавление обработчиков для чекбоксов print grid
    printGrid.addEventListener('click', (event) => {
        const checkbox = event.target.closest('.hackyBox');
        if (!checkbox) return;

        event.stopPropagation();
        const directoryItem = checkbox.closest('.directory-item');
        if (!directoryItem) return;

        const index = parseInt(directoryItem.dataset.index, 10);
        if (isNaN(index) || index < 0 || index >= window.state?.prints?.items.length) return;

        isAnimating = true;
        window.state.prints.items[index].isActive = checkbox.checked;
        window.saveStateToLocalStorage('prints');

        if (checkbox.checked) {
            setTimeout(() => {
                window.moveToFirst(index, printGrid, directoryItem, 'prints');
                animateItems(printGrid);
                isAnimating = false;
            }, 450);
        } else {
            window.returnToPosition(index, printGrid, directoryItem, 'prints');
            animateItems(printGrid);
            setTimeout(() => {
                isAnimating = false;
            }, 1450);
        }

        if (window.updatePositions) {
            window.updatePositions('prints');
        }
    });

    // 13. Добавление обработчиков для чекбоксов texture grid
    textureGrid.addEventListener('click', (event) => {
        const checkbox = event.target.closest('.hackyBox');
        if (!checkbox) return;

        event.stopPropagation();
        const directoryItem = checkbox.closest('.directory-item');
        if (!directoryItem) return;

        const index = parseInt(directoryItem.dataset.index, 10);
        if (isNaN(index) || index < 0 || index >= window.state?.step3?.items.length) return;

        isAnimating = true;
        window.state.step3.items[index].isActive = checkbox.checked;
        window.saveStateToLocalStorage('step3');

        if (checkbox.checked) {
            setTimeout(() => {
                window.moveToFirst(index, textureGrid, directoryItem, 'step3');
                animateItems(textureGrid);
                isAnimating = false;
            }, 400);
        } else {
            window.returnToPosition(index, textureGrid, directoryItem, 'step3');
            animateItems(textureGrid);
            setTimeout(() => {
                isAnimating = false;
            }, 1450);
        }

        if (window.updatePositions) {
            window.updatePositions('step3');
        }
    });

    // Обработчики событий для переключения
    boxRadio.addEventListener('change', () => {
        if (isAnimating || isTransitioning) return;
        if (typeof window.hideColorIconsImmediately === 'function') {
            window.hideColorIconsImmediately();
        }
        toggleGrids(false);
        if (window.updatePositions) window.updatePositions('prints');
    });

    paperRadio.addEventListener('change', () => {
        if (isAnimating || isTransitioning) return;
        if (typeof window.hideColorIconsImmediately === 'function') {
            window.hideColorIconsImmediately();
        }
        toggleGrids(true);
        if (window.updatePositions) window.updatePositions('step3');
    });

    // Обработчик для перехода на шаг 3
    document.addEventListener('transitionEnd', (e) => {
        if (e.detail?.step === 'step-3' && paperRadio.checked) {
            setTimeout(() => {
                showButtons();
            }, 400); // Задержка после завершения анимации перехода
        }
    });

    // Установка начального состояния
    toggleGrids(!boxRadio.checked);

    // Обработчик для отслеживания перехода между шагами
    document.addEventListener('transitionStart', () => {
        isTransitioning = true;
        if (buttonsVisible) {
            hideButtons();
        }
    });

    document.addEventListener('transitionEnd', () => {
        isTransitioning = false;
    });
});