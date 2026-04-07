import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserProfile, AuthState, SubscriptionTier } from '../types';
import authService from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateSubscription: (tier: SubscriptionTier, expiresAt: number | null) => Promise<void>;
  refreshProfile: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  clearError: () => void;
  isEmailVerified: boolean;
  isEmailPending: boolean;
  isPremium: boolean;
  hasFeature: (feature: string) => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  profile: UserProfile | null;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PREMIUM_FEATURES: Record<string, string[]> = {
  [SubscriptionTier.PREMIUM_MONTHLY]: [
    'full_campaign',
    'all_arcade_modes',
    'no_ads',
    'offline_play',
    'custom_themes',
    'unlimited_practice',
    'priority_support',
  ],
  [SubscriptionTier.PREMIUM_YEARLY]: [
    'full_campaign',
    'all_arcade_modes',
    'no_ads',
    'offline_play',
    'custom_themes',
    'unlimited_practice',
    'priority_support',
    'early_access',
    'exclusive_content',
  ],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isEmailPending, setIsEmailPending] = useState(false);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const checkEmailVerification = useCallback(async () => {
    try {
      const verified = await authService.checkEmailVerified();
      setIsEmailVerified(verified);
      return verified;
    } catch {
      return false;
    }
  }, []);

  const sendVerificationEmail = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.sendVerificationEmail();
      showToast('Verification email sent! Check your inbox.', 'success');
      setIsEmailPending(true);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send verification email.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [showToast]);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user, profile } = await authService.login(email, password);
      
      setState({
        user,
        profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      showToast('Welcome back to MathLab!', 'success');
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [showToast]);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user, profile } = await authService.register(email, password, displayName);
      
      setState({
        user,
        profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      showToast('Account created! Welcome to MathLab!', 'success');
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.logout();
      setIsEmailVerified(false);
      setIsEmailPending(false);
      setState({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      showToast('Logged out successfully', 'info');
    } catch (error: any) {
      setIsEmailVerified(false);
      setIsEmailPending(false);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Logout failed.',
      }));
      showToast('Logout failed', 'error');
      throw error;
    }
  }, [showToast]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      const updatedProfile = await authService.updateProfile(updates);
      setState(prev => ({ ...prev, profile: updatedProfile }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message || 'Update failed' }));
      throw error;
    }
  }, []);

  const updateSubscription = useCallback(async (tier: SubscriptionTier, expiresAt: number | null) => {
    const subscription = {
      tier,
      expiresAt,
      startedAt: Date.now(),
      autoRenew: tier !== SubscriptionTier.FREE,
    };
    await updateProfile({ subscription });
  }, [updateProfile]);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const session = await authService.getCurrentSession();
    if (session) {
      setState(prev => ({ ...prev, profile: session.profile }));
      
      if (session.user.email) {
        const verified = await checkEmailVerification();
        setIsEmailVerified(verified);
      }
    }
  }, [state.user, checkEmailVerification]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.changePassword(currentPassword, newPassword);
      setState(prev => ({ ...prev, isLoading: false }));
      showToast('Password changed successfully', 'success');
    } catch (error: any) {
      const errorMessage = error.message || 'Password change failed.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [showToast]);

  const deleteAccount = useCallback(async (password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.deleteAccount(password);
      setIsEmailVerified(false);
      setIsEmailPending(false);
      setState({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      showToast('Account deleted successfully', 'info');
    } catch (error: any) {
      const errorMessage = error.message || 'Account deletion failed.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [showToast]);

  const isPremium = state.profile?.subscription?.tier !== undefined &&
    state.profile.subscription.tier !== SubscriptionTier.FREE;

  const hasFeature = useCallback((feature: string): boolean => {
    if (!state.profile) return false;
    const tier = state.profile.subscription?.tier || SubscriptionTier.FREE;
    const features = PREMIUM_FEATURES[tier] || [];
    return features.includes(feature);
  }, [state.profile]);

  useEffect(() => {
    setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated || !state.user) return;
    
    const interval = setInterval(() => {
      checkEmailVerification();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.user, checkEmailVerification]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updateSubscription,
    refreshProfile,
    changePassword,
    deleteAccount,
    sendVerificationEmail,
    clearError,
    isEmailVerified,
    isEmailPending,
    isPremium,
    hasFeature,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;