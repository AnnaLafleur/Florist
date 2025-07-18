// Изменение цвета выделенного текста
function changeSelectionColor() {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    ::selection {
      background-color: #ff9175;
      color: #ffffff;
    }
    ::-moz-selection {
      background-color: #ff9175;
      color: #ffffff;
    }
    .fill-all-btn img, .clear-all-btn img, .fill-all-btn .title, .clear-all-btn .title {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
  `;
  document.head.appendChild(style);
}

// Вызываем функцию изменения цвета выделения
changeSelectionColor();

// Запрет перетаскивания для всех изображений и ссылок
document.querySelectorAll('img, a').forEach(element => {
  element.setAttribute('draggable', 'false');
  element.addEventListener('dragstart', (e) => e.preventDefault());
});

// Основное правило: запрещаем выделение для ВСЕХ элементов
document.querySelectorAll('*').forEach(element => {
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';
  element.style.mozUserSelect = 'none';
  element.style.msUserSelect = 'none';
});

// Разрешаем выделение для основных текстовых элементов и контейнеров
const allowedTextElements = document.querySelectorAll(`
  p, span, h1, h2, h3, h4, h5, h6,
  a, li, td, th, div, pre, code, blockquote,
  .nav__item-text,
  .data-container-1, .data-container-2, .book, .rose,
  .data-container-1 *, .data-container-2 *, .book *, .rose *,
  .btn p, .btn > span:not(.button-text)
`);

allowedTextElements.forEach(el => {
  el.style.userSelect = 'text';
  el.style.webkitUserSelect = 'text';
  el.style.mozUserSelect = 'text';
  el.style.msUserSelect = 'text';
});

// Явно запрещаем выделение для всех интерактивных элементов
const interactiveElements = document.querySelectorAll(`
  button, input, select, textarea,
  .stepper, .count, .arrow-btn,
  .learn-more-1, .learn-more-2, .next-btn-short, .back-btn-short,
  .form-shape, .form-display, .form-container,
  .counter-container, .bouquet-form,
  .preloader, .preloader__row, .preloader__item,
  .nav__btn, .nav__cb, .nav__content,
  .btn, .fill-all-btn, .clear-all-btn,
  .fill-all-btn *, .clear-all-btn *
`);

interactiveElements.forEach(el => {
  el.style.userSelect = 'none';
  el.style.webkitUserSelect = 'none';
  el.style.mozUserSelect = 'none';
  el.style.msUserSelect = 'none';
});

// Особое правило для содержимого кнопок - запрещаем полностью
document.querySelectorAll('button *, .btn > *').forEach(child => {
  child.style.userSelect = 'none';
  child.style.webkitUserSelect = 'none';
  child.style.mozUserSelect = 'none';
  child.style.msUserSelect = 'none';
});

// Разрешаем выделение для элемента с id="text" если он существует
const textElement = document.getElementById('text');
if (textElement) {
  textElement.style.userSelect = 'text';
  textElement.style.webkitUserSelect = 'text';
  textElement.style.mozUserSelect = 'text';
  textElement.style.msUserSelect = 'text';
}