import './auth-plugin.js';
import './dashboard-plugin.js';
import './delivery-plugin.js';
import './profile-plugin.js';
import './settings-plugin.js';

class Core {
    constructor() {
        this.plugins = {};
        this.currentRoute = 'dashboard';
    }

    register(name, plugin) {
        this.plugins[name] = plugin;
    }

    async init() {
        // Проверка авторизации
        for (const name in this.plugins) {
            if (this.plugins[name].preInit) await this.plugins[name].preInit();
        }
        
        window.router = (route) => this.navigate(route);
    }

    navigate(route) {
        this.currentRoute = route;
        
        // Подсветка кнопок мобильного меню
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if(btn.dataset.target === route) {
                btn.classList.add('text-blue-500');
                btn.classList.remove('text-slate-400');
            } else {
                btn.classList.remove('text-blue-500');
                btn.classList.add('text-slate-400');
            }
        });

        // Запуск рендера нужного плагина
        if (this.plugins[route] && typeof this.plugins[route].render === 'function') {
            this.plugins[route].render();
        }
    }
}

export const core = new Core();
core.init();