// Edge Function: create-user
// Creates a REAL login account (auth.users credential + profiles row) on behalf
// of an admin. Runs server-side so it can safely use the service-role key, which
// must NEVER be exposed to the browser.
//
// Flow:
//   1. Authenticate the CALLER and confirm they are an admin.
//   2. Create the auth user (auto-confirmed) with email = `${username}@geosafe.msu`.
//   3. Insert the matching profiles row (same UUID).
//   4. If the profile insert fails, delete the half-created auth user (rollback).

import { createClient } from 'jsr:@supabase/supabase-js@2'

// Allow the browser app to call this function (preflight + actual request).
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
  // Browsers send an OPTIONS preflight before the real POST.
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // --- 1. Who is calling? Must be a logged-in admin. ---------------------
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing authorization header.' }, 401)

    // A client scoped to the CALLER's token — getUser() returns *them*.
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller }, error: callerErr } =
      await callerClient.auth.getUser()
    if (callerErr || !caller) return json({ error: 'Invalid session.' }, 401)

    // Privileged client (bypasses RLS) for the role check + the actual work.
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data: callerProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return json({ error: 'Only admins can create users.' }, 403)
    }

    // --- 2. Validate the requested new account ----------------------------
    const { name, username, password, role } = await req.json()
    if (!name || !username || !password || !role) {
      return json({ error: 'name, username, password and role are required.' }, 400)
    }
    if (!['admin', 'officer'].includes(role)) {
      return json({ error: 'role must be admin or officer.' }, 400)
    }

    const email = `${username}@geosafe.msu`

    // --- 3. Create the auth user (auto-confirmed) -------------------------
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, username },
    })
    if (createErr || !created?.user) {
      return json({ error: createErr?.message ?? 'Could not create auth user.' }, 400)
    }

    // --- 4. Insert the profiles row (same UUID); roll back on failure -----
    const { error: profileErr } = await admin.from('profiles').insert({
      id: created.user.id,
      username,
      name,
      role,
      email,
    })
    if (profileErr) {
      await admin.auth.admin.deleteUser(created.user.id) // undo the auth user
      const msg = profileErr.message.includes('duplicate')
        ? 'That username is already taken.'
        : profileErr.message
      return json({ error: msg }, 400)
    }

    return json({ id: created.user.id, username, name, role }, 201)
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
