import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://zaqravjgsjyayjjtsaob.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcXJhdmpnc2p5YXlqanRzYW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDg2NDEsImV4cCI6MjA2NjYyNDY0MX0.NEuSNPCCG5U7cdpDOWfBNEbcBXEE2entZA8Zb9qQSH0';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Loaded ✅' : 'Missing ❌');

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 