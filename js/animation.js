class FlowerAnimation {
    static spriteCache = {};
    static isGlobalAnimating = false;

    constructor(flowerName, elementId) {
        this.flowerName = flowerName;
        this.elementId = elementId;
        this.color = 'white';
        this.sprite = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${this.color}.png`;
        this.firstFrame = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${this.color}/0001.png`;
        this.img = document.getElementById(elementId);
        this.isPlaying = false;
        this.canvas = null;
        this.ctx = null;
        this.spriteImg = new Image();
        this.spriteImg.src = this.sprite;
        this.frameWidth = 1079;
        this.frameHeight = 1080;
        this.frameCount = 30;

        // Find the parent .directory-item
        const parent = this.img ? this.img.closest('.directory-item') : null;
        if (parent) {
            // Attach click event to the entire .directory-item
            parent.style.cursor = 'pointer';
            parent.addEventListener('click', (event) => {
                // Prevent the click from interfering with radio button if clicked directly on input
                if (event.target.type !== 'radio') {
                    this.handleClick();
                }
            });

            // Observe color changes
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
        if (!this.isPlaying && !FlowerAnimation.isGlobalAnimating) {
            this.playAnimation(40);
        }
    }

    playAnimation(frameDelay = 40, parentNode = null, targetImg = null, width = null, height = null) {
        if (this.isPlaying || FlowerAnimation.isGlobalAnimating) return;

        FlowerAnimation.isGlobalAnimating = true;
        this.isPlaying = true;

        const insertTarget = targetImg || this.img;
        const insertParent = parentNode || (insertTarget ? insertTarget.parentNode : null);

        if (!insertParent || !insertTarget) {
            this.isPlaying = false;
            FlowerAnimation.isGlobalAnimating = false;
            return;
        }

        if (this.img && !targetImg) {
            this.img.classList.add('animating');
        }

        const createCanvas = () => {
            this.canvas = document.createElement('canvas');
            this.canvas.style.display = 'none';

            if (!parentNode || !targetImg) {
                const imgRect = insertTarget.getBoundingClientRect();
                this.canvas.width = imgRect.width;
                this.canvas.height = imgRect.height;
                this.canvas.style.width = '100%';
                this.canvas.style.height = '180px';
                this.canvas.style.paddingTop = '20px';
                this.canvas.style.position = 'relative';
                this.canvas.style.objectFit = 'contain';
            } else {
                this.canvas.width = width || 1079;
                this.canvas.height = height || 1080;
                this.canvas.style.width = `${width || 1079}px`;
                this.canvas.style.height = `${height || 1080}px`;
                this.canvas.style.position = 'absolute';
                this.canvas.style.top = '50%';
                this.canvas.style.left = '50%';
                this.canvas.style.transform = 'translate(-50%, -50%)';
                this.canvas.style.margin = '0';
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
            const initialScale = this.canvas.height / this.frameHeight;
            const initialDrawWidth = this.frameWidth * initialScale;
            const initialDrawHeight = this.canvas.height;
            const initialOffsetX = Math.floor((this.canvas.width - initialDrawWidth) / 2);
            const initialOffsetY = 0;
            this.ctx.drawImage(
                this.spriteImg,
                0, 0,
                this.frameWidth, this.frameHeight,
                initialOffsetX, initialOffsetY, initialDrawWidth, initialDrawHeight
            );

            insertTarget.style.display = 'none';

            const animate = (currentTime) => {
                if (!this.isPlaying) return;

                const elapsed = currentTime - startTime;
                currentFrame = Math.min(this.frameCount - 1, Math.floor((elapsed / totalDuration) * this.frameCount));

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                const scale = this.canvas.height / this.frameHeight;
                const drawWidth = this.frameWidth * scale;
                const drawHeight = this.canvas.height;
                const offsetX = Math.floor((this.canvas.width - drawWidth) / 2);
                const offsetY = 0;
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
                const offsetX = Math.floor((this.canvas.width - drawWidth) / 2);
                tempCtx.drawImage(
                    tempImg,
                    0, 0,
                    this.frameWidth, this.frameHeight,
                    offsetX, 0, drawWidth, this.canvas.height
                );
                insertTarget.style.display = 'none';
                this.spriteImg.onload = startAnimation;
            };
        } else {
            startAnimation();
        }

        this.spriteImg.onerror = () => {
            console.error(`Не удалось загрузить спрайт: ${this.sprite}`);
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
        FlowerAnimation.isGlobalAnimating = false;
        this.canvas = null;
        this.ctx = null;
    }
}

// После загрузки DOM создаем анимации для всех цветов
window.addEventListener('DOMContentLoaded', () => {
    const flowers = [
        'carnation', 'dahlia', 'hippeastrum', 'hydrangea', 'iris',
        'calla', 'camellia', 'crocus', 'lisianthus', 'lily',
        'forget-me-not', 'orchid', 'peony', 'ranunculus', 'rose',
        'lilac', 'tulip', 'chrysanthemum', 'cymbidium', 'eustoma'
    ];

    // Предварительно загружаем все изображения
    FlowerAnimation.preloadImages(flowers, ['white']).then(() => {
        flowers.forEach((flower, index) => {
            new FlowerAnimation(flower, `img${index + 1}`);
        });
    });
});