class FlowerAnimation {
    static spriteCache = {};
    static activeAnimations = new Set();

    constructor(flowerName, elementId) {
        this.flowerName = flowerName;
        this.elementId = elementId;
        this.img = document.getElementById(elementId);
        const parent = this.img ? this.img.closest('.directory-item') : null;
        this.color = parent?.dataset.currentColor || 'white';
        this.sprite = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${this.color}.png`;
        this.firstFrame = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${this.color}/0001.png`;
        this.isPlaying = false;
        this.canvas = null;
        this.ctx = null;
        this.spriteImg = new Image();
        this.spriteImg.src = this.sprite;
        this.frameWidth = 1024;
        this.frameHeight = 1024;
        this.frameCount = 30;
        this.clickCount = 0;

        if (parent) {
            parent.style.cursor = 'pointer';
            parent.addEventListener('click', (event) => {
                if (event.target.type !== 'radio' && !event.target.closest('.learn-more-1')) {
                    this.handleClick();
                }
            });

            const observer = new MutationObserver(() => {
                const newColor = parent.dataset.currentColor || 'white';
                if (newColor !== this.color) {
                    this.color = newColor;
                    this.updateSprite();
                }
            });
            observer.observe(parent, { attributes: true, attributeFilter: ['data-current-color'] });
        }

        if (this.img) {
            this.img.src = this.firstFrame;
            this.img.style.opacity = '1';
        }
    }

    static isAnimationActive(elementId) {
        for (const animation of FlowerAnimation.activeAnimations) {
            if (animation.elementId === elementId && animation.isPlaying) {
                return true;
            }
        }
        return false;
    }

    static forceStopAllAnimations() {
        FlowerAnimation.activeAnimations.forEach(animation => {
            animation.forceStopAnimation();
        });
        FlowerAnimation.activeAnimations.clear();
    }

    forceStopAnimation() {
        if (this.isPlaying) {
            this.isPlaying = false;
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
            if (this.img) {
                this.img.style.display = 'block';
                this.img.src = this.firstFrame;
                this.img.style.opacity = '1';
            }
            FlowerAnimation.activeAnimations.delete(this);
        }
    }

    updateSprite() {
        this.sprite = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${this.flowerName}/${this.color}.png`;
        this.firstFrame = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${this.flowerName}/${this.color}/0001.png`;

        const cacheKey = `${this.flowerName}-${this.color}`;
        if (!FlowerAnimation.spriteCache[cacheKey]) {
            FlowerAnimation.spriteCache[cacheKey] = new Image();
            FlowerAnimation.spriteCache[cacheKey].src = this.sprite;
        }
        this.spriteImg = FlowerAnimation.spriteCache[cacheKey];
        if (this.img) {
            this.img.src = this.firstFrame;
            this.img.style.opacity = '1';
        }
    }

