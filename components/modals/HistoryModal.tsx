

import React from 'react';
import { CalculationHistoryEntry } from '../../types';
import { Icons } from '../Icons';
import { useLanguage } from '../../context/LanguageContext';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryEntry[];
  onSelectEntry: (input: string) => void;
  onClearHistory: () => void;
  onDeleteEntry: (timestamp: number) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onSelectEntry, onClearHistory, onDeleteEntry }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-pop">
      <div className="glass-panel w-full max-w-sm h-[80vh] flex flex-col p-6 relative text-theme-text shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-theme-muted hover:text-theme-text transition-opacity focus:outline-none focus:ring-2 focus:ring-theme-accent rounded-full"
          aria-label="Close history"
        >
          <Icons.Exit className="w-6 h-6" />
        </button>
        <h2 className="font-display text-2xl text-center mb-6 tracking-wide text-theme-accent">
          {t('historyTitle')}
        </h2>

        {history.length === 0 ? (
          <p className="text-center text-theme-muted opacity-70 mt-8">{t('noHistory')}</p>
        ) : (
          <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {history.map((entry, index) => (
              <div
                key={entry.timestamp}
                className="relative flex items-center p-3 rounded-xl bg-theme-panel/50 border border-theme-border transition-colors group"
              >
                <button
                  onClick={() => {
                    onSelectEntry(entry.input);
                    onClose();
                  }}
                  className="btn-press flex-grow text-left focus:outline-none focus:ring-2 focus:ring-theme-accent rounded-lg -m-3 p-3 hover:bg-theme-panel transition-colors"
                  aria-label={`Recall calculation: ${entry.input} equals ${entry.output} for editing`}
                >
                  <div className="font-mono text-sm text-theme-muted overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {entry.input}
                  </div>
                  <div className="font-display text-lg text-theme-accent">
                    = {entry.output}
                  </div>
                </button>
                <button
                  onClick={() => onDeleteEntry(entry.timestamp)}
                  className="btn-press flex-none p-2 ml-2 rounded-full text-brand-danger hover:bg-brand-danger/20 transition-all opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand-danger"
                  aria-label={`Delete entry: ${entry.input} = ${entry.output}`}
                >
                  <Icons.Trash className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="btn-press bg-brand-danger/20 text-brand-danger border border-brand-danger/30 py-3 rounded-xl font-bold hover:bg-brand-danger hover:text-white transition-colors mt-6 focus:outline-none focus:ring-2 focus:ring-brand-danger"
            aria-label="Clear all history"
          >
            {t('clearHistory')}
          </button>
        )}
      </div>
    </div>
  );
};
