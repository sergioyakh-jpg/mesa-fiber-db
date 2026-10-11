import { core } from './core.js';
import { supabase, AuthPlugin } from './auth-plugin.js';

const SettingsPlugin = {
    name: 'settings',

    render() {
        document.getElementById('app-view-container').innerHTML = `
            <div class="max-w-md mx-auto space-y-4">
                <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                    <h2 class="text-sm font-bold text-white mb-4"><i class="fa-solid fa-gear text-sky-400 mr-2"></i> Impostazioni Personali</h2>
                    
                    <form id="settings-form" class="space-y-3">
                        <div>
                            <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Nome Completo</label>
                            <input type="text" id="st-name" value="${AuthPlugin.profile.full_name || ''}" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Nuova Password (opzionale)</label>
                            <input type="password" id="st-pass" placeholder="Minimo 6 caratteri" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500">
                        </div>
                        <button type="submit" class="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition shadow-lg">
                            Salva Modifiche
                        </button>
                        <p id="st-msg" class="text-emerald-400 text-xs text-center hidden mt-2">Modifiche salvate con successo!</p>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('settings-form').onsubmit = async (e) => {
            e.preventDefault();
            const newName = document.getElementById('st-name').value;
            const newPass = document.getElementById('st-pass').value;

            await supabase.from('profiles').update({ full_name: newName }).eq('id', AuthPlugin.user.id);
            
            if (newPass.trim().length >= 6) {
                await supabase.auth.updateUser({ password: newPass });
            }

            AuthPlugin.profile.full_name = newName;
            const msg = document.getElementById('st-msg');
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        };
    }
};

core.register('settings', SettingsPlugin);
