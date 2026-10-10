import { loginUser, logoutUser, getCurrentUserRole } from './auth.js';
import { renderTickets } from './ui.js';
import { supabase } from './db.js';

let currentUserData = null;

document.addEventListener('DOMContentLoaded', async () => {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const userMenu = document.getElementById('user-menu');
    const userBadge = document.getElementById('user-badge');

    // Verifica se l'utente ha già una sessione attiva
    const userInfo = await getCurrentUserRole();

    if (userInfo) {
        currentUserData = userInfo;
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        userMenu.classList.remove('hidden');

        userBadge.textContent = `${userInfo.fullName} (${userInfo.role.toUpperCase()})`;

        if (userInfo.role === 'admin') {
            document.getElementById('admin-panel').classList.remove('hidden');
        }

        // Carica la lista ticket iniziale
        loadData();
    }

    // Gestione Login Submit
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const errBox = document.getElementById('login-error');

        try {
            errBox.classList.add('hidden');
            await loginUser(email, pass);
            window.location.reload();
        } catch (err) {
            errBox.textContent = "Credenziali non valide o errore di connessione.";
            errBox.classList.remove('hidden');
        }
    });

    // Gestione Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        logoutUser();
    });

    // Gestione Invio Modulo Chiusura Intervento (Form)
    document.getElementById('closure-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const ticketId = document.getElementById('closure-ticket-id').value;
        const pwr1310 = document.getElementById('pwr-1310').value;
        const pwr1490 = document.getElementById('pwr-1490').value;
        const otdr = document.getElementById('otdr-result').value;
        const portCode = document.getElementById('port-code').value;
        const notes = document.getElementById('tech-notes').value;

        const { error } = await supabase
            .from('interventions')
            .update({
                status: 'completed',
                pwr_1310: pwr1310,
                pwr_1490: pwr1490,
                otdr_result: otdr,
                port_code: portCode,
                notes: notes,
                closed_at: new Date().toISOString()
            })
            .eq('id', ticketId);

        if (!error) {
            window.closeModal();
            loadData();
        } else {
            alert("Errore durante il salvataggio della chiusura.");
        }
    });
});

function loadData() {
    if (currentUserData) {
        renderTickets(currentUserData.role, currentUserData.user.id);
    }
}

window.reloadTicketsTrigger = loadData;

// Funzioni Globali per Modali
window.openClosureModal = (ticketId, clientName) => {
    document.getElementById('closure-ticket-id').value = ticketId;
    document.getElementById('modal-ticket-info').textContent = `Cliente: ${clientName}`;
    document.getElementById('closure-modal').classList.remove('hidden');
    document.getElementById('closure-modal').classList.add('flex');
};

window.closeModal = () => {
    document.getElementById('closure-modal').classList.add('hidden');
    document.getElementById('closure-modal').classList.remove('flex');
};
