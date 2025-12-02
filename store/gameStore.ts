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

export type ResearchItem = {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  maxLevel: number;
  multiplierPerLevel: number;
  currentLevel: number;
};

export type AngelUpgrade = {
  id: string;
  name: string;
  description: string;
  cost: number;
  effectType: 'profit_mult' | 'cost_disc' | 'time_warp';
  value: number;
};

export type GameStats = {
  totalTaps: number;
  totalBizUpgrades: number;
  totalEarnings: number;
  startTime: number;
};

// --- DATA DEFINITIONS ---
export const ANGEL_UPGRADES: AngelUpgrade[] = [
  { id: 'au_1', name: 'Heavenly Chips', description: 'All Profit x3', cost: 10, effectType: 'profit_mult', value: 3 },
  { id: 'au_2', name: 'Divine Discount', description: 'Upgrade Cost -10%', cost: 50, effectType: 'cost_disc', value: 0.1 },
  { id: 'au_3', name: 'Angel Wings', description: 'All Profit x5', cost: 500, effectType: 'profit_mult', value: 5 },
  { id: 'au_4', name: 'Time Mastery', description: 'Time Warp Effect +50%', cost: 2000, effectType: 'time_warp', value: 0.5 },
  { id: 'au_5', name: 'God Mode', description: 'All Profit x10', cost: 10000, effectType: 'profit_mult', value: 10 },
];

export type GameEvent = {
  id: string;
  name: string;
  multiplier: number;
  duration: number;
  startTime?: number;
};

const POSSIBLE_EVENTS: GameEvent[] = [
  { id: 'viral_marketing', name: '🔥 Viral Marketing', multiplier: 3, duration: 30 },
  { id: 'market_boom', name: '📈 Market Boom', multiplier: 5, duration: 15 },
  { id: 'investor_visit', name: '👼 Angel Investor Visit', multiplier: 2, duration: 60 },
];

export const ACHIEVEMENT_DEFS = [
    { id: 'tap_100', title: 'Finger Warmup', description: 'Tap 100 times', target: 100, reward: 10, type: 'taps' },
    { id: 'earn_1m', title: 'Millionaire', description: 'Earn $1 Million lifetime', target: 1000000, reward: 50, type: 'money' },
    { id: 'investor_1', title: 'Sellout', description: 'Perform 1 Prestige', target: 1, reward: 100, type: 'investors' },
];

const INITIAL_BUSINESSES: Business[] = [
  { id: 'lemonade', name: 'Lemonade Stand', baseCost: 100, baseRevenue: 10, level: 0, unlockCost: 0, owned: true },
  { id: 'bakery', name: 'Bakery', baseCost: 500, baseRevenue: 50, level: 0, unlockCost: 500, owned: false },
  { id: 'tech_startup', name: 'Tech Startup', baseCost: 10000, baseRevenue: 1000, level: 0, unlockCost: 10000, owned: false },
  { id: 'crypto_farm', name: 'Crypto Farm', baseCost: 1000000, baseRevenue: 8500, level: 0, unlockCost: 1000000, owned: false },
  { id: 'space_agency', name: 'Space Agency', baseCost: 500000000, baseRevenue: 120000, level: 0, unlockCost: 500000000, owned: false },
  { id: 'ai_core', name: 'AI Overlord', baseCost: 100000000000, baseRevenue: 5000000, level: 0, unlockCost: 100000000000, owned: false },
];

const INITIAL_MANAGERS: Manager[] = [
  { id: 'mgr_lemon', name: 'Kid Neighbor', description: 'x2 Lemonade Revenue', cost: 1000, businessId: 'lemonade', multiplier: 2, hired: false },
  { id: 'mgr_bakery', name: 'Grandma', description: 'x3 Bakery Revenue', cost: 5000, businessId: 'bakery', multiplier: 3, hired: false },
  { id: 'mgr_tech', name: 'Elon M.', description: 'x5 Startup Revenue', cost: 50000, businessId: 'tech_startup', multiplier: 5, hired: false },
  { id: 'mgr_crypto', name: 'Satoshi', description: 'x8 Crypto Revenue', cost: 5000000, businessId: 'crypto_farm', multiplier: 8, hired: false },
  { id: 'mgr_space', name: 'Starman', description: 'x10 Space Revenue', cost: 2000000000, businessId: 'space_agency', multiplier: 10, hired: false },
  { id: 'mgr_ai', name: 'Skynet', description: 'x20 AI Revenue', cost: 500000000000, businessId: 'ai_core', multiplier: 20, hired: false },
];

