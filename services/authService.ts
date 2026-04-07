import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  applyActionCode,
  sendPasswordResetEmail,
  updateProfile as FirebaseUpdateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User, UserProfile, UserSubscription, SubscriptionTier, Profile, Settings, CampaignOp, ArcadeMode } from '../types';
import { getFirebaseAuth, getFirebaseDb, initializeFirebase, isFirebaseConfigured } from './firebase';

const USE_FIREBASE = true;

const STORAGE_KEYS = {
  USER: 'mathlab_user',
  PROFILE: 'mathlab_profile',
  SESSION: 'mathlab_session',
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getDefaultSubscription = (): UserSubscription => ({
  tier: SubscriptionTier.FREE,
  expiresAt: null,
  startedAt: null,
  autoRenew: false,
});

const getDefaultSettings = (): Settings => ({
  timerMode: 'time_60' as any,
  practiceDifficulty: 'medium' as any,
  theme: 'simulation' as any,
  language: 'en' as any,
});

const getDefaultStats = () => ({
  zenLevels: 0,
  totalGamesPlayed: 0,
  totalCorrectAnswers: 0,
  totalQuestionsAnswered: 0,
  longestStreak: 0,
  fastestTime: 0,
});

const getDefaultCampaign = (): Record<CampaignOp, number> => ({
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
});

const getDefaultArcade = (): Record<ArcadeMode, number> => ({
  [ArcadeMode.SCORE_ATTACK]: 0,
  [ArcadeMode.ENDLESS]: 0,
  [ArcadeMode.DUEL]: 0,
  [ArcadeMode.FLASH]: 0,
  [ArcadeMode.MARATHON]: 0,
});

export const createDefaultProfile = (userId: string, name: string): UserProfile => ({
  userId,
  name,
  avatarShape: 'circle',
  avatarColor: '#3B82F6',
  campaign: getDefaultCampaign(),
  arcade: getDefaultArcade(),
  unlockedAchievements: [],
  stats: getDefaultStats(),
  streaks: {
    current: 0,
    longest: 0,
    lastPlayedDate: '',
  },
  settings: getDefaultSettings(),
  subscription: getDefaultSubscription(),
});

export const convertLegacyProfile = (legacy: Profile, userId: string, name: string): UserProfile => ({
  userId,
  name,
  avatarShape: legacy.avatarShape,
  avatarColor: legacy.avatarColor,
  campaign: { ...getDefaultCampaign(), ...legacy.campaign },
  arcade: { ...getDefaultArcade(), ...legacy.arcade },
  unlockedAchievements: legacy.unlockedAchievements,
  stats: { ...getDefaultStats(), zenLevels: legacy.stats.zenLevels },
  streaks: {
    current: 0,
    longest: 0,
    lastPlayedDate: '',
  },
  settings: getDefaultSettings(),
  subscription: getDefaultSubscription(),
});

const mapFirebaseUserToUser = (firebaseUser: FirebaseUser, displayName?: string): User => ({
  id: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: displayName || firebaseUser.displayName || 'Player',
  avatarUrl: firebaseUser.photoURL || undefined,
  emailVerified: firebaseUser.emailVerified,
  createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime).getTime() : Date.now(),
  lastLoginAt: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime).getTime() : Date.now(),
});

const saveToLocalStorage = (user: User, profile: UserProfile) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ 
    userId: user.id, 
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 
  }));
};

const clearLocalStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
};

const getStoredUser = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
  } catch {
    return null;
  }
};

const getStoredProfile = (): UserProfile | null => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || 'null');
  } catch {
    return null;
  }
};

const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const db = getFirebaseDb();
    const profileDoc = await getDoc(doc(db, 'users', userId));
    
    if (profileDoc.exists()) {
      return profileDoc.data() as UserProfile;
    }
    return null;
  } catch {
    return getStoredProfile();
  }
};

const getUsersList = (): Array<{ id: string; email: string; passwordHash: string }> => {
  try {
    return JSON.parse(localStorage.getItem('mathlab_users') || '[]');
  } catch {
    return [];
  }
};

const saveUsersList = (users: Array<{ id: string; email: string; passwordHash: string }>) => {
  localStorage.setItem('mathlab_users', JSON.stringify(users));
};

