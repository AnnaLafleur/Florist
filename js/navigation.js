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

        // Вызываем событие перехода (если используется в других скриптах)
        document.dispatchEvent(new CustomEvent('stepChanged', {
            detail: { step: 'step-' + (stepIndex + 1) }
        }));
    }

    // Обработчики для кнопок "Продолжить"
    document.querySelectorAll('.next-btn-short').forEach(button => {
        button.addEventListener('click', function() {
            if (currentStep < steps.length - 1) {
                showStep(currentStep + 1);
            }
        });
    });

    // Обработчики для кнопок "Назад"
    document.querySelectorAll('.back-btn-short').forEach(button => {
        button.addEventListener('click', function() {
            if (currentStep > 0) {
                showStep(currentStep - 1);
            }
        });
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