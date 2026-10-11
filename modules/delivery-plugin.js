import { core } from './core.js';
import { supabase, AuthPlugin } from './auth-plugin.js';

const DeliveryPlugin = {
    name: 'delivery',
    selectedDate: new Date().toISOString().split('T')[0],
    filterStatus: 'all',

    async render() {
        const container = document.getElementById('app-view-container');
        container.innerHTML = `
            <div class="space-y-4">
                <!-- Header & Filters Bar -->
                <div class="bg-card border border-borderc p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3">
                    <div>
                        <h2 class="text-base font-black text-white"><i class="fa-solid fa-screwdriver-wrench text-blue-400 mr-2"></i> Delivery FTTH</h2>
                        <p class="text-xs text-slate-400">Gestione ordini di lavoro e certificazioni campo</p>
                    </div>
                    <div class="flex items-center space-x-2 w-full md:w-auto">
                        <input type="date" id="delivery-date-filter" value="${this.selectedDate}" class="bg-darker border border-borderc rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
                        <select id="delivery-status-filter" class="bg-darker border border-borderc rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500">
                            <option value="all">Tutti gli stati</option>
                            <option value="assigned">Assegnati (Oggi)</option>
                            <option value="completed">Completati</option>
                            <option value="frozen">Congelati / Annullati</option>
                        </select>
                    </div>
                </div>

                <!-- Tickets List Container -->
                <div id="delivery-tickets-list" class="space-y-3">
                    <p class="text-slate-500 text-sm text-center py-8">Caricamento interventi in corso...</p>
                </div>
            </div>
        `;

        document.getElementById('delivery-date-filter').onchange = (e) => {
            this.selectedDate = e.target.value;
            this.loadTickets();
        };

        document.getElementById('delivery-status-filter').onchange = (e) => {
            this.filterStatus = e.target.value;
            this.loadTickets();
        };

        this.loadTickets();
    },

    async loadTickets() {
        let query = supabase.from('interventions').select('*').order('created_at', { ascending: false });

        if (AuthPlugin.profile.role !== 'admin') {
            query = query.eq('assigned_to', AuthPlugin.user.id);
        }

        if (this.filterStatus !== 'all') {
            query = query.eq('status', this.filterStatus);
        }

        const { data, error } = await query;
        const listContainer = document.getElementById('delivery-tickets-list');

        if (error || !data || data.length === 0) {
            listContainer.innerHTML = `<div class="bg-card border border-borderc p-8 rounded-2xl text-center text-slate-500 text-xs">Nessun intervento trovato per i filtri selezionati.</div>`;
            return;
        }

        listContainer.innerHTML = data.map(t => {
            let statusBadge = '';
            if (t.status === 'completed') statusBadge = `<span class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full">Completato</span>`;
            else if (t.status === 'frozen') statusBadge = `<span class="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full">Pratica Congelata</span>`;
            else if (t.status === 'cancelled') statusBadge = `<span class="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono px-2 py-0.5 rounded-full">Annullato</span>`;
            else statusBadge = `<span class="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded-full">Assegnato</span>`;

            return `
                <div class="bg-card border border-borderc p-4 rounded-2xl transition hover:border-slate-700">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] font-mono uppercase bg-darker text-slate-300 px-2 py-0.5 rounded border border-borderc">${t.work_type}</span>
                        ${statusBadge}
                    </div>
                    <h3 class="font-bold text-white text-base mb-1">${t.client_name}</h3>
                    <p class="text-xs text-slate-400 mb-3"><i class="fa-solid fa-location-dot mr-1 text-slate-500"></i> ${t.address}, ${t.city}</p>
                    
                    ${t.status === 'completed' ? `
                        <div class="bg-darker p-3 rounded-xl text-xs space-y-1 text-slate-300 border border-borderc">
                            <p><strong>Potenze (1310/1490):</strong> ${t.pwr_1310} /${t.pwr_1490} dBm</p>
                            <p><strong>Test OTDR:</strong> <span class="text-emerald-400 font-bold">${t.otdr_result}</span> \vert{} <strong>Porta:</strong>${t.port_code}</p>
                            <p class="text-slate-400 italic mt-1">Note: ${t.notes || 'Nessuna nota'}</p>
                        </div>
                    ` : t.status === 'frozen' || t.status === 'cancelled' ? `
                        <div class="bg-darker p-3 rounded-xl text-xs text-amber-400 border border-borderc">
                            <p><strong>Motivazione blocco:</strong> ${t.notes || 'Non specificata'}</p>
                        </div>
                    ` : `
                        <div class="flex space-x-2 pt-2">
                            <button onclick="window.openCloseModal('${t.id}', '${t.client_name.replace(/'/g, "")}')" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-blue-600/10">
                                <i class="fa-solid fa-clipboard-check mr-1"></i> Chiudi Lavoro
                            </button>
                            <button onclick="window.openFreezeModal('${t.id}', '${t.client_name.replace(/'/g, "")}')" class="bg-darker border border-borderc hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 font-bold px-4 py-2.5 rounded-xl text-xs transition">
                                <i class="fa-solid fa-ban"></i>
                            </button>
                        </div>
                    `}
                </div>
            `;
        }).join('');

        // Глобальные модалки закрытия / заморозки
        window.openCloseModal = (id, name) => this.renderCloseModal(id, name);
        window.openFreezeModal = (id, name) => this.renderFreezeModal(id, name);
    },

    renderCloseModal(id, name) {
        document.getElementById('global-modal-slot').innerHTML = `
            <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div class="bg-card border border-borderc rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 class="text-base font-bold text-white mb-1">Certificazione & Chiusura FTTH</h3>
                    <p class="text-xs text-slate-400 mb-4">Cliente: ${name}</p>
                    <form id="close-form" class="space-y-4">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Potenza 1310 nm</label>
                                <input type="text" id="cf-1310" placeholder="es. -18.2" required class="w-full bg-darker border border-borderc rounded-xl p-2.5 text-sm text-white">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Potenza 1490 nm</label>
                                <input type="text" id="cf-1490" placeholder="es. -16.5" required class="w-full bg-darker border border-borderc rounded-xl p-2.5 text-sm text-white">
                            </div>
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Esito Test OTDR (Viavi)</label>
                            <select id="cf-otdr" class="w-full bg-darker border border-borderc rounded-xl p-2.5 text-sm text-white">
                                <option value="Pass">PASS (Conforme)</option>
                                <option value="Fail">FAIL (Anomalia)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Codice PFP / PFS / Porta</label>
                            <input type="text" id="cf-port" placeholder="es. PFP-02 / Port 14" required class="w-full bg-darker border border-borderc rounded-xl p-2.5 text-sm text-white">
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Note Lavorazioni Eseguite</label>
                            <textarea id="cf-notes" rows="3" placeholder="Sostituita bretella, giunzione OK..." class="w-full bg-darker border border-borderc rounded-xl p-2.5 text-sm text-white"></textarea>
                        </div>
                        <div class="flex space-x-3 pt-2">
                            <button type="button" onclick="window.closeModalSlot()" class="w-1/2 bg-darker border border-borderc text-slate-300 font-bold py-3 rounded-xl text-xs">Annulla</button>
                            <button type="submit" class="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-600/20">Registra Chiusura</button>
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
                alert("Errore salvataggio.");
            }
        };
    },

    renderFreezeModal(id, name) {
        document.getElementById('global-modal-slot').innerHTML = `
            <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div class="bg-card border border-borderc rounded-3xl max-w-md w-full p-6 shadow-2xl">
                    <h3 class="text-base font-bold text-rose-400 mb-1">Congelamento o Annullamento Pratica</h3>
                    <p class="text-xs text-slate-400 mb-4">Cliente: ${name}</p>
                    <form id="freeze-form" class="space-y-4">
                        <div>
                            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Azione</label>
                            <select id="ff-status" class="w-full bg-darker border border-borderc rounded-xl p-2.5 text-sm text-white">
                                <option value="frozen">Congela Pratica (Sospesa)</option>
                                <option value="cancelled">Annulla Intervento</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Motivazione Obbligatoria</label>
                            <textarea id="ff-notes" rows="3" required placeholder="Es. Cliente irreperibile, permessi condominiali mancanti..." class="w-full bg-darker border border-borderc rounded-xl p-2.5 text-sm text-white"></textarea>
                        </div>
                        <div class="flex space-x-3 pt-2">
                            <button type="button" onclick="window.closeModalSlot()" class="w-1/2 bg-darker border border-borderc text-slate-300 font-bold py-3 rounded-xl text-xs">Indietro</button>
                            <button type="submit" class="w-1/2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-rose-600/20">Conferma</button>
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