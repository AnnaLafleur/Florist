class FlowerAnimation {
  constructor(flowerName, elementId) {
    this.sprite = `img/animation/${flowerName}/white.png`;
    this.firstFrame = `img/animation/${flowerName}/white/0001.png`;
    this.img = document.getElementById(elementId);
    this.isPlaying = false;
    this.canvas = null;
    this.ctx = null;
    this.spriteImg = new Image();
    this.spriteImg.src = this.sprite;
    this.frameWidth = 1079;
    this.frameHeight = 1080;
    this.frameCount = 30;

    if (this.img) {
      this.img.src = this.firstFrame;
      this.img.style.cursor = 'pointer';
      this.img.addEventListener('click', () => this.handleClick());
    }
  }

  handleClick() {
    if (!this.isPlaying) {
      this.playAnimation(40);
    }
  }

  playAnimation(frameDelay = 40) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const loader = document.querySelector('.preloader');

    this.canvas = document.createElement('canvas');
    this.canvas.width = 250;
    this.canvas.height = 180;
    this.canvas.style.paddingTop = '20px';
    this.canvas.style.height = '180px';
    this.ctx = this.canvas.getContext('2d');

    this.img.parentNode.insertBefore(this.canvas, this.img);

    const startAnimation = () => {
      loader.style.display = 'none';
      this.img.style.display = 'none';
      this.canvas.style.display = 'block';
      let currentFrame = 0;
      const totalDuration = frameDelay * this.frameCount;
      const startTime = performance.now();

      const animate = (currentTime) => {
        if (!this.isPlaying) return;

        const elapsed = currentTime - startTime;
        currentFrame = Math.min(this.frameCount - 1, Math.floor((elapsed / totalDuration) * this.frameCount));

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const scale = 200 / this.frameHeight;
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
          this.canvas.parentNode.removeChild(this.canvas);
          this.img.style.display = 'block';
          this.isPlaying = false;
          this.canvas = null;
          this.ctx = null;
        }
      };

      requestAnimationFrame(animate);
    };

    if (!this.spriteImg.complete) {
      loader.style.display = 'block';
      this.spriteImg.onload = startAnimation;
    } else {
      startAnimation();
    }
    this.spriteImg.onerror = () => {
      console.error(`Failed to load sprite: ${this.sprite}`);
      loader.style.display = 'none';
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
      this.img.style.display = 'block';
      this.isPlaying = false;
      this.canvas = null;
      this.ctx = null;
    };
  }
}

// После загрузки DOM создаем анимации для всех цветов
window.addEventListener('DOMContentLoaded', () => {
    // Инициализация анимаций для 20 различных цветов
    new FlowerAnimation('carnation', 'img1');    // Гвоздика
    new FlowerAnimation('dahlia', 'img2');       // Георгин
    new FlowerAnimation('hippeastrum', 'img3');  // Гиппеаструм
    new FlowerAnimation('hydrangea', 'img4');    // Гортензия
    new FlowerAnimation('iris', 'img5');         // Ирис
    new FlowerAnimation('calla', 'img6');        // Калла
    new FlowerAnimation('camellia', 'img7');     // Камелия
    new FlowerAnimation('crocus', 'img8');       // Крокус
    new FlowerAnimation('lisianthus', 'img9');   // Лизиантус
    new FlowerAnimation('lily', 'img10');         // Лилия
    new FlowerAnimation('forget-me-not', 'img11'); // Незабудка
    new FlowerAnimation('orchid', 'img12');      // Орхидея
    new FlowerAnimation('peony', 'img13');       // Пион
    new FlowerAnimation('ranunculus', 'img14');  // Ранункулюс
    new FlowerAnimation('rose1', 'img15');        // Роза
    new FlowerAnimation('lilac', 'img16');       // Сирень
    new FlowerAnimation('tulip', 'img17');       // Тюльпан
    new FlowerAnimation('chrysanthemum', 'img18'); // Хризантема
    new FlowerAnimation('cymbidium', 'img19');   // Цимбидиум
    new FlowerAnimation('eustoma', 'img20');     // Эустома
});