import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface SplashProps {
  onEnter: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onEnter }) => {
  const { t } = useLanguage();
  
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-theme-bg p-8 text-center relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-theme-accent/10 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-theme-secondary/10 blur-[100px] rounded-full animate-float" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl animate-pop px-4">
        <div className="mb-6 md:mb-10 group">
          <div className="w-32 h-32 md:w-48 md:h-48 glass-panel rounded-[2rem] md:rounded-[3rem] p-3 border-theme-border shadow-xl flex items-center justify-center transform rotate-6 group-hover:rotate-0 transition-transform duration-700">
             <div className="relative">
               <span className="text-5xl md:text-7xl font-display text-theme-text">42</span>
               <div className="absolute -top-3 -right-3 md:-top-5 md:-right-5 w-8 h-8 md:w-12 md:h-12 bg-theme-secondary rounded-lg md:rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl font-display shadow-2xl animate-bounce">
                 +
              </div>
            </div>
          </div>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl text-theme-text mb-3 tracking-tighter">
          {t('appName')}
        </h1>
        <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-10">
          <span className="h-[1px] w-6 md:w-12 bg-theme-muted/30"></span>
          <p className="font-mono text-theme-accent text-[9px] md:text-sm tracking-[0.2em] md:tracking-[0.4em] uppercase opacity-80">{t('version') || 'Simulation Protocol v3.1'}</p>
          <span className="h-[1px] w-6 md:w-12 bg-theme-muted/30"></span>
        </div>

        <button
          onClick={onEnter}
          className="btn-game group relative overflow-hidden px-8 md:px-16 py-3.5 md:py-5 bg-theme-accent rounded-xl md:rounded-3xl text-white font-display text-base md:text-xl tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
          {t('start').toUpperCase()}
        </button>
      </div>
    </div>
  );
};
