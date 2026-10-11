import { AuthPlugin } from './auth-plugin.js';
import { DashboardPlugin } from './dashboard-plugin.js';
import { DeliveryPlugin } from './delivery-plugin.js';
import { ProfilePlugin } from './profile-plugin.js';
import { SettingsPlugin } from './settings-plugin.js';

class Core {
    constructor() {
        this.plugins = {
            auth: AuthPlugin,
            dashboard: DashboardPlugin,
            delivery: DeliveryPlugin,
            profile: ProfilePlugin,
            settings: SettingsPlugin
        };
        this.currentRoute = 'dashboard';
    }

    async init() {
        try {
            if (this.plugins.auth && typeof this.plugins.auth.preInit === 'function') {
                await this.plugins.auth.preInit();
            }
            window.router = (route) => this.navigate(route);
        } catch (err) {
            console.error("Errore Core:", err);
        }
    }

    navigate(route) {
        this.currentRoute = route;
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if(btn.dataset.target === route) {
                btn.classList.add('text-sky-400');
                btn.classList.remove('text-slate-400');
            } else {
                btn.classList.remove('text-sky-400');
                btn.classList.add('text-slate-400');
            }
        });
        if (this.plugins[route] && typeof this.plugins[route].render === 'function') {
            this.plugins[route].render();
        }
    }
}

export const core = new Core();
core.init();
