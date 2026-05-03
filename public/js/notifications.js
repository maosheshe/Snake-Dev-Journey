/**
 * 现代通知系统 - 蛇蛇开发之旅
 * 提供高颜值的 Toast 提示
 */

class NotificationSystem {
    constructor() {
        this.container = null;
    }

    _ensureContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * 显示通知
     * @param {string} title 标题
     * @param {string} message 消息内容
     * @param {string} type 类型: 'success' | 'error' | 'warning'
     * @param {number} duration 持续时间(ms)
     */
    show(title, message, type = 'success', duration = 3000) {
        this._ensureContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.setProperty('--duration', `${duration}ms`);

        // 根据类型选择图标 (Lucide 名字)
        let iconName = 'check-circle';
        if (type === 'error') iconName = 'alert-circle';
        if (type === 'warning') iconName = 'alert-triangle';

        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${iconName}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i data-lucide="x"></i>
            </button>
        `;

        this.container.appendChild(toast);
        
        // 初始化图标
        if (window.lucide) {
            window.lucide.createIcons({
                attrs: {
                    class: ['icon-custom']
                },
                nameAttr: 'data-lucide',
                root: toast
            });
        }

        const closeBtn = toast.querySelector('.toast-close');
        const hideToast = () => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 500);
        };

        closeBtn.onclick = hideToast;

        setTimeout(hideToast, duration);
    }

    success(message, title = '成功') {
        this.show(title, message, 'success');
    }

    error(message, title = '错误') {
        this.show(title, message, 'error');
    }

    warning(message, title = '提醒') {
        this.show(title, message, 'warning');
    }

    /**
     * 显示确认弹窗
     * @param {string} title 标题
     * @param {string} message 消息内容
     * @returns {Promise<boolean>}
     */
    confirm(title, message) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';
            modal.innerHTML = `
                <div class="confirm-header">
                    <div class="confirm-icon"><i data-lucide="help-circle"></i></div>
                    <h3>${title}</h3>
                </div>
                <div class="confirm-body">${message}</div>
                <div class="confirm-footer">
                    <button class="btn btn-secondary cancel-btn">取消</button>
                    <button class="btn btn-primary confirm-btn">确定</button>
                </div>
            `;

            document.body.appendChild(overlay);
            document.body.appendChild(modal);

            if (window.lucide) {
                window.lucide.createIcons({ root: modal });
            }

            const cleanup = (value) => {
                modal.classList.add('hiding');
                overlay.classList.add('hiding');
                setTimeout(() => {
                    modal.remove();
                    overlay.remove();
                }, 300);
                resolve(value);
            };

            modal.querySelector('.cancel-btn').onclick = () => cleanup(false);
            modal.querySelector('.confirm-btn').onclick = () => cleanup(true);
            overlay.onclick = () => cleanup(false);
        });
    }
}

// 初始化全局实例
window.showToast = new NotificationSystem();

// 简单的快捷方式
window.toast = {
    success: (msg, title) => window.showToast.success(msg, title),
    error: (msg, title) => window.showToast.error(msg, title),
    warning: (msg, title) => window.showToast.warning(msg, title),
    confirm: (title, msg) => window.showToast.confirm(title, msg)
};

