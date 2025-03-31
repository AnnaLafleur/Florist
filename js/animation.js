class FlowerAnimation {
    constructor(flowerName, elementId) {
        // Подготовка кадров анимации
        this.frames = [];
        for (let i = 1; i <= 30; i++) {
            this.frames.push(`img/animation/${flowerName}/white/${String(i).padStart(4,'0')}.png`);
        }

        // Инициализация элемента
        this.img = document.getElementById(elementId);
        this.isPlaying = false;
        this.loadedFrames = [];
        this.animationTimer = null; // Для хранения таймера

        if (this.img) {
            this.preloadFrames().then(() => {
                this.img.style.cursor = 'pointer';
                this.img.addEventListener('click', () => this.handleClick());
                this.img.src = this.frames[0];
            });
        }
    }

    // Предзагрузка кадров
    async preloadFrames() {
        const loadImage = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = src;
            });
        };

        for (const frame of this.frames) {
            const loaded = await loadImage(frame);
            if (loaded) this.loadedFrames.push(loaded);
        }
    }

    // Обработчик клика
    handleClick() {
        if (!this.isPlaying && this.loadedFrames.length > 0) {
            this.playAnimation(40); // Значение по умолчанию (60 мс)
        }
    }

    // Воспроизведение анимации с настраиваемой скоростью
    playAnimation(frameDelay = 40) {
        if (this.isPlaying) return;

        this.isPlaying = true;
        let currentFrame = 0;

        const animate = () => {
            if (currentFrame < this.loadedFrames.length) {
                this.img.src = this.loadedFrames[currentFrame].src;
                currentFrame++;
                this.animationTimer = setTimeout(() => {
                    requestAnimationFrame(animate);
                }, frameDelay);
            } else {
                this.isPlaying = false;
                clearTimeout(this.animationTimer);
            }
        };

        animate();
    }
}

// После загрузки DOM создаем анимации для всех цветов
window.addEventListener('DOMContentLoaded', () => {
    // Инициализация анимаций для 20 различных цветов
    new FlowerAnimation('dahlia', 'img1');       // Георгин
    new FlowerAnimation('hippeastrum', 'img2');  // Гиппеаструм
    new FlowerAnimation('hydrangea', 'img3');    // Гортензия
    new FlowerAnimation('iris', 'img4');         // Ирис
    new FlowerAnimation('calla', 'img5');        // Калла
    new FlowerAnimation('camellia', 'img6');     // Камелия
    new FlowerAnimation('crocus', 'img7');       // Крокус
    new FlowerAnimation('lisianthus', 'img8');   // Лизиантус
    new FlowerAnimation('lily', 'img9');         // Лилия
    new FlowerAnimation('forget-me-not', 'img10'); // Незабудка
    new FlowerAnimation('orchid', 'img11');      // Орхидея
    new FlowerAnimation('peony', 'img12');       // Пион
    new FlowerAnimation('ranunculus', 'img13');  // Ранункулюс
    new FlowerAnimation('rose1', 'img14');        // Роза
    new FlowerAnimation('chamomile', 'img15');   // Ромашка
    new FlowerAnimation('lilac', 'img16');       // Сирень
    new FlowerAnimation('tulip', 'img17');       // Тюльпан
    new FlowerAnimation('chrysanthemum', 'img18'); // Хризантема
    new FlowerAnimation('cymbidium', 'img19');   // Цимбидиум
    new FlowerAnimation('eustoma', 'img20');     // Эустома
});