import { core } from './core.js';
import { supabase } from './auth-plugin.js';

const DeliveryPlugin = {
    name: 'delivery',
    filterStatus: 'all',

    async render() {
        const container = document.getElementById('app-view-container');
        container.innerHTML = `
            <div class="space-y-4">
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3">
                    <div>
                        <h2 class="text-sm font-bold text-white"><i class="fa-solid fa-screwdriver-wrench text-sky-400 mr-2"></i> Delivery FTTH</h2>
                        <p class="text-xs text-slate-400">Coda ordini e chiusura lavori</p>
                    </div>
                    <div>
                        <select id="delivery-status-filter" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500">
                            <option value="all">Tutti gli stati</option>
                            <option value="assigned">Assegnati</option>
                            <option value="completed">Completati</option>
                            <option value="frozen">Congelati / Annullati</option>
                        </select>
                    </div>
                </div>

                <div id="delivery-tickets-list" class="space-y-3">
                    <p class="text-slate-500 text-xs text-center py-8">Caricamento interventi...</p>
                </div>
            </div>
        `;

        document.getElementById('delivery-status-filter').onchange = (e) => {
            this.filterStatus = e.target.value;
            this.loadTickets();
        };

        this.loadTickets();
    },

    async loadTickets() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const role = profile ? profile.role : 'technician';

        let query = supabase.from('interventions').select('*').order('created_at', { ascending: false });

        if (role !== 'admin') {
            query = query.eq('assigned_to', user.id);
        }

        if (this.filterStatus !== 'all') {
            query = query.eq('status', this.filterStatus);
        }

        const { data, error } = await query;
        const listContainer = document.getElementById('delivery-tickets-list');

        if (error || !data || data.length === 0) {
            listContainer.innerHTML = `<div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center text-slate-500 text-xs">Nessun intervento trovato.</div>`;
            return;
        }

        listContainer.innerHTML = data.map(t => {
            let badge = `<span class="bg-sky-500/10 text-sky-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-sky-500/20">Assegnato</span>`;
            if (t.status === 'completed') badge = `<span class="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/20">Completato</span>`;
            if (t.status === 'frozen') badge = `<span class="bg-amber-500/10 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/20">Congelato</span>`;
            if (t.status === 'cancelled') badge = `<span class="bg-rose-500/10 text-rose-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-rose-500/20">Annullato</span>`;

            return `
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                    <div class="flex justify-between items-start">
                        <span class="text-[10px] font-mono uppercase bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">${t.work_type}</span>
                        ${badge}
                    </div>
                    <div>
                        <h3 class="font-bold text-white text-sm">${t.client_name}</h3>
                        <p class="text-xs text-slate-400"><i class="fa-solid fa-location-dot mr-1 text-slate-500"></i> ${t.address}, ${t.city}</p>
                    </div>

                    ${t.status === 'completed' ? `
                        <div class="bg-slate-950 p-2.5 rounded-xl text-xs space-y-1 text-slate-300 border border-slate-800/80">
                            <p><strong>Potenze (1310/1490):</strong> ${t.pwr_1310} /${t.pwr_1490} dBm</p>
                            <p><strong>OTDR:</strong> <span class="text-emerald-400 font-bold">${t.otdr_result}</span> \vert{} <strong>Porta:</strong>${t.port_code}</p>
                            <p class="text-slate-400 italic">Note: ${t.notes || 'Nessuna nota'}</p>
                        </div>
                    ` : t.status === 'frozen' || t.status === 'cancelled' ? `
                        <div class="bg-slate-950 p-2.5 rounded-xl text-xs text-amber-400 border border-slate-800">
                            <p><strong>Motivo:</strong> ${t.notes || 'Non specificato'}</p>
                        </div>
                    ` : `
                        <div class="flex space-x-2 pt-1">
                            <button onclick="window.openCloseModal('${t.id}', '${t.client_name.replace(/'/g, "")}')" class="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition">
                                Chiudi Lavoro
                            </button>
                            <button onclick="window.openFreezeModal('${t.id}', '${t.client_name.replace(/'/g, "")}')" class="bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-rose-400 px-3 py-2 rounded-xl text-xs transition">
                                <i class="fa-solid fa-ban"></i>
                            </button>
                        </div>
                    `}
                </div>
            `;
        }).join('');

        window.openCloseModal = (id, name) => this.renderCloseModal(id, name);
        window.openFreezeModal = (id, name) => this.renderFreezeModal(id, name);
    },

    renderCloseModal(id, name) {
        document.getElementById('global-modal-slot').innerHTML = `
            <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 class="text-sm font-bold text-white mb-1">Chiusura Lavoro FTTH</h3>
                    <p class="text-xs text-slate-400 mb-4">Cliente: ${name}</p>
                    <form id="close-form" class="space-y-3">
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">1310 nm (dBm)</label>
                                <input type="text" id="cf-1310" required class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">1490 nm (dBm)</label>
                                <input type="text" id="cf-1490" required class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                            </div>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Esito OTDR</label>
                            <select id="cf-otdr" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                                <option value="Pass">PASS (Conforme)</option>
                                <option value="Fail">FAIL (Anomalia)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Codice PFP / Porta</label>
                            <input type="text" id="cf-port" required class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Note Tecniche</label>
                            <textarea id="cf-notes" rows="2" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"></textarea>
                        </div>
                        <div class="flex space-x-2 pt-2">
                            <button type="button" onclick="window.closeModalSlot()" class="w-1/2 bg-slate-950 border border-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs">Annulla</button>
                            <button type="submit" class="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg">Salva Chiusura</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('close-form').onsubmit = async (e) => {
            e.preventDefault();
            const { error } = await supabase.from('interventions').update({
                status: 'completed',
                pwr_1310: document.getElementById('cf-1310').value,
                pwr_1490: document.getElementById('cf-1490').value,
                otdr_result: document.getElementById('cf-otdr').value,
                port_code: document.getElementById('cf-port').value,
                notes: document.getElementById('cf-notes').value,
                closed_at: new Date().toISOString()
            }).eq('id', id);

            if (!error) {
                window.closeModalSlot();
                this.loadTickets();
            } else {
                alert("Errore durante il salvataggio.");
            }
        };
    },

    renderFreezeModal(id, name) {
        document.getElementById('global-modal-slot').innerHTML = `
            <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
                    <h3 class="text-sm font-bold text-rose-400 mb-1">Blocco / Congelamento Pratica</h3>
                    <p class="text-xs text-slate-400 mb-4">Cliente: ${name}</p>
                    <form id="freeze-form" class="space-y-3">
                        <div>
                            <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Azione</label>
                            <select id="ff-status" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                                <option value="frozen">Congela (Sospesa)</option>
                                <option value="cancelled">Annulla Intervento</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Motivazione Obbligatoria</label>
                            <textarea id="ff-notes" rows="3" required class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" placeholder="Es. Cliente irreperibile..."></textarea>
                        </div>
                        <div class="flex space-x-2 pt-2">
                            <button type="button" onclick="window.closeModalSlot()" class="w-1/2 bg-slate-950 border border-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs">Indietro</button>
                            <button type="submit" class="w-1/2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg">Conferma</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('freeze-form').onsubmit = async (e) => {
            e.preventDefault();
            const { error } = await supabase.from('interventions').update({
                status: document.getElementById('ff-status').value,
                notes: document.getElementById('ff-notes').value,
                closed_at: new Date().toISOString()
            }).eq('id', id);

            if (!error) {
                window.closeModalSlot();
                this.loadTickets();
            } else {
                alert("Errore.");
            }
        };
    }
};

window.closeModalSlot = () => {
    document.getElementById('global-modal-slot').innerHTML = '';
};

core.register('delivery', DeliveryPlugin);
