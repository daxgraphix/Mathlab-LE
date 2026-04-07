

import React from 'react';
import { CampaignOp, GameConfig, Profile } from '../../types';
import { CAMPAIGNS, CAMPAIGN_LEVEL_SECTIONS } from '../../constants';
import { Icons } from '../Icons';
import { useLanguage } from '../../context/LanguageContext';

interface LevelMapProps {
  profile: Profile;
  gameConfig: GameConfig;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export const LevelMap: React.FC<LevelMapProps> = React.memo(({ profile, gameConfig, onSelectLevel, onBack }) => {
  const { t } = useLanguage();
  
  if (gameConfig.type !== 'campaign') {
    console.error("LevelMap received non-campaign game config. This component expects 'campaign' type.");
    return null; 
  }

  const currentCampaign = CAMPAIGNS[gameConfig.op];
  const playerCompletedLevel = profile.campaign[gameConfig.op] || 0;
  // Convert snake_case to camelCase for translation key
  const campTransKey = gameConfig.op.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

  return (
    <div className="h-full flex flex-col p-3 md:p-6 bg-theme-bg overflow-hidden safe-top">
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <button
          onClick={onBack}
          className="btn-press p-2 rounded-full glass-panel text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent"
          aria-label={t('back')}
        >
          <Icons.Back className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <h2 className="font-display text-xl md:text-3xl text-theme-text">
          {t(campTransKey) || currentCampaign.title}
        </h2>
      </div>
      <div className="flex-grow overflow-y-auto custom-scrollbar smooth-scroll pr-1 scroll-pad-bottom">
        {CAMPAIGN_LEVEL_SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-6 md:mb-8 px-1 md:px-2">
            <h3 className="font-mono text-theme-muted mb-3 md:mb-4 border-b border-theme-border pb-1.5 md:pb-2 text-[10px] md:text-xs uppercase tracking-widest">
              {t(section.labelKey)}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5 md:gap-3">
              {Array.from({ length: section.range[1] - section.range[0] + 1 }).map((_, i) => {
                const lvl = section.range[0] + i;
                const isUnlocked = lvl <= playerCompletedLevel + 1; // Unlock the next level after completion
                const stars = lvl <= playerCompletedLevel ? 3 : 0;
                const isCurrentLevel = gameConfig.level === lvl;

                const bgColorClass =
                  currentCampaign.id === CampaignOp.ADD ? 'bg-neon-blue' :
                  currentCampaign.id === CampaignOp.SUB ? 'bg-neon-pink' :
                  currentCampaign.id === CampaignOp.MUL ? 'bg-neon-yellow' :
                  currentCampaign.id === CampaignOp.DIV ? 'bg-neon-green' :
                  currentCampaign.id === CampaignOp.VISUAL_DOTS ? 'bg-purple-500' :
                  currentCampaign.id === CampaignOp.VISUAL_TRIANGLES ? 'bg-cyan-500' :
                  currentCampaign.id === CampaignOp.VISUAL_STARS ? 'bg-yellow-500' :
                  currentCampaign.id === CampaignOp.NUMBER_BONDS ? 'bg-orange-500' :
                  currentCampaign.id === CampaignOp.GREATER_LESS ? 'bg-indigo-500' :
                  currentCampaign.id === CampaignOp.MISSING_NUMBER ? 'bg-teal-500' :
                  'bg-theme-muted';

                return (
                  <button
                    key={lvl}
                    onClick={() => isUnlocked && onSelectLevel(lvl)}
                    disabled={!isUnlocked}
                    className={`btn-press aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center font-display text-base md:text-xl relative transition-all duration-200
                      ${
                        isUnlocked
                            ? (isCurrentLevel
                                ? `${bgColorClass} text-white shadow-lg ring-2 ring-white scale-105`
                                : `bg-theme-panel text-theme-text shadow-md hover:scale-105 hover:${bgColorClass} hover:text-white focus:outline-none focus:ring-2 focus:ring-theme-accent`)
                            : 'bg-theme-panel/50 text-theme-muted opacity-40 grayscale cursor-not-allowed shadow-inner'
                      }`
                    }
                    aria-label={isUnlocked ? `${t('selectLevel')} ${lvl}` : `${t('lockedLevel')} ${lvl}`}
                  >
                    {isUnlocked ? (
                      <>
                        {lvl}
                        <div className="flex mt-0.5 md:mt-1">
                          {Array.from({ length: 3 }).map((_, si) => (
                            <Icons.Star
                              key={si}
                              className={
                                'w-1.5 h-1.5 md:w-3 md:h-3 ' + (si < stars ? 'text-brand-warning fill-current' : 'text-theme-muted/30')
                              }
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <Icons.Lock className="w-5 h-5 md:w-8 md:h-8 text-theme-muted" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
