import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// No servidor, durante o build, usamos placeholders para evitar erros fatais.
// No navegador, as variáveis reais (injetadas via GitHub Secrets) serão usadas.
const isServer = typeof window === 'undefined'
const url = !supabaseUrl && isServer ? 'https://placeholder.supabase.co' : supabaseUrl
const key = !supabaseAnonKey && isServer ? 'placeholder' : supabaseAnonKey

export const supabase = createClient(url, key, {
  auth: {
    persistSession: false // Evita problemas de hidratação com localStorage no SSR
  }
})
