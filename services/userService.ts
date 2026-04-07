import { UserProfile, Result, CampaignOp, ArcadeMode } from '../types';

const SYNC_KEY = 'mathlab_cloud_sync';

interface SyncData {
  lastSyncedAt: number;
  profile: UserProfile;
  results: Result[];
}

export const userService = {
  async syncToCloud(profile: UserProfile): Promise<boolean> {
    try {
      const syncData: SyncData = {
        lastSyncedAt: Date.now(),
        profile,
        results: [],
      };
      localStorage.setItem(SYNC_KEY, JSON.stringify(syncData));
      return true;
    } catch (error) {
      console.error('Cloud sync failed:', error);
      return false;
    }
  },

  async syncFromCloud(): Promise<UserProfile | null> {
    try {
      const syncData = localStorage.getItem(SYNC_KEY);
      if (!syncData) return null;
      return JSON.parse(syncData).profile;
    } catch (error) {
      console.error('Cloud sync retrieval failed:', error);
      return null;
    }
  },

  async updateGameResult(profile: UserProfile, result: Result): Promise<UserProfile> {
    const updates: Partial<UserProfile> = {
      stats: {
        ...profile.stats,
        totalGamesPlayed: profile.stats.totalGamesPlayed + 1,
        totalCorrectAnswers: profile.stats.totalCorrectAnswers + result.correct,
        totalQuestionsAnswered: profile.stats.totalQuestionsAnswered + result.total,
        longestStreak: Math.max(profile.stats.longestStreak, result.correct),
      },
    };

    if (result.mode === 'campaign' && result.gameConfig) {
      const config = result.gameConfig;
      if (config.type === 'campaign') {
        const currentLevel = profile.campaign[config.op] || 0;
        if (config.level > currentLevel) {
          updates.campaign = {
            ...profile.campaign,
            [config.op]: config.level,
          };
        }
      }
    }

    if (result.mode === 'arcade' && result.gameConfig) {
      const config = result.gameConfig;
      if (config.type === 'arcade') {
        const currentScore = profile.arcade[config.arcadeMode] || 0;
        if (result.score > currentScore) {
          updates.arcade = {
            ...profile.arcade,
            [config.arcadeMode]: result.score,
          };
        }
      }
    }

    const today = new Date().toISOString().split('T')[0];
    if (profile.streaks.lastPlayedDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = profile.streaks.lastPlayedDate === yesterday 
        ? profile.streaks.current + 1 
        : 1;
      updates.streaks = {
        current: newStreak,
        longest: Math.max(profile.streaks.longest, newStreak),
        lastPlayedDate: today,
      };
    }

    if (result.score > 0 && result.time > 0) {
      const avgTime = result.time / result.correct;
      if (!profile.stats.fastestTime || avgTime < profile.stats.fastestTime) {
        updates.stats = {
          ...updates.stats,
          fastestTime: Math.round(avgTime),
        };
      }
    }

    return { ...profile, ...updates };
  },

  async unlockAchievement(profile: UserProfile, achievementId: string): Promise<UserProfile> {
    if (profile.unlockedAchievements.includes(achievementId)) {
      return profile;
    }
    return {
      ...profile,
      unlockedAchievements: [...profile.unlockedAchievements, achievementId],
    };
  },

  async exportProfile(profile: UserProfile): Promise<string> {
    return btoa(JSON.stringify(profile));
  },

  async importProfile(encoded: string): Promise<UserProfile | null> {
    try {
      return JSON.parse(atob(encoded));
    } catch {
      return null;
    }
  },

  getLastSyncTime(): number | null {
    try {
      const syncData = localStorage.getItem(SYNC_KEY);
      if (!syncData) return null;
      return JSON.parse(syncData).lastSyncedAt;
    } catch {
      return null;
    }
  },
};

export default userService;