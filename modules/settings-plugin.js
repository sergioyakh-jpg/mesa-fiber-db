import { core } from './core.js';
import { supabase, AuthPlugin } from './auth-plugin.js';

const SettingsPlugin = {
    name: 'settings',

    render() {
        document.getElementById('app-view-container').innerHTML = `
            <div class="max-w-xl mx-auto space-y-6">
                <div class="bg-card border border-borderc p-6 rounded-3xl shadow-xl">
                    <h2 class="text-base font-black text-white mb-4"><i class="fa-solid fa-sliders text-blue-400 mr-2"></i> Impostazioni Personali</h2>
                    
                    <form id="settings-form" class="space-y-4">
                        <div>
                            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Nome Completo</label>
                            <input type="text" id="st-name" value="${AuthPlugin.profile.full_name || ''}" class="w-full bg-darker border border-borderc rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Nuova Password (opzionale)</label>
                            <input type="password" id="st-pass" placeholder="Lascia vuoto per non variare" class="w-full bg-darker border border-borderc rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500">
                        </div>
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-blue-600/20">
                            Salva Modifiche
                        </button>
                        <p id="st-msg" class="text-emerald-400 text-xs text-center hidden mt-2">Aggiornato con successo!</p>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('settings-form').onsubmit = async (e) => {
            e.preventDefault();
            const newName = document.getElementById('st-name').value;
            const newPass = document.getElementById('st-pass').value;

            // Обновление профиля
            await supabase.from('profiles').update({ full_name: newName }).eq('id', AuthPlugin.user.id);
            
            // Если ввели пароль
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