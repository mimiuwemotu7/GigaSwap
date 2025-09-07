import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Wallet } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useSupabase } from '../contexts/SupabaseContext';
import { getThemeClasses } from '../themes/themeConfig';

const AuthModal = ({ isOpen, onClose }) => {
  const { currentTheme } = useTheme();
  const { signIn, signUp, signInWithGoogle, user } = useSupabase();
  const [isLogin, setIsLogin] = useState(false); // Start with signup by default
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  // Auto-close modal when user is logged in
  useEffect(() => {
    if (user && isOpen) {
      console.log('User logged in, closing modal');
      onClose();
    }
  }, [user, isOpen, onClose]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          throw error;
        }
        // Login successful - close modal
        console.log('Login successful, closing modal');
        onClose();
      } else {
        const { error } = await signUp(formData.email, formData.password, {
          username: formData.username
        });
        if (error) {
          throw error;
        }
        // Show success message or redirect
        setError('Check your email for verification link!');
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. If you just signed up, please check your email for verification link.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please check your email and click the verification link before logging in.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ email: '', password: '', username: '' });
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Starting Google authentication...');
      const { error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google auth error:', error);
        setError('Google authentication failed: ' + error.message);
        return;
      }
      
      console.log('Google auth initiated successfully');
      // The user will be redirected to Google, then back to our app
      // No need to close modal here as the page will redirect
    } catch (error) {
      console.error('Google auth failed:', error);
      setError('Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhantomAuth = async () => {
    setLoading(true);
    setError('');
    try {
      // TODO: Implement Phantom wallet connection
      console.log('Phantom authentication not implemented yet');
    } catch (error) {
      setError('Phantom wallet connection failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md ${getThemeClasses(currentTheme, 'container')} rounded-xl shadow-2xl border ${getThemeClasses(currentTheme, 'border')}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className={`text-xl font-bold ${getThemeClasses(currentTheme, 'textPrimary')}`}>
            {isLogin ? 'Login' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
          >
            <X className={`w-5 h-5 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className={`p-3 rounded-lg bg-red-500/20 border border-red-500/30`}>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${getThemeClasses(currentTheme, 'textPrimary')}`}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              className={`w-full px-4 py-3 rounded-lg ${getThemeClasses(currentTheme, 'inputBg')} ${getThemeClasses(currentTheme, 'textPrimary')} border ${getThemeClasses(currentTheme, 'border')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          {/* Password (Signup only) */}
          {!isLogin && (
            <div className="space-y-2">
              <label className={`text-sm font-medium ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className={`w-full px-4 py-3 pr-12 rounded-lg ${getThemeClasses(currentTheme, 'inputBg')} ${getThemeClasses(currentTheme, 'textPrimary')} border ${getThemeClasses(currentTheme, 'border')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${getThemeClasses(currentTheme, 'textSecondary')} hover:${getThemeClasses(currentTheme, 'textPrimary')} transition-colors duration-200`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* Password (Login only) */}
          {isLogin && (
            <div className="space-y-2">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-lg ${getThemeClasses(currentTheme, 'inputBg')} ${getThemeClasses(currentTheme, 'textPrimary')} border ${getThemeClasses(currentTheme, 'border')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-base transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isLogin ? 'Signing In...' : 'Sign Up'}</span>
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${getThemeClasses(currentTheme, 'textSecondary')} bg-gray-800`}>
                Or {isLogin ? 'Sign In' : 'Sign Up'}
              </span>
            </div>
          </div>

          {/* Social Authentication Buttons */}
          <div className="space-y-3">
            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-lg border ${getThemeClasses(currentTheme, 'border')} ${getThemeClasses(currentTheme, 'textPrimary')} hover:${getThemeClasses(currentTheme, 'hover')} transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span className="font-medium">Continue with Google</span>
            </button>

            {/* Phantom Button */}
            <button
              type="button"
              onClick={handlePhantomAuth}
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-lg border ${getThemeClasses(currentTheme, 'border')} ${getThemeClasses(currentTheme, 'textPrimary')} hover:${getThemeClasses(currentTheme, 'hover')} transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Wallet className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium">Connect with Phantom</span>
            </button>
          </div>

          {/* Toggle Mode */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={toggleMode}
              className={`text-sm ${getThemeClasses(currentTheme, 'textSecondary')} hover:${getThemeClasses(currentTheme, 'textPrimary')} transition-colors duration-200`}
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-blue-400 font-medium">
                {isLogin ? 'Sign Up' : 'Login'}
              </span>
            </button>
          </div>

          {/* Legal Disclaimer */}
          <div className="text-center pt-4">
            <p className={`text-xs ${getThemeClasses(currentTheme, 'textSecondary')}`}>
              By creating an account, you agree to GigaSwap's{' '}
              <button type="button" className="text-blue-400 hover:underline">Privacy Policy</button>
              {' '}and{' '}
              <button type="button" className="text-blue-400 hover:underline">Terms of Service</button>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
