import React, { useState } from 'react';
import { ArcadeMode, CampaignOp, Profile, PracticeDifficulty, ArcadeModeConfig, CampaignData } from '../../types';
import { CAMPAIGNS, ARCADE_MODES_CONFIG } from '../../constants';
import { MathEngine } from '../../services/mathEngine';
import { Icons } from '../Icons';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardProps {
  profile: Profile;
  onSelectCampaign: (op: CampaignOp, level: number, isPractice?: boolean) => void;
  onSelectArcade: (id: ArcadeMode) => void;
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
  onOpenCalculator: () => void;
  onResetProfile: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentPracticeDifficulty: PracticeDifficulty;
  setPracticeDifficulty: (diff: PracticeDifficulty) => void;
}

export const Dashboard: React.FC<DashboardProps> = React.memo(({
  profile,
  onSelectCampaign,
  onSelectArcade,
  onOpenSettings,
  onOpenAchievements,
  onOpenCalculator,
  onResetProfile,
  isDark,
  toggleTheme,
  currentPracticeDifficulty,
  setPracticeDifficulty,
}) => {
  const [tab, setTab] = useState<'campaign' | 'arcade' | 'practice'>('campaign');

  // Get translations
  const { t } = useLanguage();

  const getDifficultyLabel = (diff: PracticeDifficulty) => {
    switch (diff) {
      case PracticeDifficulty.EASY: return t('novice');
      case PracticeDifficulty.MEDIUM: return t('expert');
      case PracticeDifficulty.HARD: return t('master');
    }
  };

  const RenderAvatar = () => {
    const iconKey = profile.avatarShape || 'Circle';
    const IconComponent = (Icons as any)[iconKey] || Icons.Circle;
    return (
      <div className={`w-14 h-14 rounded-2xl bg-${profile.avatarColor || 'brand-primary'} flex items-center justify-center text-white shadow-xl ring-4 ring-white/10 transition-transform hover:rotate-3`}>
        <IconComponent className="w-8 h-8" />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col w-full max-w-6xl mx-auto p-3 md:p-8 animate-fade-in overflow-hidden">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 bg-theme-panel/40 p-1.5 md:p-2 pr-4 md:pr-6 rounded-2xl md:rounded-3xl border border-theme-border shadow-2xl">
          <RenderAvatar />
          <div>
            <h1 className="font-display text-base md:text-xl text-theme-text tracking-wide">{profile.name || t('mathLabOperative')}</h1>
            <div className="flex items-center gap-2">
              <span className="text-[8px] md:text-[10px] font-mono py-0.5 px-2 bg-theme-accent/20 text-theme-accent rounded-full border border-theme-accent/30">LEVEL {Math.floor((Object.values(profile.campaign) as number[]).reduce((a, b) => a + b, 0) / 10) + 1}</span>
              <span className="text-[8px] md:text-[10px] font-mono text-theme-muted hidden xs:block">GAAS OPERATIVE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <button onClick={onOpenCalculator} className="btn-game p-2 md:p-3 bg-theme-panel/80 rounded-xl md:rounded-2xl border border-theme-border hover:bg-theme-panel focus:ring-2 ring-theme-accent shadow-lg" title={t('calculator')}>
            <Icons.Calculator className="w-4 h-4 md:w-6 md:h-6 text-theme-accent" />
          </button>
          <button onClick={onOpenAchievements} className="btn-game p-2 md:p-3 bg-theme-panel/80 rounded-xl md:rounded-2xl border border-theme-border hover:bg-theme-panel focus:ring-2 ring-brand-warning shadow-lg" title={t('achievements')}>
            <Icons.Trophy className="w-4 h-4 md:w-6 md:h-6 text-brand-warning" />
          </button>
          <button onClick={onOpenSettings} className="btn-game p-2 md:p-3 bg-theme-panel/80 rounded-xl md:rounded-2xl border border-theme-border hover:bg-theme-panel focus:ring-2 ring-brand-success shadow-lg" title={t('settings')}>
            <Icons.Setting className="w-4 h-4 md:w-6 md:h-6 text-brand-success" />
          </button>
          <button onClick={onResetProfile} className="btn-game p-2 md:p-3 bg-brand-danger/20 rounded-xl md:rounded-2xl border border-brand-danger/20 hover:bg-brand-danger/40 text-brand-danger focus:ring-2 ring-brand-danger" title={t('exit')}>
            <Icons.Exit className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>
      </header>

      {/* Mode Selector Tabs */}
      <nav className="flex gap-1 mb-4 md:mb-8 bg-theme-bg/50 p-1 rounded-xl md:rounded-2xl self-start border border-theme-border">
        {(['campaign', 'arcade', 'practice'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setTab(mode)}
            className={`px-3 md:px-8 py-1.5 md:py-3 rounded-lg md:rounded-xl font-display text-[10px] md:text-sm uppercase tracking-widest transition-all ${
              tab === mode 
              ? 'bg-theme-accent text-white shadow-lg' 
              : 'text-theme-muted hover:text-theme-text hover:bg-theme-text/5'
            }`}
          >
            {t(mode)}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto custom-scrollbar smooth-scroll pb-10 scroll-pad-bottom">
        {tab === 'campaign' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-slide-up">
            {Object.values(CAMPAIGNS).map((camp: CampaignData) => {
              const level = profile.campaign[camp.id] || 0;
              const progress = (level / 30) * 100;
              // Convert snake_case to camelCase for translation keys
              const campTransKey = camp.id.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
              return (
                <button
                  key={camp.id}
                  onClick={() => onSelectCampaign(camp.id, level + 1)}
                  className="group relative bg-theme-panel/40 rounded-[2rem] p-5 md:p-6 border border-theme-border text-left overflow-hidden hover:bg-theme-panel/60 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${camp.bg} opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity`} />
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${camp.bg} flex items-center justify-center text-white mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <camp.icon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="font-display text-xl md:text-2xl text-theme-text mb-1">{t(campTransKey) || camp.title}</h3>
                  <p className="text-[10px] text-theme-muted font-mono mb-4 md:mb-6 uppercase tracking-wider">{t('campaignModule') || 'Campaign Module'}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] md:text-[10px] font-bold text-theme-muted uppercase tracking-tighter">
                      <span>{t('progress')}</span>
                      <span className="text-theme-accent">{level} / 30</span>
                    </div>
                    <div className="h-1.5 md:h-2 bg-theme-bg rounded-full overflow-hidden border border-theme-border">
                      <div className={`h-full ${camp.bg} transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {tab === 'arcade' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-slide-up">
            {ARCADE_MODES_CONFIG.map((mode: ArcadeModeConfig) => {
              const highScore = profile.arcade[mode.id] || 0;
              const tier = MathEngine.getArcadeTier(highScore);
              // Convert snake_case to camelCase for translation keys
              const transKey = mode.id.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
              return (
                <button
                  key={mode.id}
                  onClick={() => onSelectArcade(mode.id)}
                  className="group relative h-40 md:h-48 bg-theme-panel/40 rounded-[2rem] p-6 md:p-8 border border-theme-border text-left flex flex-col justify-between hover:bg-theme-panel/60 transition-all hover:shadow-2xl active:scale-95"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display text-xl md:text-2xl text-theme-text group-hover:text-theme-accent transition-colors">{t(transKey) || mode.title}</h3>
                      <p className="text-[10px] text-theme-muted font-mono uppercase tracking-widest">{t(transKey + 'Desc') || mode.desc}</p>
                    </div>
                    <mode.icon className={`w-8 h-8 md:w-10 md:h-10 ${mode.color}`} />
                  </div>
                  <div className="flex items-center justify-between bg-theme-bg/30 p-3 md:p-4 rounded-2xl border border-theme-border">
                    <span className="text-[9px] md:text-[10px] font-bold text-theme-muted uppercase tracking-widest">{t('highScore')}</span>
                    <div className="text-right">
                      <div className="font-display text-lg md:text-xl text-theme-text">{highScore}</div>
                      <div className={`text-[9px] md:text-[10px] font-bold ${tier.color} uppercase`}>{tier.name}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {tab === 'practice' && (
          <div className="space-y-6 md:space-y-8 animate-slide-up max-w-4xl">
            <div className="bg-theme-panel/40 p-6 md:p-8 rounded-[2rem] border border-theme-border">
              <h3 className="font-display text-lg md:text-xl text-theme-accent mb-4 md:mb-6 tracking-wide">{t('practiceIntensity') || 'PRACTICE INTENSITY'}</h3>
              <div className="flex gap-2 md:gap-4">
                {Object.values(PracticeDifficulty).filter(v => typeof v === 'number').map(diff => (
                  <button
                    key={diff}
                    onClick={() => setPracticeDifficulty(diff as PracticeDifficulty)}
                    className={`flex-1 py-3 md:py-4 rounded-2xl font-bold text-sm md:text-base transition-all border-2 ${
                      currentPracticeDifficulty === diff 
                      ? 'bg-theme-accent border-theme-accent text-white shadow-lg' 
                      : 'bg-theme-bg border-transparent text-theme-muted hover:border-theme-border hover:text-theme-text'
                    }`}
                  >
                    {getDifficultyLabel(diff as PracticeDifficulty)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {Object.values(CAMPAIGNS).map(camp => {
                const campTransKey = camp.id.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
                return (
                <button
                  key={camp.id}
                  onClick={() => onSelectCampaign(camp.id, currentPracticeDifficulty, true)}
                  className="p-4 md:p-6 bg-theme-panel/40 rounded-3xl border border-theme-border flex items-center justify-between hover:bg-theme-panel/60 hover:border-theme-border/20 transition-all active:scale-95"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${camp.bg} flex items-center justify-center text-white`}>
                      <camp.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h4 className="font-display text-base md:text-lg text-theme-text">{t(campTransKey) || camp.title}</h4>
                      <p className="text-[9px] md:text-[10px] font-mono text-theme-muted uppercase">{t('endlessSimulation') || 'Endless Simulation'}</p>
                    </div>
                  </div>
                  <Icons.Next className="w-4 h-4 md:w-5 md:h-5 text-theme-muted" />
                </button>
              );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
});