// 公共功能脚本

// 轮播图功能
(function () {
    const slider = document.getElementById('slider');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.slide'));
    const dotsWrap = slider.querySelector('.dots');
    const prevBtn = slider.querySelector('.prev');
    const nextBtn = slider.querySelector('.next');

    if (!slides.length || !dotsWrap) return;

    let index = 0;
    let timer = null;
    const interval = 5000;
    const t = (key, replacements) => window.i18n?.t(key, replacements) || key;

    // 生成 dots
    const dots = slides.map((_, i) => {
        const d = document.createElement('button');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.type = 'button';
        d.addEventListener('click', () => go(i));
        dotsWrap.appendChild(d);
        return d;
    });

    function render() {
        slides.forEach((s, i) => {
            const active = i === index;
            s.classList.toggle('active', active);
            s.setAttribute('aria-hidden', String(!active));
        });
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === index);
            d.setAttribute('aria-label', t('hero-go-to-slide', { number: i + 1 }));
            d.setAttribute('aria-current', String(i === index));
        });
    }

    function go(i) {
        index = (i + slides.length) % slides.length;
        render();
        restart();
    }

    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    function start() {
        timer = setInterval(next, interval);
    }

    function stop() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    function restart() {
        stop();
        start();
    }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
    });

    // 手机和平板支持横向滑动；纵向滚动仍交给浏览器处理。
    let touchStartX = 0;
    let touchStartY = 0;
    let trackingTouch = false;
    slider.addEventListener('touchstart', (event) => {
        if (event.touches.length !== 1) {
            trackingTouch = false;
            return;
        }
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        trackingTouch = true;
    }, { passive: true });
    slider.addEventListener('touchend', (event) => {
        if (!trackingTouch) return;
        trackingTouch = false;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        if (Math.abs(deltaX) < 44 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
        if (deltaX < 0) next();
        else prev();
    }, { passive: true });
    slider.addEventListener('touchcancel', () => {
        trackingTouch = false;
    }, { passive: true });

    render();
    start();
    document.addEventListener('i18n:change', render);
})();

// 首页新闻动态轮播（手动切换，避免信息堆叠）
(function () {
    const carousel = document.querySelector('[data-news-carousel]');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('.news-carousel-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-news-dot]'));
    const prevButton = carousel.querySelector('[data-news-prev]');
    const nextButton = carousel.querySelector('[data-news-next]');
    if (!slides.length) return;

    let index = 0;
    const t = (key, replacements) => window.i18n?.t(key, replacements) || key;

    const render = nextIndex => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            const active = slideIndex === index;
            slide.classList.toggle('is-active', active);
            slide.setAttribute('aria-hidden', String(!active));
        });
        dots.forEach((dot, dotIndex) => {
            const active = dotIndex === index;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-current', String(active));
            dot.setAttribute('aria-label', t('news-go-to-slide', { number: dotIndex + 1 }));
        });
    };

    if (prevButton) prevButton.addEventListener('click', () => render(index - 1));
    if (nextButton) nextButton.addEventListener('click', () => render(index + 1));
    dots.forEach((dot, dotIndex) => dot.addEventListener('click', () => render(dotIndex)));
    render(index);
    document.addEventListener('i18n:change', () => render(index));
})();

// 加入我们页面的日常照片切换（仅手动切换，避免打断阅读）
(function () {
    const carousels = document.querySelectorAll('[data-lab-life-carousel]');
    if (!carousels.length) return;

    carousels.forEach(carousel => {
        const slides = Array.from(carousel.querySelectorAll('.lab-life-slide'));
        const prevButton = carousel.querySelector('[data-lab-life-prev]');
        const nextButton = carousel.querySelector('[data-lab-life-next]');
        if (slides.length < 2) return;

        let index = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));

        const render = nextIndex => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                const active = slideIndex === index;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', String(!active));
            });
        };

        if (prevButton) prevButton.addEventListener('click', () => render(index - 1));
        if (nextButton) nextButton.addEventListener('click', () => render(index + 1));

        carousel.setAttribute('tabindex', '0');
        carousel.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                render(index - 1);
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                render(index + 1);
            }
        });

        render(index);
    });
})();

