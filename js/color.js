document.addEventListener('DOMContentLoaded', function() {
    let colorIconContainer = null;
    let selectedItem = null;
    let hideTimeout = null;
    let currentActiveStep = null; // Track the current active step

    // 1. Функция для мгновенного скрытия иконок
    function hideColorIconsImmediately() {
        if (!colorIconContainer) return;

        // Отменяем все ожидающие таймауты
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        // Мгновенное скрытие без анимации
        colorIconContainer.style.transition = 'none';
        colorIconContainer.style.visibility = 'hidden';
        colorIconContainer.style.opacity = '0';
        colorIconContainer.style.display = 'none';
        colorIconContainer.innerHTML = '';

        // Снимаем выделение с текущей ячейки
        if (selectedItem) {
            const input = selectedItem.querySelector('input[type="radio"]');
            if (input) input.checked = false;
            selectedItem.classList.remove('selected');
            selectedItem = null;
        }
    }

    // 2. Функции для работы с цветными иконками
    function updateBackgroundWidth() {
        if (!document.querySelector('.step-2.active, .step-3.active')) return;

        const grid = document.querySelector('.step-2.active .right-section .directory-grid, .step-3.active .right-section .directory-grid');
        if (!grid) return;

        const rightSection = document.querySelector('.step-2.active .right-section, .step-3.active .right-section');
        if (!rightSection) return;

        const isStep3Print = document.querySelector('.step-3.active .directory-grid[data-type="print"][style*="display: grid"]');

        if (isStep3Print) {
            // Используем расчет ширины из paper-or-box.js для print на step-3
            const cellWidth = 230;
            const columnGap = 15;
            const extraPadding = 100;
            const scrollbarWidth = 8;
            const availableWidth = window.innerWidth * 0.45 - 80;
            const columns = Math.max(1, Math.floor((availableWidth + columnGap) / (cellWidth + columnGap)));
            const totalWidth = columns * cellWidth + (columns - 1) * columnGap + extraPadding + scrollbarWidth;
            rightSection.style.width = `${totalWidth}px`;
        } else {
            // Оригинальный расчет для step-2 и других случаев step-3
            const cellWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-width')) || 240;
            const columnGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--column-gap')) || 25;
            const extraPadding = 100;
            const gridStyles = getComputedStyle(grid);
            const columns = gridStyles.getPropertyValue('grid-template-columns').split(' ').length || 1;
            const totalWidth = columns * cellWidth + (columns - 1) * columnGap + extraPadding;
            rightSection.style.width = `${totalWidth}px`;
        }

        grid.offsetWidth; // Принудительный рефлоу
        updateColorIconsPosition();
    }

    function updateColorIconsPosition() {
        if (!colorIconContainer || !document.querySelector('.step-2.active, .step-3.active')) return;

        const rightSection = document.querySelector('.step-2.active .right-section, .step-3.active .right-section');
        if (!rightSection) return;

        const isStep3Print = document.querySelector('.step-3.active .directory-grid[data-type="print"][style*="display: grid"]');
        const rightSectionRect = rightSection.getBoundingClientRect();
        const rightEdge = rightSectionRect.left + window.scrollX;

        const shapes = ['form-circle', 'form-square', 'form-rectangle'];
        const activeShape = document.querySelector('.form-shape.active');
        const selectedShape = activeShape ? activeShape.className.split(' ').find(cls => shapes.includes(cls)) : 'form-circle';

        if (isStep3Print && (selectedShape === 'form-square' || selectedShape === 'form-rectangle')) {
            // Позиционируем правый край color-icon-container 5px правее левого края right-section
            const containerWidth = 80; // min-width: 80px из CSS
            colorIconContainer.style.left = `${rightEdge - containerWidth + 12}px`;
        } else if (isStep3Print) {
            // Позиционируем правый край color-icon-container у левого края right-section для круга
            const containerWidth = 80; // min-width: 80px из CSS
            colorIconContainer.style.left = `${rightEdge - containerWidth}px`;
        } else {
            // Оригинальная позиция для других случаев
            colorIconContainer.style.left = `${rightEdge - 60}px`;
        }

        colorIconContainer.style.top = `${window.innerHeight / 2 + window.scrollY + (document.querySelector('.step-3.active') ? 50 : 0)}px`;
    }

    function createColorIconContainer() {
        if (colorIconContainer) return;

        colorIconContainer = document.createElement('div');
        colorIconContainer.className = 'color-icon-container';
        colorIconContainer.style.visibility = 'hidden';
        colorIconContainer.style.opacity = '0';
        document.body.appendChild(colorIconContainer);

        const style = document.createElement('style');
        style.textContent = `
            .color-icon-container {
                position: absolute;
                display: flex;
                justify-content: center;
                align-items: center;
                height: auto;
                background: #fd8262;
                padding: 15px;
                clip-path: polygon(0 20%, 100% 0, 100% 100%, 0 80%);
                z-index: 0;
                overflow: visible;
                transform: translateX(100%) translateY(-50%);
                transition: transform 0.3s ease, opacity 0.3s ease;
                box-sizing: border-box;
                visibility: hidden;
                opacity: 0;
                min-width: 80px;
                pointer-events: none;
            }
            .color-icons-wrapper {
                display: flex;
                flex-direction: column;
                gap: 10px;
                justify-content: center;
                align-items: center;
                position: relative;
                min-height: 100%;
                pointer-events: auto;
            }
            .color-icon {
                position: relative;
                opacity: 0;
                transform: translateY(20px);
                animation: slideIn 0.3s ease forwards;
                margin: 0 auto;
                pointer-events: auto;
                cursor: pointer;
            }
            .color-icon.slide-out {
                animation: slideOut 0.3s ease forwards !important;
            }
            @keyframes slideIn {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes slideOut {
                to {
                    opacity: 0;
                    transform: translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    const colorMap = {
        '#e7e7da': 'white',
        '#fbf893': 'yellow',
        '#ffa8ce': 'pink',
        '#cb91ea': 'purple'
    };

    function generateColorIcons(item) {
        if (!document.querySelector('.step-2.active, .step-3.active')) {
            hideColorIconsImmediately();
            return;
        }

        if (!item || item !== selectedItem) {
            animateHideIcons();
            return;
        }

        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        createColorIconContainer();
        colorIconContainer.innerHTML = '';
        colorIconContainer.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        colorIconContainer.style.visibility = 'visible';
        colorIconContainer.style.opacity = '1';
        colorIconContainer.style.transform = 'translateX(0) translateY(-50%)';
        colorIconContainer.style.display = 'flex';

        const isStep3 = document.querySelector('.step-3.active');
        const iconColors = item.dataset.iconColors?.split(',').map(c => c.trim()) || ['#e7e7da'];
        const iconHoverColors = item.dataset.iconHoverColors?.split(',').map(c => c.trim()) || ['#bebea2'];

        const containerHeight = 20 + (iconColors.length * 70);
        colorIconContainer.style.height = `${containerHeight}px`;

        const iconsWrapper = document.createElement('div');
        iconsWrapper.className = 'color-icons-wrapper';

        iconColors.forEach((color, index) => {
            const hoverColor = iconHoverColors[index % iconHoverColors.length];
            const uniqueClass = `color-icon-${color.replace('#', '')}-${Date.now()}`;

            const iconDiv = document.createElement('div');
            iconDiv.className = `color-icon ${uniqueClass}`;
            iconDiv.dataset.color = color;
            iconDiv.style.animationDelay = `${0.2 + index * 0.08}s`;

            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                .${uniqueClass} {
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    position: relative;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }
                .${uniqueClass}::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border-radius: 50%;
                    background: ${color};
                    box-shadow: inset 0 0 0 60px ${color};
                    transition: all 0.3s ease;
                }
                .${uniqueClass}:hover::before {
                    background: ${hoverColor};
                    box-shadow: inset 0 0 0 0 ${color};
                }
                .${uniqueClass}::after {
                    content: '';
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    right: -5px;
                    bottom: -5px;
                    border-radius: 50%;
                    box-shadow: inset 0 0 0 0 ${hoverColor};
                    transition: all 0.3s ease;
                }
            `;

            iconsWrapper.appendChild(iconDiv);
            iconsWrapper.appendChild(styleSheet);

            iconDiv.addEventListener('click', function(e) {
                e.stopPropagation();
                const newColor = colorMap[color] || 'white';
                if (newColor === item.dataset.currentColor) return;

                const imgElement = item.querySelector('img');
                item.dataset.currentColor = newColor;

                if (isStep3) {
                    imgElement.src = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/texture/0001/${newColor}.png`;
                    imgElement.style.opacity = '1';
                } else {
                    const flowerName = item.dataset.flowerName;
                    const activeAnimation = Array.from(FlowerAnimation.activeAnimations).find(
                        anim => anim.elementId === imgElement.id
                    );
                    if (activeAnimation) {
                        activeAnimation.forceStopAnimation();
                    }

                    const testImage = new Image();
                    testImage.onload = function() {
                        const animation = new FlowerAnimation(flowerName, imgElement.id);
                        animation.color = newColor;
                        animation.sprite = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${newColor}.png`;
                        animation.firstFrame = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${newColor}/0001.png`;

                        const spriteImg = new Image();
                        spriteImg.src = animation.sprite;
                        spriteImg.onload = function() {
                            animation.spriteImg = spriteImg;
                            animation.playAnimation(40);
                        };
                        spriteImg.onerror = function() {
                            console.error('Failed to load sprite:', animation.sprite);
                            imgElement.src = animation.firstFrame;
                            imgElement.style.opacity = '1';
                        };
                    };
                    testImage.onerror = function() {
                        console.error('Failed to load image:', `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${newColor}/0001.png`);
                    };
                    testImage.src = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${newColor}/0001.png`;
                }
            });
        });

        colorIconContainer.appendChild(iconsWrapper);
        updateColorIconsPosition();
    }

    function animateHideIcons() {
        if (!colorIconContainer) return;

        if (selectedItem) {
            const input = selectedItem.querySelector('input[type="radio"]');
            if (input && input.checked) {
                return; // Не скрываем иконки, если элемент всё ещё выделен
            }
        }

        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        const iconsWrapper = colorIconContainer.querySelector('.color-icons-wrapper');
        if (!iconsWrapper) {
            hideColorIconsImmediately();
            return;
        }

        const icons = Array.from(iconsWrapper.querySelectorAll('.color-icon'));
        if (icons.length === 0) {
            hideColorIconsImmediately();
            return;
        }

        icons.reverse().forEach((icon, index) => {
            hideTimeout = setTimeout(() => {
                icon.classList.add('slide-out');
            }, index * 50);
        });

        hideTimeout = setTimeout(() => {
            if (selectedItem) {
                const input = selectedItem.querySelector('input[type="radio"]');
                if (input && input.checked) {
                    return;
                }
            }
            colorIconContainer.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            colorIconContainer.style.transform = 'translateX(100%) translateY(-50%)';
            colorIconContainer.style.opacity = '0';

            hideTimeout = setTimeout(() => {
                colorIconContainer.style.visibility = 'hidden';
                colorIconContainer.style.display = 'none';
                colorIconContainer.innerHTML = '';
                hideTimeout = null;
            }, 300);
        }, 300 + (icons.length * 50));
    }

    function hideColorIcons() {
        if (!colorIconContainer) return;

        if (selectedItem) {
            const input = selectedItem.querySelector('input[type="radio"]');
            if (input && input.checked) {
                return; // Не скрываем иконки, если элемент всё ещё выделен
            }
        }

        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        colorIconContainer.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        colorIconContainer.style.visibility = 'hidden';
        colorIconContainer.style.opacity = '0';
        colorIconContainer.style.display = 'none';
        colorIconContainer.innerHTML = '';

        if (selectedItem) {
            const input = selectedItem.querySelector('input[type="radio"]');
            if (input) input.checked = false;
            selectedItem.classList.remove('selected');
            selectedItem = null;
        }
    }

    function setupDirectoryItems() {
        const directoryItems = document.querySelectorAll('.directory-item');

        directoryItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if (!document.querySelector('.step-2.active, .step-3.active')) {
                    hideColorIconsImmediately();
                    return;
                }

                e.stopPropagation();
                const input = this.querySelector('input[type="radio"]');
                if (!input) return;

                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }

                if (input.checked) {
                    // Снимаем выделение с предыдущей ячейки
                    if (selectedItem && selectedItem !== this) {
                        const prevInput = selectedItem.querySelector('input[type="radio"]');
                        if (prevInput) prevInput.checked = false;
                        selectedItem.classList.remove('selected');
                    }

                    selectedItem = this;
                    this.classList.add('selected');
                    generateColorIcons(this);
                } else {
                    selectedItem = null;
                    this.classList.remove('selected');
                    animateHideIcons();
                }
            });
        });
    }

    // Глобальный обработчик кликов
    document.addEventListener('click', function(e) {
        if (!document.querySelector('.step-2.active, .step-3.active')) {
            hideColorIconsImmediately();
            return;
        }

        // Игнорируем клики по самим элементам или контейнеру с иконками
        if (e.target.closest('.directory-item') || e.target.closest('.color-icon-container')) {
            return;
        }

        // Для кликов вне элементов проверяем, есть ли выделенный элемент
        if (selectedItem) {
            const input = selectedItem.querySelector('input[type="radio"]');
            if (input && input.checked) {
                return; // Не скрываем иконки, если элемент всё ещё выделен
            }
        }

        // Если нет выделенного элемента, скрываем иконки
        hideColorIconsImmediately();
    });

    function init() {
        // Делаем функцию доступной глобально
        window.hideColorIconsImmediately = hideColorIconsImmediately;
        createColorIconContainer();
        setupDirectoryItems();
        updateBackgroundWidth();

        // Обработчики ресайза
        window.addEventListener('resize', () => {
            if (document.querySelector('.step-2.active, .step-3.active')) {
                updateBackgroundWidth();
                updateColorIconsPosition();
            }
        });

        // Обработчик перед закрытием страницы
        window.addEventListener('beforeunload', hideColorIconsImmediately);

        // Усиленные обработчики для кнопок перехода
        document.querySelectorAll('.creator .back-btn, .creator .continue-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                // Мгновенное скрытие при любом нажатии на continue-btn или back-btn
                hideColorIconsImmediately();

                // Дополнительная гарантия через setTimeout
                setTimeout(() => {
                    if (colorIconContainer) {
                        colorIconContainer.style.display = 'none';
                        colorIconContainer.style.visibility = 'hidden';
                        colorIconContainer.style.opacity = '0';
                        colorIconContainer.innerHTML = '';
                    }
                    document.querySelectorAll('.directory-item input[type="radio"]').forEach(input => {
                        input.checked = false;
                    });
                    document.querySelectorAll('.directory-item.selected').forEach(item => {
                        item.classList.remove('selected');
                    });
                    selectedItem = null;
                }, 0); // Используем 0ms для немедленного выполнения в следующем цикле событий
            });
        });

        // Обработчики для обычных ссылок
        document.querySelectorAll('a[href]').forEach(element => {
            element.addEventListener('click', hideColorIconsImmediately);
        });

        // Улучшенный MutationObserver
        const observer = new MutationObserver(function(mutations) {
            const activeStep = document.querySelector('.step.active');
            if (activeStep !== currentActiveStep) {
                hideColorIconsImmediately();
                currentActiveStep = activeStep;
            } else if (document.querySelector('.step-2.active, .step-3.active')) {
                updateBackgroundWidth();
                updateColorIconsPosition();
            }
        });

        // Наблюдаем за изменениями в основном контейнере
        const creatorContainer = document.querySelector('.creator');
        if (creatorContainer) {
            observer.observe(creatorContainer, {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: ['class']
            });
        }

        // Инициализация currentActiveStep
        currentActiveStep = document.querySelector('.step.active');

        // Дополнительный обработчик для SPA-переходов
        window.addEventListener('hashchange', hideColorIconsImmediately);
    }

    init();
});