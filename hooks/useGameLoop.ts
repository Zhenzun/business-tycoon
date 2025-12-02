import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export const useGameLoop = () => {
  const { 
    businesses, managers, addMoney, getGlobalMultiplier, 
    activeEvent, triggerRandomEvent, clearEvent, 
    tickStocks 
  } = useGameStore();
  
  const gameInterval = useRef<NodeJS.Timeout | null>(null);
  const stockInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // --- MAIN GAME LOOP (1s) ---
    const tick = () => {
      // 1. Handle Active Event Duration
      if (activeEvent && activeEvent.startTime) {
        const elapsed = (Date.now() - activeEvent.startTime) / 1000;
        if (elapsed >= activeEvent.duration) {
            clearEvent(); 
        }
      } else {
        // 2. Random Event Trigger (~100s)
        if (Math.random() < 0.01) {
            triggerRandomEvent();
        }
      }

      // 3. Calculate Income
      let income = 0;
      businesses.forEach((biz) => {
        if (biz.owned) {
            const mgr = managers.find(m => m.businessId === biz.id && m.hired);
            // UPDATED: Scale with manager level (default level 1 if undefined)
            const managerMult = mgr ? mgr.multiplier * (mgr.level || 1) : 1;
            income += (biz.baseRevenue * biz.level * managerMult);
        }
      });
      
      const globalMultiplier = getGlobalMultiplier();
      const totalIncome = income * globalMultiplier;

      if (totalIncome > 0) {
          addMoney(totalIncome);
      }
    };

    // --- STOCK MARKET LOOP (5s) ---
    const marketTick = () => {
        tickStocks();
    };

    gameInterval.current = setInterval(tick, 1000);
    stockInterval.current = setInterval(marketTick, 5000); 

    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
      if (stockInterval.current) clearInterval(stockInterval.current);
    };
  }, [businesses, managers, activeEvent]); 
};