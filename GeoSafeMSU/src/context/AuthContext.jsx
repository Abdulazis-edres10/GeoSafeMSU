import { createContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Given a logged-in auth user, fetch THEIR profile row (role, name, username).
  // auth.users only knows email/password — role lives in our profiles table.
  async function loadProfile(authUser) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, name, role')
      .eq('id', authUser.id)   // profiles.id === auth.users.id (same UUID)
      .single()

    if (error || !data) {
      // Auth user exists but has no profile row → treat as not logged in.
      setUser(null)
      setIsAuthenticated(false)
      return null
    }

    const safeUser = {
      userID: data.id,
      name: data.name,
      username: data.username,
      role: data.role,
    }
    setUser(safeUser)
    setIsAuthenticated(true)
    return safeUser
  }

  useEffect(() => {
    // On mount: is there already a saved session? (Supabase persists it for us
    // in localStorage automatically — we no longer manage that by hand.)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for future auth changes (login elsewhere, token refresh, logout)
    // and keep our React state in sync.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (username, password) => {
    // Step 1: username → email lookup (the pre-auth read our RLS policy allows).
    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single()

    if (lookupError || !profile) {
      return { success: false, message: 'Invalid username or password.' }
    }

    // Step 2: real authentication — Supabase checks the hashed password server-side.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    })

    if (signInError) {
      return { success: false, message: 'Invalid username or password.' }
    }

    // Step 3: load the full profile so role/name are ready before we redirect.
    const { data: sessionData } = await supabase.auth.getUser()
    const loaded = await loadProfile(sessionData.user)
    if (!loaded) {
      return { success: false, message: 'No profile found for this account.' }
    }

    return { success: true, role: loaded.role }
  }

  const logout = async () => {
    // signOut clears the session; onAuthStateChange above resets our state.
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
