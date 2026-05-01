const text = 'Florist';

// Преобразование строки в массив
const createLetterArray = (string) => {
  return string.split('');
};

// Создание слоев букв, обернутых в теги span
const createLetterLayers = (array) => {
  return array.map((letter) => {
    let layer = '';
    // Количество слоев для каждой буквы
    for (let i = 1; i <= 2; i++) {
      // Если буква - пробел
      if (letter == ' ') {
        layer += '<span class="space"></span>';
      } else {
        layer += `<span class="letter-${i}">${letter}</span>`;
      }
    }
    return layer;
  });
};

// Каждая буква в родительском контейнере
const createLetterContainers = (array) => {
  return array.map((item) => {
    return `<div class="wrapper">${item}</div>`;
  });
};

// Вывод текстовых слоев в DOM
const outputLayers = () => {
  const textElement = document.getElementById('text');
  if (textElement) {
    textElement.innerHTML = createLetterContainers(createLetterLayers(createLetterArray(text))).join('');
  }
};

// Настройка ширины и высоты каждой буквы
const adjustLetterSizes = () => {
  const spans = document.querySelectorAll('#text .wrapper span');
  spans.forEach((span) => {
    span.parentElement.style.width = `${span.offsetWidth}px`;
    span.parentElement.style.height = `${span.offsetHeight}px`;
  });
};

// Постепенное появление каждой буквы
const animateLetters = () => {
  const wrappers = document.querySelectorAll('#text .wrapper');
  let time = 250;
  wrappers.forEach((wrapper) => {
    time += 75;
    setTimeout(() => {
      wrapper.style.top = '0px';
    }, time);
  });
};

// Инициализация после загрузки шрифта
const initializeText = () => {
  document.fonts.ready.then(() => {
    outputLayers();
    adjustLetterSizes();
    animateLetters();
  }).catch((err) => {
    console.error('Font loading failed:', err);
    // Fallback: Run initialization anyway after a timeout
    setTimeout(() => {
      outputLayers();
      adjustLetterSizes();
      animateLetters();
    }, 2000);
  });
};

// Вызов инициализации при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeText);