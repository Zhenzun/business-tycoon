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

export type ManagerRarity = 'Common' | 'Rare' | 'Legendary';
export type WeatherType = 'SUNNY' | 'RAIN' | 'STORM' | 'GOLDEN_HOUR';
export type MissionType = 'TAP' | 'EARN' | 'SPEND';
export type StockTrend = 'BULL' | 'BEAR' | 'STABLE';
export type ManagerSkillType = 'INSTANT_CASH' | 'STOCK_PUMP' | 'GEM_LUCK' | 'PROFIT_BOOST';
export type ArtifactRarity = 'Common' | 'Rare' | 'Epic' | 'Mythic' | 'Ancient';

export type DecisionOption = {
    label: string;
    cost?: number; 
    risk?: number; 
    effect: (state: GameState) => void;
};

export type DecisionEvent = {
    id: string;
    title: string;
    description: string;
    options: DecisionOption[];
};

export type Manager = {
  id: string;
  name: string;
  description: string;
  cost: number; 
  businessId: string;
  multiplier: number;
  hired: boolean;
  level: number;
  rarity: ManagerRarity;
  skillName: string;
  skillType: ManagerSkillType;
  skillCooldown: number; 
  skillValue: number; 
};

export type Mission = {
  id: string;
  description: string;
  type: MissionType;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
};

export type CeoSkill = {
    id: string;
    name: string;
    description: string;
    level: number;
    maxLevel: number;
    cost: number;
    effectType: 'tap_bonus' | 'idle_bonus' | 'upgrade_discount';
    valuePerLevel: number;
};

export type Artifact = {
    id: string;
    name: string;
    description: string;
    owned: boolean;
    effectType: 'global_mult' | 'luck_boost' | 'discount' | 'tap_boost';
    value: number;
    rarity: ArtifactRarity;
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
  trend: StockTrend;
  trendDuration: number;
};

export type GameEvent = {
  id: string;
  name: string;
  multiplier: number;
  duration: number;
  startTime?: number;
};

// --- DATA DEFINITIONS ---
const WEATHER_EFFECTS: Record<WeatherType, { multiplier: number, message: string }> = {
    'SUNNY': { multiplier: 1.0, message: "Cuaca cerah, bisnis berjalan normal." },
    'RAIN': { multiplier: 0.8, message: "Hujan turun, pelanggan berkurang (-20%)." },
    'STORM': { multiplier: 0.5, message: "Badai besar! Operasional terhambat (-50%)." },
    'GOLDEN_HOUR': { multiplier: 2.0, message: "GOLDEN HOUR! Semua profit x2!" },
};

export const SYNERGIES = [
    { id: 'syn_food', name: 'Food Chain', businesses: ['lemonade', 'bakery'], multiplier: 1.5 },
    { id: 'syn_tech', name: 'Digital Empire', businesses: ['tech_startup', 'crypto_farm'], multiplier: 2.0 },
    { id: 'syn_future', name: 'Future Tech', businesses: ['space_agency', 'ai_core'], multiplier: 3.0 },
];

const INITIAL_ARTIFACTS: Artifact[] = [
    { id: 'art_coin', name: 'Ancient Coin', description: 'Global Profit x1.5', owned: false, effectType: 'global_mult', value: 1.5, rarity: 'Common' },
    { id: 'art_cat', name: 'Lucky Cat', description: 'Event Luck +10%', owned: false, effectType: 'luck_boost', value: 0.1, rarity: 'Rare' },
    { id: 'art_hammer', name: 'Midas Hammer', description: 'Tap Profit x3', owned: false, effectType: 'tap_boost', value: 3, rarity: 'Epic' },
    { id: 'art_scroll', name: 'Merchant Scroll', description: 'Upgrade Cost -15%', owned: false, effectType: 'discount', value: 0.15, rarity: 'Mythic' },
    { id: 'art_cube', name: 'Tesseract', description: 'Global Profit x10', owned: false, effectType: 'global_mult', value: 10, rarity: 'Ancient' },
];

