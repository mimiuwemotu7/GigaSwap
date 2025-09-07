import { createClient } from '@supabase/supabase-js'

// Supabase configuration - supports both React and Next.js env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing required Supabase environment variables')
}

// Debug logging (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase Environment Check:')
console.log('Using URL:', supabaseUrl)
console.log('Using Key:', supabaseAnonKey ? 'Present' : 'Missing')
}

// Helper function to use custom fetch for all requests
const customFetch = (url, options = {}) => {
  // In development, route requests through the backend proxy server
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const proxyUrl = url.replace(supabaseUrl, 'http://localhost:3001/supabase')
    console.log('🔄 Proxying request:', url, '→', proxyUrl)
    return fetch(proxyUrl, options)
  }
  // In production, use direct URL
  console.log('🌐 Direct request:', url)
  return fetch(url, options)
}

// Create Supabase client with session-friendly configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // CRITICAL: Enable persistent sessions for auto sign-in
    persistSession: true,
    
    // Use default localStorage - ensure it's properly configured
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    
    // CRITICAL: Auto refresh tokens to maintain session
    autoRefreshToken: true,
    
    // CRITICAL: Detect existing sessions from URL params
    detectSessionInUrl: true,
    
    // Use PKCE flow for better security
    flowType: 'pkce',
    
    // IMPORTANT: Don't automatically redirect on auth events
    // This prevents interference with session restoration
    debug: process.env.NODE_ENV === 'development'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
    // Use custom fetch function for all requests
    fetch: customFetch
  }
})

// Get the correct Supabase session keys
const getSupabaseKeys = () => {
  if (typeof window === 'undefined') return []
  
  try {
    // Supabase stores sessions with keys like:
    // sb-<project-ref>-auth-token
    // sb-<project-ref>-auth-token-code-verifier
    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0]
    if (!projectRef) return []
    
    const baseKey = `sb-${projectRef}-auth-token`
    const codeVerifierKey = `${baseKey}-code-verifier`
    
    return [baseKey, codeVerifierKey]
  } catch (error) {
    console.warn('Could not determine Supabase session keys:', error.message)
    return []
  }
}

// SAFE session validation - only clear if definitely corrupted
const validateExistingSessions = () => {
  if (typeof window === 'undefined') return
  
  const keys = getSupabaseKeys()
  if (keys.length === 0) return
  
  keys.forEach(key => {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return
      
      // Only clear if we can't parse it at all
      const parsed = JSON.parse(stored)
      
      // Additional validation for the main auth token
      if (key.endsWith('-auth-token') && !key.includes('code-verifier')) {
        // Check if this looks like an anon key instead of session data
        if (parsed.access_token && parsed.access_token.startsWith('sb_')) {
          console.log('🧹 Clearing invalid session data - looks like anon key stored as session')
          localStorage.removeItem(key)
        } else if (typeof parsed !== 'object' || parsed === null) {
          console.log('🧹 Clearing completely invalid session data for key:', key)
          localStorage.removeItem(key)
        }
      }
      
    } catch (parseError) {
      // Only clear if JSON is completely malformed
      console.log('🧹 Clearing unparseable session data for key:', key)
      console.log('🧹 Parse error:', parseError.message)
      localStorage.removeItem(key)
    }
  })
}

// Initialize auth state tracking
let authStateInitialized = false
let currentUser = null
let sessionRestored = false

// Listen for auth state changes to track session restoration
supabase.auth.onAuthStateChange((event, session) => {
  
  if (event === 'INITIAL_SESSION') {
    sessionRestored = true
    currentUser = session?.user || null
    
    if (session?.user) {
      console.log('✅ Auto sign-in successful:', session.user.email)
    } else {
      console.log('ℹ️ No existing session found')
    }
  }
  
  if (event === 'SIGNED_IN') {
    currentUser = session?.user || null
    console.log('✅ User signed in:', currentUser?.email)
  }
  
  if (event === 'SIGNED_OUT') {
    currentUser = null
    console.log('👋 User signed out')
  }
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Session token refreshed')
  }
  
  authStateInitialized = true
})

