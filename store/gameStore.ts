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

// [UPDATE] Tambah Rarity
export type ManagerRarity = 'Common' | 'Rare' | 'Legendary';

export type WeatherType = 'SUNNY' | 'RAIN' | 'STORM' | 'GOLDEN_HOUR';

export type WeatherType = 'SUNNY' | 'RAIN' | 'STORM' | 'GOLDEN_HOUR';

export type CeoSkill = {
    id: string;
    name: string;
    description: string;
    level: number;
    maxLevel: number;
    cost: number; // Skill Points
    effectType: 'tap_bonus' | 'idle_bonus' | 'upgrade_discount';
    valuePerLevel: number;
};

export type Artifact = {
    id: string;
    name: string;
    description: string;
    owned: boolean;
    effectType: 'global_mult' | 'luck_boost';
    value: number;
    rarity: 'Common' | 'Rare' | 'Mythic';
};

export type Manager = {
  id: string;
  name: string;
  description: string;
  cost: number; // Cost sekarang hanya referensi value, hire pakai Gacha
  businessId: string;
  multiplier: number;
  hired: boolean;
  level: number;
  rarity: ManagerRarity; // Field Baru
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

export type Stock = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  previousPrice: number;
  volatility: number;
  history: number[];
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

const WEATHER_EFFECTS: Record<WeatherType, { multiplier: number, message: string }> = {
    'SUNNY': { multiplier: 1.0, message: "Cuaca cerah, bisnis berjalan normal." },
    'RAIN': { multiplier: 0.8, message: "Hujan turun, pelanggan berkurang (-20%)." },
    'STORM': { multiplier: 0.5, message: "Badai besar! Operasional terhambat (-50%)." },
    'GOLDEN_HOUR': { multiplier: 2.0, message: "GOLDEN HOUR! Semua profit x2!" },
};

const INITIAL_SKILLS: CeoSkill[] = [
    { id: 'skill_midas', name: 'Midas Touch', description: 'Increase Tap Profit', level: 0, maxLevel: 10, cost: 1, effectType: 'tap_bonus', valuePerLevel: 0.5 },
    { id: 'skill_negotiator', name: 'Silver Tongue', description: 'Cheaper Business Upgrades', level: 0, maxLevel: 5, cost: 2, effectType: 'upgrade_discount', valuePerLevel: 0.05 },
    { id: 'skill_manager', name: 'Micro Management', description: 'Boost Idle Revenue', level: 0, maxLevel: 10, cost: 1, effectType: 'idle_bonus', valuePerLevel: 0.2 },
];

const INITIAL_ARTIFACTS: Artifact[] = [
    { id: 'art_coin', name: 'Ancient Coin', description: 'Global Profit x1.5', owned: false, effectType: 'global_mult', value: 1.5, rarity: 'Rare' },
    { id: 'art_cat', name: 'Lucky Cat', description: 'Better Luck for Events', owned: false, effectType: 'luck_boost', value: 0.1, rarity: 'Mythic' },
];

const POSSIBLE_EVENTS: GameEvent[] = [
  { id: 'viral_marketing', name: '🔥 Viral Marketing', multiplier: 3, duration: 30 },
  { id: 'market_boom', name: '📈 Market Boom', multiplier: 5, duration: 20 },
  { id: 'investor_visit', name: '👼 Angel Investor Visit', multiplier: 2, duration: 60 },
  { id: 'market_crash', name: '📉 Market Correction', multiplier: 0.5, duration: 15 },
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

// [UPDATE] Managers dengan Rarity
const INITIAL_MANAGERS: Manager[] = [
  { id: 'mgr_lemon', name: 'Kid Neighbor', description: 'x2 Lemonade Revenue', cost: 1000, businessId: 'lemonade', multiplier: 2, hired: false, level: 1, rarity: 'Common' },
  { id: 'mgr_bakery', name: 'Grandma', description: 'x3 Bakery Revenue', cost: 5000, businessId: 'bakery', multiplier: 3, hired: false, level: 1, rarity: 'Common' },
  { id: 'mgr_tech', name: 'Elon M.', description: 'x10 Startup Revenue', cost: 50000, businessId: 'tech_startup', multiplier: 10, hired: false, level: 1, rarity: 'Legendary' },
  { id: 'mgr_crypto', name: 'Satoshi', description: 'x8 Crypto Revenue', cost: 5000000, businessId: 'crypto_farm', multiplier: 8, hired: false, level: 1, rarity: 'Rare' },
  { id: 'mgr_space', name: 'Starman', description: 'x15 Space Revenue', cost: 2000000000, businessId: 'space_agency', multiplier: 15, hired: false, level: 1, rarity: 'Legendary' },
  { id: 'mgr_ai', name: 'Skynet', description: 'x20 AI Revenue', cost: 500000000000, businessId: 'ai_core', multiplier: 20, hired: false, level: 1, rarity: 'Legendary' },
];

const INITIAL_RESEARCH: ResearchItem[] = [
  { id: 'res_marketing', name: 'Digital Marketing', description: 'Global Profit +10%', baseCost: 50000, maxLevel: 10, multiplierPerLevel: 0.1, currentLevel: 0 },
  { id: 'res_efficiency', name: 'Lean Management', description: 'Global Profit +25%', baseCost: 250000, maxLevel: 5, multiplierPerLevel: 0.25, currentLevel: 0 },
  { id: 'res_ai', name: 'AI Integration', description: 'Global Profit +50%', baseCost: 1000000, maxLevel: 5, multiplierPerLevel: 0.5, currentLevel: 0 },
  { id: 'res_quantum', name: 'Quantum Computing', description: 'Global Profit +100%', baseCost: 50000000, maxLevel: 3, multiplierPerLevel: 1.0, currentLevel: 0 },
];

const fillHistory = (price: number) => Array(20).fill(price);

const INITIAL_STOCKS: Stock[] = [
  { id: 'stk_tech', symbol: 'TECH', name: 'Tech Giant Inc', price: 100, previousPrice: 100, volatility: 0.05, history: fillHistory(100) },
  { id: 'stk_mine', symbol: 'GOLD', name: 'Gold Mines', price: 50, previousPrice: 50, volatility: 0.02, history: fillHistory(50) },
  { id: 'stk_coin', symbol: 'DOGE', name: 'Meme Coin', price: 10, previousPrice: 10, volatility: 0.15, history: fillHistory(10) },
  { id: 'stk_food', symbol: 'BURGER', name: 'McBurgers', price: 200, previousPrice: 200, volatility: 0.03, history: fillHistory(200) },
  { id: 'stk_energy', symbol: 'VOLT', name: 'Future Energy', price: 75, previousPrice: 75, volatility: 0.08, history: fillHistory(75) },
];

interface GameState {
  money: number;
  gems: number;
  investors: number;
  lifetimeEarnings: number;
  businesses: Business[];
  managers: Manager[];
  research: ResearchItem[];
  stocks: Stock[];
  portfolio: { [stockId: string]: number };
  stats: GameStats;
  claimedAchievements: string[];
  lastLogin: number;
  lastDailyReward: number;
  settings: { sfx: boolean; haptics: boolean };
  activeEvent: GameEvent | null;
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  angelUpgrades: string[];
  weather: WeatherType;
  newsTicker: string;
  ceo: {
      level: number;
      xp: number;
      maxXp: number;
      skillPoints: number;
  };
  skills: CeoSkill[];
  artifacts: Artifact[];
  updateLastLogin: () => void;

  // Actions
  addMoney: (amount: number) => void;
  addGems: (amount: number) => void;
  registerTap: () => void;
  buyBusiness: (id: string) => void;
  upgradeBusiness: (id: string) => void;
  summonManager: () => { success: boolean; manager?: Manager; message?: string };
  upgradeManager: (managerId: string) => void;
  buyResearch: (researchId: string) => void;
  buyAngelUpgrade: (id: string) => void;
  tickStocks: () => void;
  buyStock: (stockId: string, amount: number) => void;
  sellStock: (stockId: string, amount: number) => void;
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
  changeWeather: () => void;
  upgradeCeoSkill: (skillId: string) => void;
  findArtifact: () => void; 
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      money: 0,
      gems: 50,
      investors: 0,
      lifetimeEarnings: 0,
      businesses: INITIAL_BUSINESSES,
      managers: INITIAL_MANAGERS,
      research: INITIAL_RESEARCH,
      stocks: INITIAL_STOCKS,
      portfolio: {},
      stats: { totalTaps: 0, totalBizUpgrades: 0, totalEarnings: 0, startTime: Date.now() },
      claimedAchievements: [],
      lastLogin: Date.now(),
      lastDailyReward: 0,
      settings: { sfx: true, haptics: true },
      activeEvent: null,
      toast: null,
      angelUpgrades: [],
      weather: 'SUNNY',
      newsTicker: "Welcome CEO!",
      ceo: { level: 1, xp: 0, maxXp: 1000, skillPoints: 0 },
      skills: INITIAL_SKILLS,
      artifacts: INITIAL_ARTIFACTS,
      updateLastLogin: () => set({ lastLogin: Date.now() }),

      getGlobalMultiplier: () => {
        const state = get();
        const investorMult = 1 + (state.investors * 0.02);
        let researchMult = 1;
        state.research.forEach(r => { researchMult += (r.currentLevel * r.multiplierPerLevel); });
        const eventMult = state.activeEvent ? state.activeEvent.multiplier : 1;
        let angelMult = 1;
        state.angelUpgrades.forEach(id => {
            const upgrade = ANGEL_UPGRADES.find(u => u.id === id);
            if (upgrade && upgrade.effectType === 'profit_mult') angelMult *= upgrade.value;
        });
        const weatherMult = {
            'SUNNY': 1.0, 'RAIN': 0.8, 'STORM': 0.5, 'GOLDEN_HOUR': 2.0
        }[state.weather] || 1.0;
        let skillBonus = 1;
        state.skills.forEach(s => {
            if (s.effectType === 'idle_bonus') skillBonus += (s.level * s.valuePerLevel);
        });
        let artBonus = 1;
        state.artifacts.forEach(a => {
            if (a.owned && a.effectType === 'global_mult') artBonus *= a.value;
        });
        return investorMult * researchMult * eventMult * angelMult * weatherMult * skillBonus * artBonus;
      },

      changeWeather: () => {
          const rand = Math.random();
          let newWeather: WeatherType = 'SUNNY';
          
          if (rand > 0.95) newWeather = 'GOLDEN_HOUR'; // 5% chance
          else if (rand > 0.85) newWeather = 'STORM'; // 10% chance
          else if (rand > 0.60) newWeather = 'RAIN'; // 25% chance
          
          // Jangan spam notif jika cuaca sama
          if (get().weather !== newWeather) {
              set({ 
                  weather: newWeather,
                  newsTicker: `WEATHER UPDATE: ${WEATHER_EFFECTS[newWeather].message}`
              });
          }
      },

      tickStocks: () => set((state) => {
        const newStocks = state.stocks.map(stock => {
            let changePercent = (Math.random() * 2 - 1) * stock.volatility;
            
            if (state.activeEvent?.id === 'market_boom') {
                changePercent += 0.03;
            } else if (state.activeEvent?.id === 'market_crash') {
                changePercent -= 0.03;
            } else if (Math.random() < 0.1) {
                changePercent *= 3;
            }

            let newPrice = stock.price * (1 + changePercent);
            newPrice = Math.max(0.1, Math.min(newPrice, 10000));
            
            const newHistory = [...stock.history, newPrice].slice(-20);

            return { 
                ...stock, 
                previousPrice: stock.price, 
                price: newPrice, 
                history: newHistory 
            };
        });
        return { stocks: newStocks };
      }),

      buyStock: (stockId, amount) => set((state) => {
          const stock = state.stocks.find(s => s.id === stockId);
          if (!stock) return state;
          const totalCost = stock.price * amount;
          if (state.money >= totalCost) {
              triggerHaptic('success');
              const currentQty = state.portfolio[stockId] || 0;
              return { money: state.money - totalCost, portfolio: { ...state.portfolio, [stockId]: currentQty + amount } };
          }
          return state;
      }),

      sellStock: (stockId, amount) => set((state) => {
          const stock = state.stocks.find(s => s.id === stockId);
          if (!stock) return state;
          const currentQty = state.portfolio[stockId] || 0;
          if (currentQty >= amount) {
              triggerHaptic('success');
              const totalRevenue = stock.price * amount;
              return { money: state.money + totalRevenue, portfolio: { ...state.portfolio, [stockId]: currentQty - amount } };
          }
          return state;
      }),

      buyAngelUpgrade: (id) => set((state) => {
        if (state.angelUpgrades.includes(id)) return state;
        const upgrade = ANGEL_UPGRADES.find(u => u.id === id);
        if (!upgrade) return state;
        if (state.investors >= upgrade.cost) {
            triggerHaptic('success');
            return { investors: state.investors - upgrade.cost, angelUpgrades: [...state.angelUpgrades, id] };
        }
        return state;
      }),

      addMoney: (amount) => set((state) => {
        const xpGained = Math.max(1, Math.floor(amount / 100)); 
        let newXp = state.ceo.xp + xpGained;
        let newLevel = state.ceo.level;
        let newMaxXp = state.ceo.maxXp;
        let newPoints = state.ceo.skillPoints;
        let leveledUp = false;
        
        while (newXp >= newMaxXp) {
            newXp -= newMaxXp;
            newLevel++;
            newMaxXp = Math.floor(newMaxXp * 1.5);
            newPoints++;
            leveledUp = true;
        }
        if (leveledUp) {
            triggerHaptic('success');
            get().showToast(`Level Up! You are now Level ${newLevel}`, 'success');
        }
        return {
            money: state.money + amount,
            lifetimeEarnings: state.lifetimeEarnings + amount,
            stats: { ...state.stats, totalEarnings: state.stats.totalEarnings + amount },
            ceo: { ...state.ceo, xp: newXp, level: newLevel, maxXp: newMaxXp, skillPoints: newPoints }
        };
      }),
      
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

      upgradeCeoSkill: (skillId) => set((state) => {
          const skillIdx = state.skills.findIndex(s => s.id === skillId);
          const skill = state.skills[skillIdx];
          
          if (state.ceo.skillPoints >= skill.cost && skill.level < skill.maxLevel) {
              triggerHaptic('light');
              const newSkills = [...state.skills];
              newSkills[skillIdx] = { ...skill, level: skill.level + 1 };
              
              return {
                  ceo: { ...state.ceo, skillPoints: state.ceo.skillPoints - skill.cost },
                  skills: newSkills
              };
          }
          return state;
      }),

      findArtifact: () => set((state) => {
          // Cari artifact yang belum dimiliki
          const unowned = state.artifacts.filter(a => !a.owned);
          if (unowned.length === 0) return state;

          const rand = Math.random();
          // 5% chance to find one when triggered
          if (rand < 0.05) {
              const found = unowned[Math.floor(Math.random() * unowned.length)];
              const artIdx = state.artifacts.findIndex(a => a.id === found.id);
              const newArts = [...state.artifacts];
              newArts[artIdx] = { ...found, owned: true };
              
              triggerHaptic('heavy');
              get().showToast(`RARE FIND: You discovered ${found.name}!`, 'success');
              
              return { artifacts: newArts };
          }
          return state;
      }),

      upgradeBusiness: (id) => set((state) => {
        const bizIndex = state.businesses.findIndex((b) => b.id === id);
        const biz = state.businesses[bizIndex];
        let cost = Math.floor(biz.baseCost * Math.pow(1.15, biz.level));
        let discount = 0;
        state.angelUpgrades.forEach(uid => {
            const upg = ANGEL_UPGRADES.find(u => u.id === uid);
            if (upg && upg.effectType === 'cost_disc') discount += upg.value;
        });
        state.skills.forEach(s => {
            if (s.effectType === 'upgrade_discount') discount += (s.level * s.valuePerLevel);
        });
        const finalDiscount = Math.min(discount, 0.80); 
        cost = Math.floor(cost * (1 - finalDiscount)); 
        if (state.money >= cost && biz.owned) {
          triggerHaptic('light');
          const newLevel = biz.level + 1;
          let newBaseRevenue = biz.baseRevenue;
          if ([25, 50, 100, 200].includes(newLevel)) newBaseRevenue *= 2;
          const newBizs = [...state.businesses];
          newBizs[bizIndex] = { ...biz, level: newLevel, baseRevenue: newBaseRevenue };
          get().findArtifact();
          return { 
              money: state.money - cost, 
              businesses: newBizs,
              stats: { ...state.stats, totalBizUpgrades: state.stats.totalBizUpgrades + 1 } 
          };
        }
        return state;
      }),

      // [UPDATE] Sistem Gacha Manager
      summonManager: () => {
        const state = get();
        const COST = 100;

        if (state.gems < COST) {
            return { success: false, message: "Not enough Gems!" };
        }

        // Logic Gacha: Bisa dapat manager yang sudah punya (untuk upgrade gratis)
        const allManagers = state.managers;
        
        // GACHA RNG (Rarity)
        const rand = Math.random();
        let targetRarity: ManagerRarity = 'Common';
        if (rand > 0.95) targetRarity = 'Legendary';
        else if (rand > 0.70) targetRarity = 'Rare';

        // Filter manager berdasarkan rarity target
        let targets = allManagers.filter(m => m.rarity === targetRarity);
        if (targets.length === 0) targets = allManagers; // Fallback

        // Pilih random
        const selectedManager = targets[Math.floor(Math.random() * targets.length)];
        const mgrIndex = state.managers.findIndex(m => m.id === selectedManager.id);
        const newManagers = [...state.managers];
        const currentMgr = newManagers[mgrIndex];

        let message = "";
        
        if (!currentMgr.hired) {
            // Kalau belum punya -> HIRE
            newManagers[mgrIndex] = { ...currentMgr, hired: true, level: 1 };
            message = `You hired ${currentMgr.name}!`;
        } else {
            // Kalau sudah punya -> GRATIS LEVEL UP (Duplicate bonus)
            newManagers[mgrIndex] = { ...currentMgr, level: (currentMgr.level || 1) + 1 };
            message = `Duplicate! ${currentMgr.name} Leveled Up!`;
        }

        triggerHaptic('heavy');
        set({ 
            gems: state.gems - COST, 
            managers: newManagers 
        });

        // Return manager object untuk ditampilkan di kartu
        return { success: true, manager: newManagers[mgrIndex], message };
    },

      upgradeManager: (managerId) => set((state) => {
        const mgrIndex = state.managers.findIndex(m => m.id === managerId);
        const mgr = state.managers[mgrIndex];
        if (!mgr.hired) return state;
        
        // Cost upgrade manager sekarang pakai Money (bisa diubah ke Gems jika mau lebih hardcore)
        const upgradeCost = mgr.cost * 10 * mgr.level; // Base cost as reference
        
        if (state.money >= upgradeCost) {
            triggerHaptic('success');
            const newMgrs = [...state.managers];
            newMgrs[mgrIndex] = { ...mgr, level: mgr.level + 1 };
            get().showToast(`${mgr.name} Leveled Up!`, 'success');
            return { money: state.money - upgradeCost, managers: newMgrs };
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
             const managerMult = mgr ? mgr.multiplier * (mgr.level || 1) : 1;
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
                    const managerMult = mgr ? mgr.multiplier * (mgr.level || 1) : 1;
                    incomePerSec += (b.baseRevenue * b.level * managerMult);
                }
              });
              
              let warpBonus = 0;
              state.angelUpgrades.forEach(id => {
                  const u = ANGEL_UPGRADES.find(au => au.id === id);
                  if(u?.effectType === 'time_warp') warpBonus += u.value;
              });

              incomePerSec = incomePerSec * state.getGlobalMultiplier();
              const instantCash = incomePerSec * 3600 * hours * (1 + warpBonus); 
              
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
        
        if (newInvestorsClaimed <= 0) return state; // Cegah reset rugi
        
        triggerHaptic('success');
        
        return {
            money: 0,
            // lifetimeEarnings: 0, // Opsi: Biasanya lifetime earnings JANGAN direset untuk achievement
            investors: state.investors + newInvestorsClaimed,
            
            // Reset bisnis ke awal
            businesses: INITIAL_BUSINESSES, 
            
            // PENTING: JANGAN RESET MANAGER JIKA BELI PAKE GEMS!
            // Kita pertahankan manager yang sudah di-hire, mungkin reset levelnya saja ke 1?
            // Atau biarkan saja seperti state.managers agar terasa progresnya.
            managers: state.managers, 
            
            research: INITIAL_RESEARCH, // Reset research karena logicnya pakai uang
            stocks: INITIAL_STOCKS, 
            portfolio: {},
            
            // Bonus gems sedikit
            gems: state.gems + 100, 
            activeEvent: null,
            lastLogin: Date.now(),
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
      name: 'tycoon-storage-v2.0',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);