const INITIAL_RESEARCH: ResearchItem[] = [
  { id: 'res_marketing', name: 'Marketing 101', description: 'Global Profit +10%', baseCost: 50000, maxLevel: 10, multiplierPerLevel: 0.1, currentLevel: 0 },
  { id: 'res_efficiency', name: 'Process Optimization', description: 'Global Profit +25%', baseCost: 250000, maxLevel: 5, multiplierPerLevel: 0.25, currentLevel: 0 },
];

interface GameState {
  money: number;
  gems: number;
  investors: number;
  lifetimeEarnings: number;
  businesses: Business[];
  managers: Manager[];
  research: ResearchItem[];
  stats: GameStats;
  claimedAchievements: string[];
  lastLogin: number;
  lastDailyReward: number;
  settings: { sfx: boolean; haptics: boolean };
  
  // New States
  activeEvent: GameEvent | null;
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  angelUpgrades: string[]; // ID upgrade yang sudah dibeli

  // Actions
  addMoney: (amount: number) => void;
  addGems: (amount: number) => void;
  registerTap: () => void;
  buyBusiness: (id: string) => void;
  upgradeBusiness: (id: string) => void;
  hireManager: (managerId: string) => void;
  buyResearch: (researchId: string) => void;
  buyAngelUpgrade: (id: string) => void; // NEW
  
  toggleSfx: () => void;
  toggleHaptics: () => void;
  
  triggerRandomEvent: () => void;
  clearEvent: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  hideToast: () => void;

  getGlobalMultiplier: () => number;
  calculateOfflineEarnings: () => number;
  claimDailyReward: () => boolean;
  buyTimeWarp: (hours: number, cost: number) => void;
  claimAchievement: (id: string) => void;
  prestige: () => void;
  hydrateFromCloud: (cloudData: any) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // ... Initial State ...
      money: 0,
      gems: 50,
      investors: 0,
      lifetimeEarnings: 0,
      businesses: INITIAL_BUSINESSES,
      managers: INITIAL_MANAGERS,
      research: INITIAL_RESEARCH,
      stats: { totalTaps: 0, totalBizUpgrades: 0, totalEarnings: 0, startTime: Date.now() },
      claimedAchievements: [],
      lastLogin: Date.now(),
      lastDailyReward: 0,
      settings: { sfx: true, haptics: true },
      activeEvent: null,
      toast: null,
      angelUpgrades: [], // Init empty

      // --- HELPER MULTIPLIER (UPDATED WITH ANGEL UPGRADES) ---
      getGlobalMultiplier: () => {
        const state = get();
        // 1. Investor Bonus (+2% per investor)
        const investorMult = 1 + (state.investors * 0.02);
        
        // 2. Research Bonus
        let researchMult = 1;
        state.research.forEach(r => {
            researchMult += (r.currentLevel * r.multiplierPerLevel);
        });

        // 3. Event Bonus
        const eventMult = state.activeEvent ? state.activeEvent.multiplier : 1;

        // 4. Angel Upgrade Bonus (Profit Multiplier)
        let angelMult = 1;
        state.angelUpgrades.forEach(id => {
            const upgrade = ANGEL_UPGRADES.find(u => u.id === id);
            if (upgrade && upgrade.effectType === 'profit_mult') {
                angelMult *= upgrade.value; // Compound!
            }
        });

        return investorMult * researchMult * eventMult * angelMult;
      },

      buyAngelUpgrade: (id) => set((state) => {
        if (state.angelUpgrades.includes(id)) return state;
        const upgrade = ANGEL_UPGRADES.find(u => u.id === id);
        if (!upgrade) return state;

        if (state.investors >= upgrade.cost) {
            triggerHaptic('success');
            return {
                investors: state.investors - upgrade.cost, // Spend Investors!
                angelUpgrades: [...state.angelUpgrades, id]
            };
        }
        return state;
      }),

      // ... (Standard Actions) ...
      addMoney: (amount) => set((state) => ({ 
        money: state.money + amount,
        lifetimeEarnings: state.lifetimeEarnings + amount,
        stats: { ...state.stats, totalEarnings: state.stats.totalEarnings + amount }
      })),
      addGems: (amount) => set((state) => ({ gems: state.gems + amount })),
      registerTap: () => set((state) => ({ stats: { ...state.stats, totalTaps: state.stats.totalTaps + 1 } })),
      
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
        
        // Calculate Base Cost
        let cost = Math.floor(biz.baseCost * Math.pow(1.15, biz.level));
        
        // Apply Angel Discount (Cost Reduction)
        let discount = 0;
        state.angelUpgrades.forEach(uid => {
            const upg = ANGEL_UPGRADES.find(u => u.id === uid);
            if (upg && upg.effectType === 'cost_disc') discount += upg.value;
        });
        
        // Cap max discount (misal max 50%)
        const finalDiscount = Math.min(discount, 0.5);
        cost = Math.floor(cost * (1 - finalDiscount)); 

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

