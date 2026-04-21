import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Se as variáveis não existirem, o cliente vai dar erro de URL inválida
// o que é preferível a tentar conectar em um domínio inexistente.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
