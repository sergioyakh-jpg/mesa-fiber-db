import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
import { core } from './core.js';

const SUPABASE_URL = 'https://aglxhsxzuohpqaqeitow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnbHhoc3h6dW9ocHFhcWVpdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NjM5NTcsImV4cCI6MjEwNzIzOTk1N30.U367ZgtU4ZzXanHxSs6GP4zL0aZlJe0byjlTCP9-n5c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AuthPlugin = {
    name: 'auth',
    user: null,
    profile: null,

    async preInit() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.user = session.user;
            const { data } = await supabase.from('profiles').select('*').eq('id', this.user.id).single();
            this.profile = data || { full_name: this.user.email, role: 'technician' };
            
            document.getElementById('mobile-nav').classList.remove('hidden');
            this.renderHeaderUser();
            window.router('dashboard');
        } else {
            this.renderLoginScreen();
        }
    },

    renderHeaderUser() {
        document.getElementById('header-user-slot').innerHTML = `
            <div class="flex items-center space-x-2 bg-slate-900 border border-borderc px-3 py-1.5 rounded-xl">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-xs font-medium text-slate-200 hidden sm:inline">${this.profile.full_name}</span>
            </div>
        `;
    },

    renderLoginScreen() {
        document.getElementById('mobile-nav').classList.add('hidden');
        document.getElementById('app-view-container').innerHTML = `
            <div class="max-w-md mx-auto mt-16 bg-card border border-borderc p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div class="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl mx-auto flex items-center justify-center text-blue-400 text-2xl mb-4 shadow-inner">
                        <i class="fa-solid fa-lock"></i>
                    </div>
                    <h2 class="text-xl font-black text-white">Accesso Riservato</h2>
                    <p class="text-xs text-slate-400 mt-1">Inserisci le credenziali operative MESA</p>
                </div>
                <form id="login-form" class="space-y-4">
                    <div>
                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Email</label>
                        <input type="email" id="l-email" required class="w-full bg-darker border border-borderc rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Password</label>
                        <input type="password" id="l-pass" required class="w-full bg-darker border border-borderc rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition">
                    </div>
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-blue-600/20">
                        Entra nel Sistema
                    </button>
                    <p id="l-err" class="text-rose-400 text-xs text-center hidden mt-2"></p>
                </form>
            </div>
        `;

        document.getElementById('login-form').onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('l-email').value;
            const password = document.getElementById('l-pass').value;
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (!error) {
                window.location.reload();
            } else {
                const errBox = document.getElementById('l-err');
                errBox.textContent = "Credenziali non valide.";
                errBox.classList.remove('hidden');
            }
        };
    }
};

core.register('auth', AuthPlugin);