import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Fallback placeholders allow the app to build without env vars configured.
  // Replace with real values in .env.local or Vercel environment settings.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
  )
}
