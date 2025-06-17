document.addEventListener('DOMContentLoaded', () => {
  // Общая функция для скрытия контента перед анимацией
  function hideContent() {
    const activeContent = document.querySelector('.step.active .step-content') ||
                         document.querySelector('.creator-container') ||
                         document.querySelector('.directory-container') ||
                         document.querySelector('.rose') || // Добавлено для index.html
                         document.querySelector('.main-content');
    const nav = document.querySelector('.nav');
    const logo = document.querySelector('.image');

    if (activeContent) {
      activeContent.style.opacity = '0';
      activeContent.style.visibility = 'hidden';
    }
    if (nav) {
      nav.style.visibility = 'hidden';
    }
    // Оставляем логотип видимым
    if (logo) {
      logo.style.visibility = 'visible';
    }
  }

  // Общая функция для показа контента после анимации
  function showContent() {
    const activeContent = document.querySelector('.step.active .step-content') ||
                         document.querySelector('.creator-container') ||
                         document.querySelector('.directory-container') ||
                         document.querySelector('.rose') || // Добавлено для index.html
                         document.querySelector('.main-content');
    const nav = document.querySelector('.nav');

    if (activeContent) {
      activeContent.style.opacity = '1';
      activeContent.style.visibility = 'visible';
    }
    if (nav) {
      nav.style.visibility = 'visible';
    }
  }

  // Функция для анимации слева направо (для "Продолжить")
  function animateLeftToRight() {
    hideContent();

    const leftLayers = document.querySelectorAll('.left-layer, .left-layer--2, .left-layer--3');
    leftLayers.forEach(layer => {
      layer.style.zIndex = '2000';
      layer.style.display = 'block';
    });

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

    setTimeout(() => {
      leftLayers.forEach(layer => {
        layer.style.zIndex = '-1';
        layer.style.display = 'none';
        layer.style.left = '-100%';
      });
      showContent();
    }, 800);
  }

  // Функция для анимации справа налево (для "Назад")
  function animateRightToLeft() {
    hideContent();

    const rightLayers = document.querySelectorAll('.right-layer, .right-layer--2, .right-layer--3');
    rightLayers.forEach(layer => {
      layer.style.zIndex = '2000';
      layer.style.display = 'block';
    });

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

    setTimeout(() => {
      rightLayers.forEach(layer => {
        layer.style.zIndex = '-1';
        layer.style.display = 'none';
        layer.style.left = '100%';
      });
      showContent();
    }, 800);
  }

  // Функция для анимации сверху вниз (для лого, кнопок, ссылок)
  function animateTopToBottom(event, href) {
    if (event) event.preventDefault();
    hideContent();

    const topLayers = document.querySelectorAll('.top-layer, .top-layer--2, .top-layer--3');
    topLayers.forEach(layer => {
      layer.style.zIndex = '2000';
      layer.style.display = 'block';
    });

    const layerGroups = [
      document.querySelectorAll('.top-layer'),
      document.querySelectorAll('.top-layer--2'),
      document.querySelectorAll('.top-layer--3')
    ];

    layerGroups.forEach((layers, index) => {
      const delay = index * 100;
      layers.forEach(layer => {
        layer.style.transition = 'none';
        layer.style.top = '-100%';
        void layer.offsetWidth;
        layer.style.transition = `top 0.7s cubic-bezier(0.645, 0.045, 0.355, 1) ${delay}ms`;
        layer.style.top = '100%';
      });
    });

    setTimeout(() => {
      topLayers.forEach(layer => {
        layer.style.zIndex = '-1';
        layer.style.display = 'none';
        layer.style.top = '-100%';
      });
      if (href) {
        window.location.href = href;
      } else {
        showContent();
      }
    }, 1000);
  }

  // Обработчики событий
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

  // Обработчик для логотипа
  document.querySelectorAll('.image').forEach(element => {
    element.addEventListener('click', (e) => {
      const href = 'index.html';
      if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
        animateTopToBottom(e, href);
      }
    });
  });

  // Обработчики для кнопок на главной странице
  document.querySelectorAll('.learn-more-1 a, .learn-more-2 a').forEach(button => {
    button.addEventListener('click', (e) => {
      const href = button.getAttribute('href');
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      if (href && href !== '#' && href !== currentPath) {
        e.preventDefault();
        animateTopToBottom(e, href);
      }
    });
  });

  // Обработчики для ссылок меню
  document.querySelectorAll('.nav__item a').forEach(button => {
    button.addEventListener('click', (e) => {
      const href = button.getAttribute('href');
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      if (href && href !== '#' && href !== currentPath) {
        e.preventDefault();
        animateTopToBottom(e, href);
      }
    }, { capture: true });
  });
});