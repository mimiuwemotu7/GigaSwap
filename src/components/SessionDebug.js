import React, { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'
import { supabase } from '../lib/supabase'

// Debug component to help troubleshoot session issues
export const SessionDebug = () => {
  const { user, loading, profile, supabase } = useSupabase()
  const [sessionInfo, setSessionInfo] = useState(null)
  const [storageKeys, setStorageKeys] = useState([])
  const [logs, setLogs] = useState([])
  const [supabaseConfig, setSupabaseConfig] = useState(null)
  const [authEvents, setAuthEvents] = useState([])
  const [isTesting, setIsTesting] = useState(false)

  const addLog = (message) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Custom fetch function to use proxy in development
  const customFetch = (url, options = {}) => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL
      const proxyUrl = url.replace(supabaseUrl, 'http://localhost:3001/supabase')
      return fetch(proxyUrl, options)
    }
    return fetch(url, options)
  }

  const addAuthEvent = (event, session) => {
    setAuthEvents(prev => [...prev.slice(-4), {
      timestamp: new Date().toLocaleTimeString(),
      event,
      user: session?.user?.email || 'none',
      sessionId: session?.access_token?.substring(0, 20) + '...' || 'none'
    }])
  }

  useEffect(() => {
    addLog('Debug component mounted')
    addLog(`Tab opened at: ${new Date().toLocaleTimeString()}`)
    
    // Get Supabase configuration info
    const getSupabaseConfig = () => {
      try {
        const config = {
          url: supabase.supabaseUrl,
          anonKey: supabase.supabaseKey ? 'Present' : 'Missing',
          authConfig: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
          }
        }
        setSupabaseConfig(config)
        addLog('Supabase config loaded')
      } catch (err) {
        addLog(`Config check failed: ${err.message}`)
      }
    }

    const checkSession = async () => {
      try {
        // Check localStorage first
        const storedToken = localStorage.getItem('sb-vylywbbvrsyccsarrtfk-auth-token')
        addLog(`Stored token exists: ${!!storedToken}`)
        
        // Try getSession with timeout to avoid hanging
        try {
          const sessionPromise = supabase.auth.getSession()
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('getSession timeout')), 3000)
          )
          
          const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
          setSessionInfo({ session, error })
          
          // More detailed session logging
          if (session) {
            const expiresAt = new Date(session.expires_at * 1000)
            const now = new Date()
            const isExpired = expiresAt < now
            const timeUntilExpiry = Math.round((expiresAt - now) / 1000 / 60) // minutes
            addLog(`Session: Found, Expires: ${expiresAt.toLocaleTimeString()}, Expired: ${isExpired}`)
            addLog(`Time until expiry: ${timeUntilExpiry} minutes`)
            addLog(`User ID: ${session.user?.id}, Email: ${session.user?.email}`)
            addLog(`Email confirmed: ${session.user?.email_confirmed_at ? 'Yes' : 'No'}`)
            addLog(`Provider: ${session.user?.app_metadata?.provider || 'email'}`)
          } else {
            addLog(`Session: None ${error ? 'Error: ' + error.message : ''}`)
            if (storedToken) {
              addLog('WARNING: Token exists in storage but no session found!')
            }
          }
        } catch (timeoutError) {
          addLog(`getSession() timed out: ${timeoutError.message}`)
          // Fallback: check localStorage directly
          if (storedToken) {
            try {
              const parsed = JSON.parse(storedToken)
              if (parsed.user && parsed.access_token && !parsed.access_token.startsWith('sb_')) {
                const now = Math.floor(Date.now() / 1000)
                const isExpired = parsed.expires_at && parsed.expires_at < now
                if (!isExpired) {
                  addLog(`Fallback: Valid session in localStorage for ${parsed.user.email}`)
                  setSessionInfo({ session: { user: parsed.user, expires_at: parsed.expires_at }, error: null })
                } else {
                  addLog(`Fallback: Session in localStorage is expired`)
                  setSessionInfo({ session: null, error: null })
                }
              } else {
                addLog(`Fallback: Invalid session data in localStorage`)
                setSessionInfo({ session: null, error: null })
              }
            } catch (parseError) {
              addLog(`Fallback: Could not parse localStorage session data`)
              setSessionInfo({ session: null, error: null })
            }
          } else {
            setSessionInfo({ session: null, error: null })
          }
        }
      } catch (err) {
        addLog(`Session check failed: ${err.message}`)
        setSessionInfo({ session: null, error: err })
      }
    }

    const checkStorage = () => {
      try {
        const keys = Object.keys(localStorage).filter(key => 
          key.includes('supabase') || key.includes('auth') || key.includes('sb-')
        )
        setStorageKeys(keys)
        addLog(`Storage keys: ${keys.length}`)
        
        // Check for specific Supabase storage items
        const supabaseKeys = keys.filter(key => key.startsWith('sb-'))
        if (supabaseKeys.length > 0) {
          addLog(`Supabase storage items: ${supabaseKeys.join(', ')}`)
        }
      } catch (err) {
        addLog(`Storage check failed: ${err.message}`)
      }
    }

    getSupabaseConfig()
    checkSession()
    checkStorage()

    // Listen to auth state changes with enhanced logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth event: ${event} - User: ${session?.user?.email || 'none'}`)
      addAuthEvent(event, session)
      
      // Log specific event details
      switch (event) {
        case 'SIGNED_IN':
          addLog(`✅ User signed in: ${session?.user?.email}`)
          break
        case 'SIGNED_OUT':
          addLog(`❌ User signed out`)
          break
        case 'TOKEN_REFRESHED':
          addLog(`🔄 Token refreshed for: ${session?.user?.email}`)
          break
        case 'USER_UPDATED':
          addLog(`👤 User updated: ${session?.user?.email}`)
          break
        default:
          addLog(`🔔 Auth event: ${event}`)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const testSession = async () => {
    if (isTesting) {
      addLog('Test already running, please wait...')
      return
    }
    
    setIsTesting(true)
    addLog('Testing session manually...')
    try {
      // Test getUser() with aggressive timeout
      addLog('Testing getUser() with 5s timeout...')
      const startTime = Date.now()
      
      const getUserPromise = supabase.auth.getUser()
      const getUserTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('getUser() timeout after 5 seconds')), 5000)
      )
      
      const { data: { user }, error: userError } = await Promise.race([getUserPromise, getUserTimeout])
      const userTime = Date.now() - startTime
      addLog(`✅ getUser() completed in ${userTime}ms - User: ${user?.email || 'None'}`)
      
      if (userError) {
        addLog(`getUser() error: ${userError.message}`)
      }
      
      // Test getSession() with aggressive timeout
      addLog('Testing getSession() with 5s timeout...')
      const sessionStartTime = Date.now()
      
      const sessionPromise = supabase.auth.getSession()
      const sessionTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('getSession() timeout after 5 seconds')), 5000)
      )
      
      const { data: { session }, error } = await Promise.race([sessionPromise, sessionTimeout])
      const sessionTime = Date.now() - sessionStartTime
      
      if (session) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        const isExpired = expiresAt < now
        addLog(`✅ getSession() completed in ${sessionTime}ms - Session: Found, Expired: ${isExpired}`)
        addLog(`Token expires: ${expiresAt.toLocaleString()}`)
        addLog(`User: ${session.user?.email}`)
      } else {
        addLog(`❌ getSession() completed in ${sessionTime}ms - Session: None, Error: ${error?.message || 'None'}`)
      }
    } catch (err) {
      addLog(`❌ Session test failed: ${err.message}`)
      
      // Try basic diagnostic without Supabase calls
      try {
        addLog('Running basic diagnostics...')
        addLog(`Current user from context: ${user?.email || 'None'}`)
        addLog(`Loading state: ${loading}`)
        addLog(`Profile state: ${profile ? 'Loaded' : 'None'}`)
        
        // Test simple fetch to Supabase
        addLog('Testing basic Supabase connectivity...')
        const response = await customFetch(supabase.supabaseUrl + '/rest/v1/', {
          method: 'HEAD',
          headers: {
            'apikey': supabase.supabaseKey
          }
        })
        addLog(`Basic connectivity: ${response.ok ? 'Yes' : 'No'} (${response.status})`)
        
      } catch (diagErr) {
        addLog(`Basic diagnostic failed: ${diagErr.message}`)
      }
    } finally {
      setIsTesting(false)
    }
  }

  const refreshSession = async () => {
    addLog('Attempting to refresh session...')
    try {
      // Add timeout to prevent hanging
      const refreshPromise = supabase.auth.refreshSession()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Refresh timeout after 10 seconds')), 10000)
      )
      
      const { data: { session }, error } = await Promise.race([refreshPromise, timeoutPromise])
      
      if (error) {
        addLog(`Refresh failed: ${error.message}`)
        addLog(`Error code: ${error.status || 'unknown'}`)
      } else if (session) {
        addLog(`Session refreshed successfully`)
        addLog(`New expires: ${new Date(session.expires_at * 1000).toLocaleString()}`)
      } else {
        addLog(`Refresh returned no session`)
      }
    } catch (err) {
      addLog(`Refresh error: ${err.message}`)
    }
  }

  const inspectToken = () => {
    addLog('Inspecting stored token...')
    try {
      const tokenData = localStorage.getItem('sb-vylywbbvrsyccsarrtfk-auth-token')
      if (tokenData) {
        const parsed = JSON.parse(tokenData)
        addLog(`Token structure: ${Object.keys(parsed).join(', ')}`)
        
        // Check different possible session locations
        const session = parsed.currentSession || parsed.session || parsed
        if (session && session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000)
          const now = new Date()
          const isExpired = expiresAt < now
          addLog(`Stored token expires: ${expiresAt.toLocaleString()}`)
          addLog(`Token expired: ${isExpired}`)
          addLog(`User: ${session.user?.email}`)
        } else if (session && session.user) {
          addLog(`Session found but no expires_at`)
          addLog(`User: ${session.user.email}`)
        } else {
          addLog('No session data found in token')
          addLog(`Token keys: ${Object.keys(parsed).join(', ')}`)
        }
      } else {
        addLog('No token found in localStorage')
      }
    } catch (err) {
      addLog(`Token inspection failed: ${err.message}`)
    }
  }

  const checkContextState = () => {
    addLog('Checking SupabaseContext state...')
    addLog(`Context user: ${user ? user.email : 'null'}`)
    addLog(`Context loading: ${loading}`)
    addLog(`Context profile: ${profile ? 'exists' : 'null'}`)
    
    // Also check what supabase.auth.getUser() returns
    supabase.auth.getUser().then(({ data: { user: authUser }, error }) => {
      if (error) {
        addLog(`getUser() error: ${error.message}`)
      } else {
        addLog(`getUser() result: ${authUser ? authUser.email : 'null'}`)
        if (authUser) {
          addLog(`Email confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`)
          addLog(`User created: ${new Date(authUser.created_at).toLocaleString()}`)
          addLog(`User ID: ${authUser.id}`)
          addLog(`Last sign in: ${authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString() : 'Never'}`)
        }
      }
    }).catch(err => {
      addLog(`getUser() failed: ${err.message}`)
    })
  }

  const forceStopLoading = () => {
    addLog('Attempting to force stop loading...')
    addLog('Note: This requires context modification to work properly')
    // This would need to be implemented in the context
    // For now, just log that we can't do it from here
    addLog('Cannot force stop loading from debug component')
  }

  const testSignOut = async () => {
    addLog('Testing sign out...')
    try {
      // Add timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timeout after 10 seconds')), 10000)
      )
      
      const { error } = await Promise.race([signOutPromise, timeoutPromise])
      
      if (error) {
        addLog(`Sign out error: ${error.message}`)
        addLog(`Error code: ${error.status || 'unknown'}`)
        addLog(`Error details: ${JSON.stringify(error)}`)
      } else {
        addLog('Sign out successful')
      }
    } catch (err) {
      addLog(`Sign out failed: ${err.message}`)
      addLog(`Error type: ${err.constructor.name}`)
    }
  }

  const resendVerification = async () => {
    addLog('Attempting to resend verification email...')
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: 'miraclejames812@gmail.com'
      })
      
      if (error) {
        addLog(`Resend error: ${error.message}`)
      } else {
        addLog('Verification email sent successfully!')
      }
    } catch (err) {
      addLog(`Resend failed: ${err.message}`)
    }
  }

  const testSessionRestore = async () => {
    addLog('Testing session restoration...')
    try {
      // Force a fresh session check
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session) {
        addLog(`Session restored: ${session.user?.email}`)
        addLog(`Session expires: ${new Date(session.expires_at * 1000).toLocaleString()}`)
      } else {
        addLog(`Session restore failed: ${error?.message || 'No session found'}`)
        
        // Try to get user directly
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (user) {
          addLog(`User found via getUser(): ${user.email}`)
        } else {
          addLog(`getUser() also failed: ${userError?.message || 'No user found'}`)
        }
      }
    } catch (err) {
      addLog(`Session restore test failed: ${err.message}`)
    }
  }

  const manualSignOut = async () => {
    addLog('Manual sign out using Supabase...')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        addLog(`Sign out error: ${error.message}`)
      } else {
        addLog('Sign out successful')
      }
    } catch (err) {
      addLog(`Manual sign out error: ${err.message}`)
    }
  }

  const testProfileCreation = async () => {
    if (!user) {
      addLog('No user available for profile creation test')
      return
    }
    
    try {
      addLog('Testing profile creation...')
      
      // Test database connectivity first
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (error) {
        addLog(`Database test failed: ${error.message}`)
        return
      }
      
      addLog('Database connectivity: OK')
      
      // Try to create a test profile
      const testProfile = {
        id: user.id,
        email: user.email,
        username: user.email?.split('@')[0] || 'TestUser',
        bio: 'Test profile',
        wallet_address: '',
        avatar_url: null
      }
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(testProfile)
        .select()
        .single()
      
      if (createError) {
        addLog(`Profile creation failed: ${createError.message}`)
      } else {
        addLog(`Profile created successfully: ${newProfile.username}`)
      }
      
    } catch (error) {
      addLog(`Profile test failed: ${error.message}`)
    }
  }

  const testSupabaseConfig = async () => {
    addLog('Testing Supabase configuration...')
    try {
      // Test multiple endpoints
      const endpoints = [
        { name: 'Base URL', path: '', method: 'HEAD' },
        { name: 'REST API', path: '/rest/v1/', method: 'HEAD' },
        { name: 'Auth v1', path: '/auth/v1/', method: 'HEAD' },
        { name: 'Auth Settings', path: '/auth/v1/settings', method: 'GET' },
        { name: 'Health Check', path: '/health', method: 'GET' }
      ]
      
      for (const endpoint of endpoints) {
        try {
          const response = await customFetch(supabase.supabaseUrl + endpoint.path, {
            method: endpoint.method,
            headers: {
              'apikey': supabase.supabaseKey,
              'Authorization': `Bearer ${supabase.supabaseKey}`
            }
          })
          addLog(`${endpoint.name}: ${response.ok ? '✅ OK' : `❌ ${response.status}`}`)
        } catch (err) {
          addLog(`${endpoint.name}: ❌ Network Error`)
        }
      }
      
      // Test environment variables
      addLog(`Environment check:`)
      addLog(`- NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}`)
      addLog(`- REACT_APP_SUPABASE_URL: ${process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Not set'}`)
      addLog(`- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}`)
      addLog(`- REACT_APP_SUPABASE_ANON_KEY: ${process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}`)
      
      // Test client configuration
      addLog(`Client config:`)
      addLog(`- URL: ${supabase.supabaseUrl}`)
      addLog(`- Key length: ${supabase.supabaseKey?.length || 0} characters`)
      addLog(`- Key starts with: ${supabase.supabaseKey?.substring(0, 10)}...`)
      
      // Validate project ID format
      const projectId = supabase.supabaseUrl.split('//')[1]?.split('.')[0]
      addLog(`- Project ID: ${projectId}`)
      addLog(`- Project ID length: ${projectId?.length || 0} characters`)
      addLog(`- Expected format: 20 chars, alphanumeric`)
      
      // Test Supabase client methods
      addLog('Testing Supabase client methods:')
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          addLog(`getUser(): ❌ ${error.message}`)
        } else {
          addLog(`getUser(): ✅ ${data.user ? 'User found' : 'No user'}`)
        }
      } catch (err) {
        addLog(`getUser(): ❌ ${err.message}`)
      }
      
    } catch (err) {
      addLog(`❌ Config test failed: ${err.message}`)
    }
  }

  const checkProjectStatus = async () => {
    addLog('Checking Supabase project status...')
    try {
      const projectId = supabase.supabaseUrl.split('//')[1]?.split('.')[0]
      addLog(`Project ID: ${projectId}`)
      
      // Test CORS first
      addLog('Testing CORS configuration...')
      try {
        const corsResponse = await customFetch(supabase.supabaseUrl, {
          method: 'OPTIONS',
          headers: {
            'apikey': supabase.supabaseKey,
            'Origin': window.location.origin
          }
        })
        addLog(`CORS preflight: ${corsResponse.ok ? '✅ Allowed' : `❌ ${corsResponse.status}`}`)
      } catch (corsError) {
        addLog(`❌ CORS Error: ${corsError.message}`)
        addLog('🔧 Solution: Add http://localhost:3000 to Supabase CORS settings')
        addLog('  1. Go to Supabase Dashboard → Settings → API')
        addLog('  2. Add "http://localhost:3000" to CORS origins')
        addLog('  3. Save and refresh this page')
        return
      }
      
      // Test if project is accessible
      const response = await customFetch(supabase.supabaseUrl, {
        method: 'GET',
        headers: {
          'apikey': supabase.supabaseKey
        }
      })
      
      addLog(`Project accessibility: ${response.status === 200 ? '✅ Accessible' : `❌ ${response.status}`}`)
      
      if (response.status === 404) {
        addLog('❌ Project not found - possible issues:')
        addLog('  - Project ID is incorrect')
        addLog('  - Project has been deleted')
        addLog('  - Project is paused/suspended')
        addLog('  - URL format is wrong')
      } else if (response.status === 403) {
        addLog('❌ Access forbidden - possible issues:')
        addLog('  - API key is incorrect')
        addLog('  - API key has expired')
        addLog('  - Project permissions issue')
      } else if (response.status === 500) {
        addLog('❌ Server error - possible issues:')
        addLog('  - Supabase service is down')
        addLog('  - Project has internal issues')
      }
      
      // Check if the URL format is correct
      const urlPattern = /^https:\/\/[a-z0-9]{20}\.supabase\.co$/
      if (!urlPattern.test(supabase.supabaseUrl)) {
        addLog('❌ URL format is incorrect')
        addLog('Expected: https://[20-char-id].supabase.co')
        addLog(`Actual: ${supabase.supabaseUrl}`)
      } else {
        addLog('✅ URL format is correct')
      }
      
      // Check API key format
      if (supabase.supabaseKey?.startsWith('eyJ')) {
        addLog('✅ API key format looks correct (JWT)')
      } else {
        addLog('❌ API key format is incorrect')
        addLog('Expected: JWT token starting with "eyJ"')
        addLog(`Actual: ${supabase.supabaseKey?.substring(0, 10)}...`)
      }
      
    } catch (err) {
      addLog(`❌ Project status check failed: ${err.message}`)
      if (err.message.includes('CORS')) {
        addLog('🔧 This is a CORS issue - see solution above')
      }
    }
  }

  const testCrossTabPersistence = async () => {
    addLog('Testing cross-tab session persistence...')
    try {
      // Check current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        addLog(`✅ Current session found: ${session.user?.email}`)
        addLog(`Session expires: ${new Date(session.expires_at * 1000).toLocaleString()}`)
        
        // Check localStorage for session data
        const storageKeys = Object.keys(localStorage).filter(key => key.startsWith('sb-'))
        addLog(`Storage keys found: ${storageKeys.length}`)
        storageKeys.forEach(key => {
          addLog(`- ${key}`)
        })
        
        // Check if session is properly stored
        const sessionKey = `sb-${supabase.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`
        const storedSession = localStorage.getItem(sessionKey)
        
        if (storedSession) {
          addLog(`✅ Session stored in localStorage: Yes`)
          try {
            const parsedSession = JSON.parse(storedSession)
            addLog(`Stored session user: ${parsedSession.currentSession?.user?.email || 'None'}`)
            addLog(`Stored session expires: ${parsedSession.currentSession?.expires_at ? new Date(parsedSession.currentSession.expires_at * 1000).toLocaleString() : 'None'}`)
          } catch (e) {
            addLog(`❌ Error parsing stored session: ${e.message}`)
          }
        } else {
          addLog(`❌ Session NOT stored in localStorage`)
        }
        
        addLog(`\n🔍 Cross-tab test instructions:`)
        addLog(`1. Open a new tab to this same URL`)
        addLog(`2. Check if you're still logged in`)
        addLog(`3. If not, the session isn't being shared properly`)
        
      } else {
        addLog(`❌ No current session found`)
      }
    } catch (err) {
      addLog(`❌ Cross-tab test failed: ${err.message}`)
    }
  }

  const forceStop = () => {
    addLog('🛑 Force stopping all operations...')
    setIsTesting(false)
    addLog('Operations stopped. You can now try again.')
  }

  const clearAndReload = () => {
    addLog('Clearing all storage and reloading...')
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }

  return (
    <div className="fixed bottom-0 left-0 m-4 p-4 bg-gray-900 text-white text-xs rounded-lg max-w-md z-50">
      <h3 className="font-bold mb-2 text-yellow-400">🔧 Supabase Session Debug</h3>
      
      <div className="space-y-1 max-h-80 overflow-y-auto">
        
        {/* Supabase Configuration */}
        <div className="border-b border-gray-600 pb-2">
          <div className="font-semibold text-blue-400">📋 Supabase Config</div>
          <div><strong>URL:</strong> <span className="text-green-400">{supabaseConfig?.url ? 'Connected' : 'Missing'}</span></div>
          <div><strong>Anon Key:</strong> <span className="text-green-400">{supabaseConfig?.anonKey}</span></div>
          <div><strong>Persist Session:</strong> <span className="text-green-400">{supabaseConfig?.authConfig?.persistSession ? 'Yes' : 'No'}</span></div>
          <div><strong>Auto Refresh:</strong> <span className="text-green-400">{supabaseConfig?.authConfig?.autoRefreshToken ? 'Yes' : 'No'}</span></div>
        </div>

        {/* Current State */}
        <div className="border-b border-gray-600 pb-2">
          <div className="font-semibold text-blue-400">🔍 Current State</div>
          <div><strong>Loading:</strong> <span className={loading ? 'text-red-400' : 'text-green-400'}>{loading ? 'Yes' : 'No'}</span></div>
          <div><strong>User:</strong> <span className={user ? 'text-green-400' : 'text-red-400'}>{user ? user.email : 'None'}</span></div>
          <div><strong>Profile:</strong> <span className={profile ? 'text-green-400' : 'text-red-400'}>{profile ? 'Loaded' : 'None'}</span></div>
          <div><strong>Session Valid:</strong> <span className={sessionInfo?.session ? 'text-green-400' : 'text-red-400'}>{sessionInfo?.session ? 'Yes' : 'No'}</span></div>
          {sessionInfo?.session && (
            <div className="ml-2">
              <div><strong>Expires:</strong> <span className="text-yellow-400">{new Date(sessionInfo.session.expires_at * 1000).toLocaleTimeString()}</span></div>
              <div><strong>Email Confirmed:</strong> <span className={sessionInfo.session.user?.email_confirmed_at ? 'text-green-400' : 'text-red-400'}>{sessionInfo.session.user?.email_confirmed_at ? 'Yes' : 'No'}</span></div>
              <div><strong>Provider:</strong> <span className="text-blue-400">{sessionInfo.session.user?.app_metadata?.provider || 'email'}</span></div>
            </div>
          )}
          {sessionInfo?.error && (
            <div className="text-red-400"><strong>Error:</strong> {sessionInfo.error.message}</div>
          )}
        </div>

        {/* Storage Info */}
        <div className="border-b border-gray-600 pb-2">
          <div className="font-semibold text-blue-400">💾 Storage ({storageKeys.length} items)</div>
          <div className="ml-2 max-h-16 overflow-y-auto">
            {storageKeys.map(key => (
              <div key={key} className="text-xs">• {key}</div>
            ))}
          </div>
        </div>

        {/* Recent Auth Events */}
        <div className="border-b border-gray-600 pb-2">
          <div className="font-semibold text-blue-400">📡 Recent Auth Events</div>
          <div className="ml-2 max-h-16 overflow-y-auto">
            {authEvents.map((event, i) => (
              <div key={i} className="text-xs text-gray-300">
                {event.timestamp}: {event.event} - {event.user}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="pb-2">
          <div className="font-semibold text-blue-400">📝 Recent Logs</div>
          <div className="ml-2 max-h-20 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="text-xs text-gray-300">{log}</div>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-1 mt-2 flex-wrap">
          <button
            onClick={testSession}
            disabled={isTesting}
            className={`px-2 py-1 rounded text-xs ${isTesting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isTesting ? 'Testing...' : 'Test Session'}
          </button>
          <button
            onClick={refreshSession}
            className="px-2 py-1 bg-green-600 rounded text-xs hover:bg-green-700"
          >
            Refresh
          </button>
          <button
            onClick={testSupabaseConfig}
            className="px-2 py-1 bg-purple-600 rounded text-xs hover:bg-purple-700"
          >
            Test Config
          </button>
          <button
            onClick={testCrossTabPersistence}
            className="px-2 py-1 bg-cyan-600 rounded text-xs hover:bg-cyan-700"
          >
            Test Cross-Tab
          </button>
          <button
            onClick={testProfileCreation}
            className="px-2 py-1 bg-yellow-600 rounded text-xs hover:bg-yellow-700"
          >
            Test Profile
          </button>
          <button
            onClick={checkProjectStatus}
            className="px-2 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-700"
          >
            Check Project
          </button>
          {isTesting && (
            <button
              onClick={forceStop}
              className="px-2 py-1 bg-orange-600 rounded text-xs hover:bg-orange-700"
            >
              Force Stop
            </button>
          )}
          <button
            onClick={manualSignOut}
            className="px-2 py-1 bg-gray-600 rounded text-xs hover:bg-gray-700"
          >
            Sign Out
          </button>
          <button
            onClick={clearAndReload}
            className="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
          >
            Clear & Reload
          </button>
        </div>
      </div>
    </div>
  )
}
export default SessionDebug