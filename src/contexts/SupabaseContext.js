import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, db } from '../lib/supabase';

const SupabaseContext = createContext({});

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const data = await db.profiles.get(userId);
      setProfile(data || null);
      return { data };
    } catch (error) {
      console.error('loadProfile error', error);
      setProfile(null);
      return { error };
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Prefer getSession on mount to restore session (works across tabs).
    // Then subscribe to auth changes. Avoid awaiting inside the listener to
    // prevent UI stalls; instead load the profile and set state safely.
    (async () => {
      try {
        const { data: initialData, error: initialError } = await supabase.auth.getSession();
        if (initialError) console.warn('supabase.getSession warning', initialError);
        const session = initialData?.session ?? null;
        const currentUser = session?.user ?? null;
        if (mounted) {
          setUser(currentUser);
          if (currentUser) {
            // load profile but don't block rendering
            loadProfile(currentUser.id).catch(err => console.warn('loadProfile error', err));
          }
        }
      } catch (err) {
        console.error('Error fetching initial session', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { subscription } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      // Update user immediately. Load profile asynchronously to avoid blocking.
      setUser(nextUser);
      if (nextUser) {
        (async () => {
          try {
            await loadProfile(nextUser.id);
          } catch (err) {
            console.warn('loadProfile (onAuthStateChange) failed', err);
            setProfile(null);
          }
        })();
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Auth actions
  const signUp = async ({ email, password, username }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { data: null, error };

      const userId = data?.user?.id;
      let profileError = null;
      if (userId) {
        // optional: try to create profile immediately. If it fails it's fine —
        // the DB trigger will create the profile automatically after auth user is inserted.
        try {
          await db.profiles.create({ id: userId, email, username });
        } catch (e) {
          profileError = e;
          console.warn('profile create attempt failed (will be created by DB trigger):', e?.message || e);
        }
      }

      return { data, error: null, profileError };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { data: null, error };
      // profile will be loaded via onAuthStateChange
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    // Clear local state immediately and attempt sign-out in background.
    setLoading(true);
    try {
      supabase.auth.signOut().catch((err) => {
        console.error('supabase.signOut error (background):', err);
      });
      return { error: null };
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user?.id) return { data: null, error: new Error('Not authenticated') };
    setLoading(true);
    try {
      const data = await db.profiles.update(user.id, updates);
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return { data: null, error: new Error('Not authenticated') };
    setLoading(true);
    try {
      const res = await loadProfile(user.id);
      return res;
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => !!user;
  const isLoading = () => loading;

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
    isAuthenticated,
    isLoading,
    supabase,
    db
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export default SupabaseContext;