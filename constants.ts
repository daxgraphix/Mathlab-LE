
import { Achievement, ArcadeMode, ArcadeModeConfig, CampaignData, CampaignOp } from './types';
import { Icons } from './components/Icons';

export const CAMPAIGNS: Record<CampaignOp, CampaignData> = {
  // Visual Counting (easiest - just count shapes)
  [CampaignOp.VISUAL_DOTS]: { id: CampaignOp.VISUAL_DOTS, title: 'Count Dots', icon: Icons.Dot, color: 'text-purple-500', bg: 'bg-purple-500', unlockLevel: 0, unlockOp: null },
  [CampaignOp.VISUAL_TRIANGLES]: { id: CampaignOp.VISUAL_TRIANGLES, title: 'Count Triangles', icon: Icons.Triangle, color: 'text-cyan-500', bg: 'bg-cyan-500', unlockLevel: 0, unlockOp: null },
  [CampaignOp.VISUAL_STARS]: { id: CampaignOp.VISUAL_STARS, title: 'Count Stars', icon: Icons.Star, color: 'text-yellow-500', bg: 'bg-yellow-500', unlockLevel: 0, unlockOp: null },
  
  // Basic Number Sense (foundational skills)
  [CampaignOp.NUMBER_BONDS]: { id: CampaignOp.NUMBER_BONDS, title: 'Number Bonds', icon: Icons.Link, color: 'text-emerald-500', bg: 'bg-emerald-500', unlockLevel: 0, unlockOp: null },
  [CampaignOp.GREATER_LESS]: { id: CampaignOp.GREATER_LESS, title: 'Compare Numbers', icon: Icons.ArrowUpDown, color: 'text-orange-500', bg: 'bg-orange-500', unlockLevel: 0, unlockOp: null },
  
  // Core Operations (main math operations)
  [CampaignOp.ADD]: { id: CampaignOp.ADD, title: 'Addition', icon: Icons.Add, color: 'text-neon-blue', bg: 'bg-blue-500', unlockLevel: 0, unlockOp: null },
  [CampaignOp.SUB]: { id: CampaignOp.SUB, title: 'Subtraction', icon: Icons.Sub, color: 'text-neon-pink', bg: 'bg-pink-500', unlockLevel: 0, unlockOp: null },
  [CampaignOp.MISSING_NUMBER]: { id: CampaignOp.MISSING_NUMBER, title: 'Missing Number', icon: Icons.QuestionMark, color: 'text-rose-500', bg: 'bg-rose-500', unlockLevel: 0, unlockOp: null },
  [CampaignOp.MUL]: { id: CampaignOp.MUL, title: 'Multiplication', icon: Icons.Mul, color: 'text-neon-yellow', bg: 'bg-amber-500', unlockLevel: 0, unlockOp: null },
  [CampaignOp.DIV]: { id: CampaignOp.DIV, title: 'Division', icon: Icons.Div, color: 'text-neon-green', bg: 'bg-indigo-500', unlockLevel: 0, unlockOp: null },
};

export const ACHIEVEMENTS_DATA: Achievement[] = [
  { id: 'first_steps', title: 'First Steps', desc: 'Complete Level 1 in any Campaign', icon: Icons.Star },
  { id: 'add_master', title: 'Addition Master', desc: 'Complete all 30 Addition levels', icon: Icons.Add },
  { id: 'sub_master', title: 'Subtraction Master', desc: 'Complete all 30 Subtraction levels', icon: Icons.Sub },
  { id: 'mul_master', title: 'Multiplication Master', desc: 'Complete all 30 Multiplication levels', icon: Icons.Mul },
  { id: 'div_master', title: 'Division Master', desc: 'Complete all 30 Division levels', icon: Icons.Div },
  { id: 'speed_demon', title: 'Speed Demon', desc: 'Score over 300 in Score Attack', icon: Icons.Lightning },
  { id: 'survivor', title: 'Survivor', desc: 'Reach Round 20 in Endless Mode', icon: Icons.Heart },
  { id: 'zen_master', title: 'Zen Master', desc: 'Complete 10 levels in Zen Mode', icon: Icons.Moon },
  { id: 'marathon_runner', title: 'Marathon Runner', desc: 'Complete a Marathon session', icon: Icons.Trophy },
  { id: 'duelist', title: 'Duelist', desc: 'Win 5 Duels', icon: Icons.Sword },
  { id: 'sharp_eye', title: 'Sharp Eye', desc: 'Score 100 in Flash Mode', icon: Icons.Eye },
  { id: 'visual_perfectionist', title: 'Visual Perfectionist', desc: 'Complete 10 Visual Counting levels (Dots, Triangles, or Stars)', icon: Icons.Eye },
];


export const ARCADE_MODES_CONFIG: ArcadeModeConfig[] = [
  { id: ArcadeMode.SCORE_ATTACK, title: 'Score Attack', desc: '60s Time Rush', icon: Icons.Lightning, color: 'text-orange-500', bg: 'from-orange-400 to-red-500' },
  { id: ArcadeMode.ENDLESS, title: 'Endless Mode', desc: '3 Lives Survival', icon: Icons.Heart, color: 'text-pink-500', bg: 'from-pink-400 to-rose-500' },
  { id: ArcadeMode.DUEL, title: 'Duel Mode', desc: 'Battle vs CPU', icon: Icons.Sword, color: 'text-red-500', bg: 'from-red-500 to-rose-900' },
  { id: ArcadeMode.FLASH, title: 'Flash Mode', desc: 'Memory Test', icon: Icons.Eye, color: 'text-purple-500', bg: 'from-purple-400 to-indigo-500' },
  { id: ArcadeMode.MARATHON, title: 'Marathon', desc: 'Stamina Run', icon: Icons.Trophy, color: 'text-blue-500', bg: 'from-blue-400 to-cyan-500' }
];

export const CAMPAIGN_LEVEL_SECTIONS = [
  { range: [1, 5], labelKey: 'easySingle' },
  { range: [6, 15], labelKey: 'mediumDouble' },
  { range: [16, 25], labelKey: 'hardAdvanced' },
  { range: [26, 30], labelKey: 'masterExpert' }
];