/**
 * 1024×768分辨率适配通用脚本
 * 自动为页面元素添加响应式class和优化
 */

(function() {
    'use strict';

    // 1024×768适配优化函数
    function optimizeFor1024() {
        console.log('正在执行1024×768适配优化...');

        // 1. 为卡片容器添加统一class
        const cardSelectors = [
            'div.bg-white.p-6.rounded-lg.shadow-md',
            'div.bg-white.p-4.rounded-lg.shadow-md',
            'div.bg-white.p-6.rounded-lg.shadow',
            'div.bg-white.p-4.rounded-lg.shadow',
            '.bg-slate-900.p-6',
            '.bg-slate-800.p-6'
        ];
        
        cardSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!el.classList.contains('card')) {
                    el.classList.add('card');
                }
            });
        });

        // 2. 为表格添加响应式wrapper
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            // 检查是否已经有响应式wrapper
            if (!table.closest('.table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.classList.add('table-responsive');
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });

        // 3. 为图表容器添加优化class
        const chartContainers = document.querySelectorAll('canvas');
        chartContainers.forEach(canvas => {
            const parent = canvas.parentElement;
            if (parent && !parent.classList.contains('chart-container')) {
                parent.classList.add('chart-container');
                
                // 根据高度添加不同的尺寸class
                const computedStyle = window.getComputedStyle(parent);
                const height = parseInt(computedStyle.height) || parent.clientHeight;
                
                if (height <= 120) {
                    parent.classList.add('chart-small');
                } else if (height <= 180) {
                    parent.classList.add('chart-medium');
                } else {
                    parent.classList.add('chart-large');
                }
            }
        });

        // 4. 为按钮添加统一样式class
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            // 跳过已经有特定class的按钮
            if (!btn.classList.contains('btn') && 
                !btn.classList.contains('btn-sm') && 
                !btn.classList.contains('btn-lg')) {
                
                // 根据按钮大小添加相应class
                const height = btn.offsetHeight;
                if (height <= 28) {
                    btn.classList.add('btn-sm');
                } else {
                    btn.classList.add('btn');
                }
            }
        });

        // 5. 为侧边栏添加class（仅限页面主侧边栏）
        const sidebarEl = document.querySelector('#sidebar');
        if (sidebarEl && !sidebarEl.classList.contains('sidebar')) {
            sidebarEl.classList.add('sidebar');
        }

        // 6. 为主内容区域添加class
        const mainContents = document.querySelectorAll('#main-content, .main-content');
        mainContents.forEach(main => {
            if (!main.classList.contains('main-content')) {
                main.classList.add('main-content');
            }
        });

        // 7. 为面包屑导航添加class
        const breadcrumbs = document.querySelectorAll('#breadcrumb, .breadcrumb');
        breadcrumbs.forEach(breadcrumb => {
            if (!breadcrumb.classList.contains('breadcrumb')) {
                breadcrumb.classList.add('breadcrumb');
            }
        });

        // 8. 为统计卡片添加class
        const statCards = document.querySelectorAll('.bg-white.p-4, .bg-white.p-6');
        statCards.forEach(card => {
            const hasStatContent = card.querySelector('.text-2xl, .text-3xl, .text-lg');
            if (hasStatContent && !card.classList.contains('stat-card')) {
                card.classList.add('stat-card');
            }
        });

        // 9. 检查并应用紧凑模式
        checkAndApplyCompactMode();
    }

    // 检查并应用紧凑模式
    function checkAndApplyCompactMode() {
        const isSmallScreen = window.innerWidth <= 1024 && window.innerHeight <= 768;
        
        if (isSmallScreen) {
            document.body.classList.add('compact-mode');
            console.log('应用紧凑模式 - 1024×768');
        } else {
            document.body.classList.remove('compact-mode');
            console.log('移除紧凑模式');
        }
    }

    // 处理长文本截断
    function handleTextTruncation() {
        const longTextElements = document.querySelectorAll('td, th, .text-content');
        longTextElements.forEach(el => {
            if (el.textContent && el.textContent.length > 50) {
                if (!el.classList.contains('text-truncate')) {
                    el.classList.add('text-truncate');
                    el.title = el.textContent; // 添加tooltip显示完整文本
                }
            }
        });
    }

    // 优化图表响应式
    function optimizeCharts() {
        // 确保Chart.js图表响应式
        if (window.Chart) {
            Chart.defaults.responsive = true;
            Chart.defaults.maintainAspectRatio = false;
        }
    }

    // 初始化函数
    function initialize() {
        // 等待DOM完全加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(optimizeFor1024, 100); // 延迟执行确保所有元素都已渲染
                setTimeout(handleTextTruncation, 200);
                optimizeCharts();
            });
        } else {
            setTimeout(optimizeFor1024, 100);
            setTimeout(handleTextTruncation, 200);
            optimizeCharts();
        }

        // 监听窗口大小变化
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                checkAndApplyCompactMode();
                handleTextTruncation();
            }, 250);
        });

        // 监听动态内容变化（如果页面有动态加载的内容）
        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                let shouldOptimize = false;
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // 检查是否有新添加的需要优化的元素
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) { // Element node
                                if (node.matches('table, canvas, button, .bg-white') || 
                                    node.querySelector('table, canvas, button, .bg-white')) {
                                    shouldOptimize = true;
                                }
                            }
                        });
                    }
                });
                
                if (shouldOptimize) {
                    setTimeout(optimizeFor1024, 100);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // 公开API
    window.ResponsiveOptimizer = {
        optimize: optimizeFor1024,
        checkCompactMode: checkAndApplyCompactMode,
        handleTextTruncation: handleTextTruncation,
        optimizeCharts: optimizeCharts
    };

    // 自动初始化
    initialize();

})();