
import React from 'react';
import { Result, CampaignOp, ArcadeMode, TimerMode } from '../../types';
import { Icons } from '../Icons';
import { useLanguage } from '../../context/LanguageContext';

interface ResultModalProps {
  result: Result | null;
  onRestart: () => void;
  onMenu: () => void;
  onContinueCampaign?: () => void; // New prop for campaign mode
  currentCampaignLevel?: number; // New prop to determine next level
  settingsTimerMode: TimerMode; // New prop to pass timer mode from App.tsx
}

export const ResultModal: React.FC<ResultModalProps> = ({ result, onRestart, onMenu, onContinueCampaign, currentCampaignLevel, settingsTimerMode }) => {
  const { t } = useLanguage();
  if (!result) return null;

  const { correct, total, time, score, mode } = result;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  // More balanced star system - kids should feel rewarded!
  const stars = correct >= total * 0.9 ? 3 : correct >= total * 0.6 ? 2 : correct >= total * 0.3 ? 1 : 0;

  // --- Dynamic Mission Status (Kid-Friendly & Encouraging) ---
  let missionStatusTitle: string;
  let missionStatusText: string;
  let statusColor: string;
  let mainIcon: React.FC<React.SVGProps<SVGSVGElement> & { filled?: boolean }> = Icons.Trophy;

  const isCampaignSuccess = mode === 'campaign' && correct >= 5; // Lowered threshold - just 5 correct to pass
  const isArcadeWin = mode === 'arcade' && score > 0;

  if (mode === 'campaign') {
    if (isCampaignSuccess) {
      if (stars === 3) {
        missionStatusTitle = t('result_perfect_score');
        missionStatusText = t('result_amazing_math_star');
      } else if (stars === 2) {
        missionStatusTitle = t('result_great_job');
        missionStatusText = t('result_getting_good');
      } else {
        missionStatusTitle = t('result_good_effort');
        missionStatusText = t('result_keep_practicing');
      }
      statusColor = "text-emerald-400";
      mainIcon = Icons.Star;
    } else {
      // More encouraging for kids who didn't pass
      if (accuracy >= 50) {
        missionStatusTitle = t('result_almost_there');
        missionStatusText = t('result_try_again');
      } else if (accuracy >= 25) {
        missionStatusTitle = t('result_keep_learning');
        missionStatusText = t('result_practice_perfect');
      } else {
        missionStatusTitle = t('result_lets_start');
        missionStatusText = t('result_every_expert');
      }
      statusColor = "text-amber-400";
      mainIcon = Icons.Lightning; 
    }
  } else if (mode === 'arcade') {
    const config = result.gameConfig;
    const arcadeMode = config?.type === 'arcade' ? config.arcadeMode : undefined;

    if (isArcadeWin) {
      missionStatusTitle = t('result_arcade_awesome');
      missionStatusText = t('result_arcade_amazing');
      statusColor = "text-neon-blue";
      mainIcon = Icons.Gamepad;
    } else {
      missionStatusTitle = t('result_arcade_nice_try');
      missionStatusText = t('result_arcade_keep_playing');
      statusColor = "text-purple-400";
      mainIcon = Icons.Lightning; 
    }
  } else { // Practice mode
    missionStatusTitle = t('result_practice_complete');
    missionStatusText = t('result_practice_great_job');
    statusColor = "text-neon-green";
    mainIcon = Icons.Setting; 
  }


  // --- Detailed Accuracy Feedback with Tips ---
  let accuracyFeedback: string;
  let accuracyTip: string;
  let accuracyColor: string;
  
  if (accuracy === 100) {
    accuracyFeedback = t('accuracy_perfect');
    accuracyTip = t('accuracy_math_genius');
    accuracyColor = 'text-emerald-500';
  } else if (accuracy >= 90) {
    accuracyFeedback = t('accuracy_amazing');
    accuracyTip = t('accuracy_almost_perfect');
    accuracyColor = 'text-emerald-400';
  } else if (accuracy >= 70) {
    accuracyFeedback = t('accuracy_great');
    accuracyTip = t('accuracy_keep_up');
    accuracyColor = 'text-neon-green';
  } else if (accuracy >= 50) {
    accuracyFeedback = t('accuracy_good');
    accuracyTip = t('accuracy_practice_more');
    accuracyColor = 'text-neon-yellow';
  } else if (accuracy >= 25) {
    accuracyFeedback = t('accuracy_keep_trying');
    accuracyTip = t('accuracy_will_get_better');
    accuracyColor = 'text-orange-400';
  } else if (total > 0) {
    accuracyFeedback = t('accuracy_starting_out');
    accuracyTip = t('accuracy_first_steps');
    accuracyColor = 'text-blue-400';
  } else {
    accuracyFeedback = t('accuracy_lets_go');
    accuracyTip = t('accuracy_answer_questions');
    accuracyColor = 'text-slate-400';
  }

  // --- Time/Score/Rounds Display ---
  let primaryMetricLabel: string;
  let primaryMetricValue: string;
  let primaryMetricColor: string;

  if (mode === 'campaign') {
    // All timer modes are now time-based (30s, 60s, 90s, 120s)
    primaryMetricLabel = t('timeTakenLabel');
    primaryMetricValue = `${time}s`;
    primaryMetricColor = 'text-neon-blue';
  } else if (mode === 'arcade') {
    // Narrowing the gameConfig type to safely access arcadeMode
    const config = result.gameConfig;
    const arcadeMode = config?.type === 'arcade' ? config.arcadeMode : undefined;

    switch (arcadeMode) { 
        case ArcadeMode.SCORE_ATTACK:
        case ArcadeMode.FLASH:
            primaryMetricLabel = t('scoreLabel');
            primaryMetricValue = score.toString();
            primaryMetricColor = 'text-neon-yellow';
            break;
        case ArcadeMode.ENDLESS:
            primaryMetricLabel = t('roundsSurvivedLabel');
            primaryMetricValue = score.toString(); 
            primaryMetricColor = 'text-neon-pink';
            break;
        case ArcadeMode.DUEL:
            primaryMetricLabel = t('roundsWonLabel');
            primaryMetricValue = score.toString(); 
            primaryMetricColor = 'text-neon-blue';
            break;
        case ArcadeMode.MARATHON:
            primaryMetricLabel = t('totalDurationLabel');
            primaryMetricValue = `${Math.floor(time / 60)}m ${(time % 60).toString().padStart(2, '0')}s`;
            primaryMetricColor = 'text-neon-green';
            break;
        default:
            primaryMetricLabel = t('scoreLabel');
            primaryMetricValue = score.toString();
            primaryMetricColor = 'text-neon-blue';
    }
  } else { // Practice
      primaryMetricLabel = t('timeLabel');
      primaryMetricValue = 'N/A';
      primaryMetricColor = 'text-slate-500';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-pop">
      <div className="glass-panel w-full max-w-sm p-6 md:p-8 text-center relative text-theme-text shadow-2xl mt-8">
        <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2">
          <div className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-theme-accent to-theme-secondary rounded-full p-1 shadow-lg flex items-center justify-center`}>
            {React.createElement(mainIcon, { className: "w-10 h-10 md:w-12 md:h-12 text-white drop-shadow-md" })}
          </div>
        </div>

        <h2 className={`font-display text-2xl md:text-3xl mt-8 mb-1 tracking-wider ${statusColor}`}>
          {missionStatusTitle}
        </h2>
        <p className="text-xs md:text-sm text-theme-muted mb-6 px-4">
          {missionStatusText}
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <Icons.Star
              key={i}
              className={`w-8 h-8 md:w-10 md:h-10 transition-colors duration-300 ${
                i <= stars ? 'text-brand-warning fill-current animate-pop drop-shadow-md' : 'text-theme-muted/30'
              }`}
              style={{ animationDelay: `${0.1 * i}s` }}
              aria-label={`${i} star`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-theme-panel/50 rounded-xl p-3 md:p-4 border border-theme-border">
            <div className="text-[9px] md:text-[10px] text-theme-muted uppercase font-bold tracking-widest">
              ACCURACY
            </div>
            <div className={`text-xl md:text-2xl font-mono font-bold ${accuracyColor}`}>
              {accuracy}%
            </div>
            <div className={`text-[9px] md:text-xs ${accuracyColor} mt-1 font-bold`}>
              {accuracyFeedback}
            </div>
            {accuracyTip && (
              <div className="text-[8px] md:text-[10px] text-theme-muted mt-1">
                {accuracyTip}
              </div>
            )}
          </div>
          <div className="bg-theme-panel/50 rounded-xl p-3 md:p-4 border border-theme-border">
            <div className="text-[9px] md:text-[10px] text-theme-muted uppercase font-bold tracking-widest">
              {primaryMetricLabel}
            </div>
            <div className={`text-xl md:text-2xl font-mono font-bold ${primaryMetricColor}`}>
              {primaryMetricValue}
            </div>
            <div className="text-[9px] md:text-xs text-theme-muted mt-1 font-bold">
              {mode === 'campaign' ? `Correct: ${correct}/${total}` : `Q: ${total}`}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onMenu}
            className="btn-press flex-1 py-3 md:py-3.5 rounded-xl border-2 border-theme-border font-bold hover:bg-theme-panel transition-colors uppercase tracking-wide text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
            aria-label="Back to main menu"
          >
            MENU
          </button>
          {isCampaignSuccess && onContinueCampaign ? (
            <button
              onClick={onContinueCampaign}
              className="btn-press flex-1 py-3 md:py-3.5 rounded-xl bg-theme-accent text-white font-bold shadow-lg uppercase tracking-wide text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-theme-accent"
              aria-label={`Continue to next level ${currentCampaignLevel !== undefined ? currentCampaignLevel + 1 : ''}`}
            >
              NEXT LEVEL
            </button>
          ) : (
            <button
              onClick={onRestart}
              className="btn-press flex-1 py-3 md:py-3.5 rounded-xl bg-theme-panel text-theme-text font-bold shadow-lg uppercase tracking-wide text-xs md:text-sm hover:bg-theme-panel/80 focus:outline-none focus:ring-2 focus:ring-theme-accent"
              aria-label="Retry current game"
            >
              RETRY
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