      buyResearch: (researchId) => set((state) => {
        const resIndex = state.research.findIndex(r => r.id === researchId);
        const item = state.research[resIndex];
        const cost = Math.floor(item.baseCost * Math.pow(2, item.currentLevel));
        if (state.money >= cost && item.currentLevel < item.maxLevel) {
            triggerHaptic('success');
            const newResearch = [...state.research];
            newResearch[resIndex] = { ...item, currentLevel: item.currentLevel + 1 };
            return { money: state.money - cost, research: newResearch };
        }
        return state;
      }),

      toggleSfx: () => set((state) => ({ settings: { ...state.settings, sfx: !state.settings.sfx } })),
      toggleHaptics: () => {
        const state = get();
        const newVal = !state.settings.haptics;
        if (newVal) triggerHaptic('light'); 
        set({ settings: { ...state.settings, haptics: newVal } });
      },

      triggerRandomEvent: () => {
        const state = get();
        if (state.activeEvent) return;
        const randomIdx = Math.floor(Math.random() * POSSIBLE_EVENTS.length);
        const event = POSSIBLE_EVENTS[randomIdx];
        set({ activeEvent: { ...event, startTime: Date.now() } });
        get().showToast(`${event.name} Active! (x${event.multiplier})`, 'warning');
        triggerHaptic('success');
      },
      clearEvent: () => set({ activeEvent: null }),
      showToast: (message, type = 'info') => {
        set({ toast: { message, type } });
        setTimeout(() => { set({ toast: null }); }, 3000);
      },
      hideToast: () => set({ toast: null }),

      calculateOfflineEarnings: () => {
        const now = Date.now();
        const state = get();
        const timeDiffSeconds = (now - state.lastLogin) / 1000;
        if (timeDiffSeconds < 5) { set({ lastLogin: now }); return 0; }
        let incomePerSec = 0;
        state.businesses.forEach(b => {
          if (b.owned) {
             const mgr = state.managers.find(m => m.businessId === b.id && m.hired);
             const managerMult = mgr ? mgr.multiplier : 1;
             incomePerSec += (b.baseRevenue * b.level * managerMult);
          }
        });
        incomePerSec = incomePerSec * state.getGlobalMultiplier();
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
              state.businesses.forEach(b => {
                if (b.owned) {
                    const mgr = state.managers.find(m => m.businessId === b.id && m.hired);
                    const managerMult = mgr ? mgr.multiplier : 1;
                    incomePerSec += (b.baseRevenue * b.level * managerMult);
                }
              });
              
              // Apply Angel Time Warp Bonus
              let warpBonus = 0;
              state.angelUpgrades.forEach(id => {
                  const u = ANGEL_UPGRADES.find(au => au.id === id);
                  if(u?.effectType === 'time_warp') warpBonus += u.value;
              });

              incomePerSec = incomePerSec * state.getGlobalMultiplier();
              const instantCash = incomePerSec * 3600 * hours * (1 + warpBonus); // Apply Bonus
              
              triggerHaptic('heavy');
              set({ gems: state.gems - cost, money: state.money + instantCash, lifetimeEarnings: state.lifetimeEarnings + instantCash });
              get().showToast(`Time Warp Active: +$${Math.floor(instantCash)}`, 'success');
          }
      },

      claimAchievement: (id) => set((state) => {
          if (state.claimedAchievements.includes(id)) return state;
          const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
          if (!def) return state;
          let completed = false;
          if (def.type === 'taps' && state.stats.totalTaps >= def.target) completed = true;
          if (def.type === 'money' && state.lifetimeEarnings >= def.target) completed = true;
          if (def.type === 'investors' && state.investors >= def.target) completed = true;
          if (completed) {
              triggerHaptic('success');
              get().showToast(`Achievement Unlocked: ${def.title}`, 'success');
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
            research: INITIAL_RESEARCH,
            lastLogin: Date.now(),
            gems: state.gems + 100,
            activeEvent: null,
            // Angel Upgrades & Stats are PERMANENT
        };
      }),

      hydrateFromCloud: (cloudData: any) => {
        set((state) => ({
            money: Math.max(cloudData.balance || 0, state.money),
            gems: cloudData.gems || state.gems,
            investors: cloudData.investors || state.investors,
            lastDailyReward: cloudData.last_daily_reward || state.lastDailyReward,
            stats: cloudData.game_stats ? { ...state.stats, ...cloudData.game_stats } : state.stats,
            claimedAchievements: cloudData.claimed_achievements || state.claimedAchievements,
            angelUpgrades: cloudData.angel_upgrades || state.angelUpgrades
        }));
      }
    }),
    {
      name: 'tycoon-storage-v12-angels',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);