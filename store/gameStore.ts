import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { triggerHaptic } from '../utils/haptics';

// --- Types ---
export type Business = {
  id: string;
  name: string;
  baseCost: number;
  baseRevenue: number;
  level: number;
  unlockCost: number;
  owned: boolean;
};

export type Manager = {
  id: string;
  name: string;
  description: string;
  cost: number;
  businessId: string;
  multiplier: number;
  hired: boolean;
};

export type GameStats = {
  totalTaps: number;
  totalBizUpgrades: number;
  totalEarnings: number; // Sama dengan lifetimeEarnings tapi disimpan di obj stats biar rapi
  startTime: number;
};

// Definisi Achievement (Static)
export const ACHIEVEMENT_DEFS = [
    { id: 'tap_100', title: 'Finger Warmup', description: 'Tap 100 times', target: 100, reward: 10, type: 'taps' },
    { id: 'tap_1000', title: 'Cardio Finger', description: 'Tap 1,000 times', target: 1000, reward: 50, type: 'taps' },
    { id: 'earn_1m', title: 'Millionaire', description: 'Earn $1 Million lifetime', target: 1000000, reward: 50, type: 'money' },
    { id: 'upgrade_50', title: 'Builder', description: '50 Business Upgrades', target: 50, reward: 20, type: 'upgrades' },
    { id: 'investor_1', title: 'Sellout', description: 'Perform 1 Prestige', target: 1, reward: 100, type: 'investors' },
];

interface GameState {
  money: number;
  gems: number;
  investors: number;
  lifetimeEarnings: number;
  
  businesses: Business[];
  managers: Manager[];
  
  // --- NEW STATES ---
  stats: GameStats; 
  claimedAchievements: string[]; // List ID achievement yang sudah diclaim

  lastLogin: number;
  lastDailyReward: number;
  
  // Actions
  addMoney: (amount: number) => void;
  addGems: (amount: number) => void;
  registerTap: () => void; // Track Taps
  
  buyBusiness: (businessId: string) => void;
  upgradeBusiness: (businessId: string) => void;
  hireManager: (managerId: string) => void;
  
  calculateOfflineEarnings: () => number;
  claimDailyReward: () => boolean;
  buyTimeWarp: (hours: number, cost: number) => void;
  
  claimAchievement: (id: string) => void; // Claim reward
  
  prestige: () => void;
  hydrateFromCloud: (cloudData: any) => void;
}

// --- CONFIG: BUSINESSES (NEW TIERS ADDED) ---
const INITIAL_BUSINESSES: Business[] = [
  { id: 'lemonade', name: 'Lemonade Stand', baseCost: 100, baseRevenue: 10, level: 0, unlockCost: 0, owned: true },
  { id: 'bakery', name: 'Bakery', baseCost: 500, baseRevenue: 50, level: 0, unlockCost: 500, owned: false },
  { id: 'tech_startup', name: 'Tech Startup', baseCost: 10000, baseRevenue: 1000, level: 0, unlockCost: 10000, owned: false },
  
  // High Tier
  { id: 'crypto_farm', name: 'Crypto Farm', baseCost: 1000000, baseRevenue: 8500, level: 0, unlockCost: 1000000, owned: false }, // 1M
  { id: 'space_agency', name: 'Space Agency', baseCost: 500000000, baseRevenue: 120000, level: 0, unlockCost: 500000000, owned: false }, // 500M
  { id: 'ai_core', name: 'AI Overlord', baseCost: 100000000000, baseRevenue: 5000000, level: 0, unlockCost: 100000000000, owned: false }, // 100B
];

