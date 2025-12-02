import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = 'https://asejdosvbhqwhmyxyxzn.supabase.co'; // Ambil dari Dashboard Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZWpkb3N2Ymhxd2hteXh5eHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NDA0NDIsImV4cCI6MjA4MDIxNjQ0Mn0.b5tmfCMHvkpXo_QDSQS7MtvB31PuaqA2IbWkAqaOJQE'; // Ambil dari Dashboard Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Logic agar Auth Token otomatis refresh saat aplikasi dibuka kembali
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});