// Client initialization with session preservation
const initializeClient = async () => {
  if (typeof window === 'undefined') return
  
  try {
    // Only validate sessions, don't aggressively clear them
    validateExistingSessions()
    
    // Wait for initial session to be processed
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max wait
    
    while (!authStateInitialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    if (!authStateInitialized) {
      console.warn('⚠️ Auth state initialization timeout')
    }
    
    // Test connection without interfering with auth
    const { error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error && error.message.includes('JWT')) {
      console.log('🔄 Session may need refresh, this is normal')
    } else if (error) {
      console.error('❌ Database connection test failed:', error.message)
    } else {
      console.log('✅ Supabase client initialized and database accessible')
    }
    
  } catch (err) {
    console.error('❌ Client initialization error:', err.message)
  }
}

// Initialize after DOM is ready but don't block rendering
if (typeof window !== 'undefined') {
  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initializeClient)
  } else {
    setTimeout(initializeClient, 0)
  }
  
  // Comprehensive Supabase connectivity diagnostics
  setTimeout(async () => {
    console.log('🧪 Testing Supabase connectivity...')
    console.log('🔧 Configuration:')
    console.log('  - URL:', supabaseUrl)
    console.log('  - Key length:', supabaseAnonKey?.length || 0)
    console.log('  - Key starts with:', supabaseAnonKey?.substring(0, 10) + '...')
    
    // Test 1: Check base URL accessibility
    try {
      const baseResponse = await customFetch(supabaseUrl, { 
        method: 'HEAD',
        headers: { 'apikey': supabaseAnonKey }
      })
      console.log('🌐 Base URL reachable:', baseResponse.status === 200 ? 'Yes' : `No (${baseResponse.status})`)
    } catch (error) {
      console.log('🌐 Base URL reachable: No (network error)')
    }
    
    // Test 2: Check auth endpoint with correct paths
    const authPaths = ['/auth/v1/logout', '/auth/v1/signup', '/auth/v1/token']
    for (const path of authPaths) {
      try {
        const response = await customFetch(`${supabaseUrl}${path}`, { 
          method: 'POST',
          headers: { 'apikey': supabaseAnonKey }
        })
        // These endpoints expect specific data, so 400/401 is normal
        const isWorking = response.status === 200 || response.status === 400 || response.status === 401
        console.log(`🌐 Auth endpoint ${path}:`, isWorking ? 'Yes' : `No (${response.status})`)
        if (isWorking) break
      } catch (error) {
        console.log(`🌐 Auth endpoint ${path}: No (network error)`)
      }
    }
    
    // Test 3: Check REST API endpoint
    try {
      const restResponse = await customFetch(`${supabaseUrl}/rest/v1/`, { 
        method: 'HEAD',
        headers: { 'apikey': supabaseAnonKey }
      })
      console.log('🌐 REST API reachable:', restResponse.status === 200 ? 'Yes' : `No (${restResponse.status})`)
    } catch (error) {
      console.log('🌐 REST API reachable: No (network error)')
    }
    
    // Test 4: Try getSession with timeout
    try {
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('getSession timeout after 3 seconds')), 3000)
      )
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
      
      if (error) {
        console.log('⚠️ getSession error:', error.message)
      } else if (session) {
        console.log('✅ getSession success:', session.user?.email)
      } else {
        console.log('ℹ️ getSession returned no session')
      }
    } catch (error) {
      console.log('⚠️ getSession failed:', error.message)
    }
    
    // Test 5: Check if the project ID is correct
    const projectId = supabaseUrl.split('//')[1]?.split('.')[0]
    console.log('🔍 Extracted project ID:', projectId)
    console.log('🔍 Expected project ID format: 20 characters, alphanumeric')
    
  }, 1000)
}

// Helper to check if user is authenticated
export const isAuthenticated = () => currentUser !== null

// Helper to wait for auth initialization
export const waitForAuth = async (timeout = 5000) => {
  const start = Date.now()
  
  while (!authStateInitialized && (Date.now() - start) < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return { initialized: authStateInitialized, user: currentUser }
}

// Enhanced database helper functions
export const db = {
  profiles: {
    async get(userId) {
      if (!userId) throw new Error('User ID is required')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    },
    
    async create(profile) {
      if (!profile?.id) throw new Error('Profile data with ID is required')
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async update(userId, updates) {
      if (!userId || !updates) throw new Error('User ID and updates required')
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  conversations: {
    async getByUser(userId) {
      if (!userId) throw new Error('User ID is required')
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (
            id,
            content,
            role,
            timestamp,
            component_type
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    
    async create(conversation) {
      if (!conversation?.user_id) throw new Error('Conversation data with user_id required')
      
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('conversations')
        .insert({ ...conversation, created_at: now, updated_at: now })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async update(conversationId, updates) {
      if (!conversationId || !updates) throw new Error('Conversation ID and updates required')
      
      const { data, error } = await supabase
        .from('conversations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async delete(conversationId) {
      if (!conversationId) throw new Error('Conversation ID is required')
      
      // Delete messages first
      await db.messages.deleteByConversation(conversationId)
      
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
      
      if (error) throw error
    }
  },
  
  messages: {
    async getByConversation(conversationId) {
      if (!conversationId) throw new Error('Conversation ID is required')
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })
      
      if (error) throw error
      return data || []
    },
    
    async create(message) {
      if (!message?.conversation_id) throw new Error('Message with conversation_id required')
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...message,
          timestamp: message.timestamp || new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    async deleteByConversation(conversationId) {
      if (!conversationId) throw new Error('Conversation ID is required')
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)
      
      if (error) throw error
    }
  }
}

export default supabase