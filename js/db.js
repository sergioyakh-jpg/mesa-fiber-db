import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Inserisci qui le tue credenziali Supabase (Project URL e Anon Public Key)
const SUPABASE_URL = 'https://aglxhsxzuohpqaqeitow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnbHhoc3h6dW9ocHFhcWVpdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NjM5NTcsImV4cCI6MjEwNzIzOTk1N30.U367ZgtU4ZzXanHxSs6GP4zL0aZlJe0byjlTCP9-n5c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
