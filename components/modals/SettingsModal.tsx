import React from 'react';
import { useTranslation } from 'react-i18next';
import { TimerMode, Theme, Language } from '../../types';
import { Icons } from '../Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerMode: TimerMode;
  setTimerMode: (mode: TimerMode) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  timerMode,
  setTimerMode,
  theme,
  setTheme,
  language,
  setLanguage,
}) => {
  const { t, i18n } = useTranslation();
  
  if (!isOpen) return null;

  // Handle language change with i18n
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang === Language.ENGLISH ? 'en' : 'sw');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-pop">
      <div className="glass-panel w-full max-w-sm p-6 relative text-theme-text max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-theme-accent rounded-full"
          aria-label="Close settings"
        >
          <Icons.Exit className="w-6 h-6" />
        </button>
        <h2 className="font-display text-2xl text-center mb-6 tracking-wide">
          {t('settings').toUpperCase()}
        </h2>
        <div className="space-y-6">
          {/* Language Selection */}
          <section>
            <label className="block font-mono text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mb-3">
              {t('language')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleLanguageChange(Language.ENGLISH)}
                className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  language === Language.ENGLISH
                    ? 'border-theme-accent bg-theme-accent/10 text-theme-accent shadow-sm'
                    : 'border-theme-border bg-theme-panel/50 hover:bg-theme-panel text-theme-muted'
                }`}
              >
                🇬🇧 {t('english')}
              </button>
              <button
                onClick={() => handleLanguageChange(Language.SWAHILI)}
                className={`p-3 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  language === Language.SWAHILI
                    ? 'border-theme-accent bg-theme-accent/10 text-theme-accent shadow-sm'
                    : 'border-theme-border bg-theme-panel/50 hover:bg-theme-panel text-theme-muted'
                }`}
              >
                🇹🇿 {t('swahili')}
              </button>
            </div>
          </section>

          <section>
            <label className="block font-mono text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mb-3">
              {t('theme')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Theme).map((themeValue) => (
                <button
                  key={themeValue}
                  onClick={() => setTheme(themeValue)}
                  className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
                    theme === themeValue
                      ? 'border-theme-accent bg-theme-accent/10 text-theme-accent shadow-sm'
                      : 'border-theme-border bg-theme-panel/50 hover:bg-theme-panel text-theme-muted'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full bg-theme-accent ${theme === themeValue ? 'opacity-100' : 'opacity-30'}`} />
                  {t(themeValue)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="block font-mono text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mb-3">
              {t('timerConfiguration')}
            </label>
            <div className="space-y-2">
              {/* Specific Time Options */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { value: TimerMode.TIME_30, label: '30s' },
                  { value: TimerMode.TIME_60, label: '60s' },
                  { value: TimerMode.TIME_90, label: '90s' },
                  { value: TimerMode.TIME_120, label: '120s' },
                ].map((time) => (
                  <button
                    key={time.value}
                    onClick={() => setTimerMode(time.value)}
                    className={`btn-press p-3 rounded-xl border text-sm font-bold transition-all duration-200 ${
                      timerMode === time.value
                        ? 'border-theme-accent bg-theme-accent/10 text-theme-accent'
                        : 'border-theme-border bg-theme-panel/50 hover:bg-theme-panel text-theme-muted'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
