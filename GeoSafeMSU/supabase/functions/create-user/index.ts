// Edge Function: create-user
// Onboards a new account via a SECURE INVITE, on behalf of an admin. Runs
// server-side so it can safely use the service-role key, which must NEVER be
// exposed to the browser.
//
// Security model: the admin never chooses or sees a password. Supabase emails
// the new user a one-time invite link; the user proves control of that inbox
// by clicking it, then sets their own private password on our /set-password
// page. Until then the account exists but has no usable password.
//
// Flow:
//   1. Authenticate the CALLER and confirm they are an admin.
//   2. Send the invite email (creates the auth.users row, unconfirmed, no password).
//   3. Insert the matching profiles row (same UUID) with the real email.
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
    // No password here anymore: the user will set their own via the invite link.
    const { name, username, email, role, redirectTo } = await req.json()
    if (!name || !username || !email || !role) {
      return json({ error: 'name, username, email and role are required.' }, 400)
    }
    if (!['admin', 'officer'].includes(role)) {
      return json({ error: 'role must be admin or officer.' }, 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Please provide a valid email address.' }, 400)
    }

    // Check the username early — inviteUserByEmail would already have sent an
    // email by the time the profiles insert catches a duplicate username.
    const { data: usernameTaken } = await admin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()
    if (usernameTaken) {
      return json({ error: 'That username is already taken.' }, 400)
    }

    // --- 3. Send the invite (creates the auth user, passwordless) ---------
    // redirectTo tells Supabase where the emailed link should land. It is only
    // honored if that URL is on the project's Redirect URLs allow-list
    // (Dashboard -> Authentication -> URL Configuration), so a forged value
    // from a client can't hijack the link.
    const { data: invited, error: inviteErr } =
      await admin.auth.admin.inviteUserByEmail(email, {
        data: { name, username },
        redirectTo,
      })
    if (inviteErr || !invited?.user) {
      const msg = inviteErr?.message?.includes('already been registered')
        ? 'An account with that email already exists.'
        : inviteErr?.message ?? 'Could not send the invitation.'
      return json({ error: msg }, 400)
    }

    // --- 4. Insert the profiles row (same UUID); roll back on failure -----
    const { error: profileErr } = await admin.from('profiles').insert({
      id: invited.user.id,
      username,
      name,
      role,
      email,
    })
    if (profileErr) {
      await admin.auth.admin.deleteUser(invited.user.id) // undo the auth user
      const msg = profileErr.message.includes('duplicate')
        ? 'That username or email is already taken.'
        : profileErr.message
      return json({ error: msg }, 400)
    }

    return json({ id: invited.user.id, username, name, role, email }, 201)
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