// --- CONFIG: MANAGERS (NEW TIERS ADDED) ---
const INITIAL_MANAGERS: Manager[] = [
  { id: 'mgr_lemon', name: 'Kid Neighbor', description: 'x2 Lemonade Revenue', cost: 1000, businessId: 'lemonade', multiplier: 2, hired: false },
  { id: 'mgr_bakery', name: 'Grandma', description: 'x3 Bakery Revenue', cost: 5000, businessId: 'bakery', multiplier: 3, hired: false },
  { id: 'mgr_tech', name: 'Elon M.', description: 'x5 Startup Revenue', cost: 50000, businessId: 'tech_startup', multiplier: 5, hired: false },
  
  // High Tier
  { id: 'mgr_crypto', name: 'Satoshi', description: 'x8 Crypto Revenue', cost: 5000000, businessId: 'crypto_farm', multiplier: 8, hired: false },
  { id: 'mgr_space', name: 'Starman', description: 'x10 Space Revenue', cost: 2000000000, businessId: 'space_agency', multiplier: 10, hired: false },
  { id: 'mgr_ai', name: 'Skynet', description: 'x20 AI Revenue', cost: 500000000000, businessId: 'ai_core', multiplier: 20, hired: false },
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      money: 0,
      gems: 50,
      investors: 0, 
      lifetimeEarnings: 0,
      businesses: INITIAL_BUSINESSES,
      managers: INITIAL_MANAGERS,
      
      // Init Stats & Achievements
      stats: { totalTaps: 0, totalBizUpgrades: 0, totalEarnings: 0, startTime: Date.now() },
      claimedAchievements: [],

      lastLogin: Date.now(),
      lastDailyReward: 0,

      addMoney: (amount) => set((state) => ({ 
        money: state.money + amount,
        lifetimeEarnings: state.lifetimeEarnings + amount,
        stats: { ...state.stats, totalEarnings: state.stats.totalEarnings + amount }
      })),

      addGems: (amount) => set((state) => ({ gems: state.gems + amount })),

      registerTap: () => set((state) => ({
          stats: { ...state.stats, totalTaps: state.stats.totalTaps + 1 }
      })),

      buyBusiness: (id) => set((state) => {
        const bizIndex = state.businesses.findIndex((b) => b.id === id);
        const biz = state.businesses[bizIndex];
        if (state.money >= biz.unlockCost && !biz.owned) {
          triggerHaptic('success');
          const newBiz = [...state.businesses];
          newBiz[bizIndex] = { ...biz, owned: true, level: 1 };
          return { money: state.money - biz.unlockCost, businesses: newBiz };
        }
        return state;
      }),

      upgradeBusiness: (id) => set((state) => {
        const bizIndex = state.businesses.findIndex((b) => b.id === id);
        const biz = state.businesses[bizIndex];
        const cost = Math.floor(biz.baseCost * Math.pow(1.15, biz.level));

        if (state.money >= cost && biz.owned) {
          triggerHaptic('light');
          const newLevel = biz.level + 1;
          let newBaseRevenue = biz.baseRevenue;
          const milestones = [25, 50, 100, 200, 300, 400, 500, 1000];
          
          if (milestones.includes(newLevel)) {
             newBaseRevenue = newBaseRevenue * 2; 
             triggerHaptic('success'); 
          }

          const newBizs = [...state.businesses];
          newBizs[bizIndex] = { ...biz, level: newLevel, baseRevenue: newBaseRevenue };
          
          return { 
              money: state.money - cost, 
              businesses: newBizs,
              stats: { ...state.stats, totalBizUpgrades: state.stats.totalBizUpgrades + 1 } 
          };
        }
        return state;
      }),

      hireManager: (managerId) => set((state) => {
        const mgrIndex = state.managers.findIndex(m => m.id === managerId);
        const mgr = state.managers[mgrIndex];
        if (state.money >= mgr.cost && !mgr.hired) {
            triggerHaptic('heavy');
            const newMgrs = [...state.managers];
            newMgrs[mgrIndex] = { ...mgr, hired: true };
            return { money: state.money - mgr.cost, managers: newMgrs };
        }
        return state;
      }),

      calculateOfflineEarnings: () => {
        const now = Date.now();
        const state = get();
        const timeDiffSeconds = (now - state.lastLogin) / 1000;
        if (timeDiffSeconds < 5) { set({ lastLogin: now }); return 0; }

        let incomePerSec = 0;
        const investorMultiplier = 1 + (state.investors * 0.02);
        state.businesses.forEach(b => {
          if (b.owned) {
             const mgr = state.managers.find(m => m.businessId === b.id && m.hired);
             const managerMult = mgr ? mgr.multiplier : 1;
             incomePerSec += (b.baseRevenue * b.level * managerMult);
          }
        });
        incomePerSec = incomePerSec * investorMultiplier;
        const earnings = Math.floor(incomePerSec * timeDiffSeconds);
        set({ lastLogin: now, money: state.money + earnings, lifetimeEarnings: state.lifetimeEarnings + earnings });
        return earnings;
      },

      claimDailyReward: () => {
          const now = Date.now();
          const state = get();
          const oneDay = 24 * 60 * 60 * 1000;
          if (now - state.lastDailyReward >= oneDay) {
              set({ gems: state.gems + 50, lastDailyReward: now });
              return true;
          }
          return false;
      },

      buyTimeWarp: (hours, cost) => {
          const state = get();
          if (state.gems >= cost) {
              let incomePerSec = 0;
              const investorMultiplier = 1 + (state.investors * 0.02);
              state.businesses.forEach(b => {
                if (b.owned) {
                    const mgr = state.managers.find(m => m.businessId === b.id && m.hired);
                    const managerMult = mgr ? mgr.multiplier : 1;
                    incomePerSec += (b.baseRevenue * b.level * managerMult);
                }
              });
              incomePerSec = incomePerSec * investorMultiplier;
              const instantCash = incomePerSec * 3600 * hours;
              triggerHaptic('heavy');
              set({ gems: state.gems - cost, money: state.money + instantCash, lifetimeEarnings: state.lifetimeEarnings + instantCash });
          }
      },

      claimAchievement: (id) => set((state) => {
          if (state.claimedAchievements.includes(id)) return state;

          const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
          if (!def) return state;

          // Cek kondisi
          let completed = false;
          if (def.type === 'taps' && state.stats.totalTaps >= def.target) completed = true;
          if (def.type === 'money' && state.lifetimeEarnings >= def.target) completed = true;
          if (def.type === 'upgrades' && state.stats.totalBizUpgrades >= def.target) completed = true;
          if (def.type === 'investors' && state.investors >= def.target) completed = true;

          if (completed) {
              triggerHaptic('success');
              return {
                  gems: state.gems + def.reward,
                  claimedAchievements: [...state.claimedAchievements, id]
              };
          }
          return state;
      }),

      prestige: () => set((state) => {
        const potentialInvestors = Math.floor(Math.sqrt(state.lifetimeEarnings / 10000));
        const newInvestorsClaimed = potentialInvestors - state.investors;
        if (newInvestorsClaimed <= 0) return state;

        triggerHaptic('success');
        return {
            money: 0,
            lifetimeEarnings: 0,
            investors: state.investors + newInvestorsClaimed,
            businesses: INITIAL_BUSINESSES,
            managers: INITIAL_MANAGERS,
            lastLogin: Date.now(),
            gems: state.gems + 100,
            // Keep stats permanent
        };
      }),

      hydrateFromCloud: (cloudData: any) => {
        set((state) => ({
            money: cloudData.balance > state.money ? cloudData.balance : state.money,
            gems: cloudData.gems || state.gems,
            investors: cloudData.investors || state.investors,
            lastDailyReward: cloudData.last_daily_reward || state.lastDailyReward,
            // Load Stats & Achievements
            stats: cloudData.game_stats ? { ...state.stats, ...cloudData.game_stats } : state.stats,
            claimedAchievements: cloudData.claimed_achievements || state.claimedAchievements
        }));
      }
    }),
    {
      name: 'tycoon-storage-v7', // Bump Version!
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);