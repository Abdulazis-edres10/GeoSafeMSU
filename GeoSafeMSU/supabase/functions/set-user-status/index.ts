// Edge Function: set-user-status
// Enables or disables a login account on behalf of an admin. This REPLACES the
// old delete-user function: instead of destroying the account (and orphaning or
// losing the history tied to it), we preserve everything and just block sign-in.
//
// Disabling:  profiles.disabled = true  + ban the auth user (so login is rejected
//             at the auth layer, not merely hidden in the UI).
// Enabling:   profiles.disabled = false + lift the ban.
//
// All incidents, logs and the profile row are left untouched either way.
//
// Flow:
//   1. Authenticate the CALLER and confirm they are an admin.
//   2. Validate input; refuse to let an admin disable their own account.
//   3. Update the profiles.disabled flag.
//   4. Ban / unban the auth user (this is what actually enforces the block).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// ~100 years — effectively permanent until an admin re-enables the account.
const BAN_DURATION = '876000h'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // --- 1. Who is calling? Must be a logged-in admin. ---------------------
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing authorization header.' }, 401)

    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller }, error: callerErr } =
      await callerClient.auth.getUser()
    if (callerErr || !caller) return json({ error: 'Invalid session.' }, 401)

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data: callerProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return json({ error: 'Only admins can change account status.' }, 403)
    }

    // --- 2. Validate input + block self-disable (lockout guard) -----------
    const { id, disabled } = await req.json()
    if (!id || typeof disabled !== 'boolean') {
      return json({ error: 'id and disabled (boolean) are required.' }, 400)
    }
    if (id === caller.id && disabled) {
      return json({ error: 'You cannot disable your own account.' }, 400)
    }

    // --- 3. Flip the profile flag -----------------------------------------
    const { error: profileErr } = await admin
      .from('profiles')
      .update({ disabled })
      .eq('id', id)
    if (profileErr) return json({ error: profileErr.message }, 400)

    // --- 4. Ban / unban the auth user (enforces the login block) ----------
    const { error: authErr } = await admin.auth.admin.updateUserById(id, {
      ban_duration: disabled ? BAN_DURATION : 'none',
    })
    if (authErr) {
      // Roll back the flag so UI and auth state don't drift apart.
      await admin.from('profiles').update({ disabled: !disabled }).eq('id', id)
      return json({ error: authErr.message }, 400)
    }

    return json({ id, disabled })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
