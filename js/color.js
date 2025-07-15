document.addEventListener('DOMContentLoaded', function() {
    let colorIconContainer = null;
    let selectedItem = null;
    let hideTimeout = null;

    function updateBackgroundWidth() {
        if (!document.querySelector('.step-2.active')) return;

        const grid = document.querySelector('.step-2 .right-section .directory-grid');
        if (!grid) return;

        const rightSection = document.querySelector('.step-2 .right-section');
        if (!rightSection) return;

        const cellWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-width')) || 240;
        const columnGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--column-gap')) || 25;
        const extraPadding = 100;

        rightSection.style.width = 'auto';
        grid.offsetWidth;

        const gridStyles = getComputedStyle(grid);
        const columns = gridStyles.getPropertyValue('grid-template-columns').split(' ').length || 1;

        const totalWidth = columns * cellWidth + (columns - 1) * columnGap + extraPadding;
        rightSection.style.width = `${totalWidth}px`;

        updateColorIconsPosition();
    }

    function updateColorIconsPosition() {
        if (!colorIconContainer || !document.querySelector('.step-2.active')) return;

        const rightSection = document.querySelector('.step-2 .right-section');
        if (!rightSection) return;

        const rightSectionRect = rightSection.getBoundingClientRect();
        const rightEdge = rightSectionRect.left + window.scrollX;

        colorIconContainer.style.left = `${rightEdge - 60}px`;
        colorIconContainer.style.top = `${window.innerHeight / 2 + window.scrollY}px`;
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
                pointer-events: auto;;
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
        if (!document.querySelector('.step-2.active')) {
            hideColorIcons();
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

        const flowerName = item.dataset.flowerName;
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
                const flowerName = item.dataset.flowerName;

                const activeAnimation = Array.from(FlowerAnimation.activeAnimations).find(
                    anim => anim.elementId === imgElement.id
                );
                if (activeAnimation) {
                    activeAnimation.forceStopAnimation();
                }

                const testImage = new Image();
                testImage.onload = function() {
                    item.dataset.currentColor = newColor;
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
                return;
            }
        }

        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        const iconsWrapper = colorIconContainer.querySelector('.color-icons-wrapper');
        if (!iconsWrapper) {
            hideColorIcons();
            return;
        }

        const icons = Array.from(iconsWrapper.querySelectorAll('.color-icon'));
        if (icons.length === 0) {
            hideColorIcons();
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
                colorIconContainer.innerHTML = '';
                hideTimeout = null;
            }, 300);
        }, 300 + (icons.length * 50));
    }

    function hideColorIcons() {
        if (!colorIconContainer) return;

        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        colorIconContainer.style.transition = 'none';
        colorIconContainer.style.visibility = 'hidden';
        colorIconContainer.style.opacity = '0';
        colorIconContainer.innerHTML = '';

        if (selectedItem) {
            const input = selectedItem.querySelector('input[type="radio"]');
            if (input) input.checked = false;
            selectedItem = null;
        }
    }

    function setupDirectoryItems() {
        const directoryItems = document.querySelectorAll('.directory-item');

        directoryItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if (!document.querySelector('.step-2.active')) return;

                e.stopPropagation();
                const input = this.querySelector('input[type="radio"]');
                if (!input) return;

                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }

                if (input.checked) {
                    selectedItem = this;
                    generateColorIcons(this);
                } else {
                    selectedItem = null;
                    animateHideIcons();
                }
            });
        });
    }

    document.addEventListener('click', function(e) {
        if (!document.querySelector('.step-2.active')) {
            hideColorIcons();
            return;
        }

        if (e.target.closest('.directory-item') || e.target.closest('.color-icon-container')) {
            return;
        }

        const checkedInput = document.querySelector('.directory-item input[type="radio"]:checked');
        if (checkedInput) {
            const checkedItem = checkedInput.closest('.directory-item');
            if (checkedItem !== selectedItem) {
                selectedItem = checkedItem;
                generateColorIcons(checkedItem);
            }
        } else {
            selectedItem = null;
            animateHideIcons();
        }
    });

    function init() {
        createColorIconContainer();
        setupDirectoryItems();
        updateBackgroundWidth();

        window.addEventListener('resize', () => {
            if (document.querySelector('.step-2.active')) {
                updateBackgroundWidth();
                updateColorIconsPosition();
            }
        });

        window.addEventListener('beforeunload', () => {
            hideColorIcons();
        });

        document.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('click', () => {
                hideColorIcons();
            });
        });

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    const isStep2Active = document.querySelector('.step-2.active');
                    if (!isStep2Active) {
                        hideColorIcons();
                    } else {
                        updateBackgroundWidth();
                        updateColorIconsPosition();
                    }
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class']
        });
    }

    init();
});