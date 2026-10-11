import { core } from './core.js';
import { supabase, AuthPlugin } from './auth-plugin.js';

const DashboardPlugin = {
    name: 'dashboard',

    async render() {
        const container = document.getElementById('app-view-container');
        container.innerHTML = `
            <div class="space-y-6">
                <!-- Welcome Banner -->
                <div class="bg-gradient-to-r from-blue-900/40 via-card to-card border border-blue-500/20 p-6 rounded-3xl relative overflow-hidden shadow-xl">
                    <div class="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10 text-blue-400 text-9xl">
                        <i class="fa-solid fa-network-wired"></i>
                    </div>
                    <h2 class="text-2xl font-black text-white mb-1">Benvenuto, ${AuthPlugin.profile.full_name}</h2>
                    <p class="text-xs text-slate-400">Sistema operativo di gestione campi FTTH attivo.</p>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-grid">
                    <div class="bg-card border border-borderc p-4 rounded-2xl">
                        <span class="text-[10px] uppercase font-bold text-slate-400">Assegnati Oggi</span>
                        <h3 id="stat-today" class="text-2xl font-black text-white mt-1">-</h3>
                    </div>
                    <div class="bg-card border border-borderc p-4 rounded-2xl">
                        <span class="text-[10px] uppercase font-bold text-slate-400">Completati</span>
                        <h3 id="stat-done" class="text-2xl font-black text-emerald-400 mt-1">-</h3>
                    </div>
                    <div class="bg-card border border-borderc p-4 rounded-2xl">
                        <span class="text-[10px] uppercase font-bold text-slate-400">Sospesi / Annullati</span>
                        <h3 id="stat-frozen" class="text-2xl font-black text-amber-400 mt-1">-</h3>
                    </div>
                    <div class="bg-card border border-borderc p-4 rounded-2xl">
                        <span class="text-[10px] uppercase font-bold text-slate-400">Totale Gestiti</span>
                        <h3 id="stat-total" class="text-2xl font-black text-blue-400 mt-1">-</h3>
                    </div>
                </div>

                <!-- Quick Actions Grid -->
                <div>
                    <h3 class="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Moduli Rapidi</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div onclick="window.router('delivery')" class="bg-card border border-borderc p-5 rounded-2xl hover:border-blue-500/50 transition cursor-pointer flex items-center justify-between group">
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition">
                                    <i class="fa-solid fa-screwdriver-wrench"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-white">Delivery FTTH</h4>
                                    <p class="text-xs text-slate-400">Gestione interventi, chiusure e calendario</p>
                                </div>
                            </div>
                            <i class="fa-solid fa-chevron-right text-slate-600 group-hover:text-blue-400 transition"></i>
                        </div>
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

        const total = data.length;
        const done = data.filter(i => i.status === 'completed').length;
        const frozen = data.filter(i => i.status === 'frozen' || i.status === 'cancelled').length;
        
        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-done').textContent = done;
        document.getElementById('stat-frozen').textContent = frozen;
        document.getElementById('stat-today').textContent = data.filter(i => i.status === 'assigned').length;
    }
};

core.register('dashboard', DashboardPlugin);