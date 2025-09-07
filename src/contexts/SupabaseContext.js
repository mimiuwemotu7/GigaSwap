import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, db } from '../lib/supabase'

const SupabaseContext = createContext({})

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  const createUserProfile = useCallback(async (userId, fallbackUserData = null) => {
    try {
      console.log('🔄 Creating profile for user:', userId)
      
      // Try getUser with timeout
      let currentUser
      try {
        const userPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getUser timeout')), 3000)
        )
        
        const { data: { user }, error } = await Promise.race([userPromise, timeoutPromise])
        if (error) throw error
        currentUser = user
      } catch (timeoutError) {
        console.log('⚠️ getUser() timed out, using fallback user data')
        // Fallback: use the provided user data or context user
        currentUser = fallbackUserData || user
        if (!currentUser) {
          console.error('❌ No user data available for profile creation')
          return
        }
        console.log('✅ Using fallback user data:', currentUser.email)
      }
      
      if (!currentUser) return

      const profileData = {
        id: userId,
        email: currentUser.email,
        username: currentUser.user_metadata?.username || 
                 currentUser.user_metadata?.name ||
                 currentUser.email?.split('@')[0] || 
                 'User',
        bio: '',
        wallet_address: '',
        avatar_url: currentUser.user_metadata?.avatar_url || null
      }

      console.log('🔍 Creating profile with data:', profileData)
      
      try {
        const newProfile = await db.profiles.create(profileData)
        console.log('✅ Profile created successfully in database:', newProfile)
        setProfile(newProfile)
      } catch (dbError) {
        console.log('⚠️ Database profile creation failed, creating offline profile')
        console.log('⚠️ Database error:', dbError.message)
        
        // Create an offline profile that we can use locally
        const offlineProfile = {
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _offline: true // Mark as offline profile
        }
        
        console.log('✅ Created offline profile:', offlineProfile.username)
        setProfile(offlineProfile)
      }
    } catch (error) {
      console.error('❌ Error creating profile:', error.message)
      console.error('❌ Profile creation error details:', error)
    }
  }, [user])

  const loadUserProfile = useCallback(async (userId, fallbackUserData = null) => {
    try {
      console.log('🔄 Loading profile for user:', userId)
      
      // Add timeout to the database query
      console.log('🔍 Starting profile query...')
      const profilePromise = db.profiles.get(userId)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 10000)
      )
      
      const profileData = await Promise.race([profilePromise, timeoutPromise])
      console.log('🔍 Profile query result:', profileData)
      
      if (!profileData) {
        console.log('ℹ️ No profile found, creating new profile...')
        await createUserProfile(userId, fallbackUserData)
        return
      }

      console.log('✅ Profile loaded:', profileData.username || profileData.email)
      setProfile(profileData)
    } catch (error) {
      console.error('❌ Error loading profile:', error.message)
      console.error('❌ Error details:', error)
      
      // Try to create a basic profile as fallback
      try {
        console.log('🔄 Attempting to create fallback profile...')
        await createUserProfile(userId, fallbackUserData)
      } catch (fallbackError) {
        console.error('❌ Fallback profile creation failed:', fallbackError.message)
        console.error('❌ Fallback error details:', fallbackError)
      }
    }
  }, [createUserProfile])

  useEffect(() => {
    let mounted = true

    // Robust initialization with multiple fallback strategies
    const initializeAuth = async () => {
      try {
        console.log('🔄 Context initializing auth...')
        
        // Strategy 1: Try getSession() with short timeout
        try {
          const sessionPromise = supabase.auth.getSession()
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('getSession timeout')), 2000)
          )
          
          const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
          
          if (!mounted) return
          
          if (error) {
            console.log('⚠️ getSession error:', error.message)
          } else if (session?.user) {
            console.log('✅ Found session via getSession():', session.user.email)
            setUser(session.user)
            await loadUserProfile(session.user.id)
            setLoading(false)
            return
          }
        } catch (timeoutError) {
          console.log('⚠️ getSession() timed out, trying fallback...')
        }
        
        // Strategy 2: Read directly from localStorage
        if (!mounted) return
        
        const sessionKey = `sb-${supabase.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`
        const storedSession = localStorage.getItem(sessionKey)
        
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession)
            
            // Validate session data
            if (parsed.user && parsed.access_token && !parsed.access_token.startsWith('sb_')) {
              // Check if session is expired
              const now = Math.floor(Date.now() / 1000)
              const isExpired = parsed.expires_at && parsed.expires_at < now
              
            if (!isExpired) {
              console.log('✅ Found valid session in localStorage:', parsed.user.email)
              setUser(parsed.user)
              await loadUserProfile(parsed.user.id, parsed.user)
              setLoading(false)
              return
              } else {
                console.log('ℹ️ Stored session is expired, clearing...')
                localStorage.removeItem(sessionKey)
              }
            }
          } catch (parseError) {
            console.log('ℹ️ Invalid session data in localStorage')
            localStorage.removeItem(sessionKey)
          }
        }
        
        // Strategy 3: Try getUser() as last resort
        if (!mounted) return
        
        try {
          const userPromise = supabase.auth.getUser()
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('getUser timeout')), 3000)
          )
          
          const { data: { user }, error } = await Promise.race([userPromise, timeoutPromise])
          
          if (!mounted) return
          
          if (error) {
            console.log('⚠️ getUser error:', error.message)
          } else if (user) {
            console.log('✅ Found user via getUser():', user.email)
            setUser(user)
            await loadUserProfile(user.id)
          }
        } catch (timeoutError) {
          console.log('⚠️ getUser() also timed out')
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ Auth init error:', error.message)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes - this is the single source of truth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth event:', event, session?.user?.email || 'none')
      
      if (!mounted) return
      
      // Update state based on the session, regardless of event type
      const currentUser = session?.user || null
      setUser(currentUser)
      
      if (currentUser) {
        await loadUserProfile(currentUser.id, currentUser)
      } else {
        setProfile(null)
      }
      
      // Always mark as not loading after any auth event
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadUserProfile])



  const refreshProfile = async () => {
    if (!user) return
    await loadUserProfile(user.id)
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('🔄 Attempting to sign out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.log('❌ Sign out error:', error.message)
        return { error }
      }
      console.log('✅ Sign out successful')
      return { error: null }
    } catch (error) {
      console.log('❌ Sign out exception:', error.message)
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) {
      return { data: null, error: new Error('No user logged in') }
    }

    try {
      const updatedProfile = await db.profiles.update(user.id, updates)
      setProfile(updatedProfile)
      return { data: updatedProfile, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    // State
    user,
    profile,
    loading,
    
    // Auth methods
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    
    // Profile methods
    updateProfile,
    refreshProfile,
    
    // Helpers
    isAuthenticated: () => !!user,
    isLoading: () => loading,
    
    // Direct access
    supabase,
    db
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}
export default SupabaseContext