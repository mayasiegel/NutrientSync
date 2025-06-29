import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bbpvflablmgilhewtoos.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicHZmbGFibG1naWxoZXd0b29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNDUxMTQsImV4cCI6MjA2MzYyMTExNH0.pI-cTNosTQFkQyMKNh0TTnM_DlPEva-ZX7nu211p314';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 