
import React from 'react';

export enum GameScreen {
  SPLASH = 'splash',
  CHARACTER_BUILDER = 'character_builder',
  DASHBOARD = 'dashboard',
  LEVEL_MAP = 'level_map',
  GAME = 'game',
  RESULT = 'result',
  CALCULATOR = 'calculator',
}

export enum CampaignOp {
  ADD = 'add',
  SUB = 'sub',
  MUL = 'mul',
  DIV = 'div',
  VISUAL_DOTS = 'visual_dots',
  VISUAL_TRIANGLES = 'visual_triangles',
  VISUAL_STARS = 'visual_stars',
  NUMBER_BONDS = 'number_bonds',
  GREATER_LESS = 'greater_less',
  MISSING_NUMBER = 'missing_number',
}

export enum TimerMode {
  TIME_30 = 'time_30',
  TIME_60 = 'time_60',
  TIME_90 = 'time_90',
  TIME_120 = 'time_120',
}

export enum ArcadeMode {
  SCORE_ATTACK = 'score_attack',
  ENDLESS = 'endless',
  DUEL = 'duel',
  FLASH = 'flash',
  MARATHON = 'marathon',
}

export enum PracticeDifficulty {
  EASY = 5,
  MEDIUM = 15,
  HARD = 25,
}

export interface Profile {
  name: string;
  avatarShape: string;
  avatarColor: string;
  campaign: Record<CampaignOp, number>;
  arcade: Record<ArcadeMode, number>;
  unlockedAchievements: string[];
  stats: {
    zenLevels: number;
  };
}

export enum VisualShapeType {
  DOT = 'dot',
  TRIANGLE = 'triangle',
  STAR = 'star',
}

export interface VisualShape {
  id: string;
  type: VisualShapeType;
  color: string;
  x: number;
  y: number;
  size: number;
  rotation?: number;
}

export interface MathQuestion {
  text: string;
  answer: number;
  visualQuestion?: {
    type: 'dots' | 'triangles' | 'stars';
    shapes: VisualShape[];
    text: string;
  };
}

export interface Result {
  correct: number;
  total: number;
  time: number;
  score: number;
  mode: 'campaign' | 'arcade' | 'practice';
  gameConfig?: GameConfig;
}

export enum Theme {
  SIMULATION = 'simulation',
  PAPER = 'paper',
  MIDNIGHT = 'midnight',
  FOREST = 'forest',
}

export enum Language {
  ENGLISH = 'en',
  SWAHILI = 'sw',
}

export interface Settings {
  timerMode: TimerMode;
  practiceDifficulty: PracticeDifficulty;
  theme: Theme;
  language: Language;
}

export interface CampaignData {
  id: CampaignOp;
  title: string;
  icon: React.FC<React.SVGProps<SVGSVGElement> & { filled?: boolean }>;
  color: string;
  bg: string;
  unlockLevel: number;
  unlockOp: CampaignOp | null;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: React.FC<React.SVGProps<SVGSVGElement> & { filled?: boolean }>;
}

export interface ArcadeModeConfig {
  id: ArcadeMode;
  title: string;
  desc: string;
  icon: React.FC<React.SVGProps<SVGSVGElement> & { filled?: boolean }>;
  color: string;
  bg: string;
}

export interface FloatingTextData {
  id: number;
  text: string;
  x: string;
  y: string;
  color: string;
}

export interface CalculationHistoryEntry {
  input: string;
  output: string;
  timestamp: number;
}

export type GameConfig =
  | { type: 'campaign'; op: CampaignOp; level: number }
  | { type: 'practice'; op: CampaignOp; level: number; difficulty?: PracticeDifficulty }
  | { type: 'arcade'; arcadeMode: ArcadeMode };

export type SoundType = 'click' | 'start' | 'correct' | 'wrong' | 'tick' | 'win';

export type SoundFunctions = {
  [key in SoundType]: () => void;
};

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM_MONTHLY = 'premium_monthly',
  PREMIUM_YEARLY = 'premium_yearly',
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: number;
  lastLoginAt: number;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  expiresAt: number | null;
  startedAt: number | null;
  autoRenew: boolean;
}

export interface UserProfile {
  userId: string;
  name: string;
  avatarShape: string;
  avatarColor: string;
  campaign: Record<CampaignOp, number>;
  arcade: Record<ArcadeMode, number>;
  unlockedAchievements: string[];
  stats: {
    zenLevels: number;
    totalGamesPlayed: number;
    totalCorrectAnswers: number;
    totalQuestionsAnswered: number;
    longestStreak: number;
    fastestTime: number;
  };
  streaks: {
    current: number;
    longest: number;
    lastPlayedDate: string;
  };
  settings: Settings;
  subscription: UserSubscription;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
