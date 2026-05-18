import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// NUNCA colocar a service_role aqui no client side.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (__DEV__) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "⚠️ [Supabase] Variáveis de ambiente EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY não encontradas!\n" +
      "Por favor, crie seu arquivo .env local ou configure as variáveis no painel/EAS do seu projeto."
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
