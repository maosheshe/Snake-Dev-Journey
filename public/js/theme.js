/**
 * 蛇蛇的开发之旅 - 主题管理系统
 * 处理 明亮/黑暗 模式切换与持久化
 */

(function() {
    // 立即执行以防止主题闪烁
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    window.toggleTheme = function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // 更新图标 (如果页面上有切换按钮)
        updateThemeIcons();
    };

    window.updateThemeIcons = function() {
        const theme = document.documentElement.getAttribute('data-theme');
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            const icon = theme === 'dark' ? 'sun' : 'moon';
            themeBtn.innerHTML = `<i data-lucide="${icon}"></i>`;
            if (window.lucide) lucide.createIcons();
        }
    };

    // 页面加载后初始化按钮状态
    document.addEventListener('DOMContentLoaded', () => {
        updateThemeIcons();
    });
})();
