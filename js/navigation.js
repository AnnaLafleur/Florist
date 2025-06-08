document.addEventListener('DOMContentLoaded', function() {
    // Получаем все этапы
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;

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
});