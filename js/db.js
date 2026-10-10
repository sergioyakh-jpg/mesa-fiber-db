import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Inserisci qui le tue credenziali Supabase (Project URL e Anon Public Key)
const SUPABASE_URL = 'https://IL_TUO_PROGETTO.supabase.co';
const SUPABASE_ANON_KEY = 'IL_TUO_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
