import React, { useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthCallback: Starting callback handling...');
    
    const handleAuthCallback = async () => {
      try {
        // Let Supabase handle the OAuth callback naturally
        console.log('AuthCallback: Getting session from Supabase...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthCallback: Session error:', error);
          navigate('/?error=' + encodeURIComponent(error.message));
          return;
        }
        
        if (data.session) {
          console.log('AuthCallback: Session found:', data.session.user.email);
          navigate('/?auth=success');
        } else {
          console.log('AuthCallback: No session found');
          navigate('/?error=no_session');
        }
      } catch (error) {
        console.error('AuthCallback: Callback failed:', error);
        navigate('/?error=callback_failed');
      }
    };

    // Start handling immediately
    handleAuthCallback();
    
    // Fallback timeout
    const fallbackTimeout = setTimeout(() => {
      console.log('AuthCallback: Fallback timeout reached, redirecting...');
      navigate('/?error=timeout');
    }, 5000);

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, [supabase, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