    static preloadImages(flowers, colors = ['white']) {
        return Promise.all(
            flowers.flatMap(flower =>
                colors.map(color => {
                    const spriteKey = `${flower}-${color}`;
                    const firstFrameKey = `${flower}-${color}-first`;
                    if (!FlowerAnimation.spriteCache[spriteKey]) {
                        FlowerAnimation.spriteCache[spriteKey] = new Image();
                        FlowerAnimation.spriteCache[spriteKey].src = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flower}/${color}.png`;
                    }
                    if (!FlowerAnimation.spriteCache[firstFrameKey]) {
                        FlowerAnimation.spriteCache[firstFrameKey] = new Image();
                        FlowerAnimation.spriteCache[firstFrameKey].src = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flower}/${color}/0001.png`;
                    }
                    return [
                        new Promise(resolve => {
                            FlowerAnimation.spriteCache[spriteKey].onload = resolve;
                            FlowerAnimation.spriteCache[spriteKey].onerror = () => resolve();
                        }),
                        new Promise(resolve => {
                            FlowerAnimation.spriteCache[firstFrameKey].onload = resolve;
                            FlowerAnimation.spriteCache[firstFrameKey].onerror = () => resolve();
                        })
                    ];
                })
            ).flat()
        );
    }

    handleClick() {
        const isCreatorPage = window.location.pathname.includes('creator.html');

        if (isCreatorPage) {
            setTimeout(() => {
                const parentItem = this.img?.closest('.directory-item');
                if (!parentItem) return;

                const input = parentItem.querySelector('input[type="radio"]');
                if (input?.checked && !this.isPlaying) {
                    this.playAnimation(40);
                }
            }, 10);
        } else {
            if (!this.isPlaying) {
                this.playAnimation(40);
            }
        }
    }

    playAnimation(frameDelay = 40, parentNode = null, targetImg = null, width = null, height = null) {
        if (this.isPlaying) return;

        this.isPlaying = true;
        FlowerAnimation.activeAnimations.add(this);

        const insertTarget = targetImg || this.img;
        const insertParent = parentNode || (insertTarget ? insertTarget.parentNode : null);

        if (!insertParent || !insertTarget) {
            this.isPlaying = false;
            FlowerAnimation.activeAnimations.delete(this);
            return;
        }

        if (this.img && !targetImg) {
            this.img.classList.add('animating');
        }

        const createCanvas = () => {
            this.canvas = document.createElement('canvas');
            this.canvas.style.display = 'none';
            this.canvas.style.opacity = '1';

            if (parentNode && targetImg) {
                const fallbackSize = Math.max(window.innerWidth * 0.9, 200);
                this.canvas.width = width || fallbackSize;
                this.canvas.height = height || fallbackSize;
                this.canvas.style.width = `${width || fallbackSize}px`;
                this.canvas.style.height = `${height || fallbackSize}px`;
                this.canvas.style.position = 'absolute';
                this.canvas.style.top = '50%';
                this.canvas.style.left = '50%';
                this.canvas.style.transform = 'translate(-50%, -50%)';
                this.canvas.style.margin = '0';
            } else {
                const imgRect = insertTarget.getBoundingClientRect();
                const isCreatorPage = window.location.pathname.includes('creator.html');
                const scaleFactor = isCreatorPage ? 1.05 : 1.0;
                const baseHeight = isCreatorPage ? 180 : 180;
                this.canvas.width = imgRect.width * scaleFactor;
                this.canvas.height = imgRect.height * scaleFactor;
                this.canvas.style.width = `${100 * scaleFactor}%`;
                this.canvas.style.height = `${baseHeight * scaleFactor}px`;
                this.canvas.style.paddingTop = `${20 * scaleFactor}px`;
                this.canvas.style.position = 'relative';
                this.canvas.style.objectFit = 'contain';
            }

            this.ctx = this.canvas.getContext('2d');
            insertParent.insertBefore(this.canvas, insertTarget);
        };

        const startAnimation = () => {
            createCanvas();
            this.canvas.style.display = 'block';
            let currentFrame = 0;
            const totalDuration = frameDelay * this.frameCount;
            const startTime = performance.now();

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const scale = this.canvas.height / this.frameHeight;
            const drawWidth = this.frameWidth * scale;
            const drawHeight = this.canvas.height;
            const offsetX = Math.floor((this.canvas.width - drawWidth) / 2) -
                (window.location.pathname.includes('creator.html') && !parentNode ? 5 : 0);
            const offsetY = 0;

            this.ctx.drawImage(
                this.spriteImg,
                0, 0,
                this.frameWidth, this.frameHeight,
                offsetX, offsetY, drawWidth, drawHeight
            );

            insertTarget.style.display = 'none';

            const animate = (currentTime) => {
                if (!this.isPlaying) return;

                const elapsed = currentTime - startTime;
                currentFrame = Math.min(this.frameCount - 1,
                    Math.floor((elapsed / totalDuration) * this.frameCount));

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(
                    this.spriteImg,
                    currentFrame * this.frameWidth, 0,
                    this.frameWidth, this.frameHeight,
                    offsetX, offsetY, drawWidth, drawHeight
                );

                if (currentFrame < this.frameCount - 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.finishAnimation(insertTarget);
                }
            };

            requestAnimationFrame(animate);
        };

        if (!this.spriteImg.complete) {
            createCanvas();
            this.canvas.style.display = 'block';
            const tempCtx = this.canvas.getContext('2d');
            const tempImg = new Image();
            tempImg.src = this.firstFrame;
            tempImg.onload = () => {
                const scale = this.canvas.height / this.frameHeight;
                const drawWidth = this.frameWidth * scale;
                const offsetX = Math.floor((this.canvas.width - drawWidth) / 2) -
                    (window.location.pathname.includes('creator.html') && !parentNode ? 10 : 0);

                tempCtx.drawImage(
                    tempImg,
                    0, 0,
                    this.frameWidth, this.frameHeight,
                    offsetX, 0, drawWidth, this.canvas.height
                );
                insertTarget.style.display = 'none';
                this.spriteImg.onload = startAnimation;
            };
            tempImg.onerror = () => {
                this.finishAnimation(insertTarget);
            };
        } else {
            startAnimation();
        }

        this.spriteImg.onerror = () => {
            this.finishAnimation(insertTarget);
        };
    }

    finishAnimation(insertTarget) {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        if (this.img) {
            this.img.classList.remove('animating');
        }
        if (insertTarget) {
            insertTarget.style.display = 'block';
            insertTarget.style.opacity = '1';
            const testImage = new Image();
            testImage.onload = () => {
                insertTarget.src = this.firstFrame;
            };
            testImage.onerror = () => {
                insertTarget.src = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${this.flowerName}/white/0001.png`;
            };
            testImage.src = this.firstFrame;
        }
        this.isPlaying = false;
        FlowerAnimation.activeAnimations.delete(this);
        this.canvas = null;
        this.ctx = null;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const flowers = [
        'carnation', 'dahlia', 'hippeastrum', 'hydrangea', 'iris',
        'calla', 'camellia', 'crocus', 'lisianthus', 'lily',
        'forget-me-not', 'orchid', 'peony', 'ranunculus', 'rose',
        'lilac', 'tulip', 'chrysanthemum', 'cymbidium', 'eustoma'
    ];

    // Создаём анимации сразу — без ожидания предзагрузки всего
    const animations = flowers.map((flower, index) => new FlowerAnimation(flower, `img${index + 1}`));

    // Предзагружаем только первые кадры (белый цвет) для видимых элементов
    // Остальные цвета загружаются лениво при смене цвета (updateSprite уже это делает)
    const visibleFlowers = flowers.slice(0, 8); // первые 8 — скорее всего в viewport
    FlowerAnimation.preloadImages(visibleFlowers, ['white']);

    // Остальные грузим с задержкой, чтобы не блокировать первый рендер
    setTimeout(() => {
        const remainingFlowers = flowers.slice(8);
        FlowerAnimation.preloadImages(remainingFlowers, ['white']);
    }, 3000);

    // Предзагрузка других цветов только если пользователь начал взаимодействие
    let otherColorsPreloaded = false;
    document.addEventListener('click', () => {
        if (!otherColorsPreloaded) {
            otherColorsPreloaded = true;
            setTimeout(() => {
                FlowerAnimation.preloadImages(flowers, ['pink', 'red', 'yellow', 'purple', 'orange', 'blue', 'green', 'vinous']);
            }, 500);
        }
    }, { once: true });
});