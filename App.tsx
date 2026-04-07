
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Profile, GameScreen, GameConfig, Result, Settings, CampaignOp, TimerMode, ArcadeMode, SoundFunctions, PracticeDifficulty, Theme, Language } from './types';
import { MathEngine } from './services/mathEngine';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider, ToastContainer } from './contexts/ToastContext';
import { ACHIEVEMENTS_DATA } from './constants';
import { ErrorBoundary } from './components/ErrorBoundary';

// Screens
import { Splash } from './components/screens/Splash';
import { Dashboard } from './components/screens/Dashboard';
import { LevelMap } from './components/screens/LevelMap';
import { GameArena } from './components/screens/GameArena';
import { CharacterBuilder } from './components/screens/CharacterBuilder';
import { Calculator } from './components/screens/Calculator';
import { LoadingScreen } from './components/LoadingScreen';

// Modals
import { SettingsModal } from './components/modals/SettingsModal';
import { AchievementsModal } from './components/modals/AchievementsModal';
import { ResultModal } from './components/modals/ResultModal';

const AppContent: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.SPLASH);
  const [profileState, setProfileState] = useState<Profile>(() => {
    try {
      const savedProfile = localStorage.getItem('math_profile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        return {
          ...parsedProfile,
          name: parsedProfile.name || '',
          avatarShape: parsedProfile.avatarShape || 'Circle',
          avatarColor: parsedProfile.avatarColor || 'neon-blue',
        };
      }
    } catch (error) {
      console.warn('Failed to parse saved profile, resetting to defaults:', error);
      localStorage.removeItem('math_profile');
    }
    return {
      name: '',
      avatarShape: 'Circle',
      avatarColor: 'neon-blue',
      campaign: {
        [CampaignOp.ADD]: 0,
        [CampaignOp.SUB]: 0,
        [CampaignOp.MUL]: 0,
        [CampaignOp.DIV]: 0,
        [CampaignOp.VISUAL_DOTS]: 0,
        [CampaignOp.VISUAL_TRIANGLES]: 0,
        [CampaignOp.VISUAL_STARS]: 0,
        [CampaignOp.NUMBER_BONDS]: 0,
        [CampaignOp.GREATER_LESS]: 0,
        [CampaignOp.MISSING_NUMBER]: 0,
      },
      arcade: {
        [ArcadeMode.SCORE_ATTACK]: 0,
        [ArcadeMode.ENDLESS]: 0,
        [ArcadeMode.DUEL]: 0,
        [ArcadeMode.FLASH]: 0,
        [ArcadeMode.MARATHON]: 0,
      },
      unlockedAchievements: [],
      stats: { zenLevels: 0 }
    };
  });
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('math_settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.warn('Failed to parse saved settings, using defaults:', error);
      localStorage.removeItem('math_settings');
    }
    return {
      timerMode: TimerMode.TIME_60,
      practiceDifficulty: PracticeDifficulty.EASY,
      theme: Theme.SIMULATION,
      language: Language.ENGLISH,
    };
  });
  const [isDark, setIsDark] = useState<boolean>(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    const shouldBeDark = settings.theme !== Theme.PAPER;
    if (isDark !== shouldBeDark) {
      setIsDark(shouldBeDark);
    }
  }, [settings.theme]);

  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const sounds = useRef<SoundFunctions | null>(null);
  const audioInitializedRef = useRef(false);

  const initAudio = useCallback(async () => {
    if (!audioInitializedRef.current) {
      await Tone.start();
      const synth = new Tone.PolySynth(Tone.Synth).toDestination();
      const plucky = new Tone.PluckSynth().toDestination();
      sounds.current = {
        click: () => synth.triggerAttackRelease("C5", "32n", undefined, 0.1),
        start: () => synth.triggerAttackRelease(["C4", "E4", "G4", "C5"], "8n"),
        correct: () => { plucky.triggerAttack("C5"); setTimeout(() => plucky.triggerAttack("E5"), 100); },
        wrong: () => plucky.triggerAttack("A2"),
        tick: () => synth.triggerAttackRelease("C6", "32n", undefined, 0.05),
        win: () => {
          const now = Tone.now();
          synth.triggerAttackRelease("C4", "8n", now);
          synth.triggerAttackRelease("E4", "8n", now + 0.1);
          synth.triggerAttackRelease("G4", "8n", now + 0.2);
          synth.triggerAttackRelease("C5", "2n", now + 0.3);
        }
      };
      audioInitializedRef.current = true;
    }
  }, []);

  const playSound = useCallback((type: keyof SoundFunctions) => {
    if (sounds.current) {
      sounds.current[type]();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('math_profile', JSON.stringify(profileState));
  }, [profileState]);

  useEffect(() => {
    localStorage.setItem('math_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleFinishGame = useCallback(async (result: Result | null) => {
    if (!result) {
      setScreen(GameScreen.DASHBOARD);
      return;
    }
    setLastResult(result);

    const newProfile = { ...profileState };

    if (result.mode === 'campaign' && result.correct >= 10 && gameConfig?.type === 'campaign') {
      const currentLvl = gameConfig.level;
      if (currentLvl > (newProfile.campaign[gameConfig.op] || 0)) {
        newProfile.campaign[gameConfig.op] = currentLvl;
      }
    } else if (result.mode === 'arcade' && gameConfig?.type === 'arcade') {
      if (result.score > (newProfile.arcade[gameConfig.arcadeMode] || 0)) {
        newProfile.arcade[gameConfig.arcadeMode] = result.score;
      }
    }

    const checkAchievement = (id: string, condition: boolean) => {
      if (!newProfile.unlockedAchievements.includes(id) && condition) {
        newProfile.unlockedAchievements.push(id);
      }
    };

    checkAchievement('first_steps', result.mode === 'campaign' && result.correct > 0);
    checkAchievement('speed_demon', result.mode === 'arcade' && gameConfig?.type === 'arcade' && gameConfig.arcadeMode === ArcadeMode.SCORE_ATTACK && result.score > 300);
    checkAchievement('survivor', result.mode === 'arcade' && gameConfig?.type === 'arcade' && gameConfig.arcadeMode === ArcadeMode.ENDLESS && result.score >= 20);
    checkAchievement('zen_master', newProfile.stats.zenLevels >= 10);
    checkAchievement('duelist', result.mode === 'arcade' && gameConfig?.type === 'arcade' && gameConfig.arcadeMode === ArcadeMode.DUEL && result.score >= 5);
    checkAchievement('sharp_eye', result.mode === 'arcade' && gameConfig?.type === 'arcade' && gameConfig.arcadeMode === ArcadeMode.FLASH && result.score >= 100);

    const totalVisualLevelsCompleted = (newProfile.campaign[CampaignOp.VISUAL_DOTS] || 0) +
                                       (newProfile.campaign[CampaignOp.VISUAL_TRIANGLES] || 0) +
                                       (newProfile.campaign[CampaignOp.VISUAL_STARS] || 0);
    checkAchievement('visual_perfectionist', totalVisualLevelsCompleted >= 10);

    Object.values(CampaignOp).forEach(op => checkAchievement(`${op}_master`, newProfile.campaign[op] >= 30));

    setProfileState(newProfile);
    localStorage.setItem('math_profile', JSON.stringify(newProfile));
    
    setScreen(GameScreen.RESULT);
  }, [profileState, gameConfig, settings.timerMode]);

  const handleCharacterCreated = useCallback((name: string, avatarShape: string, avatarColor: string) => {
    setProfileState(prev => ({
        ...prev,
        name,
        avatarShape,
        avatarColor,
    }));
    setScreen(GameScreen.DASHBOARD);
  }, []);

  const handleResetProfile = useCallback(() => {
    setProfileState({
      name: '',
      avatarShape: 'Circle',
      avatarColor: 'neon-blue',
      campaign: {
        [CampaignOp.ADD]: 0,
        [CampaignOp.SUB]: 0,
        [CampaignOp.MUL]: 0,
        [CampaignOp.DIV]: 0,
        [CampaignOp.VISUAL_DOTS]: 0,
        [CampaignOp.VISUAL_TRIANGLES]: 0,
        [CampaignOp.VISUAL_STARS]: 0,
        [CampaignOp.NUMBER_BONDS]: 0,
        [CampaignOp.GREATER_LESS]: 0,
        [CampaignOp.MISSING_NUMBER]: 0,
      },
      arcade: {
        [ArcadeMode.SCORE_ATTACK]: 0,
        [ArcadeMode.ENDLESS]: 0,
        [ArcadeMode.DUEL]: 0,
        [ArcadeMode.FLASH]: 0,
        [ArcadeMode.MARATHON]: 0,
      },
      unlockedAchievements: [],
      stats: { zenLevels: 0 }
    });
    localStorage.removeItem('math_profile');
    setScreen(GameScreen.CHARACTER_BUILDER);
  }, []);

  const handleContinueCampaign = useCallback(() => {
    if (gameConfig?.type === 'campaign') {
      const nextLevel = gameConfig.level + 1;
      setGameConfig(prevConfig => prevConfig ? { ...prevConfig, level: nextLevel } as GameConfig : null);
      setScreen(GameScreen.GAME);
    }
  }, [gameConfig]);

  const handleOpenCalculator = useCallback(() => {
    setScreen(GameScreen.CALCULATOR);
  }, []);

  return (
    <div className="h-full w-full">
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        timerMode={settings.timerMode}
        setTimerMode={(m) => setSettings(s => ({ ...s, timerMode: m }))}
        theme={settings.theme}
        setTheme={(t) => setSettings(s => ({ ...s, theme: t }))}
        language={settings.language}
        setLanguage={(l) => setSettings(s => ({ ...s, language: l }))}
      />

      <ErrorBoundary>

      <LanguageProvider initialLanguage={settings.language}>

      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        unlocked={profileState.unlockedAchievements}
        key={settings.language}
      />

      {screen === GameScreen.SPLASH && (
        <Splash
          onEnter={async () => {
            await initAudio();
            if (!profileState.name) {
              setScreen(GameScreen.CHARACTER_BUILDER);
            } else {
              setScreen(GameScreen.DASHBOARD);
            }
          }}
        />
      )}

      {screen === GameScreen.CHARACTER_BUILDER && (
        <CharacterBuilder onCharacterCreated={handleCharacterCreated} />
      )}

      {screen === GameScreen.DASHBOARD && (
        <Dashboard
          profile={profileState}
          onSelectCampaign={(op, level, isPractice = false) => {
            setGameConfig({ type: isPractice ? 'practice' : 'campaign', op, level });
            if (isPractice) setScreen(GameScreen.GAME);
            else setScreen(GameScreen.LEVEL_MAP);
          }}
          onSelectArcade={(id) => {
            setGameConfig({ type: 'arcade', arcadeMode: id });
            setScreen(GameScreen.GAME);
          }}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenCalculator={handleOpenCalculator}
          onResetProfile={handleResetProfile}
          isDark={isDark}
          toggleTheme={() => setIsDark(d => !d)}
          currentPracticeDifficulty={settings.practiceDifficulty}
          setPracticeDifficulty={(d) => setSettings(s => ({ ...s, practiceDifficulty: d }))}
        />
      )}

      {screen === GameScreen.LEVEL_MAP && gameConfig && (
        <LevelMap
          profile={profileState}
          gameConfig={gameConfig}
          onSelectLevel={(level) => {
            if (gameConfig && gameConfig.type === 'campaign') {
              setGameConfig(prevConfig => prevConfig ? { ...prevConfig, level } as GameConfig : null);
              setScreen(GameScreen.GAME);
            }
          }}
          onBack={() => setScreen(GameScreen.DASHBOARD)}
        />
      )}

      {screen === GameScreen.GAME && gameConfig && (
        <GameArena mode={gameConfig.type} config={gameConfig} onFinish={handleFinishGame} playSound={playSound} settings={settings} />
      )}

      {screen === GameScreen.RESULT && lastResult && (
        <ResultModal 
          result={lastResult} 
          onRestart={() => setScreen(GameScreen.GAME)}
          onMenu={() => setScreen(GameScreen.DASHBOARD)} 
          onContinueCampaign={handleContinueCampaign}
          currentCampaignLevel={gameConfig?.type === 'campaign' ? gameConfig.level : undefined}
          settingsTimerMode={settings.timerMode}
        />
      )}

      {screen === GameScreen.CALCULATOR && (
        <Calculator onBack={() => setScreen(GameScreen.DASHBOARD)} playSound={playSound} />
      )}
      </LanguageProvider>

      </ErrorBoundary>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;