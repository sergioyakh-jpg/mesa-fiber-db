import { core } from './core.js';
import { supabase, AuthPlugin } from './auth-plugin.js';

const DashboardPlugin = {
    name: 'dashboard',

    async render() {
        const container = document.getElementById('app-view-container');
        container.innerHTML = `
            <div class="space-y-6">
                <!-- Welcome Banner -->
                <div class="bg-gradient-to-r from-sky-900/30 via-slate-900 to-slate-900 border border-sky-500/20 p-6 rounded-3xl shadow-xl">
                    <h2 class="text-xl font-bold text-white mb-1">Benvenuto, ${AuthPlugin.profile.full_name || 'Tecnico'}</h2>
                    <p class="text-xs text-slate-400">Sistema operativo di gestione campi FTTH attivo.</p>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                        <span class="text-[10px] uppercase font-bold text-slate-400">Assegnati</span>
                        <h3 id="stat-today" class="text-2xl font-black text-white mt-1">-</h3>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                        <span class="text-[10px] uppercase font-bold text-slate-400">Completati</span>
                        <h3 id="stat-done" class="text-2xl font-black text-emerald-400 mt-1">-</h3>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                        <span class="text-[10px] uppercase font-bold text-slate-400">Congelati</span>
                        <h3 id="stat-frozen" class="text-2xl font-black text-amber-400 mt-1">-</h3>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                        <span class="text-[10px] uppercase font-bold text-slate-400">Totale</span>
                        <h3 id="stat-total" class="text-2xl font-black text-sky-400 mt-1">-</h3>
                    </div>
                </div>

                <!-- Quick Module Access -->
                <div>
                    <h3 class="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Moduli Operativi</h3>
                    <div onclick="window.router('delivery')" class="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-sky-500/50 transition cursor-pointer flex items-center justify-between group">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition">
                                <i class="fa-solid fa-screwdriver-wrench"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-white text-sm">Delivery FTTH</h4>
                                <p class="text-xs text-slate-400">Gestione interventi, chiusure e certificazioni</p>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right text-slate-600 group-hover:text-sky-400 transition text-sm"></i>
                    </div>
                </div>
            </div>
        `;

        this.loadStats();
    },

    async loadStats() {
        let query = supabase.from('interventions').select('*');
        if (AuthPlugin.profile.role !== 'admin') {
            query = query.eq('assigned_to', AuthPlugin.user.id);
        }
        const { data } = await query;
        if (!data) return;

        document.getElementById('stat-total').textContent = data.length;
        document.getElementById('stat-done').textContent = data.filter(i => i.status === 'completed').length;
        document.getElementById('stat-frozen').textContent = data.filter(i => i.status === 'frozen' || i.status === 'cancelled').length;
        document.getElementById('stat-today').textContent = data.filter(i => i.status === 'assigned').length;
    }
};

core.register('dashboard', DashboardPlugin);
