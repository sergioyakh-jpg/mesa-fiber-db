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
        try {
            for (const name in this.plugins) {
                if (typeof this.plugins[name].preInit === 'function') {
                    await this.plugins[name].preInit();
                }
            }
            window.router = (route) => this.navigate(route);
        } catch (err) {
            console.error("Errore Core:", err);
            document.getElementById('app-view-container').innerHTML = `
                <div class="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-center text-rose-400 text-xs mt-10">
                    Errore caricamento moduli. Apri la console (F12).
                </div>
            `;
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
