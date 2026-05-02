document.addEventListener('DOMContentLoaded', () => {
    const pageCloneContainer = document.createElement('div');
    pageCloneContainer.className = 'page-clone-container';
    pageCloneContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        overflow: hidden;
        display: none;
        background: #ffc6b7;
    `;
    document.body.appendChild(pageCloneContainer);
    const shadowRoot = pageCloneContainer.attachShadow({mode: 'open'});

    const pageClones = {};

    const baseUrl = 'https://annalafleur.github.io/Florist/';

    function preloadPageClones() {
        const pages = ['index.html', 'directory.html', 'creator.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        pages.forEach(page => {
            if (pageClones[page]) {
                return;
            }

            if (page === currentPage) {
                pageClones[page] = createPageClone(document.documentElement.outerHTML, page);
            } else {
                const pageUrl = page === 'index.html' ? baseUrl : `${baseUrl}${page}`;
                fetch(pageUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(html => {
                        pageClones[page] = createPageClone(html, page);
                    })
                    .catch(error => {
                        pageClones[page] = createPageClone('<html><body></body></html>', page);
                    });
            }
        });
    }

    function createPageClone(html, page) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => script.remove());

        const preloader = doc.querySelector('.preloader');
        if (preloader) {
            preloader.remove();
        }

        const transitionLayers = doc.querySelectorAll('[class*="layer"]');
        transitionLayers.forEach(layer => layer.remove());

        if (page === 'creator.html') {
            const notifications = doc.querySelectorAll('.message, [class*="message"], .attention, [class*="attention"]');
            notifications.forEach(notification => notification.remove());
        }

        let styles = '';
        doc.querySelectorAll('head link[rel="stylesheet"], head style').forEach(el => {
            styles += el.outerHTML + '\n';
        });

        styles += `
            <style>
                *,
                *:before,
                *:after {
                    animation: none !important;
                    transition: none !important;
                }

                .heart-container, .heart, .message, [class*="message"], .attention, [class*="attention"] {
                    display: none !important;
                }

                body * {
                    pointer-events: none !important;
                    cursor: default !important;
                }

                .directory-item:hover, .data-container-1:hover, .data-container-2:hover {
                    transform: none !important;
                    box-shadow: none !important;
                    background: #fd8262 !important;
                }

                .data-container-1 {
                    top: 100% !important;
                }
                .data-container-2 {
                    top: 110% !important;
                }
                .rose {
                    top: 0 !important;
                    width: 67vw;
                    margin-left: auto;
                    margin-right: auto;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                body {
                    margin: 0;
                    padding: 0;
                    background: #ffc6b7;
                }
                .directory-container, .container {
                    min-height: 200vh;
                }
                .directory-container, .container {
                    scrollbar-width: thin;
                    scrollbar-color: #ffa089 transparent;
                }
                .directory-container::-webkit-scrollbar, .container::-webkit-scrollbar {
                    width: 8px;
                }
                .directory-container::-webkit-scrollbar-track, .container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .directory-container::-webkit-scrollbar-thumb, .container::-webkit-scrollbar-thumb {
                    background: #ffa089;
                    border-radius: 4px;
                }
            </style>
        `;

        const allElements = doc.querySelectorAll('body *');
        allElements.forEach(el => {
            el.style.pointerEvents = 'none';
            el.style.cursor = 'default';
        });

        const cloneContent = styles + doc.body.outerHTML;
        return cloneContent;
    }

    function showTargetPageClone(href) {
        const pageName = href || 'index.html';
        const cloneHtml = pageClones[pageName];

        const noScrollPages = ['creator.html'];
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (currentPage === 'creator.html' && !noScrollPages.includes(pageName)) {
            pageCloneContainer.style.overflowY = 'auto';
            pageCloneContainer.style.height = '100%';
            pageCloneContainer.style.transform = 'translate3d(0, 0, 0)';
        } else {
            pageCloneContainer.style.overflowY = 'hidden';
            pageCloneContainer.style.height = '100%';
        }

        if (noScrollPages.includes(pageName)) {
            document.body.style.overflow = 'hidden';
            pageCloneContainer.style.overflowY = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        if (cloneHtml) {
            shadowRoot.innerHTML = cloneHtml;
            pageCloneContainer.style.display = 'block';
            setTimeout(() => {
                pageCloneContainer.style.opacity = '1';
            }, 10);
        } else {
            shadowRoot.innerHTML = '';
            pageCloneContainer.style.display = 'block';
            setTimeout(() => {
                pageCloneContainer.style.opacity = '1';
            }, 10);
        }
    }

    function hidePageClone() {
        pageCloneContainer.style.opacity = '0';
        setTimeout(() => {
            pageCloneContainer.style.display = 'none';
            shadowRoot.innerHTML = '';
            pageCloneContainer.style.overflowY = 'hidden';
            pageCloneContainer.style.transform = '';
            document.body.style.overflow = '';
        }, 200);
    }

    function hideContent() {
        const logo = document.querySelector('.image');
        if (logo) {
            logo.style.visibility = 'visible';
        }
        document.body.style.pointerEvents = 'none';
    }

    function showContent() {
        document.body.style.pointerEvents = 'auto';
    }

    window.animateLeftToRight = function(e, href, callback, transitionDelay = 350) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('transitionStart'));
        hideContent();

        const container = document.querySelector('.container');
        if (container) {
            container.style.zIndex = '2000';
        }

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

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isIntraPageTransition = currentPage === 'creator.html' && !href;

        if (!isIntraPageTransition) {
            setTimeout(() => {
                showTargetPageClone(href);
            }, 400);
        }

        if (isIntraPageTransition && callback) {
            setTimeout(callback, transitionDelay);
        }

        setTimeout(() => {
            leftLayers.forEach(layer => {
                layer.style.zIndex = '-1';
                layer.style.display = 'none';
                layer.style.left = '-100%';
            });

            if (container) {
                container.style.zIndex = '-5';
            }
            if (href) {
                window.location.href = href;
            } else if (!isIntraPageTransition) {
                hidePageClone();
                showContent();
            }
        }, 1000);
    };

    window.animateRightToLeft = function(e, href, callback, transitionDelay = 350) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('transitionStart'));
        hideContent();

        const container = document.querySelector('.container');
        if (container) {
            container.style.zIndex = '2000';
        }

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
                layer.style.transition = `left 0.7s cubic-bezier(0.645, 0.045, 0.355, 1) ${delay}ms`;
                layer.style.left = '-100%';
            });
        });

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isIntraPageTransition = currentPage === 'creator.html' && !href;

        if (!isIntraPageTransition) {
            setTimeout(() => {
                showTargetPageClone(href);
            }, 400);
        }

        if (isIntraPageTransition && callback) {
            setTimeout(callback, transitionDelay);
        }

        setTimeout(() => {
            rightLayers.forEach(layer => {
                layer.style.zIndex = '-1';
                layer.style.display = 'none';
                layer.style.left = '100%';
            });

            if (container) {
                container.style.zIndex = '-5';
            }
            if (href) {
                window.location.href = href;
            } else if (!isIntraPageTransition) {
                hidePageClone();
                showContent();
            }
        }, 1000);
    };

    window.animateTopToBottom = function(e, href) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('transitionStart'));
        hideContent();

        const container = document.querySelector('.container');
        if (container) {
            container.style.zIndex = '2000';
        }

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
            showTargetPageClone(href);
        }, 400);

        setTimeout(() => {
            topLayers.forEach(layer => {
                layer.style.zIndex = '-1';
                layer.style.display = 'none';
                layer.style.top = '-100%';
            });

            if (container) {
                container.style.zIndex = '-5';
            }
            if (href) {
                window.location.href = href;
            } else {
                hidePageClone();
                showContent();
            }
        }, 1000);
    };

    // Обработчики кликов для межстраничных переходов
    document.querySelectorAll('.next-btn-short, .back-btn-short').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            const warning = document.querySelector('.warning');
            if (warning && warning.style.display !== 'none' && warning.style.visibility !== 'hidden') {
                e.preventDefault();
                return;
            }
            if (href) {
                e.preventDefault();
                if (btn.classList.contains('next-btn-short')) {
                    window.animateLeftToRight(e, href);
                } else {
                    window.animateRightToLeft(e, href);
                }
            }
        }, { capture: true });
    });

    document.querySelectorAll('.image').forEach(element => {
        element.addEventListener('click', (e) => {
            const href = 'index.html';
            if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
                e.preventDefault();
                window.animateTopToBottom(e, href);
            }
        });
    });

    document.querySelectorAll('.learn-more-1 a, .learn-more-2 a').forEach(button => {
        button.addEventListener('click', (e) => {
            const href = button.getAttribute('href');
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            if (href && href !== '#' && href !== currentPath) {
                e.preventDefault();
                window.animateTopToBottom(e, href);
            }
        });
    });

    document.querySelectorAll('.nav__item a').forEach(button => {
        button.addEventListener('click', (e) => {
            const href = button.getAttribute('href');
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            if (href && href !== '#' && href !== currentPath) {
                e.preventDefault();
                window.animateTopToBottom(e, href);
            }
        }, { capture: true });
    });

    preloadPageClones();
});