// 移动端导航
(function() {
    const navBtn = document.getElementById('navBtn');
    const leftNav = document.getElementById('leftNav');
    const opacity2 = document.getElementById('opacity2');

    if (!navBtn || !leftNav) return;

    const t = key => window.i18n?.t(key) || key;
    const isOpen = () => navBtn.getAttribute('aria-expanded') === 'true';
    const focusableElements = () => Array.from(leftNav.querySelectorAll('a[href], button:not([disabled])'))
        .filter(element => element.getClientRects().length > 0);

    const updateButtonLabel = () => {
        navBtn.setAttribute('aria-label', t(isOpen() ? 'close-navigation' : 'open-navigation'));
    };

    const setMenuState = (open, { restoreFocus = true } = {}) => {
        leftNav.classList.toggle('page-active', open);
        leftNav.setAttribute('aria-hidden', open ? 'false' : 'true');
        leftNav.toggleAttribute('inert', !open);
        navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('nav-open', open);
        if (opacity2) opacity2.style.display = open ? 'block' : 'none';
        updateButtonLabel();

        if (open) {
            focusableElements()[0]?.focus();
        } else if (restoreFocus && navBtn.getClientRects().length > 0) {
            navBtn.focus();
        }
    };

    navBtn.addEventListener('click', () => {
        setMenuState(!isOpen());
    });

    if (opacity2) opacity2.addEventListener('click', () => setMenuState(false));

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && isOpen()) {
            setMenuState(false);
            return;
        }

        if (event.key === 'Tab' && isOpen()) {
            const focusable = focusableElements();
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    document.addEventListener('i18n:change', updateButtonLabel);

    const desktopQuery = window.matchMedia('(min-width: 1101px)');
    desktopQuery.addEventListener('change', event => {
        if (event.matches && isOpen()) setMenuState(false, { restoreFocus: false });
    });
    
    // 点击导航链接后关闭菜单
    const navLinks = document.querySelectorAll('.model-leftnav-main .nnav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            setMenuState(false, { restoreFocus: false });
        });
    });

    leftNav.setAttribute('inert', '');
    updateButtonLabel();
})();

// 返回顶部按钮
(function() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;

    const updateVisibility = () => {
        const visible = window.pageYOffset > 300;
        backToTop.classList.toggle('is-visible', visible);
        backToTop.setAttribute('aria-hidden', String(!visible));
        backToTop.tabIndex = visible ? 0 : -1;

        if (!visible && document.activeElement === backToTop) {
            backToTop.blur();
        }
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
    });
})();

// 导航高亮（兼容目录式 URL 与本地静态预览）
(function() {
    const normalizePath = (path) => decodeURIComponent(path)
        .replace(/\/index\.html$/, '/')
        .replace(/\/+$/, '/');
    const currentPath = normalizePath(window.location.pathname);
    const navLinks = document.querySelectorAll('.nav a, .model-leftnav-main .nnav a');

    navLinks.forEach(link => {
        const linkPath = normalizePath(new URL(link.href, window.location.href).pathname);
        if (linkPath === currentPath) {
            link.parentElement.classList.add('on');
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
})();

// 平滑滚动（仅用于锚点链接）
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    });
});

// 论文摘要与 BibTeX 展开面板
(function () {
    const toggles = document.querySelectorAll('.publication-toggle');
    if (!toggles.length) return;

    const fallbackCopy = text => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        return copied;
    };

    document.querySelectorAll('.publication-bibtex').forEach(panel => {
        const code = panel.querySelector('code');
        if (!code) return;

        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'bibtex-copy';
        copyButton.setAttribute('data-i18n', 'copy-bibtex');
        copyButton.textContent = '复制';
        panel.prepend(copyButton);

        copyButton.addEventListener('click', async () => {
            let copied = false;

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(code.textContent);
                    copied = true;
                } else {
                    copied = fallbackCopy(code.textContent);
                }
            } catch (error) {
                copied = fallbackCopy(code.textContent);
            }

            if (!copied) return;

            copyButton.textContent = document.documentElement.lang.startsWith('en') ? 'Copied' : '已复制';
            window.setTimeout(() => {
                copyButton.textContent = document.documentElement.lang.startsWith('en') ? 'Copy' : '复制';
            }, 1600);
        });
    });

    toggles.forEach(button => {
        button.addEventListener('click', () => {
            const panelId = button.dataset.panel;
            const panel = document.getElementById(panelId);
            const entry = button.closest('.publication-entry');
            if (!panel || !entry) return;

            const shouldOpen = panel.hidden;

            entry.querySelectorAll('.publication-panel').forEach(item => {
                item.hidden = true;
            });
            entry.querySelectorAll('.publication-toggle').forEach(item => {
                item.classList.remove('active');
                item.setAttribute('aria-expanded', 'false');
            });

            panel.hidden = !shouldOpen;
            button.classList.toggle('active', shouldOpen);
            button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

            if (shouldOpen && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                panel.getAnimations().forEach(animation => animation.cancel());
                panel.animate([
                    { opacity: 0, transform: 'translateY(-6px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], {
                    duration: 220,
                    easing: 'cubic-bezier(0.23, 1, 0.32, 1)'
                });
            }
        });
    });
})();