export const authService = {
  async register(email: string, password: string, displayName: string): Promise<{ user: User; profile: UserProfile }> {
    const normalizedEmail = email.toLowerCase().trim();
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    if (!displayName.trim()) {
      throw new Error('Please enter your name');
    }
    
    if (displayName.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    
    const { auth, db } = initializeFirebase();
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      if (displayName.trim()) {
        await FirebaseUpdateProfile(firebaseUser, { displayName: displayName.trim() });
      }
      
      const userId = firebaseUser.uid;
      const profile = createDefaultProfile(userId, displayName.trim());
      
      try {
        console.log('Saving profile to Firestore for user:', userId);
        await setDoc(doc(db, 'users', userId), {
          ...profile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log('Profile saved to Firestore successfully!');
      } catch (firestoreError) {
        console.error('Firestore write failed:', firestoreError);
      }
      
      const user = mapFirebaseUserToUser(firebaseUser, displayName.trim());
      
      saveToLocalStorage(user, profile);
      
      return { user, profile };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak');
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  async login(email: string, password: string): Promise<{ user: User; profile: UserProfile }> {
    const normalizedEmail = email.toLowerCase().trim();
    
    const { auth, db } = initializeFirebase();
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const user = mapFirebaseUserToUser(firebaseUser);
      
      let profile = null;
      try {
        profile = await fetchUserProfile(firebaseUser.uid);
      } catch (e) {
        console.log('No existing profile in Firestore');
      }
      
      if (!profile) {
        profile = createDefaultProfile(firebaseUser.uid, user.displayName);
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...profile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.log('Could not save to Firestore');
        }
      }
      
      profile = { ...profile, userId: firebaseUser.uid };
      
      saveToLocalStorage(user, profile);
      
      return { user, profile };
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      }
      if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled');
      }
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      }
      if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      }
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  },

  async logout(): Promise<void> {
    try {
      const { auth } = initializeFirebase();
      await signOut(auth);
    } catch (error) {
      console.warn('Firebase logout failed:', error);
    } finally {
      clearLocalStorage();
    }
  },

  async getCurrentSession(): Promise<{ user: User; profile: UserProfile } | null> {
    try {
      const { auth } = initializeFirebase();
      
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          unsubscribe();
          
          if (!firebaseUser) {
            clearLocalStorage();
            resolve(null);
            return;
          }
          
          const storedUser = getStoredUser();
          const storedProfile = getStoredProfile();
          
          if (storedUser && storedProfile && storedUser.id === firebaseUser.uid) {
            resolve({ user: storedUser, profile: storedProfile });
            return;
          }
          
          const user = mapFirebaseUserToUser(firebaseUser);
          let profile = await fetchUserProfile(firebaseUser.uid);
          
          if (!profile) {
            profile = createDefaultProfile(firebaseUser.uid, user.displayName);
          }
          
          profile = {
            ...profile,
            userId: firebaseUser.uid,
          };
          
          saveToLocalStorage(user, profile);
          
          resolve({ user, profile });
        });
      });
    } catch {
      const storedUser = getStoredUser();
      const storedProfile = getStoredProfile();
      
      if (storedUser && storedProfile) {
        return { user: storedUser, profile: storedProfile };
      }
      
      return null;
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentProfile = getStoredProfile();
    
    if (!currentProfile) {
      throw new Error('No active session');
    }
    
    const updatedProfile = { ...currentProfile, ...updates };
    
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, 'users', currentProfile.userId), {
        ...updatedProfile,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (firestoreError) {
      console.warn('Firestore update failed:', firestoreError);
    }
    
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
    
    return updatedProfile;
  },

  async updateUser(updates: Partial<User>): Promise<User> {
    const currentUser = getStoredUser();
    
    if (!currentUser) {
      throw new Error('No active session');
    }
    
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    
    return updatedUser;
  },

  isSessionValid(): boolean {
    try {
      const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
      return session && session.expiresAt > Date.now();
    } catch {
      return false;
    }
  },

  migrateFromLegacy(): { user: User; profile: UserProfile } | null {
    try {
      const legacyProfile = localStorage.getItem('math_profile');
      if (legacyProfile) {
        const parsed = JSON.parse(legacyProfile);
        if (!parsed.name) return null;
        
        const userId = generateId();
        const user: User = {
          id: userId,
          email: 'local@mathlab.app',
          displayName: parsed.name || 'Player',
          emailVerified: true,
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
        };
        const profile = convertLegacyProfile(parsed, userId, parsed.name || 'Player');
        
        saveToLocalStorage(user, profile);
        
        localStorage.removeItem('math_profile');
        
        return { user, profile };
      }
      return null;
    } catch {
      return null;
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { auth } = initializeFirebase();
    const currentUser = auth.currentUser;
    
    if (!currentUser || !currentUser.email) {
      throw new Error('No active session');
    }
    
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }
    
    try {
      await signInWithEmailAndPassword(auth, currentUser.email, currentPassword);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      }
      throw error;
    }
  },

  async deleteAccount(password: string): Promise<void> {
    const { auth } = initializeFirebase();
    const currentUser = auth.currentUser;
    
    if (!currentUser || !currentUser.email) {
      throw new Error('No active session');
    }
    
    try {
      await signInWithEmailAndPassword(auth, currentUser.email, password);
      await currentUser.delete();
      clearLocalStorage();
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      }
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Please log in again before deleting your account');
      }
      throw error;
    }
  },

  async sendVerificationEmail(): Promise<void> {
    const { auth } = initializeFirebase();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No active session');
    }
    
    if (currentUser.emailVerified) {
      throw new Error('Email is already verified');
    }
    
    try {
      await sendEmailVerification(currentUser);
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error('Failed to send verification email. Please try again.');
    }
  },

  async verifyEmail(actionCode: string): Promise<void> {
    const { auth } = initializeFirebase();
    
    try {
      await applyActionCode(auth, actionCode);
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.reload();
      }
    } catch (error: any) {
      if (error.code === 'auth/invalid-action-code') {
        throw new Error('Invalid or expired verification link');
      }
      throw new Error('Email verification failed. Please try again.');
    }
  },

  async sendPasswordResetEmail(email: string): Promise<void> {
    const { auth } = initializeFirebase();
    
    if (!email) {
      throw new Error('Email is required');
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return;
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      }
      throw new Error('Failed to send password reset email. Please try again.');
    }
  },

  async checkEmailVerified(): Promise<boolean> {
    const { auth } = initializeFirebase();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return false;
    }
    
    await currentUser.reload();
    return currentUser.emailVerified;
  },
};

export default authService;