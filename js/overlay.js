document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.learn-more-1');
    const modal = document.getElementById('modal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalImage = modal.querySelector('.modal-image');
    const modalDesc = modal.querySelector('.modal-description p');
    const modalClose = modal.querySelector('.modal-close');
    const modalIconContainer = modal.querySelector('.modal-text-container .icon-container');

    const colorMap = {
        '#e7e7da': 'white',
        '#fbf893': 'yellow',
        '#ffa8ce': 'pink',
        '#cb91ea': 'purple',
        '#ffaa57': 'orange',
        '#ff6047': 'red',
        '#aab1ee': 'blue',
        '#c74d52': 'vinous',
        '#ade09a': 'green'
    };

    let currentParent = null;
    let currentFlowerName = null;
    let currentColor = 'white';
    let currentModalAnimation = null;

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            currentParent = this.closest('.directory-item');
            const title = currentParent.querySelector('.item-caption').textContent;
            currentFlowerName = currentParent.dataset.flowerName || title.toLowerCase().replace(/\s+/g, '-');

            // Берём актуальный цвет из data-атрибута карточки
            currentColor = currentParent.dataset.currentColor || 'white';

            const imgElement = currentParent.querySelector('img');

            // Сохраняем текущее состояние
            const currentDisplay = imgElement.style.display;
            const currentSrc = imgElement.src;

            // Формируем путь к нужному начальному кадру
            const initialImageSrc = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${currentFlowerName}/${currentColor}/0001.png`;

            const testImage = new Image();
            testImage.onload = () => {
                // Устанавливаем правильный цвет сразу в карточке
                imgElement.src = initialImageSrc;
                imgElement.style.display = currentDisplay;

                // Открываем модалку с этим же цветом
                modalTitle.textContent = title;
                modalImage.src = initialImageSrc;
                modalImage.style.display = 'block';
                modalDesc.textContent = currentParent.dataset.description || `Описание для ${title}`;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';

                // Стили для изображения в модалке
                modalImage.style.width = '90vw';
                modalImage.style.minWidth = '200px';
                modalImage.style.minHeight = '200px';
                modalImage.style.aspectRatio = '1 / 1';
                modalImage.style.objectFit = 'contain';

                setTimeout(() => {
                    modalIconContainer.innerHTML = '';
                    const iconCount = parseInt(currentParent.dataset.icons) || 1;
                    const iconColors = currentParent.dataset.iconColors
                        ? currentParent.dataset.iconColors.split(',').map(c => c.trim())
                        : ['#e7e7da'];
                    const iconHoverColors = currentParent.dataset.iconHoverColors
                        ? currentParent.dataset.iconHoverColors.split(',').map(c => c.trim())
                        : ['#bebea2'];

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
                            const newColor = colorMap[color] || 'white';

                            if (newColor === currentColor) return;

                            currentColor = newColor;
                            currentParent.dataset.currentColor = newColor;

                            const newImageSrc = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${currentFlowerName}/${currentColor}/0001.png`;
                            const spriteSrc = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${currentFlowerName}/${currentColor}.png`;

                            const spriteImg = new Image();
                            spriteImg.src = spriteSrc;

                            modalImage.style.width = '90vw';
                            modalImage.style.minWidth = '200px';
                            modalImage.style.minHeight = '200px';
                            modalImage.style.aspectRatio = '1 / 1';
                            modalImage.style.objectFit = 'contain';

                            // Обновляем оба изображения
                            modalImage.src = newImageSrc;
                            imgElement.src = newImageSrc;

                            if (currentModalAnimation) {
                                currentModalAnimation.forceStopAnimation();
                                currentModalAnimation = null;
                            }

                            const tempAnimation = new FlowerAnimation(currentFlowerName, null);
                            currentModalAnimation = tempAnimation;
                            tempAnimation.color = newColor;
                            tempAnimation.sprite = spriteSrc;
                            tempAnimation.firstFrame = newImageSrc;
                            tempAnimation.spriteImg = spriteImg;

                            const checkReady = () => {
                                if (spriteImg.complete) {
                                    modalImage.style.display = 'none';
                                    modalImage.offsetHeight; // reflow
                                    modalImage.style.display = 'block';
                                    const imgRect = modalImage.getBoundingClientRect();
                                    tempAnimation.playAnimation(
                                        40,
                                        modalImage.parentNode,
                                        modalImage,
                                        imgRect.width,
                                        imgRect.height
                                    );
                                } else {
                                    spriteImg.onload = checkReady;
                                }
                            };

                            setTimeout(checkReady, 0);
                        });
                    }
                }, 0);
            };

            testImage.onerror = () => {
                // Fallback на белый, если нужный цвет не загрузился
                const fallbackSrc = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${currentFlowerName}/white/0001.png`;
                imgElement.src = fallbackSrc;
                imgElement.style.display = currentDisplay;

                modalTitle.textContent = title;
                modalImage.src = fallbackSrc;
                modalImage.style.display = 'block';
                modalDesc.textContent = currentParent.dataset.description || `Описание для ${title}`;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';

                modalImage.style.width = '90vw';
                modalImage.style.minWidth = '200px';
                modalImage.style.minHeight = '200px';
                modalImage.style.aspectRatio = '1 / 1';
                modalImage.style.objectFit = 'contain';
            };

            testImage.src = initialImageSrc;
        });
    });

    modalClose.addEventListener('click', () => {
        if (currentParent) {
            const imgElement = currentParent.querySelector('img');
            imgElement.style.display = 'block';
        }
        if (currentModalAnimation) {
            currentModalAnimation.forceStopAnimation();
            currentModalAnimation = null;
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
            if (currentModalAnimation) {
                currentModalAnimation.forceStopAnimation();
                currentModalAnimation = null;
            }
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            modalIconContainer.innerHTML = '';
            currentParent = null;
            currentFlowerName = null;
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

            if (currentModalAnimation) {
                currentModalAnimation.forceStopAnimation();
                modalImage.style.width = '90vw';
                modalImage.style.minWidth = '200px';
                modalImage.style.minHeight = '200px';
                modalImage.style.aspectRatio = '1 / 1';
                modalImage.style.objectFit = 'contain';

                modalImage.style.display = 'none';
                modalImage.offsetHeight; // reflow
                modalImage.style.display = 'block';

                const imgRect = modalImage.getBoundingClientRect();
                currentModalAnimation.playAnimation(
                    40,
                    modalImage.parentNode,
                    modalImage,
                    imgRect.width,
                    imgRect.height
                );
            }
        }
    });
});