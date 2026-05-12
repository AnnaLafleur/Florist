document.addEventListener('DOMContentLoaded', function() {
    const boxRadio = document.getElementById('radio-3');
    const paperRadio = document.getElementById('radio-2');
    const packagingContainer = document.querySelector('.step-3 .right-section');
    const textureGrid = packagingContainer?.querySelector('.directory-grid[data-type="texture"]');
    const printGrid = packagingContainer?.querySelector('.directory-grid[data-type="print"]');
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
    let currentGridAnimation = null;
    let currentButtonAnimation = null;
    let buttonsVisible = false;
    let isAnimating = false;
    let isTransitioning = false;
    let currentPaperButton = 'paper1';
    const scrollPositions = { paper1: 0, paper2: 0 };

    // Initialize state for cell selection
    window.state = window.state || {};
    window.state.step3 = window.state.step3 || { items: [], selectedPaper1Id: null, selectedPaper2Id: null };
    window.state.prints = window.state.prints || { items: [], selectedPrintId: null };
    window.state.step3.items = window.state.step3.items || [];
    window.state.prints.items = window.state.prints.items || [];

    // Текущее состояние для выделенных ячеек
    let step3State = {
        lastSelectedPrint: null,
        lastSelectedPaper1: null,
        lastSelectedPaper2: null
    };
    window.step3State = step3State;

    // Функция для обновления выделения ячеек
    function updateCellSelection() {
        // Убираем все выделения
        document.querySelectorAll('.step-3 .item-content.selected').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('.step-3 .item-content__input[type="radio"]:checked').forEach(radio => {
            radio.checked = false;
        });

        // Восстанавливаем выделение для активной вкладки
        if (boxRadio.checked && step3State.lastSelectedPrint) {
            const item = printGrid.querySelector(`[data-texture-name="${step3State.lastSelectedPrint}"]`);
            if (item) {
                const radio = item.querySelector('.item-content__input');
                const content = item.querySelector('.item-content');
                if (radio && content) {
                    radio.checked = true;
                    content.classList.add('selected');
                }
            }
        } else if (paperRadio.checked) {
            const selectedId = currentPaperButton === 'paper1' ? window.state.step3.selectedPaper1Id : window.state.step3.selectedPaper2Id;
            const lastSelected = currentPaperButton === 'paper1' ? step3State.lastSelectedPaper1 : step3State.lastSelectedPaper2;
            if (lastSelected) {
                const item = textureGrid.querySelector(`[data-texture-name="${lastSelected}"]`);
                if (item) {
                    const radio = item.querySelector('.item-content__input');
                    const content = item.querySelector('.item-content');
                    if (radio && content && (item.dataset.id || item.dataset.index) === selectedId) {
                        radio.checked = true;
                        content.classList.add('selected');
                    }
                }
            }
        }

        const printItems = printGrid.querySelectorAll('.directory-item');
        printItems.forEach(item => {
            const radio = item.querySelector('.item-content__input');
            if (radio) {
                const itemId = item.dataset.id || item.dataset.index || '0';
                radio.checked = itemId === window.state.prints.selectedPrintId;
                if (radio.checked) {
                    item.querySelector('.item-content').classList.add('selected');
                }
            }
        });

        window.saveStateToLocalStorage('step3');
        window.saveStateToLocalStorage('prints');
    }

    // Обработчик кликов для элементов print
    function handlePrintItemClick(event, grid, type) {
        let item = event.target.closest('.directory-item');
        if (!item) {
            item = event.target.closest('label.directory-item');
        }
        if (!item) return;

        const itemName = item.dataset.textureName;
        if (!itemName) return;

        if (event.target.closest('.hackyBox')) return;

        event.stopPropagation();
        event.preventDefault();

        const radio = item.querySelector('.item-content__input');
        const content = item.querySelector('.item-content');
        if (!radio || !content) return;

        // Убираем предыдущее выделение
        grid.querySelectorAll('.item-content.selected').forEach(el => {
            el.classList.remove('selected');
        });
        grid.querySelectorAll('.item-content__input[type="radio"]:checked').forEach(el => {
            el.checked = false;
        });

        // Устанавливаем новое выделение
        radio.checked = true;
        content.classList.add('selected');
        step3State.lastSelectedPrint = itemName;
        window.state.prints.selectedPrintId = item.dataset.id || item.dataset.index || '0';

        window.saveStateToLocalStorage('prints');
    }

    // Обработчик кликов для элементов texture
    function handleTextureItemClick(event, grid) {
        let item = event.target.closest('.directory-item');
        if (!item) {
            item = event.target.closest('label.directory-item');
        }
        if (!item) return;

        const itemName = item.dataset.textureName;
        if (!itemName) return;

        if (event.target.closest('.hackyBox')) return;

        event.stopPropagation();
        event.preventDefault();

        const radio = item.querySelector('.item-content__input');
        const content = item.querySelector('.item-content');
        if (!radio || !content) return;

        const itemId = item.dataset.id || item.dataset.index || '0';

        // Убираем предыдущее выделение
        grid.querySelectorAll('.item-content.selected').forEach(el => {
            el.classList.remove('selected');
        });
        grid.querySelectorAll('.item-content__input[type="radio"]:checked').forEach(el => {
            el.checked = false;
        });

        // Устанавливаем новое выделение
        radio.checked = true;
        content.classList.add('selected');
        if (currentPaperButton === 'paper1') {
            step3State.lastSelectedPaper1 = itemName;
            window.state.step3.selectedPaper1Id = itemId;
        } else {
            step3State.lastSelectedPaper2 = itemName;
            window.state.step3.selectedPaper2Id = itemId;
        }

        window.saveStateToLocalStorage('step3');
    }

    // Добавляем обработчики на сами элементы
    function addDirectHandlers() {
        printGrid.querySelectorAll('.directory-item').forEach(item => {
            item.addEventListener('click', function(event) {
                handlePrintItemClick(event, printGrid, 'print');
            });
        });
        textureGrid.querySelectorAll('.directory-item').forEach(item => {
            item.addEventListener('click', function(event) {
                handleTextureItemClick(event, textureGrid);
            });
        });
    }

    // Получение выбранной формы
    const shapes = ['form-circle', 'form-square', 'form-rectangle'];
    const getSelectedShape = () => {
        const activeShape = document.querySelector('.form-shape.active');
        return activeShape ? activeShape.className.split(' ').find(cls => shapes.includes(cls)) : 'form-circle';
    };
    window.getSelectedShape = getSelectedShape;

    // Функция для получения начальных ID ячеек
    function initializeCellIds() {
        const textureItems = textureGrid.querySelectorAll('.directory-item');
        if (textureItems.length > 0 && window.state.step3.selectedPaper1Id === null) {
            window.state.step3.selectedPaper1Id = textureItems[0].dataset.id || textureItems[0].dataset.index || '0';
            step3State.lastSelectedPaper1 = textureItems[0].dataset.textureName;
        }
        if (textureItems.length > 1 && window.state.step3.selectedPaper2Id === null) {
            window.state.step3.selectedPaper2Id = textureItems[1].dataset.id || textureItems[1].dataset.index || '1';
            step3State.lastSelectedPaper2 = textureItems[1].dataset.textureName;
        }
        const printItems = printGrid.querySelectorAll('.directory-item');
        if (printItems.length > 0 && window.state.prints.selectedPrintId === null) {
            window.state.prints.selectedPrintId = printItems[0].dataset.id || printItems[0].dataset.index || '0';
            step3State.lastSelectedPrint = printItems[0].dataset.textureName;
        }
        window.saveStateToLocalStorage('step3');
        window.saveStateToLocalStorage('prints');
    }

    // Функция для обновления адаптивного фона
    function updateBackgroundWidth() {
        const activeGrid = document.querySelector('.step-3.active .directory-grid[style*="display: grid"]');
        if (!activeGrid) return;

        // Не менять стили на ПК версии - они жестко зафиксированы в CSS
        if (window.innerWidth > 768) {
            // Сброс инлайн-стилей если они были установлены на мобильной
            const rightSection = activeGrid.closest('.right-section');
            if (rightSection) rightSection.style.width = '';
            backgroundContainer.style.width = '';
            return;
        }

        const rightSection = activeGrid.closest('.right-section');
        if (!rightSection) return;

        const cellWidth = 240;
        const isPrint = activeGrid.dataset.type === 'print';
        const columnGap = 8;
        const extraPadding = 100;
        const scrollbarWidth = 8;

        rightSection.style.width = 'auto';
        activeGrid.offsetHeight;

        const availableWidth = window.innerWidth * 0.45 - 80;
        const columns = Math.max(1, Math.floor((availableWidth + columnGap) / (cellWidth + columnGap)));

        const totalWidth = columns * cellWidth + (columns - 1) * columnGap + extraPadding + scrollbarWidth;
        rightSection.style.width = `${totalWidth}px`;
        backgroundContainer.style.width = `${totalWidth}px`;
    }

    // Инициализация сеток
    function initializeGrids() {
        requestAnimationFrame(() => {
            const commonStylesStep3 = {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                columnGap: '15px',
                width: '100%',
                paddingBottom: '20px',
                boxSizing: 'border-box',
                height: 'calc(100% - 125px)',
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

            const selectedShape = getSelectedShape();
            const radioContainer = boxRadio.parentElement;
            if (selectedShape !== 'form-circle') {
                textureGrid.style.display = 'none';
                printGrid.style.display = 'grid';
                paperButtonsContainer.style.display = 'none';
                buttonsVisible = false;
                radioContainer.style.display = 'none';
                packagingContainer.style.background = 'transparent';
                navMenu.style.background = '#ff957a';
                navMenu.style.boxShadow = '0 0 0 7px #fd8262';
            } else {
                if (boxRadio.checked) {
                    textureGrid.style.display = 'none';
                    printGrid.style.display = 'grid';
                    paperButtonsContainer.style.display = 'none';
                    buttonsVisible = false;
                    backgroundContainer.style.display = 'none';
                    packagingContainer.style.background = '';
                    navMenu.style.background = '';
                    navMenu.style.boxShadow = '';
                    initializeCellIds();
                    updateCellSelection();
                    if (window.showColorIconsForSelected) window.showColorIconsForSelected();
                } else {
                    printGrid.style.display = 'none';
                    textureGrid.style.display = 'grid';
                    paperButtonsContainer.style.display = 'none';
                    buttonsVisible = false;
                    backgroundContainer.style.display = 'none';
                    packagingContainer.style.background = '';
                    navMenu.style.background = '';
                    navMenu.style.boxShadow = '';
                    showButtons();
                    textureGrid.scrollTop = scrollPositions[currentPaperButton];
                    initializeCellIds();
                    updateCellSelection();
                    if (window.showColorIconsForSelected) window.showColorIconsForSelected();
                }
            }

            updateBackgroundWidth();
        });
    }

    // Анимация поворота элементов
    function animateItems(grid) {
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
                            const frontImg = item.querySelector('img:not(.backface-img)');
                            const backImg = item.querySelector('.backface-img');
                            if (frontImg && backImg) {
                                [frontImg.src, backImg.src] = [backImg.src, frontImg.src];
                            }
                            item.style.transform = 'rotateY(0deg)';
                            item.offsetHeight;
                        });
                        currentGridAnimation = null;
                        isAnimating = false;
                        boxRadio.disabled = false;
                        paperRadio.disabled = false;
                        resolve();
                    }
                });
            });
        });
    }

    // Анимация поворота без смены изображений
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

    // Функции для работы с кнопками
    function showButtons() {
        if (buttonsVisible) return;
        buttonsVisible = true;
        paperButtonsContainer.style.display = 'flex';
        const buttons = paperButtonsContainer.querySelectorAll('.paper-btn');
        buttons.forEach(btn => btn.style.transform = 'translateY(150%)');
        if (currentButtonAnimation) {
            currentButtonAnimation.pause();
            currentButtonAnimation = null;
        }
        anime.remove(buttons);
        currentButtonAnimation = anime({
            targets: buttons,
            translateY: ['150%', '0%'],
            easing: 'spring(1, 80, 10, 0)',
            delay: anime.stagger(100),
            duration: 200,
            complete: () => {
                currentButtonAnimation = null;
            }
        });
    }

    function hideButtons() {
        if (!paperButtonsContainer.style.display || paperButtonsContainer.style.display === 'none') {
            buttonsVisible = false;
            return;
        }
        buttonsVisible = false;
        const buttons = paperButtonsContainer.querySelectorAll('.paper-btn');
        if (currentButtonAnimation) {
            currentButtonAnimation.pause();
            currentButtonAnimation = null;
        }
        anime.remove(buttons);
        currentButtonAnimation = anime({
            targets: buttons,
            translateY: ['0%', '150%'],
            easing: 'easeInOutQuad',
            delay: anime.stagger(100),
            duration: 300,
            complete: () => {
                paperButtonsContainer.style.display = 'none';
                buttons.forEach(btn => {
                    btn.style.transform = 'translateY(150%)';
                    btn.offsetHeight;
                });
                currentButtonAnimation = null;
            }
        });
    }

    // Переключение между режимами
    function toggleGrids(showTexture, isInitial = false) {
        const selectedShape = getSelectedShape();
        const radioContainer = boxRadio.parentElement;

        if (selectedShape !== 'form-circle') {
            textureGrid.style.display = 'none';
            printGrid.style.display = 'grid';
            paperButtonsContainer.style.display = 'none';
            buttonsVisible = false;
            radioContainer.style.display = 'none';
            packagingContainer.style.background = 'transparent';
            navMenu.style.background = '#ff957a';
            navMenu.style.boxShadow = '0 0 0 7px #fd8262';
            if (!isInitial) {
                const printItems = printGrid.querySelectorAll('.directory-item');
                if (currentGridAnimation) {
                    currentGridAnimation.pause();
                    isAnimating = false;
                    currentGridAnimation = null;
                }
                anime.remove(printItems);
                printItems.forEach(item => {
                    item.style.transform = 'rotateY(180deg)';
                    item.offsetHeight;
                });
                requestAnimationFrame(() => {
                    printGrid.scrollTo({ top: 0, behavior: 'smooth' });
                    animateItems(printGrid);
                });
            }
            updateBackgroundWidth();
            initializeCellIds();
            updateCellSelection();
            if (window.showColorIconsForSelected) window.showColorIconsForSelected();
            if (window.updatePositions) requestAnimationFrame(() => window.updatePositions('prints'));
            return;
        }

        if (currentGridAnimation) {
            currentGridAnimation.pause();
            isAnimating = false;
            currentGridAnimation = null;
        }
        const textureItems = textureGrid.querySelectorAll('.directory-item');
        const printItems = printGrid.querySelectorAll('.directory-item');
        anime.remove(textureItems);
        anime.remove(printItems);
        textureItems.forEach(item => {
            item.style.transform = 'rotateY(180deg)';
            item.style.transformStyle = 'preserve-3d';
            item.style.backfaceVisibility = 'hidden';
            item.offsetHeight;
        });
        printItems.forEach(item => {
            item.style.transform = 'rotateY(180deg)';
            item.offsetHeight;
        });

        requestAnimationFrame(() => {
            if (typeof window.hideColorIconsImmediately === 'function') {
                window.hideColorIconsImmediately();
            }

            if (showTexture) {
                textureGrid.style.display = 'grid';
                printGrid.style.display = 'none';
                backgroundContainer.style.display = 'none';
                packagingContainer.style.background = '';
                navMenu.style.background = '';
                navMenu.style.boxShot = '';

                if (!isInitial) {
                    showButtons();
                    textureGrid.scrollTop = scrollPositions[currentPaperButton];
                    updateCellSelection();
                    if (window.showColorIconsForSelected) window.showColorIconsForSelected();
                    requestAnimationFrame(() => {
                        textureGrid.scrollTo({ top: 0, behavior: 'smooth' });
                        animateItems(textureGrid);
                    });
                }
            } else {
                paperButtonsContainer.style.display = 'none';
                buttonsVisible = false;
                printGrid.style.display = 'grid';
                textureGrid.style.display = 'none';
                backgroundContainer.style.display = 'none';
                packagingContainer.style.background = '';
                navMenu.style.background = '';
                navMenu.style.boxShadow = '';

                if (!isInitial) {
                    requestAnimationFrame(() => {
                        printGrid.scrollTo({ top: 0, behavior: 'smooth' });
                        animateItems(printGrid);
                    });
                }
            }

            initializeCellIds();
            updateCellSelection();
            if (window.showColorIconsForSelected) window.showColorIconsForSelected();
            updateBackgroundWidth();
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
                buttonsVisible = false;
                radioContainer.style.display = 'none';
                packagingContainer.style.background = 'transparent';
                navMenu.style.background = '#ff957a';
                navMenu.style.boxShadow = '0 0 0 7px #fd8262';
            } else {
                if (boxRadio.checked) {
                    printGrid.style.display = 'grid';
                    textureGrid.style.display = 'none';
                    paperButtonsContainer.style.display = 'none';
                    buttonsVisible = false;
                    backgroundContainer.style.display = 'none';
                    packagingContainer.style.background = '';
                    navMenu.style.background = '';
                    navMenu.style.boxShadow = '';
                    initializeCellIds();
                    updateCellSelection();
                    if (window.showColorIconsForSelected) window.showColorIconsForSelected();
                } else {
                    const textureItems = textureGrid.querySelectorAll('.directory-item');
                    if (currentGridAnimation) {
                        currentGridAnimation.pause();
                        isAnimating = false;
                        currentGridAnimation = null;
                    }
                    anime.remove(textureItems);
                    textureItems.forEach(item => {
                        item.style.transform = 'rotateY(0deg)';
                        item.style.pointerEvents = 'auto';
                        item.offsetHeight;
                    });

                    textureGrid.style.display = 'grid';
                    printGrid.style.display = 'none';
                    backgroundContainer.style.display = 'none';
                    packagingContainer.style.background = '';
                    navMenu.style.background = '';
                    navMenu.style.boxShadow = '';
                    if (!buttonsVisible && document.querySelector('.step-3.active')) {
                        showButtons();
                        textureGrid.scrollTop = scrollPositions[currentPaperButton];
                        updateCellSelection();
                        if (window.showColorIconsForSelected) window.showColorIconsForSelected();
                    }
                }
                radioContainer.style.display = '';
            }

            updateBackgroundWidth();

            if (window.updatePositions && (boxRadio.checked || selectedShape !== 'form-circle')) {
                requestAnimationFrame(() => window.updatePositions('prints'));
            }
        });
    });

    // Создание кнопок paper
    function createPaperButton(iconSrc) {
        const button = document.createElement('button');
        button.className = 'paper-btn';
        button.setAttribute('type', 'button');
        button.setAttribute('aria-pressed', 'false');
        button.style.transform = 'translateY(150%)';
        const buttonId = iconSrc === 'paper1.svg' ? 'paper1' : 'paper2';
        button.dataset.buttonId = buttonId;

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

            if (currentGridAnimation) {
                currentGridAnimation.pause();
                isAnimating = false;
                currentGridAnimation = null;
            }
            const textureItems = textureGrid.querySelectorAll('.directory-item');
            anime.remove(textureItems);
            textureItems.forEach(item => {
                item.style.transform = 'rotateY(180deg)';
                item.style.transformStyle = 'preserve-3d';
                item.style.backfaceVisibility = 'hidden';
                item.offsetHeight;
            });

            scrollPositions[currentPaperButton] = textureGrid.scrollTop;
            currentPaperButton = this.dataset.buttonId;
            document.querySelectorAll('.paper-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            anime({ targets: this, scale: [1.1, 1], duration: 300, easing: 'easeOutQuad' });

            textureGrid.scrollTop = scrollPositions[currentPaperButton];
            updateCellSelection();
            if (window.showColorIconsForSelected) window.showColorIconsForSelected();
            requestAnimationFrame(() => {
                textureGrid.scrollTo({ top: 0, behavior: 'smooth' });
                animateItemsNoSwap(textureGrid);
            });
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
        paperButton1.setAttribute('aria-pressed', 'true');
        paperButtonsContainer.appendChild(paperButton1);
        paperButtonsContainer.appendChild(paperButton2);
        const step3Section = document.querySelector('.step-3');
        if (step3Section) {
            const existingContainer = step3Section.querySelector('.paper-buttons-container');
            if (existingContainer) existingContainer.remove();
            step3Section.appendChild(paperButtonsContainer);
        }
    }

    // Стили
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
            overflow: visible;
            transform: translateY(150%) translateZ(0);
            transform-origin: center;
            will-change: transform;
            transition: all 0.2s ease;
            pointer-events: auto;
        }
        .paper-btn.active {
            cursor: pointer;
        }
        .paper-btn-outline {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: calc(100% + 10px);
            height: calc(100% + 10px);
            border: 3px solid #fd8262;
            border-radius: 50%;
            display: none;
            pointer-events: none;
            box-sizing: border-box;
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
            transform: rotateY(0deg);
            cursor: pointer;
            min-width: 240px;
            max-width: 240px;
            flex-shrink: 0;
            user-select: none;
            margin: 0;
            min-height: auto;
            margin-top: 5px;
            position: relative;
            pointer-events: auto;
        }
        .step-3 .right-section .directory-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            row-gap: 15px;
            column-gap: 15px;
            width: 100%;
            min-width: 240px;
            margin-top: 25px;
            padding-left: 10px;
            padding-right: 20px;
            padding-bottom: 20px;
            box-sizing: border-box;
            height: calc(100% - 125px);
            overflow-y: auto;
            scrollbar-gutter: stable;
            position: relative;
        }
        .step-3 .right-section .directory-grid[data-type="print"] {
            grid-row-gap: 40px;
            grid-auto-rows: minmax(205px, auto);
            column-gap: 10px;
            padding-right: 20px;
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
        .step-3 .item-content.selected {
            box-shadow: 0 0 0 6px #fedfd7 !important;
        }
        .step-3 .item-content__input[type="radio"]:checked ~ .item-content {
            box-shadow: 0 0 0 6px #fedfd7 !important;
        }
    `;
    document.head.appendChild(style);

    // Инициализация системы
    createPaperButtons();
    initializeGrids();

    // Обработчики событий для чекбоксов и выделения ячеек
    printGrid.addEventListener('click', (event) => {
        const checkbox = event.target.closest('.hackyBox');
        const directoryItem = event.target.closest('.directory-item');
        if (!directoryItem) return;
        const index = parseInt(directoryItem.dataset.index, 10);
        const itemId = directoryItem.dataset.id || directoryItem.dataset.index || '0';
        if (isNaN(index) || index < 0 || index >= window.state?.prints?.items.length) return;

        if (checkbox) {
            event.stopPropagation();
            window.state.prints.items[index].isActive = checkbox.checked;
            window.saveStateToLocalStorage('prints');

            isAnimating = true;
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
                requestAnimationFrame(() => window.updatePositions('prints'));
            }
        } else {
            handlePrintItemClick(event, printGrid, 'print');
        }
    });

    textureGrid.addEventListener('click', (event) => {
        const checkbox = event.target.closest('.hackyBox');
        const directoryItem = event.target.closest('.directory-item');
        if (!directoryItem) return;
        const index = parseInt(directoryItem.dataset.index, 10);
        const itemId = directoryItem.dataset.id || directoryItem.dataset.index || '0';
        if (isNaN(index) || index < 0 || index >= window.state?.step3?.items.length) return;

        if (checkbox) {
            event.stopPropagation();
            window.state.step3.items[index].isActive = checkbox.checked;
            window.saveStateToLocalStorage('step3');

            isAnimating = true;
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
                requestAnimationFrame(() => window.updatePositions('step3'));
            }
        } else {
            handleTextureItemClick(event, textureGrid);
        }
    });

    // Save scroll position when scrolling textureGrid
    textureGrid.addEventListener('scroll', () => {
        if (paperRadio.checked && textureGrid.style.display === 'grid') {
            scrollPositions[currentPaperButton] = textureGrid.scrollTop;
        }
    });

    // Обработчики событий для переключения режимов
    boxRadio.addEventListener('change', () => {
        if (typeof window.hideColorIconsImmediately === 'function') {
            window.hideColorIconsImmediately();
        }
        if (paperRadio.checked) {
            scrollPositions[currentPaperButton] = textureGrid.scrollTop;
        }
        toggleGrids(false);
        if (window.updatePositions) {
            requestAnimationFrame(() => window.updatePositions('prints'));
        }
    });

    paperRadio.addEventListener('change', () => {
        if (typeof window.hideColorIconsImmediately === 'function') {
            window.hideColorIconsImmediately();
        }
        toggleGrids(true);
        if (window.updatePositions) {
            requestAnimationFrame(() => window.updatePositions('step3'));
        }
    });

    // Обработчики для перехода между шагами
    document.addEventListener('transitionEnd', (e) => {
        if (e.detail?.step === 'step-3') {
            const selectedShape = getSelectedShape();
            const radioContainer = boxRadio.parentElement;
            if (selectedShape === 'form-circle' && paperRadio.checked) {
                radioContainer.style.display = '';
                backgroundContainer.style.display = 'none';
                packagingContainer.style.background = '';
                navMenu.style.background = '';
                navMenu.style.boxShadow = '';
                showButtons();
                textureGrid.scrollTop = scrollPositions[currentPaperButton];
                initializeCellIds();
                updateCellSelection();
                if (window.showColorIconsForSelected) window.showColorIconsForSelected();
                requestAnimationFrame(() => {
                    textureGrid.scrollTo({ top: 0, behavior: 'smooth' });
                    animateItems(textureGrid);
                });
            } else {
                paperButtonsContainer.style.display = 'none';
                buttonsVisible = false;
                radioContainer.style.display = selectedShape === 'form-circle' ? '' : 'none';
                textureGrid.style.display = 'none';
                printGrid.style.display = 'grid';
                backgroundContainer.style.display = 'block';
                packagingContainer.style.background = 'transparent';
                navMenu.style.background = '#ff957a';
                navMenu.style.boxShadow = '0 0 0 7px #fd8262';
                initializeCellIds();
                updateCellSelection();
                if (window.showColorIconsForSelected) window.showColorIconsForSelected();
                updateBackgroundWidth();
                requestAnimationFrame(() => {
                    printGrid.scrollTo({ top: 0, behavior: 'smooth' });
                    animateItems(printGrid);
                });
            }
        }
    });

    document.addEventListener('transitionEnd', () => {
        isTransitioning = false;
    });

    // Установка начального состояния
    toggleGrids(!boxRadio.checked, true);
    addDirectHandlers();
});