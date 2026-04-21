import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Se as variáveis estiverem faltando durante o build (SSR), 
// criamos um cliente com valores fictícios apenas para não quebrar o build.
// No navegador (runtime), o Next.js injetará os valores reais.
const isServer = typeof window === 'undefined'
const finalUrl = !supabaseUrl && isServer ? 'https://placeholder.supabase.co' : supabaseUrl
const finalKey = !supabaseAnonKey && isServer ? 'placeholder' : supabaseAnonKey

export const supabase = createClient(finalUrl, finalKey)
