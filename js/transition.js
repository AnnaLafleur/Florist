document.addEventListener('DOMContentLoaded', () => {
  // Функция для анимации слева направо (для "Продолжить")
  function animateLeftToRight() {
    const activeContent = document.querySelector('.step.active .step-content');

    // 1. Резко скрываем контент
    if (activeContent) {
      activeContent.style.opacity = '0';
    }

    // 2. Сбрасываем и запускаем анимацию слева направо для всех слоев
    const layerGroups = [
      document.querySelectorAll('.left-layer'),
      document.querySelectorAll('.left-layer--2'),
      document.querySelectorAll('.left-layer--3')
    ];

    layerGroups.forEach((layers, index) => {
      const delay = index * 100;
      layers.forEach(layer => {
        layer.style.transition = 'none';
        layer.style.left = '-100%';
        void layer.offsetWidth;
        layer.style.transition = `left 0.7s cubic-bezier(0.645, 0.045, 0.355, 1) ${delay}ms`;
        layer.style.left = '100%';
      });
    });

    // 3. После анимации возвращаем видимость
    setTimeout(() => {
      if (activeContent) {
        activeContent.style.opacity = '1';
      }
    }, 800);
  }

  // Функция для анимации справа налево (для "Назад")
  function animateRightToLeft() {
    const activeContent = document.querySelector('.step.active .step-content');

    // 1. Резко скрываем контент
    if (activeContent) {
      activeContent.style.opacity = '0';
    }

    // 2. Сбрасываем и запускаем анимацию справа налево для всех слоев
    const layerGroups = [
      document.querySelectorAll('.right-layer'),
      document.querySelectorAll('.right-layer--2'),
      document.querySelectorAll('.right-layer--3')
    ];

    layerGroups.forEach((layers, index) => {
      const delay = index * 100;
      layers.forEach(layer => {
        layer.style.transition = 'none';
        layer.style.left = '100%';
        void layer.offsetWidth;
        layer.style.transition = `left 0.9s cubic-bezier(0.645, 0.045, 0.355, 1) ${delay}ms`;
        layer.style.left = '-100%';
      });
    });

    // 3. После анимации возвращаем видимость
    setTimeout(() => {
      if (activeContent) {
        activeContent.style.opacity = '1';
      }
    }, 800);
  }

  // Вешаем обработчики на кнопки
  document.querySelectorAll('.next-btn-short').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      animateLeftToRight();
    });
  });

  document.querySelectorAll('.back-btn-short').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      animateRightToLeft();
    });
  });
});