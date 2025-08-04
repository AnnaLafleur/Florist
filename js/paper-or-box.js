document.addEventListener('DOMContentLoaded', function() {
    const boxRadio = document.getElementById('radio-3');
    const paperRadio = document.getElementById('radio-2');
    const packagingContainer = document.querySelector('.step-3 .right-section');
    const textureGrid = packagingContainer?.querySelector('.directory-grid[data-type="texture"]');
    const printGrid = packagingContainer?.querySelector('.directory-grid[data-type="print"]');
    const step2Grid = document.querySelector('.step-2 .right-section .directory-grid');
    const navMenu = document.querySelector('nav.creator-nav');

    if (!textureGrid || !printGrid || !boxRadio || !paperRadio || !navMenu) {
        return;
    }

    // Контейнер для кнопок paper1 и paper2
    const paperButtonsContainer = document.createElement('div');
    paperButtonsContainer.className = 'paper-buttons-container';
    paperButtonsContainer.style.display = 'none';

    // Создание контейнера для полноэкранного фона
    const backgroundContainer = document.createElement('div');
    backgroundContainer.className = 'step-3-background';
    backgroundContainer.style.display = 'none';
    backgroundContainer.style.position = 'fixed';
    backgroundContainer.style.top = '0';
    backgroundContainer.style.right = '0';
    backgroundContainer.style.width = '45vw';
    backgroundContainer.style.height = '100vh';
    backgroundContainer.style.background = '#fd8264';
    backgroundContainer.style.borderRadius = '60px 0 0 60px';
    backgroundContainer.style.zIndex = '0';
    const step3Section = document.querySelector('.step-3');
    if (step3Section) {
        step3Section.appendChild(backgroundContainer);
    }

    // Переменные для управления анимациями
    let currentAnimation = null;
    let buttonsVisible = false;
    let isAnimating = false;
    let isTransitioning = false;

    // Получение выбранной формы
    const shapes = ['form-circle', 'form-square', 'form-rectangle'];
    const getSelectedShape = () => {
        const activeShape = document.querySelector('.form-shape.active');
        return activeShape ? activeShape.className.split(' ').find(cls => shapes.includes(cls)) : 'form-circle';
    };

    // Функция для обновления адаптивного фона и стилей меню
    function updateBackgroundWidth() {
        const activeGrid = document.querySelector('.step-3.active .directory-grid[style*="display: grid"]');
        if (!activeGrid) return;

        const rightSection = activeGrid.closest('.right-section');
        if (!rightSection) return;

        const cellWidth = 230;
        const columnGap = 15;
        const extraPadding = 100;
        const scrollbarWidth = 8;

        rightSection.style.width = 'auto';
        activeGrid.offsetHeight; // Принудительный рефлоу

        const availableWidth = window.innerWidth * 0.45 - 80;
        const columns = Math.max(1, Math.floor((availableWidth + columnGap) / (cellWidth + columnGap)));

        // Фиксированный padding-right сохраняется
        activeGrid.style.paddingRight = '23px';

        const totalWidth = columns * cellWidth + (columns - 1) * columnGap + extraPadding + scrollbarWidth;
        rightSection.style.width = `${totalWidth}px`;
        backgroundContainer.style.width = `${totalWidth}px`; // Синхронизация ширины фона
    }

    // Инициализация сеток
    function initializeGrids() {
        requestAnimationFrame(() => {
            // Стили с фиксированным padding-right
            const commonStylesStep3 = {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                columnGap: '15px',
                width: '100%',
                paddingRight: '23px', // Фиксированный отступ
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

            Object.assign(textureGrid.style, commonStylesStep3);
            Object.assign(printGrid.style, printGridStyles);

            // Инициализация step2 grid
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

            // Инициализация состояния
            const selectedShape = getSelectedShape();
            const radioContainer = boxRadio.parentElement;
            if (selectedShape !== 'form-circle') {
                textureGrid.style.display = 'none';
                printGrid.style.display = 'grid';
                paperButtonsContainer.style.display = 'none';
                radioContainer.style.display = 'none';
                buttonsVisible = false;
                packagingContainer.style.background = 'transparent'; // Убираем фон у right-section
                navMenu.style.background = '#ff957a'; // Светлый фон для меню
                navMenu.style.boxShadow = '0 0 0 7px #fd8262'; // Розовая обводка
            } else {
                if (boxRadio.checked) {
                    textureGrid.style.display = 'none';
                    printGrid.style.display = 'grid';
                    paperButtonsContainer.style.display = 'none';
                    buttonsVisible = false;
                    backgroundContainer.style.display = 'none';
                    packagingContainer.style.background = ''; // Восстанавливаем оригинальный фон
                    navMenu.style.background = ''; // Сбрасываем фон меню
                    navMenu.style.boxShadow = ''; // Сбрасываем обводку
                } else {
                    printGrid.style.display = 'none';
                    textureGrid.style.display = 'grid';
                    paperButtonsContainer.style.display = 'none';
                    buttonsVisible = false;
                    backgroundContainer.style.display = 'none';
                    packagingContainer.style.background = ''; // Восстанавливаем оригинальный фон
                    navMenu.style.background = ''; // Сбрасываем фон меню
                    navMenu.style.boxShadow = ''; // Сбрасываем обводку
                    setTimeout(() => showButtons(), 800);
                }
            }

            updateBackgroundWidth();
        });
    }

    // Анимация переворота элементов
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

    // Функции для работы с кнопками
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

    // Переключение между режимами
    function toggleGrids(showTexture) {
        if (isAnimating || isTransitioning) return;
        const selectedShape = getSelectedShape();
        const radioContainer = boxRadio.parentElement;

        if (selectedShape !== 'form-circle') {
            textureGrid.style.display = 'none';
            printGrid.style.display = 'grid';
            paperButtonsContainer.style.display = 'none';
            radioContainer.style.display = 'none';
            buttonsVisible = false;
            packagingContainer.style.background = 'transparent'; // Убираем фон у right-section
            navMenu.style.background = '#ff957a'; // Светлый фон для меню
            navMenu.style.boxShadow = '0 0 0 7px #fd8262'; // Розовая обводка
            animateItems(printGrid);
            updateBackgroundWidth();
            if (window.updatePositions) window.updatePositions('prints');
            return;
        }

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
                backgroundContainer.style.display = 'none';
                packagingContainer.style.background = ''; // Восстанавливаем оригинальный фон
                navMenu.style.background = ''; // Сбрасываем фон меню
                navMenu.style.boxShadow = ''; // Сбрасываем обводку
                if (!buttonsVisible) {
                    setTimeout(() => showButtons(), 500);
                }
                animateItems(textureGrid);
            } else {
                buttonsVisible = false;
                hideButtons();
                printGrid.style.display = 'grid';
                textureGrid.style.display = 'none';
                backgroundContainer.style.display = 'none';
                packagingContainer.style.background = ''; // Восстанавливаем оригинальный фон
                navMenu.style.background = ''; // Сбрасываем фон меню
                navMenu.style.boxShadow = ''; // Сбрасываем обводку
                animateItems(printGrid);
            }

            updateBackgroundWidth();

            setTimeout(() => {
                isAnimating = false;
                boxRadio.disabled = false;
                paperRadio.disabled = false;
            }, 1000);
        });
    }

    // Обработчик изменения размера окна
    window.addEventListener('resize', () => {
        requestAnimationFrame(() => {
            const selectedShape = getSelectedShape();
            const radioContainer = boxRadio.parentElement;

            if (selectedShape !== 'form-circle') {
                printGrid.style.display = 'grid';
                textureGrid.style.display = 'none';
                paperButtonsContainer.style.display = 'none';
                radioContainer.style.display = 'none';
                buttonsVisible = false;
                packagingContainer.style.background = 'transparent'; // Убираем фон у right-section
                navMenu.style.background = '#ff957a'; // Светлый фон для меню
                navMenu.style.boxShadow = '0 0 0 7px #fd8262'; // Розовая обводка
            } else {
                if (boxRadio.checked) {
                    printGrid.style.display = 'grid';
                    textureGrid.style.display = 'none';
                    backgroundContainer.style.display = 'none';
                    packagingContainer.style.background = ''; // Восстанавливаем оригинальный фон
                    navMenu.style.background = ''; // Сбрасываем фон меню
                    navMenu.style.boxShadow = ''; // Сбрасываем обводку
                    if (buttonsVisible) {
                        buttonsVisible = false;
                        paperButtonsContainer.style.display = 'none';
                    }
                } else {
                    textureGrid.style.display = 'grid';
                    printGrid.style.display = 'none';
                    backgroundContainer.style.display = 'none';
                    packagingContainer.style.background = ''; // Восстанавливаем оригинальный фон
                    navMenu.style.background = ''; // Сбрасываем фон меню
                    navMenu.style.boxShadow = ''; // Сбрасываем обводку
                    if (!buttonsVisible && document.querySelector('.step-3.active')) {
                        setTimeout(() => showButtons(), 800);
                    }
                }
                radioContainer.style.display = '';
            }

            updateBackgroundWidth();

            if (window.updatePositions && (boxRadio.checked || selectedShape !== 'form-circle')) {
                window.updatePositions('prints');
            }
        });
    });

    // Создание кнопок paper
    function createPaperButton(iconSrc) {
        const button = document.createElement('button');
        button.className = 'paper-btn';
        button.setAttribute('type', 'button');
        button.setAttribute('aria-pressed', 'false');
        button.style.transform = 'translateY(100%)';

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
            anime({ targets: this, scale: [1.1, 1], duration: 300, easing: 'easeOutQuad' });
        });

        button.addEventListener('mouseenter', function() {
            anime({ targets: this, scale: 1.1, duration: 200, easing: 'easeOutQuad' });
        });

        button.addEventListener('mouseleave', function() {
            anime({ targets: this, scale: this.classList.contains('active') ? 1 : 1, duration: 200, easing: 'easeOutQuad' });
        });

        return button;
    }

    // Инициализация кнопок
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

    // Стили с фиксированным padding-right
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
            padding-right: 23px;
            padding-bottom: 10px;
            box-sizing: border-box;
            height: calc(100% - 115px);
            overflow-y: auto;
            scrollbar-gutter: stable;
            position:060px;
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

    // Инициализация системы
    createPaperButtons();
    initializeGrids();

    // Обработчики событий для чекбоксов
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
            setTimeout(() => { isAnimating = false; }, 1450);
        }

        if (window.updatePositions) {
            window.updatePositions('prints');
        }
    });

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
            setTimeout(() => { isAnimating = false; }, 1450);
        }

        if (window.updatePositions) {
            window.updatePositions('step3');
        }
    });

    // Обработчики событий для переключения режимов
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

    // Обработчики для перехода между шагами
    document.addEventListener('transitionEnd', (e) => {
        if (e.detail?.step === 'step-3') {
            const selectedShape = getSelectedShape();
            const radioContainer = boxRadio.parentElement;
            if (selectedShape === 'form-circle' && paperRadio.checked) {
                radioContainer.style.display = '';
                backgroundContainer.style.display = 'none';
                packagingContainer.style.background = ''; // Восстанавливаем оригинальный фон
                navMenu.style.background = ''; // Сбрасываем фон меню
                navMenu.style.boxShadow = ''; // Сбрасываем обводку
                setTimeout(() => showButtons(), 400);
            } else {
                paperButtonsContainer.style.display = 'none';
                radioContainer.style.display = selectedShape === 'form-circle' ? '' : 'none';
                textureGrid.style.display = 'none';
                printGrid.style.display = 'grid';
                backgroundContainer.style.display = 'block'; // Показываем фон после завершения анимации
                packagingContainer.style.background = 'transparent'; // Убираем фон у right-section
                navMenu.style.background = '#ff957a'; // Светлый фон для меню
                navMenu.style.boxShadow = '0 0 0 7px #fd8262'; // Розовая обводка
                updateBackgroundWidth();
                if (window.updatePositions) window.updatePositions('prints');
            }
        }
    });

    document.addEventListener('transitionStart', () => {
        isTransitioning = true;
        if (buttonsVisible) hideButtons();
        backgroundContainer.style.display = 'none'; // Скрываем фон во время перехода
        const selectedShape = getSelectedShape();
        if (selectedShape !== 'form-circle') {
            packagingContainer.style.background = 'transparent'; // Убираем фон у right-section во время перехода
            navMenu.style.background = '#ff957a'; // Светлый фон для меню
            navMenu.style.boxShadow = '0 0 0 7px #fd8262'; // Розовая обводка
        }
    });

    document.addEventListener('transitionEnd', () => {
        isTransitioning = false;
    });

    // Установка начального состояния
    toggleGrids(!boxRadio.checked);
});