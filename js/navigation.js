document.addEventListener('DOMContentLoaded', function() {
    // Получаем все этапы
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;
    const navMenu = document.querySelector('nav.creator-nav');

    // Функция для обновления стилей меню
    function updateMenuStyles() {
        if (!navMenu) return;

        const activeStep = document.querySelector('.step.active');
        if (!activeStep) return;

        if (activeStep.classList.contains('step-1')) {
            // Стили для первого этапа
            navMenu.style.background = '';
            navMenu.style.boxShadow = '';
        } else if (activeStep.classList.contains('step-2')) {
            // Стили для второго этапа
            navMenu.style.background = '#ff957a';
            navMenu.style.boxShadow = '0 0 0 7px #fd8262';
        } else if (activeStep.classList.contains('step-3')) {
            // Получаем выбранную форму и состояние радио-кнопок
            const boxRadio = document.getElementById('radio-3');
            const paperRadio = document.getElementById('radio-2');
            const activeShape = document.querySelector('.form-shape.active');
            const shapes = ['form-circle', 'form-square', 'form-rectangle'];
            const selectedShape = activeShape ? activeShape.className.split(' ').find(cls => shapes.includes(cls)) : 'form-circle';

            if (selectedShape !== 'form-circle' || (boxRadio && boxRadio.checked)) {
                // Стили для третьего этапа (не круг или выбран box)
                navMenu.style.background = '#ff957a';
                navMenu.style.boxShadow = '0 0 0 7px #fd8262';
            } else {
                // Стили для третьего этапа (круг и выбран paper)
                navMenu.style.background = '';
                navMenu.style.boxShadow = '';
            }
        }
    }

    // Функция для показа текущего этапа
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        currentStep = stepIndex;

        // Обновляем стили меню после изменения этапа
        updateMenuStyles();

        // Вызываем событие перехода
        document.dispatchEvent(new CustomEvent('stepChanged', {
            detail: { step: 'step-' + (stepIndex + 1) }
        }));
    }

    // Функция для сокрытия контента во время анимации
    function hideContent() {
        const logo = document.querySelector('.image');
        if (logo) {
            logo.style.visibility = 'visible';
        }
        document.body.style.pointerEvents = 'none';
    }

    // Функция для показа контента после анимации
    function showContent(direction) {
        document.body.style.pointerEvents = 'auto';
        const activeStep = document.querySelector('.step.active');
        const stepClass = activeStep ? activeStep.className.match(/step-\d+/)?.[0] : '';
        document.dispatchEvent(new CustomEvent('transitionEnd', { detail: { step: stepClass, direction } }));
    }

    // Обработчики для кнопок "Продолжить"
    document.querySelectorAll('.next-btn-short').forEach(button => {
        button.addEventListener('click', function(e) {
            if (currentStep >= steps.length - 1) return;

            // На step-2 проверяем, заблокирована ли кнопка
            if (document.querySelector('.step-2.active') && button.classList.contains('disabled')) {
                return; // Позволяем insert.js обработать тост
            }

            e.preventDefault(); // Предотвращаем немедленный переход
            hideContent();

            // Используем animateLeftToRight из transition.js
            window.animateLeftToRight(e, null, () => {
                // Callback для смены этапа на 225 мс
                showStep(currentStep + 1);
                showContent('next');
            }, 400);
        }, { capture: true });
    });

    // Обработчики для кнопок "Назад"
    document.querySelectorAll('.back-btn-short').forEach(button => {
        button.addEventListener('click', function(e) {
            if (currentStep <= 0) return;

            e.preventDefault(); // Предотвращаем немедленный переход
            hideContent();

            // Используем animateRightToLeft из transition.js
            window.animateRightToLeft(e, null, () => {
                // Callback для смены этапа на 225 мс
                showStep(currentStep - 1);
                showContent('back');
            }, 400);
        }, { capture: true });
    });

    // Инициализация - показываем первый этап
    showStep(0);

    // Обработчик изменения формы (если используется в шаге 3)
    document.addEventListener('change', function(e) {
        if (e.target.matches('input[name="tabs"]')) {
            updateMenuStyles();
        }
    });

    // Обработчик изменения формы букета (если используется)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.form-shape')) {
            setTimeout(updateMenuStyles, 100);
        }
    });
});