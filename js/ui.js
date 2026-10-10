import { supabase } from './db.js';

let currentFilter = 'all';

export async function renderTickets(userRole, userId) {
    const container = document.getElementById('tickets-container');
    container.innerHTML = `<p class="text-slate-500 text-sm text-center py-4">Caricamento flussi in corso...</p>`;

    let query = supabase.from('interventions').select('*').order('created_at', { ascending: false });

    // Se l'utente è un tecnico semplice, vede solo i propri ticket assegnati
    if (userRole !== 'admin') {
        query = query.eq('assigned_to', userId);
    }

    if (currentFilter !== 'all') {
        query = query.eq('status', currentFilter);
    }

    const { data: tickets, error } = await query;

    if (error) {
        container.innerHTML = `<p class="text-rose-400 text-sm text-center">Errore nel caricamento dati.</p>`;
        return;
    }

    if (tickets.length === 0) {
        container.innerHTML = `<p class="text-slate-500 text-sm text-center py-4">Nessun intervento presente in questa vista.</p>`;
        return;
    }

    container.innerHTML = tickets.map(t => {
        const isCompleted = t.status === 'completed';
        const statusBadge = isCompleted 
            ? `<span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-mono">Completato</span>`
            : `<span class="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2 py-0.5 rounded-full font-mono">Assegnato (In Corso)</span>`;

        return `
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-mono uppercase bg-slate-800 text-slate-300 px-2 py-1 rounded">${t.work_type || 'FTTH Attivazione'}</span>
                    ${statusBadge}
                </div>
                <h4 class="font-bold text-white text-base mb-1">${t.client_name}</h4>
                <p class="text-xs text-slate-400 mb-3"><i class="fa-solid fa-location-dot text-slate-500 mr-1"></i> ${t.address}, ${t.city}</p>
                
                ${isCompleted ? `
                    <div class="bg-slate-950 p-3 rounded-lg text-xs space-y-1 text-slate-300 border border-slate-800/60 mb-3">
                        <p><strong>Potenze (1310/1490):</strong> ${t.pwr_1310} /${t.pwr_1490}</p>
                        <p><strong>OTDR:</strong> <span class="text-emerald-400 font-bold">${t.otdr_result}</span> \vert{} <strong>Porta:</strong>${t.port_code}</p>
                        <p class="text-slate-400 italic">Note: ${t.notes || 'Nessuna nota'}</p>
                    </div>
                ` : `
                    <button onclick="window.openClosureModal('${t.id}', '${t.client_name.replace(/'/g, "")}')" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg text-xs transition">
                        <i class="fa-solid fa-clipboard-check mr-1"></i> Compila Chiusura & Report
                    </button>
                `}
            </div>
        `;
    }).join('');
}

window.filterTickets = (filter) => {
    currentFilter = filter;
    window.reloadTicketsTrigger();
};
