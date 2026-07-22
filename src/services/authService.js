import { isSupabaseConfigured, supabase } from '../config/supabaseClients'

function ensureSupabaseConfig() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
  }
}

export const authService = {
  getSession() {
    return supabase.auth.getSession()
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  async signUp({ email, password, name }) {
    ensureSupabaseConfig()

    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })
  },

  async signIn({ email, password }) {
    ensureSupabaseConfig()

    return supabase.auth.signInWithPassword({
      email,
      password,
    })
  },

  async signInWithGoogle() {
    ensureSupabaseConfig()

    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  },

  async signOut() {
    ensureSupabaseConfig()

    return supabase.auth.signOut()
  },
}