const INITIAL_MANAGERS: Manager[] = [
  { id: 'mgr_lemon', name: 'Kid Neighbor', description: 'x2 Lemonade Revenue', cost: 1000, businessId: 'lemonade', multiplier: 2, hired: false, level: 1, rarity: 'Common', skillName: 'Quick Sale', skillType: 'INSTANT_CASH', skillCooldown: 300, skillValue: 60 },
  { id: 'mgr_bakery', name: 'Grandma', description: 'x3 Bakery Revenue', cost: 5000, businessId: 'bakery', multiplier: 3, hired: false, level: 1, rarity: 'Common', skillName: 'Fresh Batch', skillType: 'INSTANT_CASH', skillCooldown: 600, skillValue: 120 },
  { id: 'mgr_tech', name: 'Elon M.', description: 'x10 Startup Revenue', cost: 50000, businessId: 'tech_startup', multiplier: 10, hired: false, level: 1, rarity: 'Legendary', skillName: 'Market Tweet', skillType: 'STOCK_PUMP', skillCooldown: 900, skillValue: 0.15 },
  { id: 'mgr_crypto', name: 'Satoshi', description: 'x8 Crypto Revenue', cost: 5000000, businessId: 'crypto_farm', multiplier: 8, hired: false, level: 1, rarity: 'Rare', skillName: 'Mining Rig', skillType: 'GEM_LUCK', skillCooldown: 3600, skillValue: 5 },
  { id: 'mgr_space', name: 'Starman', description: 'x15 Space Revenue', cost: 2000000000, businessId: 'space_agency', multiplier: 15, hired: false, level: 1, rarity: 'Legendary', skillName: 'Warp Drive', skillType: 'PROFIT_BOOST', skillCooldown: 1200, skillValue: 5 },
  { id: 'mgr_ai', name: 'Skynet', description: 'x20 AI Revenue', cost: 500000000000, businessId: 'ai_core', multiplier: 20, hired: false, level: 1, rarity: 'Legendary', skillName: 'Optimization', skillType: 'INSTANT_CASH', skillCooldown: 1800, skillValue: 300 },
];

const INITIAL_BUSINESSES: Business[] = [
  { id: 'lemonade', name: 'Lemonade Stand', baseCost: 100, baseRevenue: 10, level: 0, unlockCost: 0, owned: true },
  { id: 'bakery', name: 'Bakery', baseCost: 500, baseRevenue: 50, level: 0, unlockCost: 500, owned: false },
  { id: 'tech_startup', name: 'Tech Startup', baseCost: 10000, baseRevenue: 1000, level: 0, unlockCost: 10000, owned: false },
  { id: 'crypto_farm', name: 'Crypto Farm', baseCost: 1000000, baseRevenue: 8500, level: 0, unlockCost: 1000000, owned: false },
  { id: 'space_agency', name: 'Space Agency', baseCost: 500000000, baseRevenue: 120000, level: 0, unlockCost: 500000000, owned: false },
  { id: 'ai_core', name: 'AI Overlord', baseCost: 100000000000, baseRevenue: 5000000, level: 0, unlockCost: 100000000000, owned: false },
];

const INITIAL_RESEARCH: ResearchItem[] = [
  { id: 'res_marketing', name: 'Digital Marketing', description: 'Global Profit +10%', baseCost: 50000, maxLevel: 10, multiplierPerLevel: 0.1, currentLevel: 0 },
  { id: 'res_efficiency', name: 'Lean Management', description: 'Global Profit +25%', baseCost: 250000, maxLevel: 5, multiplierPerLevel: 0.25, currentLevel: 0 },
  { id: 'res_ai', name: 'AI Integration', description: 'Global Profit +50%', baseCost: 1000000, maxLevel: 5, multiplierPerLevel: 0.5, currentLevel: 0 },
  { id: 'res_quantum', name: 'Quantum Computing', description: 'Global Profit +100%', baseCost: 50000000, maxLevel: 3, multiplierPerLevel: 1.0, currentLevel: 0 },
];

const fillHistory = (price: number) => Array(20).fill(price);
const INITIAL_STOCKS: Stock[] = [
  { id: 'stk_tech', symbol: 'TECH', name: 'Tech Giant Inc', price: 100, previousPrice: 100, volatility: 0.05, history: fillHistory(100), trend: 'STABLE', trendDuration: 10 },
  { id: 'stk_mine', symbol: 'GOLD', name: 'Gold Mines', price: 50, previousPrice: 50, volatility: 0.02, history: fillHistory(50), trend: 'STABLE', trendDuration: 15 },
  { id: 'stk_coin', symbol: 'DOGE', name: 'Meme Coin', price: 10, previousPrice: 10, volatility: 0.15, history: fillHistory(10), trend: 'BEAR', trendDuration: 5 },
  { id: 'stk_food', symbol: 'BURGER', name: 'McBurgers', price: 200, previousPrice: 200, volatility: 0.03, history: fillHistory(200), trend: 'BULL', trendDuration: 12 },
  { id: 'stk_energy', symbol: 'VOLT', name: 'Future Energy', price: 75, previousPrice: 75, volatility: 0.08, history: fillHistory(75), trend: 'STABLE', trendDuration: 8 },
];

export const ACHIEVEMENT_DEFS = [
    { id: 'tap_100', title: 'Finger Warmup', description: 'Tap 100 times', target: 100, reward: 10, type: 'taps' },
    { id: 'earn_1m', title: 'Millionaire', description: 'Earn $1 Million lifetime', target: 1000000, reward: 50, type: 'money' },
    { id: 'investor_1', title: 'Sellout', description: 'Perform 1 Prestige', target: 1, reward: 100, type: 'investors' },
];

