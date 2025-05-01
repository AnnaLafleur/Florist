document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.learn-more-1');
    const modal = document.getElementById('modal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalImage = modal.querySelector('.modal-image');
    const modalDesc = modal.querySelector('.modal-description');
    const modalClose = modal.querySelector('.modal-close');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const parent = this.closest('.directory-item');
            const title = parent.querySelector('.item-caption').textContent;
            const imgSrc = parent.querySelector('img').src;

            modalTitle.textContent = title;
            modalImage.src = imgSrc;
            modalDesc.textContent = `Здесь будет подробное описание ${title}`;

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Проверяем высоту и включаем прокрутку при необходимости
            if (modal.offsetHeight > window.innerHeight) {
                modal.querySelector('.modal-container').style.overflowY = 'auto';
            }
        });
    });

    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Обработчик изменения размера окна
    window.addEventListener('resize', function() {
        if (modal.style.display === 'flex') {
            const modalContainer = modal.querySelector('.modal-container');
            if (modalContainer.offsetHeight > window.innerHeight) {
                modalContainer.style.overflowY = 'auto';
            } else {
                modalContainer.style.overflowY = 'visible';
            }
        }
    });
});