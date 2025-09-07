import React, { useState } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../themes/themeConfig';
import { useToast } from './ToastContext';
import supabase from '../lib/supabase';

export default function AuthModalUI() {
  const { signUp, signIn, signInWithGoogle } = useSupabase();
  const { currentTheme } = useTheme();
  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  function mapAuthErrorToMessage(err) {
    const msg = err?.message || String(err);
    if (/invalid password|invalid login|invalid_credentials|wrong password/i.test(msg)) return 'That email or password doesn\'t match our records.';
    if (/email not confirmed|email_not_confirmed/i.test(msg)) return 'Almost there — please confirm the link we sent to your email.';
    if (/user already registered|already registered|duplicate/i.test(msg)) return 'Looks like that email is already registered. Try signing in.';
    if (/invalid email|email address invalid/i.test(msg)) return 'Hmm — that email looks invalid. Try again.';
    if (/password must/i.test(msg)) return 'Your password doesn\'t meet our security requirements.';
    return 'Authentication failed. Please try again.';
  }

  function mapDbErrorToMessage(err) {
    const msg = err?.message || String(err);
    if (/duplicate key value violates unique constraint.*username|uq_profiles_username|username.*already exists/i.test(msg)) return 'That username is taken — try another.';
    if (/duplicate key value violates unique constraint.*email|uq_profiles_email|email.*already exists/i.test(msg)) return 'That email is already in use. Try signing in instead.';
    return 'Could not save profile — please try again.';
  }

  const containerClass = `p-2 w-full`;
  const inputClass = `${getThemeClasses(currentTheme, 'input')} w-full p-2 rounded-lg border ${getThemeClasses(currentTheme, 'border')} focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm`;
  const labelClass = `${getThemeClasses(currentTheme, 'label')} text-xs block mb-1 font-medium`;
  const actionBtnBase = `${getThemeClasses(currentTheme, 'actionButton')} `;
  const actionBtnEnabled = `${getThemeClasses(currentTheme, 'actionButtonEnabled')}`;

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      if (!username || username.length < 2) {
        const msg = 'Pick a short, memorable username (2+ chars).';
        setMessage(msg);
        addToast(msg, 'error');
        setSubmitting(false);
        return;
      }

      // Pre-check username availability
      try {
        const { data: existing, error: qErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .limit(1)
          .maybeSingle();
        if (qErr) console.warn('username check error', qErr);
        if (existing) {
          setUsernameAvailable(false);
          const msg = 'That username is already taken — try another.';
          setMessage(msg);
          addToast(msg, 'error');
          setSubmitting(false);
          return;
        }
      } catch (chkErr) {
        console.warn('username pre-check failed', chkErr);
        addToast('Could not verify username availability — attempting sign-up.', 'info');
      }

      const { error, profileError } = await signUp({ email, password, username });
      if (error) {
        const msg = mapAuthErrorToMessage(error);
        setMessage(msg);
        addToast(msg, 'error');
      } else if (profileError) {
        const dbMsg = mapDbErrorToMessage(profileError);
        setMessage(dbMsg);
        addToast(dbMsg, 'error');
      } else {
        const ok = 'Welcome to GigaSwap — account created! Check your email if confirmation is required.';
        setMessage(ok);
        addToast(ok, 'success');
        setEmail(''); setPassword(''); setUsername('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const { error } = await signIn({ email, password });
      if (error) {
        const m = mapAuthErrorToMessage(error);
        setMessage(m);
        addToast(m, 'error');
      } else {
        const ok = 'Signed in — welcome back!';
        setMessage(ok);
        addToast(ok, 'success');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const container = (
    <div className={containerClass} role="form" aria-label={mode === 'signIn' ? 'Sign in form' : 'Sign up form'}>
      <div className="text-center mb-2">
        <h3 className={`${getThemeClasses(currentTheme, 'header')} text-sm font-bold mb-1.5`}>{mode === 'signIn' ? 'Welcome back' : 'Create account'}</h3>
        <div className={`flex ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg p-0.5 max-w-xs mx-auto`}>
          <button 
            onClick={() => setMode('signIn')} 
            aria-pressed={mode === 'signIn'} 
            className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              mode === 'signIn' 
                ? `${getThemeClasses(currentTheme, 'buttonPrimary')} ${getThemeClasses(currentTheme, 'textPrimary')} shadow-sm` 
                : `${getThemeClasses(currentTheme, 'textSecondary')} hover:${getThemeClasses(currentTheme, 'textPrimary')}`
            }`}
          >
            Sign in
          </button>
          <button 
            onClick={() => setMode('signUp')} 
            aria-pressed={mode === 'signUp'} 
            className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              mode === 'signUp' 
                ? `${getThemeClasses(currentTheme, 'buttonPrimary')} ${getThemeClasses(currentTheme, 'textPrimary')} shadow-sm` 
                : `${getThemeClasses(currentTheme, 'textSecondary')} hover:${getThemeClasses(currentTheme, 'textPrimary')}`
            }`}
          >
            Sign up
          </button>
        </div>
      </div>

      {mode === 'signUp' ? (
        <form onSubmit={handleSignUp} className="space-y-2">
          <div>
            <label className={labelClass} htmlFor="signup-email">Email</label>
            <input 
              id="signup-email" 
              autoFocus 
              required 
              type="email" 
              className={inputClass} 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="signup-password">Password</label>
            <input 
              id="signup-password" 
              required 
              type="password" 
              className={inputClass} 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="signup-username">Username</label>
            <input 
              id="signup-username" 
              required 
              className={inputClass} 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="Choose a username"
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={submitting} 
              className={`${actionBtnBase} ${actionBtnEnabled} rounded-lg px-4 py-2.5 text-sm font-semibold w-full`}
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignIn} className="space-y-2">
          <div>
            <label className={labelClass} htmlFor="signin-email">Email</label>
            <input 
              id="signin-email" 
              autoFocus 
              required 
              type="email" 
              className={inputClass} 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="signin-password">Password</label>
            <input 
              id="signin-password" 
              required 
              type="password" 
              className={inputClass} 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={submitting} 
              className={`${actionBtnBase} ${actionBtnEnabled} rounded-lg px-4 py-2.5 text-sm font-semibold w-full`}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${getThemeClasses(currentTheme, 'border')}`} />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className={`px-2 ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'} ${getThemeClasses(currentTheme, 'textSecondary')}`}>Or continue with</span>
          </div>
        </div>
        <button 
          onClick={() => signInWithGoogle()} 
          className={`w-full mt-2 py-1.5 px-3 rounded-lg border ${getThemeClasses(currentTheme, 'border')} ${getThemeClasses(currentTheme, 'buttonSecondary')} ${getThemeClasses(currentTheme, 'buttonSecondaryHover')} ${getThemeClasses(currentTheme, 'textPrimary')} font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>

      <div role="status" aria-live="polite" className="mt-2">
        {message && (
          <div className={`p-2 rounded-lg text-xs ${message.includes('Welcome') || message.includes('Signed in') ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )

  return container;
}