// 专利摘要预览：默认显示固定高度，以渐进材质遮罩自然收起正文
(function () {
    const panels = document.querySelectorAll('.patent-panel');
    if (!panels.length) return;

    const labelFor = expanded => {
        const english = document.documentElement.lang.startsWith('en');
        if (expanded) return english ? 'Show less' : '收起';
        return english ? 'Show more' : '展开';
    };

    panels.forEach((panel, index) => {
        const abstract = panel.querySelector('.patent-abstract');
        if (!abstract) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'patent-expand';
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', `patent-abstract-${index + 1}`);
        button.setAttribute('data-i18n', 'patent-expand');
        button.textContent = labelFor(false);
        abstract.id = `patent-abstract-${index + 1}`;

        const previewFade = document.createElement('span');
        previewFade.className = 'patent-preview-fade';
        previewFade.setAttribute('aria-hidden', 'true');
        const layerCount = 12;
        const blurStart = 43;
        const blurRange = 57;
        const feather = 1.15;

        for (let layer = 0; layer < layerCount; layer += 1) {
            const progress = layer / (layerCount - 1);
            const bandStart = blurStart + (blurRange * layer / layerCount);
            const bandEnd = blurStart + (blurRange * (layer + 1) / layerCount);
            // 中文正文只保留亚像素级软化，视觉层级主要由透明度渐退完成。
            const blurRadius = 0.05 + (Math.pow(progress, 1.8) * 0.85);
            const blurLayer = document.createElement('span');
            blurLayer.className = 'patent-preview-blur';
            blurLayer.style.setProperty('--patent-blur-radius', `${blurRadius.toFixed(2)}px`);
            blurLayer.style.setProperty('--patent-fade-start', `${Math.max(0, bandStart - feather).toFixed(2)}%`);
            blurLayer.style.setProperty('--patent-band-start', `${bandStart.toFixed(2)}%`);
            blurLayer.style.setProperty('--patent-band-end', `${bandEnd.toFixed(2)}%`);
            blurLayer.style.setProperty('--patent-fade-end', `${Math.min(100, bandEnd + feather).toFixed(2)}%`);

            const blurCopy = abstract.cloneNode(true);
            blurCopy.removeAttribute('id');
            blurCopy.className = 'patent-preview-copy';
            blurCopy.setAttribute('aria-hidden', 'true');
            blurLayer.appendChild(blurCopy);
            previewFade.appendChild(blurLayer);
        }

        panel.appendChild(previewFade);
        panel.appendChild(button);

        const updateAvailability = () => {
            if (panel.classList.contains('is-expanded')) return;
            const panelStyle = window.getComputedStyle(panel);
            const visibleHeight = panel.clientHeight
                - parseFloat(panelStyle.paddingTop)
                - parseFloat(panelStyle.paddingBottom);
            const needsToggle = abstract.scrollHeight > visibleHeight + 1;
            panel.classList.toggle('is-static', !needsToggle);
            button.hidden = !needsToggle;
        };

        button.addEventListener('click', () => {
            const entry = panel.closest('.patent-entry');
            const figure = entry?.querySelector('.patent-figure');
            const willExpand = !panel.classList.contains('is-expanded');

            if (willExpand && figure) {
                figure.style.height = `${figure.getBoundingClientRect().height}px`;
            }

            const expanded = panel.classList.toggle('is-expanded');
            entry?.classList.toggle('is-patent-expanded', expanded);

            if (!expanded && figure) {
                figure.style.height = '';
            }

            button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            button.setAttribute('data-i18n', expanded ? 'patent-collapse' : 'patent-expand');
            button.textContent = labelFor(expanded);
        });

        updateAvailability();
        window.addEventListener('resize', updateAvailability, { passive: true });
    });
})();

// 顶栏滚动状态
(function () {
    const topper = document.querySelector('.topper');
    if (topper) {
        let scheduled = false;
        const updateHeader = () => {
            topper.classList.toggle('is-scrolled', window.scrollY > 18);
            scheduled = false;
        };

        updateHeader();
        window.addEventListener('scroll', () => {
            if (scheduled) return;
            scheduled = true;
            window.requestAnimationFrame(updateHeader);
        }, { passive: true });
    }

})();
