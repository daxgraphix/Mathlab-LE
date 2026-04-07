import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Icons } from '../../components/Icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'account'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [displayName, setDisplayName] = useState(profile?.name || '');
  const [avatarShape, setAvatarShape] = useState(profile?.avatarShape || 'circle');
  const [avatarColor, setAvatarColor] = useState(profile?.avatarColor || '#3B82F6');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Account deletion state
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const avatarShapes = ['circle', 'square', 'triangle', 'hexagon'];
  const avatarColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const handleSaveProfile = useCallback(async () => {
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await updateProfile({
        name: displayName.trim(),
        avatarShape,
        avatarColor,
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [displayName, avatarShape, avatarColor, updateProfile, onClose]);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, changePassword]);

  const handleDeleteAccount = useCallback(async () => {
    if (!deletePassword) {
      setError('Please enter your password');
      return;
    }
    if (!confirmDelete) {
      setError('Please confirm account deletion');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await deleteAccount(deletePassword);
      await logout();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [deletePassword, confirmDelete, deleteAccount, logout, onClose]);

  const handleClose = useCallback(() => {
    setError(null);
    setActiveTab('profile');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setDeletePassword('');
    setConfirmDelete(false);
    onClose();
  }, [onClose]);

  if (!isOpen || !user || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icons.Close className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'profile', label: 'Profile' },
            { key: 'password', label: 'Password' },
            { key: 'account', label: 'Account' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); setError(null); }}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Avatar Shape
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {avatarShapes.map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setAvatarShape(shape)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        avatarShape === shape
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icons.Circle className={`w-6 h-6 mx-auto ${
                        shape === 'triangle' ? 'text-transparent' : 'text-gray-600'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Avatar Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {avatarColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatarColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        avatarColor === color ? 'border-gray-800' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Account Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Email: {user.email}</p>
                  <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  <p>Last Login: {new Date(user.lastLoginAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="text-sm font-medium text-red-900 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete your account, there is no going back. This will permanently delete your account and remove your data from our servers.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-red-900 mb-1">
                      Enter your password to confirm
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your password"
                    />
                  </div>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.checked)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-red-900">
                      I understand this action cannot be undone
                    </span>
                  </label>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={isLoading || !confirmDelete || !deletePassword}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;