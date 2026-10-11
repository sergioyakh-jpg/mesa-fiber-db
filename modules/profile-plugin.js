import { core } from './core.js';
import { AuthPlugin } from './auth-plugin.js';

const ProfilePlugin = {
    name: 'profile',

    render() {
        document.getElementById('app-view-container').innerHTML = `
            <div class="max-w-xl mx-auto space-y-6">
                <div class="bg-card border border-borderc p-6 rounded-3xl shadow-xl text-center">
                    <div class="w-20 h-20 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-3xl mx-auto flex items-center justify-center text-3xl mb-4 font-black shadow-inner">
                        ${AuthPlugin.profile.full_name ? AuthPlugin.profile.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <h2 class="text-xl font-black text-white">${AuthPlugin.profile.full_name}</h2>
                    <p class="text-xs text-slate-400 mt-1">${AuthPlugin.user.email}</p>
                    <span class="inline-block mt-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono px-3 py-1 rounded-full uppercase">${AuthPlugin.profile.role}</span>
                </div>

                <div class="bg-card border border-borderc p-6 rounded-3xl shadow-xl space-y-4">
                    <h3 class="text-sm font-bold text-white uppercase tracking-wider">Sessione Attiva</h3>
                    <button onclick="window.doLogout()" class="w-full bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-bold py-3 rounded-xl text-xs transition">
                        Disconnetti Account
                    </button>
                </div>
            </div>
        `;

        window.doLogout = async () => {
            await AuthPlugin.supabase.auth.signOut();
            window.location.reload();
        };
    }
};

core.register('profile', ProfilePlugin);