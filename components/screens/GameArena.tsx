
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GameConfig, MathQuestion, Result, Settings, FloatingTextData, ArcadeMode, SoundType, TimerMode, CampaignOp } from '../../types';
import { MathEngine, AdaptiveState } from '../../services/mathEngine';
import { Icons } from '../Icons';
import { BigMathQuestion } from '../BigMathQuestion';
import { FloatingText } from '../FloatingText';
import { PauseMenu } from '../modals/PauseMenu';

interface GameArenaProps {
  mode: 'campaign' | 'arcade' | 'practice';
  config: GameConfig;
  onFinish: (result: Result | null) => void;
  playSound: (type: SoundType) => void;
  settings: Settings;
}

export const GameArena: React.FC<GameArenaProps> = ({ mode, config, onFinish, playSound, settings }) => {
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const initialTimeLimitRef = useRef(0);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'finished'>('ready');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextData[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState<number>(0);
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveState>({
    difficulty: 3, // Start at easy-medium
    avgResponseTime: 5000,
    recentAccuracy: 0.5,
    streak: 0,
    totalCorrect: 0,
    totalQuestions: 0,
  });
  
  // Combo and bonus system for arcade mode
  const [combo, setCombo] = useState(0);
  const [lastBonus, setLastBonus] = useState<{text: string, amount: number} | null>(null);

  const gameTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const submissionTimerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const currentQuestion = useMemo(() => questions[currentIdx], [questions, currentIdx]);
  const difficultyLabel = MathEngine.getDifficultyLabel(adaptiveState.difficulty);
  const difficultyColor = MathEngine.getDifficultyColor(adaptiveState.difficulty);

  const clearTimers = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (submissionTimerRef.current) {
      clearTimeout(submissionTimerRef.current);
      submissionTimerRef.current = null;
    }
  }, []);

  const addFloatingText = useCallback((text: string, color: string) => {
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, text, color, x: '50%', y: '40%' }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 800);
  }, []);

  const finishGame = useCallback(() => {
    clearTimers();
    setGameState('finished');
    playSound('win');
    let correctCount = 0;
    const questionsCompleted = config.type === 'campaign' ? 20 : currentIdx;
    
    questions.slice(0, questionsCompleted).forEach((q, i) => {
      if (parseInt(answers[i]) === q.answer) correctCount++;
    });

    onFinish({
      correct: correctCount,
      total: questionsCompleted,
      time: initialTimeLimitRef.current - timeLeft,
      score: score,
      mode: config.type,
      gameConfig: config,
    });
    
    // Reset question bank after game ends
    MathEngine.resetQuestionBanks();
  }, [config, currentIdx, questions, answers, timeLeft, score, onFinish, playSound, clearTimers, settings.timerMode]);

  const initGame = useCallback(() => {
    clearTimers();
    let initialQuestions: MathQuestion[] = [];
    let initialTime = 0;

    if (config.type === 'campaign') {
      // Use the new question bank system for campaign mode (500+ questions per difficulty)
      try {
        const campaignPool = MathEngine.initCampaignPool(config.level, config.op);
        initialQuestions = campaignPool.slice(0, 20); // Get first 20 questions for the game
        initialTime = MathEngine.getTimeLimit(config.level, settings.timerMode);
      } catch (err) {
        console.error('Failed to init campaign pool:', err);
        // Fallback: generate questions directly
        for (let i = 0; i < 20; i++) {
          initialQuestions.push(MathEngine.generate(config.level, config.op));
        }
        initialTime = MathEngine.getTimeLimit(config.level, settings.timerMode);
      }
    } else if (config.type === 'practice') {
      // Practice mode uses adaptive difficulty - generate initial question
      const initialAdaptiveState: AdaptiveState = {
        difficulty: 3, // Start at easy-medium
        avgResponseTime: 5000,
        recentAccuracy: 0.5,
        streak: 0,
        totalCorrect: 0,
        totalQuestions: 0,
      };
      initialQuestions = [
        MathEngine.generateAdaptive(initialAdaptiveState, config.op)
      ];
      initialTime = 9999; // No time limit for practice
    } else if (config.type === 'arcade') {
      // Use the new question bank system for arcade mode
      try {
        MathEngine.initArcadePool();
        initialQuestions = [MathEngine.getNextArcadeQuestion(0)];
      } catch (err) {
        console.error('Failed to init arcade pool:', err);
        initialQuestions = [MathEngine.generate(1, CampaignOp.ADD)];
      }
      initialTime = (config.arcadeMode === ArcadeMode.SCORE_ATTACK || config.arcadeMode === ArcadeMode.FLASH) ? 60 : 9999;
    }

    setQuestions(initialQuestions);
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(initialTime);
    initialTimeLimitRef.current = initialTime;
    setScore(0);
    setGameState('ready');
    setCountdown(3);
    setCombo(0);
    setLastBonus(null);
    setAdaptiveState({
      difficulty: 3,
      avgResponseTime: 5000,
      recentAccuracy: 0.5,
      streak: 0,
      totalCorrect: 0,
      totalQuestions: 0,
    });

    countdownTimerRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          setGameState('playing');
          playSound('start');
          return 0;
        }
        playSound('tick');
        return prev - 1;
      });
    }, 1000);
  }, [clearTimers, config, settings, playSound]);

  useEffect(() => {
    initGame();
    return () => clearTimers();
  }, [initGame, clearTimers]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const isStandardTimed = config.type === 'campaign';
    const isArcadeTimed = config.type === 'arcade' && (config.arcadeMode === ArcadeMode.SCORE_ATTACK || config.arcadeMode === ArcadeMode.FLASH);
    
    if (isStandardTimed || isArcadeTimed) {
      gameTimerRef.current = window.setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            finishGame();
            return 0;
          }
          if (t <= 10) playSound('tick');
          return t - 1;
        });
      }, 1000);
    }

    return () => { if (gameTimerRef.current) clearInterval(gameTimerRef.current); };
  }, [gameState, settings.timerMode, config, playSound, finishGame]);

  const submitAnswer = useCallback((q: MathQuestion, userAns: number) => {
    const isCorrect = userAns === q.answer;
    setSubmissionStatus(isCorrect ? 'correct' : 'incorrect');
    if (submissionTimerRef.current) clearTimeout(submissionTimerRef.current);
    submissionTimerRef.current = window.setTimeout(() => setSubmissionStatus('none'), 500);

    if (isCorrect) {
      // Track response time for adaptive difficulty
      const responseTime = Date.now() - currentQuestionStartTime;
      
      // Update adaptive difficulty state
      setAdaptiveState(prev => MathEngine.updateAdaptiveState(prev, responseTime, true));
      
      playSound('correct');
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      
      // Combo system for arcade mode
      const newCombo = config.type === 'arcade' ? combo + 1 : 0;
      setCombo(newCombo);
      
      // Calculate score with combo bonus
      let scoreBonus = 10;
      let bonusText = '';
      
      if (config.type === 'arcade') {
        if (newCombo >= 5) {
          scoreBonus += 15; // Super combo bonus
          bonusText = 'SUPER COMBO!';
        } else if (newCombo >= 3) {
          scoreBonus += 5; // Combo bonus
          bonusText = 'COMBO!';
        }
        
        // Speed bonus for fast answers
        if (responseTime < 3000) {
          scoreBonus += 5;
          bonusText = bonusText ? bonusText + ' +SPEED!' : 'SPEED BONUS!';
        }
      }
      
      setScore(s => s + scoreBonus);
      addFloatingText(bonusText || 'EXCELLENT!', bonusText ? 'text-yellow-400' : 'text-emerald-400');
      
      // Show bonus popup
      if (bonusText) {
        setLastBonus({ text: bonusText, amount: scoreBonus - 10 });
        setTimeout(() => setLastBonus(null), 1500);
      }
    } else {
      // Track response time for wrong answers too
      const responseTime = Date.now() - currentQuestionStartTime;
      setAdaptiveState(prev => MathEngine.updateAdaptiveState(prev, responseTime, false));
      
      playSound('wrong');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      
      // Reset combo on wrong answer
      if (config.type === 'arcade') {
        setCombo(0);
      }
    }

    if (config.type === 'practice') {
      // Generate adaptive question for practice mode
      const newQuestion = MathEngine.generateAdaptive(adaptiveState, config.op);
      setQuestions(prev => [...prev.slice(1), newQuestion]);
      setCurrentQuestionStartTime(Date.now());
    } else if (config.type === 'campaign') {
      if (currentIdx + 1 < questions.length) setCurrentIdx(c => c + 1);
      else finishGame();
    } else {
      // Use the new question bank system for arcade mode with progressive difficulty
      setQuestions(prev => [...prev, MathEngine.getNextArcadeQuestion(score + 10)]);
      setCurrentIdx(c => c + 1);
    }
    setAnswers(prev => ({ ...prev, [currentIdx + 1]: '' }));
    
    // Reset timer for new question
    setCurrentQuestionStartTime(Date.now());
  }, [config, currentIdx, questions, score, playSound, finishGame, addFloatingText, adaptiveState, combo]);

  const handleInput = useCallback((val: string) => {
    if (gameState !== 'playing') return;
    const currentAnswer = answers[currentIdx] || '';

    if (val === 'DEL') {
      setAnswers(p => ({ ...p, [currentIdx]: currentAnswer.slice(0, -1) }));
      playSound('click');
    } else if (val === 'ENTER') {
      if (currentAnswer) submitAnswer(currentQuestion, parseInt(currentAnswer));
    } else {
      if (currentAnswer.length < 6) {
        setAnswers(p => ({ ...p, [currentIdx]: currentAnswer + val }));
        playSound('click');
      }
    }
  }, [gameState, answers, currentIdx, currentQuestion, playSound, submitAnswer]);

  // Keyboard input handling for numerical data entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      // Prevent default for game-related keys to avoid page scrolling
      if (e.key === 'Enter' || e.key === 'Delete' || e.key === 'Backspace' || /^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
      
      if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        handleInput('ENTER');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleInput('DEL');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleInput]);

  return (
    <div className="h-full flex flex-col bg-theme-bg overflow-hidden select-none safe-top safe-bottom">
      {gameState === 'paused' && (
        <PauseMenu onResume={() => setGameState('playing')} onRestart={initGame} onQuit={() => onFinish(null)} />
      )}

      {/* Dynamic HUD */}
      <header className="p-3 md:p-5 flex items-center justify-between bg-theme-panel/60 backdrop-blur-md border-b border-theme-border z-20">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setGameState('paused')} className="p-2.5 md:p-3 glass-panel rounded-xl text-theme-muted hover:text-theme-text transition-all hover:bg-theme-panel">
            <Icons.Pause className="w-5 h-5 md:w-6 h-6" />
          </button>
          <div>
            <div className="text-[9px] md:text-[10px] font-mono text-theme-muted uppercase tracking-widest hidden xs:block">SIMULATION</div>
            <div className="text-xs md:text-sm font-bold text-theme-text uppercase truncate max-w-[80px] md:max-w-none">{config.type}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          {/* Adaptive Difficulty Display for Practice Mode */}
          {config.type === 'practice' && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] md:text-[10px] font-mono text-theme-muted uppercase">Level</span>
              <span className={`text-lg md:text-xl font-display font-bold ${difficultyColor}`}>
                {Math.round(adaptiveState.difficulty)}
              </span>
              <span className={`text-[8px] md:text-[10px] font-mono ${difficultyColor}`}>
                {difficultyLabel}
              </span>
            </div>
          )}
          {true && (
            <div className={`text-2xl md:text-3xl font-mono font-bold tracking-tighter ${timeLeft < 10 ? 'text-brand-danger animate-pulse' : 'text-theme-accent'}`}>
              {timeLeft}s
            </div>
          )}
          <div className="text-right">
            <div className="text-[9px] md:text-[10px] font-mono text-theme-muted uppercase">{config.type === 'campaign' ? 'PROGRESS' : 'SCORE'}</div>
            <div className={`text-lg md:text-xl font-display ${config.type === 'campaign' ? 'text-theme-text' : 'text-brand-warning'}`}>
              {config.type === 'campaign' ? `${currentIdx + 1}/20` : score}
            </div>
            {/* Combo display for arcade mode */}
            {config.type === 'arcade' && combo > 0 && (
              <div className={`text-xs font-bold ${combo >= 5 ? 'text-yellow-400 animate-bounce' : 'text-orange-400'}`}>
                {combo}x COMBO
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content: Flexible Grid */}
      <main className="flex-grow flex flex-col lg:flex-row items-stretch justify-center gap-3 md:gap-6 p-2 md:p-4 min-h-0 overflow-hidden">
        
        {/* Playfield Section */}
        <div className="flex-grow flex flex-col min-h-0 relative">
          <div className={`flex-grow glass-panel rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-6 lg:p-10 flex flex-col items-center justify-center relative transition-transform overflow-hidden ${shake ? 'animate-shake' : ''}`}>
            
            <BigMathQuestion
              q={currentQuestion}
              input={answers[currentIdx] || ''}
              showCursor={gameState === 'playing'}
              hideTerms={false}
              submissionStatus={submissionStatus}
            />
            
            {/* Bonus popup for arcade mode */}
            {lastBonus && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 animate-bounce">
                <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-yellow-400 shadow-2xl">
                  <div className="text-yellow-400 text-2xl font-bold text-center">+{lastBonus.amount}</div>
                  <div className="text-white text-sm font-bold text-center">{lastBonus.text}</div>
                </div>
              </div>
            )}
            
            {floatingTexts.map(ft => (
              <FloatingText key={ft.id} {...ft} />
            ))}
          </div>
        </div>

        {/* Input Controls Section */}
        <aside className="w-full lg:w-80 xl:w-96 flex flex-col justify-end shrink-0">
          <div className="bg-theme-panel/40 p-3 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-theme-border shadow-2xl">
            <div className="grid grid-cols-3 gap-1.5 md:gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'DEL', 0].map(key => (
                <button
                  key={key}
                  onClick={() => handleInput(key.toString())}
                  className={`h-10 md:h-16 lg:h-20 rounded-lg md:rounded-2xl text-lg md:text-2xl font-display transition-all active:scale-95 shadow-lg border-b-4 ${
                    key === 'DEL' 
                    ? 'bg-brand-danger/20 text-brand-danger border-brand-danger/30' 
                    : 'bg-theme-panel text-theme-text border-theme-border hover:bg-theme-panel/80'
                  }`}
                >
                  {key === 'DEL' ? <Icons.Trash className="w-4 h-4 md:w-6 h-6 mx-auto" /> : key}
                </button>
              ))}
              <button
                onClick={() => handleInput('ENTER')}
                className="h-10 md:h-16 lg:h-20 bg-theme-accent rounded-lg md:rounded-2xl text-white text-lg md:text-2xl font-display active:scale-95 shadow-lg border-b-4 border-theme-accent/60"
              >
                GO
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Start Overlay */}
      {gameState === 'ready' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-theme-bg/90 backdrop-blur-xl">
          <div className="text-8xl md:text-9xl font-display text-theme-text animate-pop">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameArena;