const INITIAL_SKILLS: CeoSkill[] = [
    { id: 'skill_midas', name: 'Midas Touch', description: 'Increase Tap Profit', level: 0, maxLevel: 10, cost: 1, effectType: 'tap_bonus', valuePerLevel: 0.5 },
    { id: 'skill_negotiator', name: 'Silver Tongue', description: 'Cheaper Business Upgrades', level: 0, maxLevel: 5, cost: 2, effectType: 'upgrade_discount', valuePerLevel: 0.05 },
    { id: 'skill_manager', name: 'Micro Management', description: 'Boost Idle Revenue', level: 0, maxLevel: 10, cost: 1, effectType: 'idle_bonus', valuePerLevel: 0.2 },
];

const POSSIBLE_EVENTS: GameEvent[] = [
  { id: 'viral_marketing', name: '🔥 Viral Marketing', multiplier: 3, duration: 30 },
  { id: 'market_boom', name: '📈 Market Boom', multiplier: 5, duration: 20 },
  { id: 'investor_visit', name: '👼 Angel Investor Visit', multiplier: 2, duration: 60 },
  { id: 'market_crash', name: '📉 Market Correction', multiplier: 0.5, duration: 15 },
];

export const ANGEL_UPGRADES: AngelUpgrade[] = [
  { id: 'au_1', name: 'Heavenly Chips', description: 'All Profit x3', cost: 10, effectType: 'profit_mult', value: 3 },
  { id: 'au_2', name: 'Divine Discount', description: 'Upgrade Cost -10%', cost: 50, effectType: 'cost_disc', value: 0.1 },
  { id: 'au_3', name: 'Angel Wings', description: 'All Profit x5', cost: 500, effectType: 'profit_mult', value: 5 },
  { id: 'au_4', name: 'Time Mastery', description: 'Time Warp Effect +50%', cost: 2000, effectType: 'time_warp', value: 0.5 },
  { id: 'au_5', name: 'God Mode', description: 'All Profit x10', cost: 10000, effectType: 'profit_mult', value: 10 },
];

