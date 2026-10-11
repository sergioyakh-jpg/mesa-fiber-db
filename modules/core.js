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
        console.log(`Plugin registrato: ${name}`);
    }

    async init() {
        try {
            console.log("Core in avvio...");
            for (const name in this.plugins) {
                if (typeof this.plugins[name].preInit === 'function') {
                    await this.plugins[name].preInit();
                }
            }
            window.router = (route) => this.navigate(route);
        } catch (err) {
            console.error("Errore critico in init:", err);
            document.getElementById('app-view-container').innerHTML = `
                <div class="bg-rose-500/20 border border-rose-500/40 p-4 rounded-2xl text-rose-300 text-xs mt-6">
                    <strong>Errore Moduli:</strong> ${err.message}
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
