document.addEventListener('DOMContentLoaded', function() {
    const greenRadio = document.getElementById('radio-green');
    const flowerRadio = document.getElementById('radio-flower');
    const step2Container = document.querySelector('.step-2 .right-section');
    const flowerGrid = step2Container?.querySelector('.directory-grid[data-type="flower"]');
    const greenGrid = step2Container?.querySelector('.directory-grid[data-type="green"]');

    if (!flowerGrid || !greenGrid || !greenRadio || !flowerRadio) {
        return;
    }

    let currentGridAnimation = null;
    let isAnimating = false;

    // Текущее состояние (только для сессии, не сохраняется)
    let step2State = {
        lastSelectedFlower: null,
        lastSelectedGreen: null
    };

    // Функция для обновления выделения
    function updateSelection() {
        // Убираем все выделения
        document.querySelectorAll('.step-2 .item-content.selected').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('.step-2 .item-content__input[type="radio"]:checked').forEach(radio => {
            radio.checked = false;
        });

        // Восстанавливаем выделение для активной вкладки
        if (flowerRadio.checked && step2State.lastSelectedFlower) {
            const item = flowerGrid.querySelector(`[data-flower-name="${step2State.lastSelectedFlower}"]`);
            if (item) {
                const radio = item.querySelector('.item-content__input');
                const content = item.querySelector('.item-content');
                if (radio && content) {
                    radio.checked = true;
                    content.classList.add('selected');
                }
            }
        } else if (greenRadio.checked && step2State.lastSelectedGreen) {
            const item = greenGrid.querySelector(`[data-green-name="${step2State.lastSelectedGreen}"]`);
            if (item) {
                const radio = item.querySelector('.item-content__input');
                const content = item.querySelector('.item-content');
                if (radio && content) {
                    radio.checked = true;
                    content.classList.add('selected');
                }
            }
        }
    }

    // Обработчик кликов для элементов
    function handleItemClick(event, grid, type) {
        let item = event.target.closest('.directory-item');

        if (!item) {
            item = event.target.closest('label.directory-item');
        }

        if (!item) return;

        const itemName = item.dataset[type + 'Name'];
        if (!itemName) return;

        // Если клик на чекбокс - пропускаем
        if (event.target.closest('.hackyBox')) return;

        // Останавливаем всплытие
        event.stopPropagation();
        event.preventDefault();

        const radio = item.querySelector('.item-content__input');
        const content = item.querySelector('.item-content');

        if (!radio || !content) return;

        const stateKey = type === 'flower' ? 'lastSelectedFlower' : 'lastSelectedGreen';
        const isCurrentlySelected = step2State[stateKey] === itemName;

        if (isCurrentlySelected) {
            // Если уже выделена - снимаем выделение
            radio.checked = false;
            content.classList.remove('selected');
            step2State[stateKey] = null;
        } else {
            // Если не выделена - выделяем
            // Снимаем все выделения
            grid.querySelectorAll('.item-content.selected').forEach(el => {
                el.classList.remove('selected');
            });
            grid.querySelectorAll('.item-content__input[type="radio"]:checked').forEach(el => {
                el.checked = false;
            });

            // Выделяем текущий элемент
            radio.checked = true;
            content.classList.add('selected');
            step2State[stateKey] = itemName;
        }
    }

    // Добавляем обработчики на сами элементы
    function addDirectHandlers() {
        // Для flower элементов
        flowerGrid.querySelectorAll('.directory-item').forEach(item => {
            item.addEventListener('click', function(event) {
                handleItemClick(event, flowerGrid, 'flower');
            });
        });

        // Для green элементов
        greenGrid.querySelectorAll('.directory-item').forEach(item => {
            item.addEventListener('click', function(event) {
                handleItemClick(event, greenGrid, 'green');
            });
        });
    }

    function fixGridPositions() {
        const rightSection = document.querySelector('.step-2 .right-section');

        if (rightSection) {
            rightSection.style.top = '0';
            rightSection.style.paddingTop = '130px';
            rightSection.style.height = '100vh';
        }

        const commonGridStyles = {
            marginTop: '20px',
            paddingTop: '0',
            paddingBottom: '20px',
            height: 'auto',
            minHeight: 'calc(100vh - 245px)',
            rowGap: '15px'
        };

        if (flowerGrid) {
            Object.assign(flowerGrid.style, commonGridStyles);
            flowerGrid.style.paddingLeft = '30px';
            flowerGrid.style.paddingRight = '25px';
            flowerGrid.style.columnGap = '15px';
        }

        if (greenGrid) {
            Object.assign(greenGrid.style, commonGridStyles);
            greenGrid.style.paddingLeft = '20px';
            greenGrid.style.paddingRight = '25px';
            greenGrid.style.columnGap = '18px';
        }
    }

    function adjustContainerHeight() {
        const rightSection = document.querySelector('.step-2 .right-section');
        const activeGrid = document.querySelector('.step-2 .right-section .directory-grid[style*="display: grid"]');

        if (rightSection && activeGrid) {
            const gridHeight = activeGrid.scrollHeight;
            const availableHeight = window.innerHeight - 130;

            if (gridHeight < availableHeight) {
                rightSection.style.height = (gridHeight + 130) + 'px';
                activeGrid.style.height = 'auto';
            } else {
                rightSection.style.height = '100vh';
                activeGrid.style.height = 'calc(100vh - 245px)';
            }
        }
    }

    function animateItems(grid) {
        if (!grid || grid.style.display === 'none') return;

        const items = Array.from(grid.querySelectorAll('.directory-item'));
        if (!items.length) return;

        if (currentGridAnimation) {
            currentGridAnimation.pause();
            isAnimating = false;
            currentGridAnimation = null;
        }

        anime.remove(items);

        items.forEach(item => {
            item.style.transform = 'rotateY(180deg)';
            item.style.transformStyle = 'preserve-3d';
            item.style.backfaceVisibility = 'hidden';
        });

        return new Promise(resolve => {
            requestAnimationFrame(() => {
                currentGridAnimation = anime({
                    targets: items,
                    rotateY: [180, 0],
                    duration: 1000,
                    delay: anime.stagger(100),
                    easing: 'cubicBezier(0.5,1,0.5,1.3)',
                    begin: function() {
                        isAnimating = true;
                    },
                    complete: function() {
                        items.forEach(item => {
                            const frontImg = item.querySelector('img:not(.backface-img)');
                            const backImg = item.querySelector('.backface-img');
                            if (frontImg && backImg) {
                                [frontImg.src, backImg.src] = [backImg.src, frontImg.src];
                            }
                            item.style.transform = 'rotateY(0deg)';
                        });
                        currentGridAnimation = null;
                        isAnimating = false;

                        setTimeout(() => {
                            adjustContainerHeight();
                        }, 100);
                        resolve();
                    }
                });
            });
        });
    }

    function toggleGrids(showFlower, isInitial = false) {
        if (currentGridAnimation) {
            currentGridAnimation.pause();
            isAnimating = false;
            currentGridAnimation = null;
        }

        const flowerItems = flowerGrid.querySelectorAll('.directory-item');
        const greenItems = greenGrid.querySelectorAll('.directory-item');

        anime.remove(flowerItems);
        anime.remove(greenItems);

        flowerItems.forEach(item => {
            item.style.transform = 'rotateY(180deg)';
            item.style.transformStyle = 'preserve-3d';
            item.style.backfaceVisibility = 'hidden';
        });

        greenItems.forEach(item => {
            item.style.transform = 'rotateY(180deg)';
        });

        requestAnimationFrame(() => {
            if (showFlower) {
                flowerGrid.style.display = 'grid';
                greenGrid.style.display = 'none';
            } else {
                greenGrid.style.display = 'grid';
                flowerGrid.style.display = 'none';
            }

            fixGridPositions();

            // Восстанавливаем выделение после переключения вкладки
            setTimeout(() => {
                updateSelection();
            }, 100);

            if (!isInitial) {
                requestAnimationFrame(() => {
                    const activeGrid = showFlower ? flowerGrid : greenGrid;
                    activeGrid.scrollTo({ top: 0, behavior: 'smooth' });
                    animateItems(activeGrid);
                });
            }

            setTimeout(() => {
                adjustContainerHeight();
            }, 200);
        });
    }

    const style = document.createElement('style');
    style.textContent = `
        .step-2 .right-section {
            top: 0;
            padding-top: 130px;
            height: auto;
            min-height: 100vh;
        }

        .step-2 .right-section .directory-grid {
            margin-top: 20px;
            padding-top: 0;
            padding-bottom: 20px;
            height: auto;
            min-height: calc(100vh - 245px);
            row-gap: 15px;
        }

        .step-2 .right-section .directory-grid[data-type="flower"] {
            margin-top: 20px;
            padding-top: 0;
            padding-bottom: 20px;
            padding-left: 30px;
            padding-right: 25px;
            column-gap: 15px;
        }

        .step-2 .right-section .directory-grid[data-type="green"] {
            margin-top: 20px;
            padding-top: 0;
            padding-bottom: 20px;
            padding-left: 20px;
            padding-right: 25px;
            column-gap: 22px;
        }

        .step-2 .right-section .directory-grid::-webkit-scrollbar {
            width: 8px;
        }
        .step-2 .right-section .directory-grid::-webkit-scrollbar-track {
            background: transparent;
        }
        .step-2 .right-section .directory-grid::-webkit-scrollbar-thumb {
            background: #ffffff;
            border-radius: 4px;
        }
        .step-2 .right-section .directory-grid::-webkit-scrollbar-thumb:hover {
            background: #fed7cd;
        }
        .hackyBox {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 10;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // Обработчики для чекбоксов (существующая логика)
    flowerGrid.addEventListener('click', (event) => {
        const checkbox = event.target.closest('.hackyBox');
        const directoryItem = event.target.closest('.directory-item');

        if (!directoryItem || !checkbox) return;

        const index = parseInt(directoryItem.dataset.index, 10);

        if (isNaN(index) || index < 0 || index >= window.state?.step2?.items.length) return;

        event.stopPropagation();
        window.state.step2.items[index].isActive = checkbox.checked;

        if (window.saveStateToLocalStorage) {
            window.saveStateToLocalStorage('step2');
        }

        isAnimating = true;
        if (checkbox.checked) {
            setTimeout(() => {
                if (window.moveToFirst) {
                    window.moveToFirst(index, flowerGrid, directoryItem, 'step2');
                }
                animateItems(flowerGrid);
                isAnimating = false;
            }, 400);
        } else {
            if (window.returnToPosition) {
                window.returnToPosition(index, flowerGrid, directoryItem, 'step2');
            }
            animateItems(flowerGrid);
            setTimeout(() => { isAnimating = false; }, 1450);
        }

        if (window.updatePositions) {
            window.updatePositions('step2');
        }
    });

    greenGrid.addEventListener('click', (event) => {
        const checkbox = event.target.closest('.hackyBox');
        const directoryItem = event.target.closest('.directory-item');

        if (!directoryItem || !checkbox) return;

        const index = parseInt(directoryItem.dataset.index, 10);

        if (isNaN(index) || index < 0 || index >= window.state?.step2?.items.length) return;

        event.stopPropagation();
        window.state.step2.items[index].isActive = checkbox.checked;

        if (window.saveStateToLocalStorage) {
            window.saveStateToLocalStorage('step2');
        }

        isAnimating = true;
        if (checkbox.checked) {
            setTimeout(() => {
                if (window.moveToFirst) {
                    window.moveToFirst(index, greenGrid, directoryItem, 'step2');
                }
                animateItems(greenGrid);
                isAnimating = false;
            }, 400);
        } else {
            if (window.returnToPosition) {
                window.returnToPosition(index, greenGrid, directoryItem, 'step2');
            }
            animateItems(greenGrid);
            setTimeout(() => { isAnimating = false; }, 1450);
        }

        if (window.updatePositions) {
            window.updatePositions('step2');
        }
    });

    // Переключение вкладок
    greenRadio.addEventListener('change', () => {
        toggleGrids(false);
        setTimeout(() => {
            fixGridPositions();
            adjustContainerHeight();
        }, 50);
        if (window.updatePositions) {
            window.updatePositions('step2');
        }
    });

    flowerRadio.addEventListener('change', () => {
        toggleGrids(true);
        setTimeout(() => {
            fixGridPositions();
            adjustContainerHeight();
        }, 50);
        if (window.updatePositions) {
            window.updatePositions('step2');
        }
    });

    document.addEventListener('transitionEnd', (e) => {
        if (e.detail?.step === 'step-2') {
            setTimeout(() => {
                fixGridPositions();
                adjustContainerHeight();
            }, 100);

            if (flowerRadio.checked) {
                updateSelection();
                requestAnimationFrame(() => {
                    flowerGrid.scrollTo({ top: 0, behavior: 'smooth' });
                    animateItems(flowerGrid);
                });
            } else {
                updateSelection();
                requestAnimationFrame(() => {
                    greenGrid.scrollTo({ top: 0, behavior: 'smooth' });
                    animateItems(greenGrid);
                });
            }
        }
    });

    window.addEventListener('resize', () => {
        setTimeout(() => {
            fixGridPositions();
            adjustContainerHeight();
        }, 100);
    });

    window.addEventListener('load', () => {
        setTimeout(() => {
            fixGridPositions();
            adjustContainerHeight();
        }, 300);
    });

    // Инициализация
    setTimeout(() => {
        toggleGrids(!greenRadio.checked, true);
        addDirectHandlers(); // Добавляем обработчики выделения
        setTimeout(() => {
            fixGridPositions();
            adjustContainerHeight();
            // При загрузке страницы никаких выделений не восстанавливаем
        }, 100);
    }, 100);
});