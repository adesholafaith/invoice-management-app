import { isSupabaseConfigured, supabase, supabaseConfigStatus } from '../config/supabaseClients'

function ensureSupabaseConfig() {
  if (!isSupabaseConfigured) {
    const missingValues = [
      !supabaseConfigStatus.hasUrl ? 'VITE_SUPABASE_URL' : null,
      !supabaseConfigStatus.hasAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
    ].filter(Boolean)

    throw new Error(`Supabase is not configured. Missing: ${missingValues.join(', ')}.`)
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
        emailRedirectTo: `${window.location.origin}/dashboard`,
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

  async signOut() {
    ensureSupabaseConfig()

    return supabase.auth.signOut()
  },
}
