

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onRestart, onQuit }) => {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col gap-3 md:gap-4 min-w-[280px] md:min-w-[320px] animate-pop shadow-2xl text-theme-text">
        <h2 className="text-2xl md:text-3xl font-display text-center text-theme-text mb-4">{t('pause').toUpperCase()}</h2>
        <button 
          onClick={onResume} 
          className="btn-press bg-theme-accent text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-theme-accent"
          aria-label="Resume game"
        >
          {t('resume').toUpperCase()}
        </button>
        <button
          onClick={onRestart}
          className="btn-press bg-theme-panel text-theme-text py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-theme-panel/80 focus:outline-none focus:ring-2 focus:ring-theme-accent"
          aria-label="Restart current game"
        >
          {t('restart').toUpperCase()}
        </button>
        <button
          onClick={onQuit}
          className="btn-press bg-brand-danger/20 text-brand-danger border border-brand-danger/30 py-3 md:py-4 rounded-xl font-bold hover:bg-brand-danger hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-danger"
          aria-label="Quit to main menu"
        >
          {t('quit').toUpperCase()}
        </button>
      </div>
    </div>
  );
};
