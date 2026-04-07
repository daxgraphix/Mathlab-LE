

import React from 'react';
import { Achievement } from '../../types';
import { ACHIEVEMENTS_DATA } from '../../constants';
import { Icons } from '../Icons';
import { useLanguage } from '../../context/LanguageContext';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlocked: string[];
}

// Translation key mapping for achievements
const getAchievementTranslationKeys = (id: string): { titleKey: string; descKey: string } => {
  const keyMap: Record<string, { titleKey: string; descKey: string }> = {
    first_steps: { titleKey: 'achievement_first_steps', descKey: 'achievement_first_steps_desc' },
    add_master: { titleKey: 'achievement_add_master', descKey: 'achievement_add_master_desc' },
    sub_master: { titleKey: 'achievement_sub_master', descKey: 'achievement_sub_master_desc' },
    mul_master: { titleKey: 'achievement_mul_master', descKey: 'achievement_mul_master_desc' },
    div_master: { titleKey: 'achievement_div_master', descKey: 'achievement_div_master_desc' },
    speed_demon: { titleKey: 'achievement_speed_demon', descKey: 'achievement_speed_demon_desc' },
    survivor: { titleKey: 'achievement_survivor', descKey: 'achievement_survivor_desc' },
    zen_master: { titleKey: 'achievement_zen_master', descKey: 'achievement_zen_master_desc' },
    marathon_runner: { titleKey: 'achievement_marathon_runner', descKey: 'achievement_marathon_runner_desc' },
    duelist: { titleKey: 'achievement_duelist', descKey: 'achievement_duelist_desc' },
    sharp_eye: { titleKey: 'achievement_sharp_eye', descKey: 'achievement_sharp_eye_desc' },
    visual_perfectionist: { titleKey: 'achievement_visual_perfectionist', descKey: 'achievement_visual_perfectionist_desc' },
  };
  return keyMap[id] || { titleKey: '', descKey: '' };
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, unlocked }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-pop">
      <div className="glass-panel w-full max-w-md h-[80vh] flex flex-col p-6 relative text-theme-text shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-theme-muted hover:text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent rounded-full"
          aria-label="Close achievements"
        >
          <Icons.Exit className="w-6 h-6" />
        </button>
        <h2 className="font-display text-2xl text-center mb-6 text-brand-warning tracking-wide">
          {t('achievementsTitle').toUpperCase()}
        </h2>
        <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {ACHIEVEMENTS_DATA.map((ach: Achievement) => {
            const isUnlocked = unlocked.includes(ach.id);
            const IconComponent = ach.icon;
            const translationKeys = getAchievementTranslationKeys(ach.id);
            const title = translationKeys.titleKey ? t(translationKeys.titleKey) : ach.title;
            const desc = translationKeys.descKey ? t(translationKeys.descKey) : ach.desc;
            
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex gap-4 items-center transition-all ${
                  isUnlocked ? 'border-brand-success bg-brand-success/10' : 'border-theme-border bg-theme-panel/50 opacity-60 grayscale'
                }`}
              >
                <div
                  className={`w-12 h-12 flex-none rounded-full flex items-center justify-center ${
                    isUnlocked ? 'bg-brand-success text-white shadow-lg' : 'bg-theme-panel'
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base">{title}</h3>
                  <p className="text-xs opacity-70">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
