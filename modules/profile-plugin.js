import { core } from './core.js';
import { AuthPlugin } from './auth-plugin.js';

const ProfilePlugin = {
    name: 'profile',

    render() {
        document.getElementById('app-view-container').innerHTML = `
            <div class="max-w-md mx-auto space-y-4">
                <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl text-center">
                    <div class="w-16 h-16 bg-sky-500/10 border border-sky-500/25 text-sky-400 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3 font-bold">
                        ${AuthPlugin.profile.full_name ? AuthPlugin.profile.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <h2 class="text-base font-bold text-white">${AuthPlugin.profile.full_name}</h2>
                    <p class="text-xs text-slate-400 mt-0.5">${AuthPlugin.user.email}</p>
                    <span class="inline-block mt-3 bg-sky-500/10 text-sky-400 text-[10px] font-mono px-3 py-1 rounded-full uppercase border border-sky-500/20">${AuthPlugin.profile.role}</span>
                </div>

                <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-3">
                    <h3 class="text-xs font-bold text-white uppercase tracking-wider">Sessione</h3>
                    <button onclick="window.doLogout()" class="w-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-bold py-3 rounded-xl text-xs transition">
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
