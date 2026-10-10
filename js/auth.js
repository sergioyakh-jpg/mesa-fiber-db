import { supabase } from './db.js';

export async function getCurrentUserRole() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Legge il ruolo dalla tabella personalizzata 'profiles' collegata agli utenti
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

    return {
        user,
        role: profile ? profile.role : 'technician', // Default tecnico
        fullName: profile ? profile.full_name : user.email
    };
}

export async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function logoutUser() {
    await supabase.auth.signOut();
    window.location.reload();
}
