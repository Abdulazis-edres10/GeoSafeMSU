// Edge Function: delete-user
// Deletes a login account (auth.users credential + profiles row) on behalf of an
// admin. Runs server-side with the service-role key — the browser cannot delete
// another user's auth credential, which is why this must live here.
//
// Flow:
//   1. Authenticate the CALLER and confirm they are an admin.
//   2. Refuse to let an admin delete their own account (lockout guard).
//   3. Delete the profiles row, then the auth user.

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
      return json({ error: 'Only admins can delete users.' }, 403)
    }

    // --- 2. Validate target + block self-deletion -------------------------
    const { id } = await req.json()
    if (!id) return json({ error: 'id is required.' }, 400)
    if (id === caller.id) {
      return json({ error: 'You cannot delete your own account.' }, 400)
    }

    // --- 3. Delete profile first (avoids any FK conflict), then auth user --
    const { error: profileErr } = await admin.from('profiles').delete().eq('id', id)
    if (profileErr) return json({ error: profileErr.message }, 400)

    const { error: authErr } = await admin.auth.admin.deleteUser(id)
    if (authErr) return json({ error: authErr.message }, 400)

    return json({ id, deleted: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
