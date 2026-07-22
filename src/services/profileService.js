import { supabase } from '../config/supabaseClients'

const PROFILE_COLUMNS =
  'id, user_id, company_name, contact_name, email, phone, address, website, tax_id, invoice_footer, created_at, updated_at'

export const emptyProfile = {
  address: '',
  company_name: '',
  contact_name: '',
  email: '',
  invoice_footer: '',
  phone: '',
  tax_id: '',
  website: '',
}

export const profileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      return { data: null, error }
    }

    return { data: data || { ...emptyProfile, user_id: userId }, error: null }
  },

  async upsertProfile(userId, values) {
    return supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          ...normalizeProfile(values),
        },
        { onConflict: 'user_id' },
      )
      .select(PROFILE_COLUMNS)
      .single()
  },
}

function normalizeProfile(values) {
  return {
    address: values.address || null,
    company_name: values.company_name || null,
    contact_name: values.contact_name || null,
    email: values.email || null,
    invoice_footer: values.invoice_footer || null,
    phone: values.phone || null,
    tax_id: values.tax_id || null,
    website: values.website || null,
  }
}