// [FIX] Pindahkan Definisi Event Decision ke LUAR store agar fungsi tidak hilang karena persistensi
const DECISION_REGISTRY: DecisionEvent[] = [
    { 
        id: 'tax_audit', 
        title: '📢 Tax Audit!', 
        description: 'IRS is knocking on your door.', 
        options: [
            { 
                label: 'Pay Fine ($5k)', 
                effect: (s) => { 
                    if(s.money >= 5000) { s.addMoney(-5000); s.showToast("Paid the fine.", "info"); } 
                    else s.showToast("Not enough money!", "warning"); 
                } 
            }, 
            { 
                label: 'Hire Lawyer (50 Gems)', 
                cost: 50, 
                effect: (s) => { 
                    if(s.gems >= 50) { s.addGems(-50); s.showToast("Lawyer handled it.", "success"); } 
                    else s.showToast("Not enough gems!", "warning"); 
                } 
            }, 
            { 
                label: 'Bribe (Risky)', 
                risk: 0.5, 
                effect: (s) => { s.showToast("Bribe Accepted.", "warning"); } 
            }
        ] 
    }, 
    { 
        id: 'viral_trend', 
        title: '📱 Viral Opportunity', 
        description: 'A TikTok trend fits your product.', 
        options: [
            { 
                label: 'Ignore', 
                effect: (s) => s.showToast("Safe play.", "info") 
            }, 
            { 
                label: 'Boost (50 Gems)', 
                effect: (s) => { 
                    if (s.gems >= 50) { 
                        s.addGems(-50); 
                        s.activeEvent = { id: 'viral', name: 'Viral Hype', multiplier: 5, duration: 20, startTime: Date.now() }; 
                        s.showToast("x5 Profit!", "success"); 
                    } else s.showToast("No gems!", "warning"); 
                } 
            }
        ] 
    }
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
  activeDecision: DecisionEvent | null; 
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  angelUpgrades: string[];
  weather: WeatherType;
  newsTicker: string;
  ceo: { level: number; xp: number; maxXp: number; skillPoints: number; };
  skills: CeoSkill[];
  artifacts: Artifact[];
  missions: Mission[];
  lastMissionUpdate: number;
  lastSkillUsed: Record<string, number>; 
  combo: number;
  maxCombo: number;

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
  triggerDecision: () => void; 
  resolveDecision: (optionIndex: number) => void; 
  clearEvent: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  hideToast: () => void;
  getGlobalMultiplier: () => number;
  getBusinessRevenue: (id: string) => number; 
  calculateOfflineEarnings: () => number;
  claimDailyReward: () => boolean;
  buyTimeWarp: (hours: number, cost: number) => void;
  claimAchievement: (id: string) => void;
  prestige: () => void;
  hydrateFromCloud: (cloudData: any) => void;
  changeWeather: () => void;
  upgradeCeoSkill: (skillId: string) => void;
  findArtifact: () => void; 
  discoverArtifact: () => { success: boolean; artifact?: Artifact; message?: string }; 
  checkMissions: (type: MissionType, amount: number) => void; 
  claimMission: (id: string) => void; 
  refreshMissions: () => void; 
  triggerManagerSkill: (managerId: string) => void;
  loadSaveData: (data: string) => boolean; 
  decayCombo: () => void;
  getAnalyticsData: () => { labels: string[], data: number[] };
  exportSaveData: () => string; 
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
      activeDecision: null, 
      toast: null,
      angelUpgrades: [],
      weather: 'SUNNY',
      newsTicker: "Welcome CEO!",
      ceo: { level: 1, xp: 0, maxXp: 1000, skillPoints: 0 },
      skills: INITIAL_SKILLS,
      artifacts: INITIAL_ARTIFACTS,
      missions: [],
      lastMissionUpdate: 0,
      lastSkillUsed: {},
      combo: 0,
      maxCombo: 100,

      updateLastLogin: () => set({ lastLogin: Date.now() }),

      discoverArtifact: () => {
          const state = get();
          const COST = 250; 
          
          if (state.gems < COST) return { success: false, message: "Not enough Gems!" };
          
          const unowned = state.artifacts.filter(a => !a.owned);
          if (unowned.length === 0) return { success: false, message: "You found all artifacts!" };

          const found = unowned[Math.floor(Math.random() * unowned.length)];
          
          const newArts = state.artifacts.map(a => a.id === found.id ? { ...a, owned: true } : a);
          
          triggerHaptic('heavy');
          set({ gems: state.gems - COST, artifacts: newArts });
          return { success: true, artifact: found };
      },

      exportSaveData: () => {
          const state = get();
          const saveObj = {
              version: 1.5,
              timestamp: Date.now(),
              data: state
          };
          const json = JSON.stringify(saveObj);
          const encoded = btoa(json);
          return `TYCOON-${encoded}`;
      },

      loadSaveData: (dataString) => {
          try {
              const raw = dataString.replace('TYCOON-', '');
              const decoded = atob(raw);
              const parsed = JSON.parse(decoded);
              
              if (parsed.version && parsed.data) {
                  set((state) => ({ ...state, ...parsed.data }));
                  triggerHaptic('success');
                  return true;
              }
              return false;
          } catch (e) {
              console.log("Load failed", e);
              return false;
          }
      },

      getBusinessRevenue: (id: string) => {
          const state = get();
          const biz = state.businesses.find(b => b.id === id);
          if (!biz || !biz.owned) return 0;
          let revenue = biz.baseRevenue * biz.level;
          const manager = state.managers.find(m => m.businessId === id && m.hired);
          if (manager) revenue *= (manager.multiplier * (manager.level || 1));
          const activeSynergies = SYNERGIES.filter(syn => {
              const hasAll = syn.businesses.every(bid => {
                  const b = state.businesses.find(x => x.id === bid);
                  return b && b.owned;
              });
              return hasAll && syn.businesses.includes(id);
          });
          activeSynergies.forEach(syn => { revenue *= syn.multiplier; });
          return revenue;
      },

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
        const weatherMult = WEATHER_EFFECTS[state.weather].multiplier || 1.0;
        let skillBonus = 1;
        state.skills.forEach(s => {
            if (s.effectType === 'idle_bonus') skillBonus += (s.level * s.valuePerLevel);
        });
        let artBonus = 1;
        state.artifacts.forEach(a => {
            if (a.owned && a.effectType === 'global_mult') artBonus *= a.value;
        });
        const comboBonus = 1 + (state.combo / 100);
        return investorMult * researchMult * eventMult * angelMult * weatherMult * skillBonus * artBonus * comboBonus;
      },

      calculateOfflineEarnings: () => {
        const state = get();
        const now = Date.now();
        const secondsOffline = (now - state.lastLogin) / 1000;

        if (secondsOffline < 60) return 0;

        let incomePerSec = 0;
        state.businesses.forEach(b => {
            if (b.owned) {
                incomePerSec += state.getBusinessRevenue(b.id);
            }
        });

        const globalMult = state.getGlobalMultiplier();
        const maxOfflineSecs = 24 * 60 * 60; 
        const effectiveTime = Math.min(secondsOffline, maxOfflineSecs);

        const earnings = Math.floor(incomePerSec * globalMult * effectiveTime);

        if (earnings > 0) {
            set((state) => ({
                money: state.money + earnings,
                lifetimeEarnings: state.lifetimeEarnings + earnings,
            }));
        }
        
        set({ lastLogin: now });
        return earnings;
      },

      decayCombo: () => set((state) => {
          if (state.combo > 0) {
              const decayAmount = Math.max(1, Math.floor(state.combo * 0.05));
              return { combo: Math.max(0, state.combo - decayAmount) };
          }
          return state;
      }),

      getAnalyticsData: () => {
          const state = get();
          const data: number[] = [];
          const labels: string[] = [];
          state.businesses.forEach(b => {
              if (b.owned) {
                  labels.push(b.name);
                  data.push(state.getBusinessRevenue(b.id) * 60);
              }
          });
          return { labels, data };
      },

      addMoney: (amount) => set((state) => {
        const xpGained = Math.max(1, Math.floor(amount / 100)); 
        let newXp = state.ceo.xp + xpGained;
        let newLevel = state.ceo.level;
        let newMaxXp = state.ceo.maxXp;
        let newPoints = state.ceo.skillPoints;
        let leveledUp = false;
        while (newXp >= newMaxXp) { newXp -= newMaxXp; newLevel++; newMaxXp = Math.floor(newMaxXp * 1.5); newPoints++; leveledUp = true; }
        if (leveledUp) { triggerHaptic('success'); get().showToast(`Level Up! You are now Level ${newLevel}`, 'success'); }
        return { money: state.money + amount, lifetimeEarnings: state.lifetimeEarnings + amount, stats: { ...state.stats, totalEarnings: state.stats.totalEarnings + amount }, ceo: { ...state.ceo, xp: newXp, level: newLevel, maxXp: newMaxXp, skillPoints: newPoints } };
      }),
      addGems: (amount) => set((state) => ({ gems: state.gems + amount })),
      registerTap: () => { const state = get(); const newCombo = Math.min(state.maxCombo, state.combo + 5); set({ stats: { ...state.stats, totalTaps: state.stats.totalTaps + 1 }, combo: newCombo }); state.checkMissions('TAP', 1); },
      buyBusiness: (id) => set((state) => { const bizIndex = state.businesses.findIndex((b) => b.id === id); const biz = state.businesses[bizIndex]; if (state.money >= biz.unlockCost && !biz.owned) { triggerHaptic('success'); const newBiz = [...state.businesses]; newBiz[bizIndex] = { ...biz, owned: true, level: 1 }; get().checkMissions('SPEND', biz.unlockCost); return { money: state.money - biz.unlockCost, businesses: newBiz }; } return state; }),
      upgradeBusiness: (id) => set((state) => { const bizIndex = state.businesses.findIndex((b) => b.id === id); const biz = state.businesses[bizIndex]; let cost = Math.floor(biz.baseCost * Math.pow(1.15, biz.level)); let discount = 0; state.angelUpgrades.forEach(uid => { const upg = ANGEL_UPGRADES.find(u => u.id === uid); if (upg && upg.effectType === 'cost_disc') discount += upg.value; }); state.skills.forEach(s => { if (s.effectType === 'upgrade_discount') discount += (s.level * s.valuePerLevel); }); state.artifacts.forEach(a => { if (a.owned && a.effectType === 'discount') discount += a.value; }); const finalDiscount = Math.min(discount, 0.80); cost = Math.floor(cost * (1 - finalDiscount)); if (state.money >= cost && biz.owned) { triggerHaptic('light'); const newLevel = biz.level + 1; let newBaseRevenue = biz.baseRevenue; if ([25, 50, 100, 200].includes(newLevel)) newBaseRevenue *= 2; const newBizs = [...state.businesses]; newBizs[bizIndex] = { ...biz, level: newLevel, baseRevenue: newBaseRevenue }; get().findArtifact(); get().checkMissions('SPEND', cost); return { money: state.money - cost, businesses: newBizs, stats: { ...state.stats, totalBizUpgrades: state.stats.totalBizUpgrades + 1 } }; } return state; }),
      summonManager: () => { const state = get(); const COST = 100; if (state.gems < COST) return { success: false, message: "Not enough Gems!" }; const allManagers = state.managers; const rand = Math.random(); let targetRarity: ManagerRarity = 'Common'; if (rand > 0.95) targetRarity = 'Legendary'; else if (rand > 0.70) targetRarity = 'Rare'; let targets = allManagers.filter(m => m.rarity === targetRarity); if (targets.length === 0) targets = allManagers; const selectedManager = targets[Math.floor(Math.random() * targets.length)]; const mgrIndex = state.managers.findIndex(m => m.id === selectedManager.id); const newManagers = [...state.managers]; const currentMgr = newManagers[mgrIndex]; let message = ""; if (!currentMgr.hired) { newManagers[mgrIndex] = { ...currentMgr, hired: true, level: 1 }; message = `You hired ${currentMgr.name}!`; } else { newManagers[mgrIndex] = { ...currentMgr, level: (currentMgr.level || 1) + 1 }; message = `Duplicate! ${currentMgr.name} Leveled Up!`; } triggerHaptic('heavy'); set({ gems: state.gems - COST, managers: newManagers }); return { success: true, manager: newManagers[mgrIndex], message }; },
      upgradeManager: (managerId) => set((state) => { const mgrIndex = state.managers.findIndex(m => m.id === managerId); const mgr = state.managers[mgrIndex]; if (!mgr.hired) return state; const upgradeCost = mgr.cost * 10 * mgr.level; if (state.money >= upgradeCost) { triggerHaptic('success'); const newMgrs = [...state.managers]; newMgrs[mgrIndex] = { ...mgr, level: mgr.level + 1 }; get().showToast(`${mgr.name} Leveled Up!`, 'success'); get().checkMissions('SPEND', upgradeCost); return { money: state.money - upgradeCost, managers: newMgrs }; } return state; }),
      buyResearch: (researchId) => set((state) => { const resIndex = state.research.findIndex(r => r.id === researchId); const item = state.research[resIndex]; const cost = Math.floor(item.baseCost * Math.pow(2, item.currentLevel)); if (state.money >= cost && item.currentLevel < item.maxLevel) { triggerHaptic('success'); const newResearch = [...state.research]; newResearch[resIndex] = { ...item, currentLevel: item.currentLevel + 1 }; get().checkMissions('SPEND', cost); return { money: state.money - cost, research: newResearch }; } return state; }),
      buyAngelUpgrade: (id) => set((state) => { if (state.angelUpgrades.includes(id)) return state; const upgrade = ANGEL_UPGRADES.find(u => u.id === id); if (!upgrade) return state; if (state.investors >= upgrade.cost) { triggerHaptic('success'); return { investors: state.investors - upgrade.cost, angelUpgrades: [...state.angelUpgrades, id] }; } return state; }),
      sellStock: (stockId, amount) => set((state) => { const stock = state.stocks.find(s => s.id === stockId); if (!stock) return state; const currentQty = state.portfolio[stockId] || 0; if (currentQty >= amount) { triggerHaptic('success'); const totalRevenue = stock.price * amount; return { money: state.money + totalRevenue, portfolio: { ...state.portfolio, [stockId]: currentQty - amount } }; } return state; }),
      toggleSfx: () => set((state) => ({ settings: { ...state.settings, sfx: !state.settings.sfx } })),
      toggleHaptics: () => { const state = get(); const newVal = !state.settings.haptics; if (newVal) triggerHaptic('light'); set({ settings: { ...state.settings, haptics: newVal } }); },
      
      triggerRandomEvent: () => { 
          const state = get(); 
          if (state.activeEvent || state.activeDecision) return; 
          const rand = Math.random(); 
          if (rand < 0.5) { 
              const randomIdx = Math.floor(Math.random() * POSSIBLE_EVENTS.length); 
              const event = POSSIBLE_EVENTS[randomIdx]; 
              set({ activeEvent: { ...event, startTime: Date.now() } }); 
              get().showToast(`${event.name} Active! (x${event.multiplier})`, 'warning'); 
              triggerHaptic('success'); 
          } else { 
              state.triggerDecision(); 
          } 
      },

      // [FIX] triggerDecision: Ambil event dari REGISTRY, hanya simpan ke state.
      triggerDecision: () => { 
          const state = get(); 
          if (state.activeDecision || state.activeEvent) return; 
          const randomEvent = DECISION_REGISTRY[Math.floor(Math.random() * DECISION_REGISTRY.length)]; 
          set({ activeDecision: randomEvent }); 
      },

      // [FIX] resolveDecision: Cari fungsi asli dari REGISTRY berdasarkan ID, bukan dari state yang hilang fungsinya.
      resolveDecision: (optionIndex) => { 
          const state = get(); 
          if (!state.activeDecision) return; 
          
          const decisionId = state.activeDecision.id;
          // Cari definisi asli di REGISTRY agar dapat fungsinya
          const originalEvent = DECISION_REGISTRY.find(d => d.id === decisionId);
          
          if (originalEvent) {
              const option = originalEvent.options[optionIndex]; 
              
              if (option.risk) { 
                  const roll = Math.random(); 
                  if (roll < option.risk) { 
                      triggerHaptic('error'); 
                      get().showToast("Backfired!", "warning"); 
                      set({ money: Math.max(0, state.money * 0.9) }); 
                  } else { 
                      triggerHaptic('success'); 
                      option.effect(state); 
                  } 
              } else { 
                  triggerHaptic('light'); 
                  option.effect(state); 
              }
          }
          
          set({ activeDecision: null }); 
      },

      clearEvent: () => set({ activeEvent: null }),
      showToast: (message, type = 'info') => { set({ toast: { message, type } }); setTimeout(() => { set({ toast: null }); }, 3000); },
      hideToast: () => set({ toast: null }),
      claimDailyReward: () => { const now = Date.now(); const state = get(); const oneDay = 24 * 60 * 60 * 1000; if (now - state.lastDailyReward >= oneDay) { set({ gems: state.gems + 50, lastDailyReward: now }); return true; } return false; },
      buyTimeWarp: (hours, cost) => { const state = get(); if (state.gems >= cost) { let incomePerSec = 0; state.businesses.forEach(b => { if (b.owned) incomePerSec += state.getBusinessRevenue(b.id); }); let warpBonus = 0; state.angelUpgrades.forEach(id => { const u = ANGEL_UPGRADES.find(au => au.id === id); if(u?.effectType === 'time_warp') warpBonus += u.value; }); incomePerSec = incomePerSec * state.getGlobalMultiplier(); const instantCash = incomePerSec * 3600 * hours * (1 + warpBonus); triggerHaptic('heavy'); set({ gems: state.gems - cost, money: state.money + instantCash, lifetimeEarnings: state.lifetimeEarnings + instantCash }); get().showToast(`Time Warp: +$${Math.floor(instantCash)}`, 'success'); } },
      claimAchievement: (id) => set((state) => { if (state.claimedAchievements.includes(id)) return state; const def = ACHIEVEMENT_DEFS.find(d => d.id === id); if (!def) return state; let completed = false; if (def.type === 'taps' && state.stats.totalTaps >= def.target) completed = true; if (def.type === 'money' && state.lifetimeEarnings >= def.target) completed = true; if (def.type === 'investors' && state.investors >= def.target) completed = true; if (completed) { triggerHaptic('success'); get().showToast(`Unlocked: ${def.title}`, 'success'); return { gems: state.gems + def.reward, claimedAchievements: [...state.claimedAchievements, id] }; } return state; }),
      prestige: () => set((state) => { const potentialInvestors = Math.floor(Math.sqrt(state.lifetimeEarnings / 10000)); const newInvestorsClaimed = potentialInvestors - state.investors; if (newInvestorsClaimed <= 0) return state; triggerHaptic('success'); return { money: 0, investors: state.investors + newInvestorsClaimed, businesses: INITIAL_BUSINESSES, managers: state.managers, research: INITIAL_RESEARCH, stocks: INITIAL_STOCKS, portfolio: {}, gems: state.gems + 100, activeEvent: null, lastLogin: Date.now() }; }),
      hydrateFromCloud: (cloudData: any) => { set((state) => ({ money: Math.max(cloudData.balance || 0, state.money), gems: cloudData.gems || state.gems, investors: cloudData.investors || state.investors, lastDailyReward: cloudData.last_daily_reward || state.lastDailyReward, stats: cloudData.game_stats ? { ...state.stats, ...cloudData.game_stats } : state.stats, claimedAchievements: cloudData.claimed_achievements || state.claimedAchievements, angelUpgrades: cloudData.angel_upgrades || state.angelUpgrades, missions: state.missions })); },
      findArtifact: () => set((state) => { const unowned = state.artifacts.filter(a => !a.owned); if (unowned.length === 0) return state; const rand = Math.random(); if (rand < 0.05) { const found = unowned[Math.floor(Math.random() * unowned.length)]; const artIdx = state.artifacts.findIndex(a => a.id === found.id); const newArts = [...state.artifacts]; newArts[artIdx] = { ...found, owned: true }; triggerHaptic('heavy'); get().showToast(`Found: ${found.name}!`, 'success'); return { artifacts: newArts }; } return state; }),
      upgradeCeoSkill: (skillId) => set((state) => { const skillIdx = state.skills.findIndex(s => s.id === skillId); const skill = state.skills[skillIdx]; if (state.ceo.skillPoints >= skill.cost && skill.level < skill.maxLevel) { triggerHaptic('light'); const newSkills = [...state.skills]; newSkills[skillIdx] = { ...skill, level: skill.level + 1 }; return { ceo: { ...state.ceo, skillPoints: state.ceo.skillPoints - skill.cost }, skills: newSkills }; } return state; }),
      checkMissions: (type, amount) => { const state = get(); const updatedMissions = state.missions.map(m => { if (m.type === type && !m.completed) { const newCurrent = m.current + amount; const isFinished = newCurrent >= m.target; if (isFinished) { triggerHaptic('success'); get().showToast("Mission Done!", 'success'); } return { ...m, current: newCurrent, completed: isFinished }; } return m; }); set({ missions: updatedMissions }); },
      claimMission: (id) => { const state = get(); const mission = state.missions.find(m => m.id === id); if (mission && mission.completed && !mission.claimed) { triggerHaptic('heavy'); const newMissions = state.missions.map(m => m.id === id ? { ...m, claimed: true } : m); get().showToast(`Claimed ${mission.reward} Gems!`, 'success'); set({ gems: state.gems + mission.reward, missions: newMissions }); } },
      refreshMissions: () => { const now = Date.now(); const state = get(); if (state.missions.length === 0 || now - state.lastMissionUpdate > 86400000) { const newMissions: Mission[] = [{ id: `m_tap_${now}`, description: 'Tap 200 times', type: 'TAP', target: 200, current: 0, reward: 10, completed: false, claimed: false }, { id: `m_earn_${now}`, description: 'Earn $100k manually', type: 'EARN', target: 100000, current: 0, reward: 25, completed: false, claimed: false }, { id: `m_spend_${now}`, description: 'Invest $50k', type: 'SPEND', target: 50000, current: 0, reward: 15, completed: false, claimed: false }]; set({ missions: newMissions, lastMissionUpdate: now }); } },
      triggerManagerSkill: (managerId) => { const state = get(); const manager = state.managers.find(m => m.id === managerId); if (!manager || !manager.hired) return; const now = Date.now(); const lastUsed = state.lastSkillUsed[managerId] || 0; const cooldownMs = manager.skillCooldown * 1000; if (now - lastUsed < cooldownMs) { get().showToast("Cooldown!", "warning"); return; } triggerHaptic('heavy'); if (manager.skillType === 'INSTANT_CASH') { const revenuePerSec = state.getBusinessRevenue(manager.businessId) * state.getGlobalMultiplier(); const cash = revenuePerSec * manager.skillValue; get().addMoney(cash); get().showToast(`Skill: +$${Math.floor(cash)}`, 'success'); } else if (manager.skillType === 'STOCK_PUMP') { const newStocks = state.stocks.map(s => ({ ...s, price: s.price * (1 + manager.skillValue), trend: 'BULL' as StockTrend, trendDuration: 30 })); set({ stocks: newStocks }); get().showToast("Stocks Pumping!", 'success'); } else if (manager.skillType === 'GEM_LUCK') { const luck = Math.random(); if (luck > 0.5) { get().addGems(manager.skillValue); get().showToast("Gems found!", 'success'); } else get().showToast("Mining failed...", 'info'); } else if (manager.skillType === 'PROFIT_BOOST') { set({ activeEvent: { id: 'skill_boost', name: '⚡ Warp Drive', multiplier: manager.skillValue, duration: 30, startTime: Date.now() } }); get().showToast("Profit Boost Active!", 'success'); } set((state) => ({ lastSkillUsed: { ...state.lastSkillUsed, [managerId]: now } })); },
      changeWeather: () => { const rand = Math.random(); let newWeather: WeatherType = 'SUNNY'; if (rand > 0.95) newWeather = 'GOLDEN_HOUR'; else if (rand > 0.85) newWeather = 'STORM'; else if (rand > 0.60) newWeather = 'RAIN'; if (get().weather !== newWeather) set({ weather: newWeather, newsTicker: `WEATHER: ${WEATHER_EFFECTS[newWeather].message}` }); },
      tickStocks: () => set((state) => { const newStocks = state.stocks.map(stock => { let newTrend = stock.trend; let newDuration = stock.trendDuration - 1; if (newDuration <= 0) { const rand = Math.random(); if (rand > 0.6) newTrend = 'BULL'; else if (rand > 0.3) newTrend = 'BEAR'; else newTrend = 'STABLE'; newDuration = Math.floor(Math.random() * 10) + 5; } let baseChange = (Math.random() * 2 - 1) * stock.volatility; if (newTrend === 'BULL') baseChange += (stock.volatility * 0.5); if (newTrend === 'BEAR') baseChange -= (stock.volatility * 0.5); if (state.activeEvent?.id === 'market_boom') baseChange += 0.05; if (state.activeEvent?.id === 'market_crash') baseChange -= 0.05; let newPrice = stock.price * (1 + baseChange); newPrice = Math.max(0.1, Math.min(newPrice, 50000)); const newHistory = [...stock.history, newPrice].slice(-20); return { ...stock, previousPrice: stock.price, price: newPrice, history: newHistory, trend: newTrend, trendDuration: newDuration }; }); return { stocks: newStocks }; }),
    }),
    {
      name: 'tycoon-storage-v2.0',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);