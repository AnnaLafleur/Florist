document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.learn-more-1');
    const modal = document.getElementById('modal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalImage = modal.querySelector('.modal-image');
    const modalDesc = modal.querySelector('.modal-description p');
    const modalClose = modal.querySelector('.modal-close');
    const modalIconContainer = modal.querySelector('.modal-text-container .icon-container');
    const colorIcons = document.querySelectorAll('.color-icon');
    const directoryItems = document.querySelectorAll('.directory-item');

    const colorMap = {
        '#e7e7da': 'white',
        '#fbf893': 'yellow',
        '#ffa8ce': 'pink',
        '#cb91ea': 'purple'
    };

    let currentParent = null;
    let currentFlowerName = null;
    let currentColor = 'white';

    // Modal handling for directory.html
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            currentParent = this.closest('.directory-item');
            const title = currentParent.querySelector('.item-caption').textContent;
            currentFlowerName = currentParent.dataset.flowerName || title.toLowerCase().replace(/\s+/g, '-');
            currentColor = currentParent.dataset.currentColor || 'white';
            const imgElement = currentParent.querySelector('img');

            if (!imgElement.classList.contains('animating')) {
                const imgSrc = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${currentFlowerName}/${currentColor}/0001.png`;
                const testImage = new Image();
                testImage.onload = () => {
                    imgElement.src = imgSrc;
                    imgElement.style.display = 'block';
                };
                testImage.src = imgSrc;
            }

            const description = currentParent.dataset.description || `Описание для ${title}`;
            const iconCount = parseInt(currentParent.dataset.icons) || 1;
            const iconColors = currentParent.dataset.iconColors ? currentParent.dataset.iconColors.split(',').map(c => c.trim()) : ['#e7e7da'];
            const iconHoverColors = currentParent.dataset.iconHoverColors ? currentParent.dataset.iconHoverColors.split(',').map(c => c.trim()) : ['#bebea2'];

            modalTitle.textContent = title;
            modalImage.src = imgElement.src;
            modalImage.style.display = 'block';
            modalDesc.textContent = description;

            modalImage.onclick = null;

            modalIconContainer.innerHTML = '';
            for (let i = 0; i < iconCount; i++) {
                const iconDiv = document.createElement('div');
                const uniqueClass = `modal-icon-${i}-${Date.now()}`;
                iconDiv.className = `modal-icon ${uniqueClass}`;
                const color = iconColors[i % iconColors.length];
                const hoverColor = iconHoverColors[i % iconHoverColors.length];
                iconDiv.innerHTML = '<i class="fa fa-bars"></i>';
                const styleSheet = document.createElement('style');
                styleSheet.textContent = `
                    .${uniqueClass}::before {
                        background: ${color};
                        box-shadow: inset 0 0 0 60px ${color};
                    }
                    .${uniqueClass}:hover::before {
                        background: ${hoverColor};
                        box-shadow: inset 0 0 0 0 ${color};
                    }
                    .${uniqueClass}:hover::after {
                        box-shadow: inset 0 0 0 0 ${hoverColor};
                    }
                `;
                modalIconContainer.appendChild(iconDiv);
                modalIconContainer.appendChild(styleSheet);

                iconDiv.addEventListener('click', () => {
                    if (FlowerAnimation.isGlobalAnimating) return;

                    const newColor = colorMap[color] || 'white';

                    if (newColor !== currentColor) {
                        currentColor = newColor;
                        const newImageSrc = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${currentFlowerName}/${currentColor}/0001.png`;

                        const spriteSrc = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${currentFlowerName}/${currentColor}.png`;
                        const spriteImg = new Image();
                        spriteImg.src = spriteSrc;

                        modalImage.src = newImageSrc;
                        imgElement.src = newImageSrc;
                        currentParent.dataset.currentColor = currentColor;

                        const tempAnimation = new FlowerAnimation(currentFlowerName, null);
                        tempAnimation.color = currentColor;
                        tempAnimation.sprite = spriteSrc;
                        tempAnimation.firstFrame = newImageSrc;
                        tempAnimation.spriteImg = spriteImg;

                        const checkReady = () => {
                            if (spriteImg.complete) {
                                const imgRect = modalImage.getBoundingClientRect();
                                tempAnimation.playAnimation(40, modalImage.parentNode, modalImage, imgRect.width, imgRect.height);
                            } else {
                                spriteImg.onload = checkReady;
                            }
                        };

                        checkReady();
                    }
                });
            }

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    modalClose.addEventListener('click', () => {
        if (currentParent) {
            const imgElement = currentParent.querySelector('img');
            imgElement.style.display = 'block';
        }
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        modalIconContainer.innerHTML = '';
        currentParent = null;
        currentFlowerName = null;
        modalImage.onclick = null;
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (currentParent) {
                const imgElement = currentParent.querySelector('img');
                imgElement.style.display = 'block';
            }
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            modalIconContainer.innerHTML = '';
            currentParent = null;
            currentFlowerName = null;
            modalImage.onclick = null;
        }
    });

    // Color selection for creator.html
    colorIcons.forEach(icon => {
        const color = icon.dataset.color;
        const uniqueClass = `color-icon-${color.replace('#', '')}-${Date.now()}`;
        icon.className = `modal-icon ${uniqueClass}`; // Reuse modal-icon styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .${uniqueClass}::before {
                background: ${color};
                box-shadow: inset 0 0 0 60px ${color};
            }
            .${uniqueClass}:hover::before {
                background: ${colorMap[color] === 'white' ? '#bebea2' : colorMap[color] === 'yellow' ? '#e8e563' : colorMap[color] === 'pink' ? '#e893b6' : '#b67bd1'};
                box-shadow: inset 0 0 0 0 ${color};
            }
            .${uniqueClass}:hover::after {
                box-shadow: inset 0 0 0 0 ${colorMap[color] === 'white' ? '#bebea2' : colorMap[color] === 'yellow' ? '#e8e563' : colorMap[color] === 'pink' ? '#e893b6' : '#b67bd1'};
            }
        `;
        icon.appendChild(styleSheet);

        icon.addEventListener('click', () => {
            if (FlowerAnimation.isGlobalAnimating) return;

            const newColor = colorMap[color] || 'white';
            directoryItems.forEach(item => {
                const flowerName = item.dataset.flowerName;
                const imgElement = item.querySelector('img');
                if (!imgElement.classList.contains('animating')) {
                    const newImageSrc = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${newColor}/0001.png`;
                    const spriteSrc = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${newColor}.png`;
                    const spriteImg = new Image();
                    spriteImg.src = spriteSrc;

                    imgElement.src = newImageSrc;
                    item.dataset.currentColor = newColor;

                    const tempAnimation = new FlowerAnimation(flowerName, null);
                    tempAnimation.color = newColor;
                    tempAnimation.sprite = spriteSrc;
                    tempAnimation.firstFrame = newImageSrc;
                    tempAnimation.spriteImg = spriteImg;

                    const checkReady = () => {
                        if (spriteImg.complete) {
                            const imgRect = imgElement.getBoundingClientRect();
                            tempAnimation.playAnimation(40, imgElement.parentNode, imgElement, imgRect.width, imgRect.height);
                        } else {
                            spriteImg.onload = checkReady;
                        }
                    };

                    checkReady();
                }
            });
        });
    });

    window.addEventListener('resize', function() {
        if (modal.style.display === 'flex') {
            const modalContainer = modal.querySelector('.modal-container');
            if (modalContainer.offsetHeight > window.innerHeight) {
                modalContainer.style.overflowY = 'auto';
            } else {
                modalContainer.style.overflowY = 'visible';
            }
        }
    });
});