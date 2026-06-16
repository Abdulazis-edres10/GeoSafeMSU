import { createClient } from '@supabase/supabase-js'

// Credentials come from the .env file (must start with VITE_ so Vite exposes
// them to the browser). Never hard-code keys here — that would commit them to git.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// A single shared client the whole app imports and reuses.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
