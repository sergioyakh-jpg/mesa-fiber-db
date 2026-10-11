import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
import { core } from './core.js';

const SUPABASE_URL = 'https://aglxhsxzuohpqaqeitow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnbHhoc3h6dW9ocHFhcWVpdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NjM5NTcsImV4cCI6MjEwNzIzOTk1N30.U367ZgtU4ZzXanHxSs6GP4zL0aZlJe0byjlTCP9-n5c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const AuthPlugin = {
    name: 'auth',
    user: null,
    profile: null,

    async preInit() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.user = session.user;
            const { data } = await supabase.from('profiles').select('*').eq('id', this.user.id).single();
            this.profile = data || { full_name: this.user.email, role: 'technician' };
            
            document.getElementById('telegram-nav').classList.remove('hidden');
            this.renderHeaderUser();
            window.router('dashboard');
        } else {
            this.renderLoginScreen();
        }
    },

    renderHeaderUser() {
        document.getElementById('header-user-slot').innerHTML = `
            <div class="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full shadow-inner">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-xs font-medium text-slate-200 hidden sm:inline">${this.profile.full_name}</span>
            </div>
        `;
    },

    renderLoginScreen() {
        document.getElementById('telegram-nav').classList.add('hidden');
        document.getElementById('app-view-container').innerHTML = `
            <div class="max-w-sm mx-auto mt-16 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <div class="text-center mb-6">
                    <div class="w-14 h-14 bg-sky-500/10 border border-sky-500/20 rounded-2xl mx-auto flex items-center justify-center text-sky-400 text-xl mb-3">
                        <i class="fa-solid fa-lock"></i>
                    </div>
                    <h2 class="text-lg font-bold text-white">Accesso Riservato</h2>
                    <p class="text-xs text-slate-400 mt-1">Inserisci le credenziali MESA</p>
                </div>
                <form id="login-form" class="space-y-4">
                    <div>
                        <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email</label>
                        <input type="email" id="l-email" required class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-sky-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Password</label>
                        <input type="password" id="l-pass" required class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-sky-500">
                    </div>
                    <button type="submit" class="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-sky-500/20">
                        Accedi
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
                document.getElementById('l-err').textContent = "Credenziali non valide.";
                document.getElementById('l-err').classList.remove('hidden');
            }
        };
    }
};

core.register('auth', AuthPlugin);
