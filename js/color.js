document.addEventListener('DOMContentLoaded', function() {
    let colorIconContainer = null;
    let selectedItem = null;
    let hideTimeout = null;
    let currentActiveStep = null;


    function isMobile() {
        return window.innerWidth <= 768;
    }

    function getColorIconParent() {
        if (isMobile()) {
            const rightSection = document.querySelector('.step-2.active .right-section, .step-3.active .right-section');
            if (rightSection) return rightSection;
        }
        return document.body;
    }

    function ensureColorIconContainerParent() {
        if (!colorIconContainer) return;
        const desiredParent = getColorIconParent();
        if (colorIconContainer.parentElement !== desiredParent) {
            desiredParent.appendChild(colorIconContainer);
            // При возврате на десктоп — сброс мобильных inline-стилей
            if (!isMobile()) {
                colorIconContainer.style.position = 'absolute';
                colorIconContainer.style.left = '';
                colorIconContainer.style.top = '';
                colorIconContainer.style.transform = 'translateX(100%) translateY(-50%)';
                colorIconContainer.style.width = '';
                colorIconContainer.style.background = '';
                colorIconContainer.style.clipPath = '';
                colorIconContainer.style.padding = '';
                colorIconContainer.style.margin = '';
            }
        }
    }

    function hideColorIconsImmediately() {
        if (!colorIconContainer) return;
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
        colorIconContainer.style.transition = 'none';
        colorIconContainer.style.visibility = 'hidden';
        colorIconContainer.style.opacity = '0';
        colorIconContainer.style.display = 'none';
        colorIconContainer.innerHTML = '';
        if (selectedItem) {
            // На шаге 2 не снимаем выделение ячейки — только скрываем иконки цвета
            const isStep2 = document.querySelector('.step-2.active');
            if (!isStep2) {
                const input = selectedItem.querySelector('input[type="radio"]');
                if (input) input.checked = false;
                selectedItem.classList.remove('selected');
            }
            selectedItem = null;
        }
    }

    function updateBackgroundWidth() {
        // Не менять стили на ПК версии - они жестко зафиксированы в CSS
        if (window.innerWidth > 768) {
            const rightSection = document.querySelector('.step-2.active .right-section, .step-3.active .right-section');
            if (rightSection) {
                rightSection.style.width = '';
                rightSection.style.minWidth = '';
            }
            return;
        }

        if (!document.querySelector('.step-2.active, .step-3.active')) {
            const rightSection = document.querySelector('.step-1.active .right-section');
            if (rightSection) {
                rightSection.style.width = '';
                rightSection.style.minWidth = '';
            }
            return;
        }

        const grid = document.querySelector('.step-2.active .right-section .directory-grid, .step-3.active .right-section .directory-grid');
        if (!grid) return;

        const rightSection = document.querySelector('.step-2.active .right-section, .step-3.active .right-section');
        if (!rightSection) return;

        const isStep3Print = document.querySelector('.step-3.active .directory-grid[data-type="print"][style*="display: grid"]');

        if (isStep3Print) {
            const cellWidth = 230;
            const columnGap = 15;
            const extraPadding = 100;
            const scrollbarWidth = 20;
            const availableWidth = window.innerWidth * 0.45 - 80;
            const columns = Math.max(1, Math.floor((availableWidth + columnGap) / (cellWidth + columnGap)));
            const totalWidth = columns * cellWidth + (columns - 1) * columnGap + extraPadding + scrollbarWidth;
            rightSection.style.width = `${Math.ceil(totalWidth)}px`;
            rightSection.style.minWidth = `${Math.ceil(totalWidth)}px`;
            grid.style.gridTemplateColumns = `repeat(${columns}, ${cellWidth}px)`;
        } else {
            const cellWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-width')) || 240;
            const columnGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--column-gap')) || 15;
            const extraPadding = 100;
            const availableWidth = window.innerWidth * 0.45 - 80;
            const columns = Math.max(1, Math.floor((availableWidth + columnGap) / (cellWidth + columnGap)));
            const totalWidth = columns * cellWidth + (columns - 1) * columnGap + extraPadding;
            rightSection.style.width = `${Math.ceil(totalWidth)}px`;
            rightSection.style.minWidth = `${Math.ceil(totalWidth)}px`;
            grid.style.gridTemplateColumns = `repeat(${columns}, ${cellWidth}px)`;
        }

        grid.offsetWidth;
        updateColorIconsPosition();
    }

    function updateColorIconsPosition() {
        if (!colorIconContainer || !document.querySelector('.step-2.active, .step-3.active')) return;

        // На мобильных контейнер находится в потоке внутри right-section — позиционировать не нужно
        if (isMobile()) {
            colorIconContainer.style.position = '';
            colorIconContainer.style.left = '';
            colorIconContainer.style.top = '';
            colorIconContainer.style.transform = '';
            return;
        }

        // FIX: Reset transform that might have been set during mobile→desktop transition
        colorIconContainer.style.transform = 'translateX(0) translateY(-50%)';

        const rightSection = document.querySelector('.step-2.active .right-section, .step-3.active .right-section');
        if (!rightSection) return;

        const isStep3 = document.querySelector('.step-3.active');
        const rightSectionRect = rightSection.getBoundingClientRect();
        const rightEdge = rightSectionRect.left + window.scrollX;

        const containerWidth = 60;
        if (isStep3) {
            const shapes = ['form-circle', 'form-square', 'form-rectangle'];
            const activeShape = document.querySelector('.form-shape.active');
            const selectedShape = activeShape ? activeShape.className.split(' ').find(cls => shapes.includes(cls)) : 'form-circle';

            if (selectedShape === 'form-square' || selectedShape === 'form-rectangle') {
                colorIconContainer.style.left = `${Math.floor(rightEdge - containerWidth + 20)}px`;
            } else {
                colorIconContainer.style.left = `${Math.floor(rightEdge - containerWidth)}px`;
            }
        } else {
            colorIconContainer.style.left = `${Math.floor(rightEdge - containerWidth)}px`;
        }

        colorIconContainer.style.top = `${window.innerHeight / 2 + window.scrollY + 50}px`;
    }

    function createColorIconContainer() {
        if (colorIconContainer) {
            ensureColorIconContainerParent();
            return;
        }

        colorIconContainer = document.createElement('div');
        colorIconContainer.className = 'color-icon-container';
        colorIconContainer.style.visibility = 'hidden';
        colorIconContainer.style.opacity = '0';
        getColorIconParent().appendChild(colorIconContainer);

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
                z-index: 1001;
                overflow: visible;
                transform: translateX(100%) translateY(-50%);
                transition: transform 0.3s ease, opacity 0.3s ease;
                box-sizing: border-box;
                visibility: hidden;
                opacity: 0;
                min-width: 60px;
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
                z-index: 1;
            }
            .color-icon {
                position: relative;
                opacity: 0;
                transform: translateY(20px);
                animation: slideIn 0.3s ease forwards;
                margin: 0 auto;
                pointer-events: auto;
                cursor: pointer;
                z-index: 2;
            }
            .color-icon.disabled {
                pointer-events: none;
                cursor: not-allowed;
                opacity: 0.5;
            }
            .color-icon:not(.disabled):hover {
                transform: scale(1.1);
                z-index: 3;
            }
            .color-icon.slide-out {
                animation: slideOut 0.3s ease forwards !important;
            }
            @keyframes slideIn {
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideOut {
                to { opacity: 0; transform: translateY(-20px); }
            }
            .step-2.active .right-section, .step-3.active .right-section {
                box-sizing: border-box;
                padding-right: 20px !important;
            }
            .step-2.active .directory-grid, .step-3.active .directory-grid {
                padding-right: 0 !important;
                margin-right: 20px !important;
                overflow-y: auto;
                scrollbar-gutter: stable;
                box-sizing: border-box;
            }
        `;
        document.head.appendChild(style);
    }

    function toggleColorIconsDisabledState(disable) {
        if (!colorIconContainer) return;
        const icons = colorIconContainer.querySelectorAll('.color-icon');
        icons.forEach(icon => {
            if (disable) {
                icon.classList.add('disabled');
            } else {
                icon.classList.remove('disabled');
            }
        });
    }

    const colorMap = {
        '#e7e7da': 'white', //#bebea2
        '#fbf893': 'yellow', //#e8e563
        '#ffa8ce': 'pink', //#e893b6
        '#cb91ea': 'purple', //#b67bd1
        '#ffaa57': 'orange', //#f39b44
        '#ff6047': 'red', //#f2523a
        '#aab1ee': 'blue', //#9fa7e9
        '#c74d52': 'vinous',
        '#ade09a': 'green', //#96ca81
        '#c97b5b': 'brown' //#bd704f
    };

    function syncInitialColor(item) {
        const imgElement = item.querySelector('img');
        if (!imgElement) return;

        const flowerName = item.dataset.flowerName;
        const initialColor = item.dataset.currentColor || 'white';

        const isStep3 = document.querySelector('.step-3.active');

        if (isStep3) {
            const textureName = item.dataset.textureName || '';
            const numMatch = textureName.match(/(\d+)$/);
            const textureNum = numMatch ? numMatch[1].padStart(4, '0') : '0001';
            const folder = textureName.startsWith('print') ? 'print' : 'texture';
            imgElement.src = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/${folder}/cell/${textureNum}/${initialColor}.jpg`;
            imgElement.style.opacity = '1';
            return;
        }

        if (!flowerName) return;

        const firstFrameUrl = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${initialColor}/0001.png`;

        const testImg = new Image();
        testImg.src = firstFrameUrl;
        testImg.onload = () => {
            imgElement.src = firstFrameUrl;
            imgElement.style.opacity = '1';
        };
        testImg.onerror = () => {
            imgElement.src = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/white/0001.png`;
            imgElement.style.opacity = '1';
        };
    }

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
        colorIconContainer.style.transform = isMobile() ? '' : 'translateX(0) translateY(-50%)';
        colorIconContainer.style.display = 'flex';

        const isStep3 = document.querySelector('.step-3.active');
        const iconColors = item.dataset.iconColors?.split(',').map(c => c.trim()) || ['#e7e7da'];
        const iconHoverColors = item.dataset.iconHoverColors?.split(',').map(c => c.trim()) || ['#bebea2'];

        if (iconColors.length <= 1) {
            // Только скрываем контейнер иконок — selectedItem и input.checked не трогаем
            if (colorIconContainer) {
                colorIconContainer.style.transition = 'none';
                colorIconContainer.style.visibility = 'hidden';
                colorIconContainer.style.opacity = '0';
                colorIconContainer.style.display = 'none';
                colorIconContainer.innerHTML = '';
            }
            return;
        }

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

            if (!isStep3) {
                const imgElement = item.querySelector('img');
                const activeAnimation = Array.from(FlowerAnimation.activeAnimations || []).find(
                    anim => anim.elementId === imgElement.id && anim.isPlaying
                );
                if (activeAnimation) {
                    iconDiv.classList.add('disabled');
                }
            }

            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                .${uniqueClass} {
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    position: relative;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    z-index: 2;
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
                .${uniqueClass}:not(.disabled):hover::before {
                    background: ${hoverColor};
                    box-shadow: inset 0 0 0 0 ${color};
                    z-index: 3;
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
                .${uniqueClass}.disabled:hover::before {
                    background: ${color};
                    box-shadow: inset 0 0 0 60px ${color};
                }
            `;

            iconsWrapper.appendChild(iconDiv);
            iconsWrapper.appendChild(styleSheet);

            iconDiv.addEventListener('click', function(e) {
                e.stopPropagation();
                if (iconDiv.classList.contains('disabled')) return;

                const newColor = colorMap[color] || 'white';
                if (newColor === item.dataset.currentColor) return;

                const imgElement = item.querySelector('img');
                item.dataset.currentColor = newColor;

                if (isStep3) {
                    const textureName = item.dataset.textureName || '';
                    const numMatch = textureName.match(/(\d+)$/);
                    const textureNum = numMatch ? numMatch[1].padStart(4, '0') : '0001';
                    const folder = textureName.startsWith('print') ? 'print' : 'texture';
                    imgElement.src = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/${folder}/cell/${textureNum}/${newColor}.jpg`;
                    imgElement.style.opacity = '1';
                } else {
                    const flowerName = item.dataset.flowerName;
                    const activeAnimation = Array.from(FlowerAnimation.activeAnimations || []).find(
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
                            imgElement.src = animation.firstFrame;
                            imgElement.style.opacity = '1';
                        };
                    };
                    testImage.onerror = function() {
                        imgElement.src = animation.firstFrame;
                        imgElement.style.opacity = '1';
                    };
                    testImage.src = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${newColor}/0001.png`;
                }
                updateBackgroundWidth();
            });
        });

        colorIconContainer.appendChild(iconsWrapper);
        updateColorIconsPosition();
    }

    function animateHideIcons() {
        if (!colorIconContainer) return;

        if (selectedItem) {
            const input = selectedItem.querySelector('input[type="radio"]');
            if (input && input.checked) return;
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
                if (input && input.checked) return;
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
            if (input && input.checked) return;
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

                const isStep3 = document.querySelector('.step-3.active');
                const isStep2 = document.querySelector('.step-2.active');

                if (input.checked) {
                    if (selectedItem && selectedItem !== this) {
                        const prevInput = selectedItem.querySelector('input[type="radio"]');
                        if (prevInput) prevInput.checked = false;
                        selectedItem.classList.remove('selected');
                    }

                    selectedItem = this;
                    this.classList.add('selected');
                    generateColorIcons(this);
                    syncInitialColor(this);
                } else if (!isStep3 && !isStep2) {
                    selectedItem = null;
                    this.classList.remove('selected');
                    animateHideIcons();
                } else if (isStep2) {
                    // На шаге 2: повторный клик просто показывает иконки цвета снова
                    selectedItem = this;
                    generateColorIcons(this);
                    syncInitialColor(this);
                }
                updateBackgroundWidth();
            });
        });
    }

    document.addEventListener('click', function(e) {
        if (!document.querySelector('.step-2.active, .step-3.active')) {
            hideColorIconsImmediately();
            // Reset sync flag when leaving step-3
            const step3Grid = document.querySelector('.step-3 .directory-grid');
            if (step3Grid) step3Grid.dataset.synced = '';
            return;
        }

        if (e.target.closest('.directory-item') || e.target.closest('.color-icon-container')) {
            return;
        }

        if (selectedItem) {
            const input = selectedItem.querySelector('input[type="radio"]');
            if (input && input.checked) return;
        }

        hideColorIconsImmediately();
    });

    window.showColorIconsForSelected = function() {
        const activeStep = document.querySelector('.step.active');
        if (!activeStep) return;
        const stepClass = activeStep.classList.contains('step-2') ? '.step-2.active' : '.step-3.active';

        if (activeStep.classList.contains('step-3')) {
            // Only sync once - check if already synced to avoid re-processing all items
            const step3Grid = document.querySelector('.step-3 .directory-grid');
            if (step3Grid && !step3Grid.dataset.synced) {
                document.querySelectorAll('.step-3 .directory-item').forEach(item => {
                    syncInitialColor(item);
                });
                step3Grid.dataset.synced = 'true';
            }
        }

        const selectedContent = document.querySelector(`${stepClass} .item-content.selected`);
        if (selectedContent) {
            selectedItem = selectedContent.closest('.directory-item');
            if (selectedItem) {
                generateColorIcons(selectedItem);
                syncInitialColor(selectedItem);
            }
        }
    };

    function init() {
        window.hideColorIconsImmediately = hideColorIconsImmediately;
        createColorIconContainer();
        setupDirectoryItems();

        document.querySelectorAll('.step-2 .directory-item, .step-3 .directory-item').forEach(item => {
            syncInitialColor(item);
        });

        if (document.querySelector('.step-2.active, .step-3.active')) {
            updateBackgroundWidth();
            window.showColorIconsForSelected();
        } else {
            const rightSection = document.querySelector('.step-1.active .right-section');
            if (rightSection) {
                rightSection.style.width = '';
                rightSection.style.minWidth = '';
            }
        }

        window.addEventListener('resize', () => {
            // При смене размера — перемещаем контейнер в нужного родителя
            ensureColorIconContainerParent();

            if (document.querySelector('.step-2.active, .step-3.active')) {
                updateBackgroundWidth();
                updateColorIconsPosition();
            } else {
                const rightSection = document.querySelector('.step-1.active .right-section');
                if (rightSection) {
                    rightSection.style.width = '';
                    rightSection.style.minWidth = '';
                }
            }
        });

        window.addEventListener('beforeunload', hideColorIconsImmediately);

        document.querySelectorAll('.creator .back-btn, .creator .continue-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                hideColorIconsImmediately();
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
                }, 0);
            });
        });

        document.querySelectorAll('a[href]').forEach(element => {
            element.addEventListener('click', hideColorIconsImmediately);
        });

        const observer = new MutationObserver(function(mutations) {
            const activeStep = document.querySelector('.step.active');
            if (activeStep !== currentActiveStep) {
                hideColorIconsImmediately();
                currentActiveStep = activeStep;
                if (document.querySelector('.step-2.active, .step-3.active')) {
                    updateBackgroundWidth();
                    updateColorIconsPosition();
                    window.showColorIconsForSelected();
                    document.querySelectorAll('.step-2 .directory-item, .step-3 .directory-item').forEach(item => {
                        syncInitialColor(item);
                    });
                } else if (document.querySelector('.step-1.active')) {
                    const rightSection = document.querySelector('.step-1.active .right-section');
                    if (rightSection) {
                        rightSection.style.width = '';
                        rightSection.style.minWidth = '';
                    }
                }
            } else if (document.querySelector('.step-2.active, .step-3.active')) {
                updateBackgroundWidth();
                updateColorIconsPosition();
                window.showColorIconsForSelected();
            }
        });

        document.addEventListener('transitionEnd', function(e) {
            if (e.detail?.step === 'step-3') {
                setTimeout(() => {
                    document.querySelectorAll('.step-3 .directory-item').forEach(item => {
                        syncInitialColor(item);
                    });
                }, 50);
            }
        });

        const creatorContainer = document.querySelector('.creator');
        if (creatorContainer) {
            observer.observe(creatorContainer, {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: ['class']
            });
        }

        window.addEventListener('fillAllAnimationStart', () => {
            toggleColorIconsDisabledState(true);
        });

        window.addEventListener('fillAllAnimationEnd', () => {
            toggleColorIconsDisabledState(false);
        });

        currentActiveStep = document.querySelector('.step.active');
        window.addEventListener('hashchange', hideColorIconsImmediately);
    }

    init();
});