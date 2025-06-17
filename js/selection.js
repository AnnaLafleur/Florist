// Изменение цвета выделенного текста
function changeSelectionColor() {
  // Создаем элемент style
  const style = document.createElement('style');
  style.type = 'text/css';

  // CSS правило для изменения цвета выделения
  const css = `
    ::selection {
      background-color: #ff9175;
      color: #ffffff; /* Белый текст */
    }
    ::-moz-selection {
      background-color: #ff9175; /* Для Firefox */
      color: #ffffff;
    }
  `;

  // Добавляем правило в style элемент
  style.innerHTML = css;

  // Добавляем style элемент в head документа
  document.getElementsByTagName('head')[0].appendChild(style);
}

// Вызываем функцию
changeSelectionColor();

// Запрет перетаскивания для всех картинок
document.querySelectorAll('img').forEach(img => {
  img.setAttribute('draggable', 'false'); // HTML-атрибут
  img.addEventListener('dragstart', (e) => e.preventDefault()); // Отмена события
});

// Дополнительно: отмена перетаскивания для ссылок (если нужно)
document.querySelectorAll('a').forEach(a => {
  a.setAttribute('draggable', 'false');
  a.addEventListener('dragstart', (e) => e.preventDefault());
});

// Запрещаем выделение для всех элементов
document.querySelectorAll('*').forEach(element => {
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    element.style.mozUserSelect = 'none';
    element.style.msUserSelect = 'none';
});

// Разрешаем выделение для текстовых элементов, КРОМЕ #text
const textElements = document.querySelectorAll(`
  p:not(#text),
  span:not(#text),
  h1:not(#text), h2:not(#text), h3:not(#text), h4:not(#text), h5:not(#text), h6:not(#text),
  a:not(#text),
  li:not(#text),
  td:not(#text), th:not(#text),
  div:not(#text),
  pre:not(#text),
  code:not(#text),
  blockquote:not(#text)
`);

textElements.forEach(el => {
    el.style.userSelect = 'text';
    el.style.webkitUserSelect = 'text';
    el.style.mozUserSelect = 'text';
    el.style.msUserSelect = 'text';
});

// Явно запрещаем выделение для #text и его содержимого
const textElement = document.getElementById('text');
if (textElement) {
    textElement.style.userSelect = 'none';
    textElement.style.webkitUserSelect = 'none';
    textElement.style.mozUserSelect = 'none';
    textElement.style.msUserSelect = 'none';

    // Запрещаем выделение для всех дочерних элементов
    textElement.querySelectorAll('*').forEach(child => {
        child.style.userSelect = 'none';
        child.style.webkitUserSelect = 'none';
        child.style.mozUserSelect = 'none';
        child.style.msUserSelect = 'none';
    });
}