document.addEventListener('DOMContentLoaded', () => {
    // Список цветов из animation.js для сопоставления id изображения
    const flowerList = [
        'carnation', 'dahlia', 'hippeastrum', 'hydrangea', 'iris',
        'calla', 'camellia', 'crocus', 'lisianthus', 'lily',
        'forget-me-not', 'orchid', 'peony', 'ranunculus', 'rose',
        'lilac', 'tulip', 'chrysanthemum', 'cymbidium', 'eustoma'
    ];

    // Коэффициенты масштаба для каждого цветка
    const sizeMultipliers = {
        'carnation': 1.2,
        'dahlia': 1.242,
        'hippeastrum': 1.2,
        'hydrangea': 1.5,
        'iris': 1.326,
        'calla': 1.416,
        'camellia': 1.2,
        'crocus': 1.2,
        'lisianthus': 1.2,
        'lily': 1.416,
        'forget-me-not': 1.242,
        'orchid': 1.326,
        'peony': 1.416,
        'ranunculus': 1.242,
        'rose': 1.242,
        'lilac': 1.5,
        'tulip': 1.2,
        'chrysanthemum': 1.326,
        'cymbidium': 1.2,
        'eustoma': 1.242
    };

    // Цветки, которые нужно поворачивать
    const flowersToRotate = ['iris', 'calla', 'crocus', 'orchid'];

    // Находим SVG
    const svg = document.getElementById('flowers-svg');
    if (!svg) {
        return;
    }

    // Определяем текущую форму
    const activeShape = document.querySelector('.form-shape.active');
    const currentShapeIndex = activeShape ? ['form-circle', 'form-square', 'form-rectangle'].indexOf(activeShape.classList[1]) : 0;

    // Получаем viewBox для вычисления центра
    const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
    let centerX, centerY;

    if (currentShapeIndex === 0) { // Круг
        centerX = viewBox[2] / 2; // Центр viewBox
        centerY = viewBox[3] / 2;
    } else if (currentShapeIndex === 1) { // Квадрат
        centerX = 0; // Центр в SVG-координатах
        centerY = 0;
    } else if (currentShapeIndex === 2) { // Прямоугольник
        // Из rectangle.js: viewBox="0 0 viewBoxWidth viewBoxHeight", где viewBoxWidth = w * zoom + margin * 2, viewBoxHeight = h * zoom + margin * 2 + offset
        const margin = 20;
        const zoom = Math.min((window.innerWidth * 0.7 - margin * 2) / viewBox[2], (window.innerHeight * 0.8 - margin * 2) / viewBox[3]);
        const w = (viewBox[2] - margin * 2) / zoom; // Реальная ширина прямоугольника
        const h = (viewBox[3] - margin * 2 - (selectedFlowerCount === 3 ? 200 : selectedFlowerCount === 15 ? 100 : 0)) / zoom; // Реальная высота
        centerX = w / 2; // Центр в SVG-координатах
        centerY = h / 2;
    } else {
        centerX = viewBox[2] / 2; // Запасной вариант
        centerY = viewBox[3] / 2;
    }

    // Добавляем CSS для кнопки закрытия, круга для hover и кнопки "Заполнить все"
    const style = document.createElement('style');
    style.textContent = `
        .flower-group .hover-circle:hover ~ .close-btn {
            display: block;
        }
        .close-btn {
            cursor: pointer;
            display: none;
            z-index: 2000;
        }
        .hover-circle {
            fill: none !important;
            pointer-events: all;
            z-index: 1500;
        }
        .flower-image {
            pointer-events: none;
            z-index: 1000;
        }
        .flower-canvas {
            pointer-events: none;
            z-index: 1000;
        }
        .close-btn circle {
            fill: #f25056 !important;
        }
        .close-btn line {
            stroke: #ffffff !important;
            stroke-width: 5;
            stroke-linecap: butt;
        }
        #fill-all-btn {
            position: absolute;
            left: calc(60vw - 130px);
            bottom: 30px;
            padding: 10px 20px 10px 40px;
            background: transparent;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', sans-serif;
            font-size: 27px;
            z-index: 3000;
            display: none;
            align-items: center;
            gap: 10px;
        }
        #fill-all-btn:hover {
            color: white;
        }
        #fill-all-checkbox {
            position: absolute;
            left: 2px;
            top: 50%;
            transform: translateY(-50%);
            width: 28px;
            height: 28px;
            background: transparent;
            border: 2px solid white;
            border-radius: 5px;
            transition: background 0.15s ease, border 0.15s ease, transform 0.15s ease, opacity 0.18s linear;
            cursor: pointer;
        }
        #fill-all-checkbox.checked {
            background: #fd8262;
            border: none;
            opacity: 1;
            transform: scale(1) translateY(-50%);
        }
        #fill-all-checkbox:after {
            position: absolute;
            display: block;
            content: '';
            width: 0;
            height: 8px;
            top: 10px;
            left: 1px;
            background-color: #fff;
            transform: rotate(45deg);
            transition: width 0.1s linear, top 0.1s linear, left 0.1s linear;
        }
        #fill-all-checkbox.checked:after {
            width: 16px;
        }
        #fill-all-checkbox:before {
            position: absolute;
            display: block;
            content: '';
            width: 0;
            height: 8px;
            top: 7px;
            left: 6px;
            background-color: #fff;
            transform: rotate(-45deg);
            transition: width 0.1s linear 0.1s, top 0.1s linear 0.1s, left 0.1s linear 0.1s;
        }
        #fill-all-checkbox.checked:before {
            width: 24px;
        }
    `;
    document.head.appendChild(style);

    // Создаём кнопку "Заполнить все" с чекбоксом
    const fillAllButton = document.createElement('button');
    fillAllButton.id = 'fill-all-btn';
    fillAllButton.textContent = 'Заполнить все';
    const checkbox = document.createElement('span');
    checkbox.id = 'fill-all-checkbox';
    fillAllButton.prepend(checkbox);
    document.querySelector('.step-2 .left-section').appendChild(fillAllButton);

    // Функция для обновления видимости кнопки
    function updateFillAllButtonVisibility() {
        const selectedRadio = document.querySelector('.right-section .directory-item input[type="radio"]:checked');
        const isSecondStage = document.querySelector('.form-shape.active') !== null;
        // Подсчитываем свободные ячейки
        const circles = svg.querySelectorAll('circle:not(.hover-circle)[fill]:not([fill="none"])');
        let freeCellCount = 0;
        circles.forEach(circle => {
            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            const existingGroup = svg.querySelector(`g.flower-group circle[cx="${cx}"][cy="${cy}"]`);
            if (!existingGroup) {
                freeCellCount++;
            }
        });
        // Кнопка видна, если есть выбранный цветок, это второй этап и больше одной свободной ячейки
        fillAllButton.style.display = (selectedRadio && isSecondStage && freeCellCount > 1) ? 'flex' : 'none';
        // Сбрасываем чекбокс при появлении кнопки
        checkbox.classList.remove('checked');
    }

    // Инициализация видимости кнопки
    updateFillAllButtonVisibility();

    // Обработчик изменения состояния radio buttons в .right-section
    const radioButtons = document.querySelectorAll('.right-section .directory-item input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            updateFillAllButtonVisibility();
        });
        radio.addEventListener('click', () => {
            updateFillAllButtonVisibility();
        });
    });

    // Отслеживание изменений состояния страницы (переход на второй этап)
    const observer = new MutationObserver(() => {
        updateFillAllButtonVisibility();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Счётчик для уникальных идентификаторов
    let groupCounter = 0;

    // Функция для добавления цветка в круг
    function addFlowerToCircle(circle) {
        // Находим выделенную ячейку
        const selectedRadio = document.querySelector('.right-section .directory-item input[type="radio"]:checked');
        if (!selectedRadio) {
            return;
        }

        const parentItem = selectedRadio.closest('.directory-item');
        if (!parentItem) {
            return;
        }

        // Находим изображение в ячейке
        const imgElement = parentItem.querySelector('img');
        if (!imgElement) {
            return;
        }

        // Извлекаем имя цветка из id изображения
        const imgId = imgElement.id;
        const index = parseInt(imgId.replace('img', '')) - 1;
        if (isNaN(index) || index < 0 || index >= flowerList.length) {
            return;
        }
        const flowerName = flowerList[index];

        // Получаем множитель масштаба
        const sizeMultiplier = sizeMultipliers[flowerName] || 1;

        // Получаем цвет
        const color = parentItem.dataset.currentColor || 'white';

        // Формируем URL первого кадра
        const firstFrame = `https://cdn.jsdelivr.net/gh/AnnaLafleur/Florist@main/img/animation/${flowerName}/${color}/0001.png`;

        // Проверяем изображение
        const testImage = new Image();
        testImage.onerror = () => {};
        testImage.onload = () => {};
        testImage.src = firstFrame;

        // Получаем координаты и радиус круга
        const cx = parseFloat(circle.getAttribute('cx'));
        const cy = parseFloat(circle.getAttribute('cy'));
        const radius = parseFloat(circle.getAttribute('r'));

        // Вычисляем размер изображения
        const imageSize = radius * 2 * sizeMultiplier;

        // Создаём группу для изображения, круга для hover и анимации
        const flowerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        flowerGroup.setAttribute('class', 'flower-group');
        const groupId = `flower-group-${groupCounter++}`;
        flowerGroup.setAttribute('id', groupId);

        // Вычисляем поворот для указанных цветков
        let rotationAngle = 0;
        if (flowersToRotate.includes(flowerName)) {
            // Проверяем, находится ли цветок в центре
            const tolerance = 0.1; // Допуск для центрального цветка
            const distanceToCenter = Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2);
            if (distanceToCenter > tolerance) {
                // Угол от центра цветка к центру макета
                const dx = centerX - cx;
                const dy = centerY - cy;
                const angleToCenter = Math.atan2(dy, dx); // Угол в радианах
                // Угол поворота: нижняя грань (0° вниз) направлена к центру
                rotationAngle = (angleToCenter - Math.PI / 2) * (180 / Math.PI);
                // Нормализуем угол в диапазон [0, 360]
                rotationAngle = (rotationAngle + 360) % 360;
                flowerGroup.setAttribute('transform', `rotate(${rotationAngle}, ${cx}, ${cy})`);
            }
        }

        // Создаём элемент <image>
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('href', firstFrame);
        image.setAttribute('width', imageSize);
        image.setAttribute('height', imageSize);
        image.setAttribute('x', cx - imageSize / 2);
        image.setAttribute('y', cy - imageSize / 2);
        image.setAttribute('class', 'flower-image');

        // Создаём foreignObject для canvas анимации
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('x', cx - imageSize / 2);
        foreignObject.setAttribute('y', cy - imageSize / 2);
        foreignObject.setAttribute('width', imageSize);
        foreignObject.setAttribute('height', imageSize);
        foreignObject.setAttribute('class', 'flower-canvas');

        // Создаём canvas
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', imageSize);
        canvas.setAttribute('height', imageSize);
        canvas.style.width = `${imageSize}px`;
        canvas.style.height = `${imageSize}px`;
        foreignObject.appendChild(canvas);

        // Создаём круг для обработки hover с уменьшенным радиусом
        const hoverCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hoverCircle.setAttribute('class', 'hover-circle');
        hoverCircle.setAttribute('cx', cx);
        hoverCircle.setAttribute('cy', cy);
        hoverCircle.setAttribute('r', imageSize / 2 * 0.9);
        hoverCircle.setAttribute('data-group-id', groupId);

        // Создаём кнопку закрытия
        const closeBtn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        closeBtn.setAttribute('class', 'close-btn');
        const btnOffset = imageSize / 2 * 0.607;
        closeBtn.setAttribute('transform', `rotate(${-rotationAngle}, ${cx}, ${cy}) translate(${cx + btnOffset}, ${cy - btnOffset})`);
        const closeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        closeCircle.setAttribute('cx', 0);
        closeCircle.setAttribute('cy', 0);
        closeCircle.setAttribute('r', 18);
        const closeLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        closeLine1.setAttribute('x1', -6);
        closeLine1.setAttribute('y1', -6);
        closeLine1.setAttribute('x2', 6);
        closeLine1.setAttribute('y2', 6);
        const closeLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        closeLine2.setAttribute('x1', -6);
        closeLine2.setAttribute('y1', 6);
        closeLine2.setAttribute('x2', 6);
        closeLine2.setAttribute('y2', -6);
        closeBtn.appendChild(closeCircle);
        closeBtn.appendChild(closeLine1);
        closeBtn.appendChild(closeLine2);

        // Сохраняем ссылку на круг и линии плюса
        const circleData = {
            element: circle,
            fill: circle.getAttribute('fill'),
            stroke: circle.getAttribute('stroke'),
            lines: []
        };
        let nextSibling = circle.nextSibling;
        while (nextSibling && nextSibling.tagName === 'line') {
            circleData.lines.push({
                element: nextSibling,
                stroke: nextSibling.getAttribute('stroke')
            });
            nextSibling = nextSibling.nextSibling;
        }

        // Добавляем элементы в группу
        flowerGroup.appendChild(foreignObject);
        flowerGroup.appendChild(image);
        flowerGroup.appendChild(hoverCircle);
        flowerGroup.appendChild(closeBtn);
        svg.appendChild(flowerGroup);

        // Скрываем круг и плюс
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', 'none');
        circleData.lines.forEach(line => line.element.setAttribute('stroke', 'none'));

        // Инициализируем анимацию
        const flowerAnimation = new FlowerAnimation(flowerName, imgId);
        flowerAnimation.color = color;
        flowerAnimation.updateSprite();
        image.style.display = 'none'; // Скрываем image во время анимации
        flowerAnimation.playAnimation(40, foreignObject, canvas, imageSize, imageSize);

        // Удаление изображения, анимации и восстановление круга при клике на кнопку
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            flowerGroup.remove();
            circle.setAttribute('fill', circleData.fill);
            circle.setAttribute('stroke', circleData.stroke);
            circleData.lines.forEach(line => line.element.setAttribute('stroke', line.stroke));
            flowerAnimation.forceStopAnimation();
            // Обновляем видимость кнопки после удаления цветка
            updateFillAllButtonVisibility();
        });

        // Блокируем клики по hover-circle и canvas
        hoverCircle.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        canvas.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Показываем image после завершения анимации
        flowerAnimation.finishAnimation = function(originalFinishAnimation) {
            return function(insertTarget) {
                originalFinishAnimation.call(this, insertTarget);
                image.style.display = 'block';
                if (foreignObject && foreignObject.parentNode) {
                    foreignObject.parentNode.removeChild(foreignObject);
                }
                // Обновляем видимость кнопки после завершения анимации
                updateFillAllButtonVisibility();
            };
        }(flowerAnimation.finishAnimation);
    }

    // Делегируем обработку кликов по кругам
    svg.addEventListener('click', (event) => {
        const circle = event.target.closest('circle');
        if (!circle) {
            return;
        }

        event.stopPropagation();
        addFlowerToCircle(circle);
    });

    // Функция для задержки
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Обработчик для кнопки "Заполнить все"
    let isChecked = false;
    fillAllButton.addEventListener('click', async (e) => {
        isChecked = !isChecked;
        checkbox.classList.toggle('checked', isChecked);
        if (isChecked) {
            // Выбираем все круги, которые не являются hover-circle и имеют fill отличный от 'none'
            const circles = svg.querySelectorAll('circle:not(.hover-circle)[fill]:not([fill="none"])');
            for (const circle of circles) {
                const cx = parseFloat(circle.getAttribute('cx'));
                const cy = parseFloat(circle.getAttribute('cy'));
                const radius = parseFloat(circle.getAttribute('r'));
                // Проверяем, не связан ли круг с существующей flower-group
                const existingGroup = svg.querySelector(`g.flower-group circle[cx="${cx}"][cy="${cy}"]`);
                if (!existingGroup) {
                    addFlowerToCircle(circle);
                    await delay(300); // Задержка 300ms перед добавлением следующего цветка
                }
            }
        }
        // Обновляем видимость кнопки после заполнения всех ячеек
        updateFillAllButtonVisibility();
    });

    // Обработчик клика по чекбоксу
    checkbox.addEventListener('click', (e) => {
        e.stopPropagation(); // Предотвращаем срабатывание клика по кнопке
        fillAllButton.click(); // Программно вызываем клик по кнопке
    });
});