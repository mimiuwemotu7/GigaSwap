import React, { useEffect, useState, useRef } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { getThemeClasses } from '../themes/themeConfig';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from './ToastContext';

const UserProfile = ({ onClose }) => {
	const { profile, refreshProfile, user, db } = useSupabase();
	const { currentTheme } = useTheme();
	const [loading, setLoading] = useState(false);
	const [localProfile, setLocalProfile] = useState(profile);
	const [creating, setCreating] = useState(false);
	const [usernameDraft, setUsernameDraft] = useState(user?.email?.split('@')[0] || '');
	const [createError, setCreateError] = useState(null);
	const attemptedRef = useRef(false);
	const containerClass = `p-6 rounded-xl ${getThemeClasses(currentTheme, 'container')} border ${getThemeClasses(currentTheme, 'border')}`;
	const titleClass = `text-xl font-bold ${getThemeClasses(currentTheme, 'textPrimary')}`;
	const subClass = `text-sm ${getThemeClasses(currentTheme, 'textSecondary')}`;
	const btnClass = `${getThemeClasses(currentTheme, 'actionButton')} ${getThemeClasses(currentTheme, 'actionButtonEnabled')} px-4 py-2 rounded-lg text-sm font-medium`;

			useEffect(() => {
				// Keep local copy in sync and attempt to refresh once if missing
				setLocalProfile(profile);
				if (!profile && !attemptedRef.current) {
					attemptedRef.current = true;
					(async () => {
						setLoading(true);
						try {
							const res = await refreshProfile();
							if (res?.data) setLocalProfile(res.data);
						} catch (err) {
							console.warn('refreshProfile failed', err);
						} finally {
							setLoading(false);
						}
					})();
				}
			}, [profile, refreshProfile]);

			const { addToast } = useToast();

	if (loading) return (
		<div style={{ padding: 20 }} className={containerClass}>
			<div className={subClass}>Loading profile...</div>
		</div>
	);


		if (!localProfile) return (
			<div style={{ padding: 20, width: 'min(92vw,520px)' }} className={containerClass}>
				<div className={subClass}>No profile available yet. The account provisioning system will create a profile automatically; try refreshing or re-opening this panel shortly.</div>

				<div style={{ marginTop: 12, textAlign: 'right' }}>
					<button onClick={onClose} className={`${btnClass}`}>Close</button>
				</div>
			</div>
		);

	const initials = (localProfile.username || localProfile.email || '')
		.split(/\s+/).map(s => s[0]).slice(0,2).join('').toUpperCase();

	return (
		<div style={{ width: 'min(92vw,520px)' }}>
			<div className={containerClass}>
				<div className="flex items-center space-x-4 mb-6">
					{localProfile.avatar_url ? (
						<img src={localProfile.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
					) : (
						<div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-200 dark:border-gray-600">
							{initials || 'U'}
						</div>
					)}
					<div>
						<div className={titleClass}>{localProfile.username || 'Unnamed'}</div>
						<div className={subClass}>{localProfile.email}</div>
					</div>
				</div>

				{localProfile.bio && (
					<div className={`mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 ${subClass}`}>{localProfile.bio}</div>
				)}

				{localProfile.wallet_address && (
					<div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
						<div className={`text-xs font-medium ${getThemeClasses(currentTheme, 'textSecondary')} mb-1`}>Wallet Address</div>
						<div className={`text-sm font-mono break-all ${getThemeClasses(currentTheme, 'textPrimary')}`}>{localProfile.wallet_address}</div>
					</div>
				)}

				<div className="flex justify-end space-x-3">
					<button onClick={onClose} className={btnClass}>Close</button>
				</div>
			</div>
		</div>
	);
};

export default UserProfile;
