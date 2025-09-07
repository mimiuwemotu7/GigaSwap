import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, Wallet, Edit3, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useSupabase } from '../contexts/SupabaseContext';
import { getThemeClasses } from '../themes/themeConfig';

const UserProfile = ({ isOpen, onClose }) => {
  const { currentTheme } = useTheme();
  const { user, profile, signOut, updateProfile, refreshProfile } = useSupabase();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    wallet_address: profile?.wallet_address || ''
  });
  const [loading, setLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  // Update editData when profile changes
  useEffect(() => {
    console.log('UserProfile: Profile changed:', profile);
    if (profile) {
      const newEditData = {
        username: profile.username || '',
        bio: profile.bio || '',
        wallet_address: profile.wallet_address || ''
      };
      console.log('UserProfile: Setting editData to:', newEditData);
      setEditData(newEditData);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const newData = {
      ...editData,
      [e.target.name]: e.target.value
    };
    console.log('UserProfile: Input changed:', e.target.name, 'to:', e.target.value);
    console.log('UserProfile: New editData:', newData);
    setEditData(newData);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('UserProfile: Saving profile data:', editData);
      const result = await updateProfile(editData);
      console.log('UserProfile: Update result:', result);
      
      if (result.error) {
        console.error('UserProfile: Update failed:', result.error);
        return;
      }
      
      console.log('UserProfile: Profile updated successfully, closing edit mode');
      console.log('UserProfile: Result data:', result.data);
      
      // Refresh the profile to ensure UI updates
      await refreshProfile();
      
      setIsEditing(false);
    } catch (error) {
      console.error('UserProfile: Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      console.log('Starting sign out...');
      const result = await signOut();
      console.log('Sign out result:', result);
      
      if (result.error) {
        console.error('Sign out error:', result.error);
        return;
      }
      
      console.log('Sign out successful, closing modal');
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSignOutLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md ${getThemeClasses(currentTheme, 'container')} rounded-xl shadow-2xl border ${getThemeClasses(currentTheme, 'border')}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className={`text-lg font-bold ${getThemeClasses(currentTheme, 'textPrimary')}`}>
            Profile
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
          >
            <X className={`w-5 h-5 ${getThemeClasses(currentTheme, 'textSecondary')}`} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-4 space-y-4">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center`}>
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                {profile?.username || user.email?.split('@')[0]}
              </h3>
              <p className={`text-sm ${getThemeClasses(currentTheme, 'textSecondary')}`}>
                {user.email}
              </p>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={editData.username}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg ${getThemeClasses(currentTheme, 'inputBg')} ${getThemeClasses(currentTheme, 'textPrimary')} border ${getThemeClasses(currentTheme, 'border')} focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              ) : (
                <p className={`px-3 py-2 rounded-lg ${getThemeClasses(currentTheme, 'section')} ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                  {profile?.username || 'Not set'}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className={`w-full px-3 py-2 rounded-lg ${getThemeClasses(currentTheme, 'inputBg')} ${getThemeClasses(currentTheme, 'textPrimary')} border ${getThemeClasses(currentTheme, 'border')} focus:outline-none focus:ring-2 focus:ring-red-500 resize-none`}
                />
              ) : (
                <p className={`px-3 py-2 rounded-lg ${getThemeClasses(currentTheme, 'section')} ${getThemeClasses(currentTheme, 'textPrimary')} min-h-[60px]`}>
                  {profile?.bio || 'No bio yet...'}
                </p>
              )}
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${getThemeClasses(currentTheme, 'textPrimary')}`}>
                Wallet Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="wallet_address"
                  value={editData.wallet_address}
                  onChange={handleInputChange}
                  placeholder="Enter your Solana wallet address..."
                  className={`w-full px-3 py-2 rounded-lg ${getThemeClasses(currentTheme, 'inputBg')} ${getThemeClasses(currentTheme, 'textPrimary')} border ${getThemeClasses(currentTheme, 'border')} focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              ) : (
                <p className={`px-3 py-2 rounded-lg ${getThemeClasses(currentTheme, 'section')} ${getThemeClasses(currentTheme, 'textPrimary')} font-mono text-sm`}>
                  {profile?.wallet_address || 'Not connected'}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    loading
                      ? `${getThemeClasses(currentTheme, 'buttonDisabled')} cursor-not-allowed`
                      : `${getThemeClasses(currentTheme, 'buttonPrimary')} ${getThemeClasses(currentTheme, 'buttonPrimaryHover')}`
                  }`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`px-4 py-2 rounded-lg border ${getThemeClasses(currentTheme, 'border')} ${getThemeClasses(currentTheme, 'textPrimary')} hover:${getThemeClasses(currentTheme, 'hover')} transition-all duration-200`}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={`flex-1 py-2 px-4 rounded-lg border ${getThemeClasses(currentTheme, 'border')} ${getThemeClasses(currentTheme, 'textPrimary')} hover:${getThemeClasses(currentTheme, 'hover')} transition-all duration-200 flex items-center justify-center space-x-2`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={signOutLoading}
            className={`w-full py-2 px-4 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all duration-200 flex items-center justify-center space-x-2 ${
              signOutLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {signOutLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
