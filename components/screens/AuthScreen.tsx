import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Icons } from '../../components/Icons';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, displayName: string) => Promise<void>;
  onContinueAsGuest: () => void;
  error: string | null;
  isLoading: boolean;
  clearError: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  onRegister,
  onContinueAsGuest,
  error,
  isLoading,
  clearError,
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const getPasswordStrength = useCallback((pwd: string): { level: number; label: string; color: string; checks: { text: string; met: boolean }[] } => {
    if (pwd.length === 0) return { level: 0, label: '', color: '', checks: [] };
    const checks = [
      { text: 'At least 8 characters', met: pwd.length >= 8 },
      { text: 'Contains uppercase letter', met: /[A-Z]/.test(pwd) },
      { text: 'Contains lowercase letter', met: /[a-z]/.test(pwd) },
      { text: 'Contains number', met: /[0-9]/.test(pwd) },
      { text: 'Contains special character', met: /[^A-Za-z0-9]/.test(pwd) },
    ];
    const metChecks = checks.filter(check => check.met).length;
    let level = 0, label = '', color = '';
    if (pwd.length < 6) { level = 1; label = 'Too short'; color = 'bg-red-500'; }
    else if (metChecks <= 2) { level = 2; label = 'Weak'; color = 'bg-red-500'; }
    else if (metChecks === 3) { level = 3; label = 'Fair'; color = 'bg-orange-500'; }
    else if (metChecks === 4) { level = 4; label = 'Good'; color = 'bg-yellow-500'; }
    else { level = 5; label = 'Strong'; color = 'bg-green-500'; }
    return { level, label, color, checks };
  }, []);

  const validateEmail = useCallback((email: string): { isValid: boolean; error?: string } => {
    if (!email) return { isValid: false, error: 'Email is required' };
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) return { isValid: false, error: 'Please enter a valid email' };
    return { isValid: true };
  }, []);

  const validateDisplayName = useCallback((name: string): { isValid: boolean; error?: string } => {
    if (!name.trim()) return { isValid: false, error: 'Name is required' };
    if (name.trim().length < 2) return { isValid: false, error: 'Name must be at least 2 characters' };
    return { isValid: true };
  }, []);

  const validateField = useCallback((field: string, value: string) => {
    let error = '';
    switch (field) {
      case 'email': error = validateEmail(value).error || ''; break;
      case 'displayName': if (mode === 'register') error = validateDisplayName(value).error || ''; break;
      case 'password': if (mode === 'register') { const strength = getPasswordStrength(value); if (value && strength.level < 2) error = 'Password is too weak'; } else if (!value) error = 'Password is required'; break;
      case 'confirmPassword': if (mode === 'register') { if (!value) error = 'Please confirm your password'; else if (value !== password) error = 'Passwords do not match'; } break;
    }
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, [mode, password, validateEmail, validateDisplayName, getPasswordStrength]);

  const handleFieldBlur = useCallback((field: string, value: string) => {
    setTouchedFields(prev => new Set([...prev, field]));
    validateField(field, value);
  }, [validateField]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
  }, [fieldErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    const now = Date.now();
    if (now - lastSubmitTime < 2000) { setLocalError('Please wait a moment'); return; }
    setLastSubmitTime(now);
    const allFields = mode === 'register' ? ['email', 'displayName', 'password', 'confirmPassword'] : ['email', 'password'];
    allFields.forEach(field => setTouchedFields(prev => new Set([...prev, field])));
    const isValid = allFields.every(field => {
      let value = '';
      if (field === 'email') value = email;
      else if (field === 'displayName') value = displayName;
      else if (field === 'password') value = password;
      else value = confirmPassword;
      return validateField(field, value);
    });
    if (!isValid) { setLocalError('Please correct the errors above'); return; }
    try {
      if (mode === 'register') await onRegister(email, password, displayName.trim());
      else await onLogin(email, password);
    } catch (err: any) { setLocalError(err.message || `${mode === 'login' ? 'Login' : 'Registration'} failed.`); }
  };

  const switchMode = useCallback((newMode: 'login' | 'register') => {
    setIsTransitioning(true);
    setTimeout(() => { setMode(newMode); setLocalError(null); clearError(); setFieldErrors({}); setTouchedFields(new Set()); setIsTransitioning(false); }, 150);
  }, [clearError]);

  const displayError = localError || error;
  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" role="main">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-cyan-500/15 to-purple-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-2 h-2 bg-cyan-400/40 rounded-full animate-pulse" />
        <div className="absolute top-[25%] right-[15%] w-1 h-1 bg-purple-400/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 rounded-[2rem] bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 mb-4 shadow-2xl shadow-purple-500/40">
            <Icons.Calculator className="w-10 h-10 text-white" filled />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MathLab</span>
          </h1>
          <p className="text-white/50">{t('tagline') || 'Master Math Through Play'}</p>
        </div>
        <div className="relative max-h-[60vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
            <button type="button" onClick={() => switchMode('login')} className={`flex-1 py-3 rounded-lg font-semibold transition-all ${mode === 'login' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : 'text-white/50'}`}>
              {t('login') || 'Login'}
            </button>
            <button type="button" onClick={() => switchMode('register')} className={`flex-1 py-3 rounded-lg font-semibold transition-all ${mode === 'register' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : 'text-white/50'}`}>
              {t('register') || 'Sign Up'}
            </button>
          </div>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs text-white/30"><span className="px-2 bg-transparent">continue with email</span></div>
          </div>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">{t('name') || 'Display Name'}</label>
                <div className="relative">
                  <Icons.User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 text-white/30" />
                  <input type="text" name="displayName" value={displayName} onChange={(e) => { setDisplayName(e.target.value); handleFieldChange('displayName', e.target.value); }} onFocus={() => setFocusedField('name')} onBlur={() => handleFieldBlur('displayName', displayName)} className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border text-white text-sm ${focusedField === 'name' ? 'border-cyan-500' : 'border-white/10'}`} placeholder={t('namePlaceholder') || 'Enter your name'} disabled={isLoading} maxLength={30} />
                </div>
                {fieldErrors.displayName && touchedFields.has('displayName') && <p className="text-red-400 text-xs mt-1">{fieldErrors.displayName}</p>}
              </div>
            )}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">{t('email') || 'Email'}</label>
              <div className="relative">
                <Icons.Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 text-white/30" />
                <input type="email" name="email" value={email} onChange={(e) => { setEmail(e.target.value.toLowerCase()); handleFieldChange('email', e.target.value.toLowerCase()); }} onFocus={() => setFocusedField('email')} onBlur={() => handleFieldBlur('email', email)} className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border text-white text-sm ${focusedField === 'email' ? 'border-cyan-500' : 'border-white/10'}`} placeholder={t('emailPlaceholder') || 'your@email.com'} disabled={isLoading} autoComplete="email" />
              </div>
              {fieldErrors.email && touchedFields.has('email') && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">{t('password') || 'Password'}</label>
              <div className="relative">
                <Icons.Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 text-white/30" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={password} onChange={(e) => { setPassword(e.target.value); handleFieldChange('password', e.target.value); }} onFocus={() => setFocusedField('password')} onBlur={() => handleFieldBlur('password', password)} className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border text-white text-sm ${focusedField === 'password' ? 'border-cyan-500' : 'border-white/10'}`} placeholder="••••••••" minLength={6} disabled={isLoading} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">{showPassword ? <Icons.EyeOff className="w-5" /> : <Icons.Eye className="w-5" />}</button>
              </div>
              {mode === 'register' && password && (
                <div className="mt-2">
                  <div className="flex gap-1">{[1,2,3,4,5].map((l) => <div key={l} className={`h-1 flex-1 rounded-full ${passwordStrength.level >= l ? passwordStrength.color : 'bg-white/10'}`} />)}</div>
                  <div className="flex justify-between text-xs mt-1"><span className={passwordStrength.level >= 4 ? 'text-green-400' : 'text-white/50'}>{passwordStrength.label}</span></div>
                </div>
              )}
              {fieldErrors.password && touchedFields.has('password') && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Icons.Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 text-white/30" />
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); handleFieldChange('confirmPassword', e.target.value); }} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => handleFieldBlur('confirmPassword', confirmPassword)} className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border text-white text-sm ${focusedField === 'confirmPassword' ? 'border-cyan-500' : 'border-white/10'}`} placeholder="••••••••" minLength={6} disabled={isLoading} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">{showConfirmPassword ? <Icons.EyeOff className="w-5" /> : <Icons.Eye className="w-5" />}</button>
                </div>
                {fieldErrors.confirmPassword && touchedFields.has('confirmPassword') && <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
              </div>
            )}
            {displayError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2"><Icons.AlertCircle className="w-5" />{displayError}</div>}
            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
              {isLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Please wait...</span> : mode === 'login' ? (t('loginButton') || 'Welcome Back') : (t('registerButton') || 'Create Account')}
            </button>
          </form>
          <div className="mt-6">
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div><div className="relative flex justify-center text-xs text-white/30"><span className="px-2 bg-transparent">or</span></div></div>
            <button type="button" onClick={onContinueAsGuest} disabled={isLoading} className="mt-4 w-full py-3 rounded-xl border border-white/10 bg-white/5 text-white/70 font-semibold hover:bg-white/10 hover:border-white/20 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <Icons.User className="w-4 h-4" />
              {t('continueGuest') || 'Play as Guest'}
            </button>
          </div>
        </div>
        <div className="mt-4 text-center"><p className="text-white/30 text-xs">By continuing, you agree to Terms & Privacy</p></div>
      </div>
    </div>
  );
};

export default AuthScreen;