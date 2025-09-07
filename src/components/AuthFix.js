import React, { useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'

// Component to handle OAuth cleanup and recovery
export const AuthFix = () => {
  const { supabase } = useSupabase()

  useEffect(() => {
    const handleAuthRecovery = async () => {
      console.log('AuthFix: Checking for incomplete OAuth flow...')
      
      // Check if we're on a callback page or have OAuth parameters
      const urlParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      
      const code = urlParams.get('code') || hashParams.get('access_token')
      const error = urlParams.get('error') || hashParams.get('error')
      
      console.log('AuthFix: URL params:', { code: !!code, error })
      
      if (error) {
        console.log('AuthFix: OAuth error detected:', error)
        // Clean up failed OAuth attempt
        cleanupIncompleteAuth()
        return
      }
      
      if (code) {
        console.log('AuthFix: OAuth code/token found, letting Supabase handle it...')
        // Let Supabase handle the OAuth callback
        return
      }
      
      // Check for orphaned code verifier
      const codeVerifier = localStorage.getItem('sb-vylywbbvrsyccsarrtfk-auth-token-code-verifier')
      if (codeVerifier && !code) {
        console.log('AuthFix: Found orphaned code verifier, cleaning up...')
        cleanupIncompleteAuth()
      }
    }

    const cleanupIncompleteAuth = () => {
      console.log('AuthFix: Cleaning up incomplete auth state...')
      
      // Remove the orphaned code verifier
      localStorage.removeItem('sb-vylywbbvrsyccsarrtfk-auth-token-code-verifier')
      
      // Remove any other auth-related items that might be stuck
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-vylywbbvrsyccsarrtfk-auth-token') && 
            key !== 'sb-vylywbbvrsyccsarrtfk-auth-token') {
          console.log('AuthFix: Removing:', key)
          localStorage.removeItem(key)
        }
      })
      
      console.log('AuthFix: Cleanup complete')
    }

    // Run the recovery check
    handleAuthRecovery()

    // Also clean up if we detect the app has been idle with a code verifier for too long
    const checkForStaleVerifier = () => {
      const codeVerifier = localStorage.getItem('sb-vylywbbvrsyccsarrtfk-auth-token-code-verifier')
      if (codeVerifier) {
        // If we've had a code verifier for more than 5 minutes without completion, clean it up
        const verifierAge = Date.now() - (JSON.parse(localStorage.getItem('auth-verifier-timestamp') || '0'))
        if (verifierAge > 5 * 60 * 1000) { // 5 minutes
          console.log('AuthFix: Stale code verifier detected, cleaning up...')
          cleanupIncompleteAuth()
        }
      }
    }

    // Check for stale verifier on mount and periodically
    checkForStaleVerifier()
    const interval = setInterval(checkForStaleVerifier, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [supabase])

  // This component doesn't render anything
  return null
}

// Button to manually fix auth issues using Supabase
export const AuthFixButton = () => {
  const { supabase } = useSupabase()
  
  const handleFixAuth = async () => {
    console.log('AuthFixButton: Manual auth fix triggered')
    
    try {
      // Use Supabase's signOut to properly clear session
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('AuthFixButton: Sign out error:', error)
      } else {
        console.log('AuthFixButton: Sign out successful')
      }
    } catch (err) {
      console.error('AuthFixButton: Error:', err)
    }
    
    // Reload page to reset state
    window.location.href = '/'
  }

  return (
    <button
      onClick={handleFixAuth}
      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
    >
      🔧 Fix Auth State
    </button>
  )
}

export default AuthFix
