document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.learn-more-1');
    const modal = document.getElementById('modal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalImage = modal.querySelector('.modal-image');
    const modalDesc = modal.querySelector('.modal-description p');
    const modalClose = modal.querySelector('.modal-close');
    const iconContainer = modal.querySelector('.modal-text-container .icon-container');

    const colorMap = {
        '#e7e7da': 'white',
        '#fbf893': 'yellow',
        '#ffa8ce': 'pink',
        '#cb91ea': 'purple'
    };

    let currentParent = null;

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            currentParent = this.closest('.directory-item');
            const title = currentParent.querySelector('.item-caption').textContent;
            const flowerName = currentParent.dataset.flowerName || title.toLowerCase().replace(/\s+/g, '-');
            const imgElement = currentParent.querySelector('img');

            // Не обновляем изображение если идет анимация
            if (!imgElement.classList.contains('animating')) {
                const colorName = currentParent.dataset.currentColor || 'white';
                const imgSrc = `img/animation/${flowerName}/${colorName}/0001.png`;
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

            modalImage.onclick = () => {
                if (FlowerAnimation.isGlobalAnimating) return;

                const currentColor = currentParent.dataset.currentColor || 'white';
                const tempAnimation = new FlowerAnimation(flowerName, null);
                tempAnimation.color = currentColor;
                tempAnimation.sprite = `img/animation/${flowerName}/${currentColor}.png`;
                tempAnimation.firstFrame = `img/animation/${flowerName}/${currentColor}/0001.png`;

                const cacheKey = `${flowerName}-${currentColor}`;
                if (!FlowerAnimation.spriteCache[cacheKey]) {
                    FlowerAnimation.spriteCache[cacheKey] = new Image();
                    FlowerAnimation.spriteCache[cacheKey].src = tempAnimation.sprite;
                }
                tempAnimation.spriteImg = FlowerAnimation.spriteCache[cacheKey];

                setTimeout(() => {
                    const imgRect = modalImage.getBoundingClientRect();
                    tempAnimation.playAnimation(40, modalImage.parentNode, modalImage, imgRect.width, imgRect.height);
                }, 200);
            };

            iconContainer.innerHTML = '';
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
                iconContainer.appendChild(iconDiv);
                iconContainer.appendChild(styleSheet);

                iconDiv.addEventListener('click', () => {
                    if (FlowerAnimation.isGlobalAnimating) return;

                    const colorName = colorMap[color] || 'white';
                    const newImageSrc = `img/animation/${flowerName}/${colorName}/0001.png`;
                    const testImage = new Image();
                    testImage.onload = () => {
                        modalImage.src = newImageSrc;
                        modalImage.style.display = 'block';
                        imgElement.src = newImageSrc;
                        imgElement.style.display = 'block';
                    };
                    testImage.onerror = () => {
                        modalImage.src = `img/animation/${flowerName}/white/0001.png`;
                        modalImage.style.display = 'block';
                        imgElement.src = `img/animation/${flowerName}/white/0001.png`;
                        imgElement.style.display = 'block';
                    };
                    testImage.src = newImageSrc;
                    currentParent.dataset.currentColor = colorName;
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
        iconContainer.innerHTML = '';
        currentParent = null;
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
            iconContainer.innerHTML = '';
            currentParent = null;
            modalImage.onclick = null;
        }
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