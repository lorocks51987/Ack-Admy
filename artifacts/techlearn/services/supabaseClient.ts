import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// No MVP, as chaves estão hardcoded por simplicidade.
// NUNCA colocar a service_role aqui no client side.
const supabaseUrl = "https://clsivnkkxbkxjwhbbibe.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsc2l2bmtreGJreGp3aGJiaWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Nzc3NTEsImV4cCI6MjA5NDM1Mzc1MX0.julNkWNpDMSF80k9gAW1sRcOsI0ZDxMXHsBChtQVmX8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
