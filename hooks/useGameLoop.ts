import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export const useGameLoop = () => {
  const { 
    businesses, managers, addMoney, getGlobalMultiplier, 
    activeEvent, triggerRandomEvent, clearEvent, 
    research, investors 
  } = useGameStore();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const tick = () => {
      // 1. Handle Active Event Duration
      if (activeEvent && activeEvent.startTime) {
        const elapsed = (Date.now() - activeEvent.startTime) / 1000;
        if (elapsed >= activeEvent.duration) {
            clearEvent(); // Event Selesai
        }
      } else {
        // 2. Random Event Trigger
        // 1% chance per second (Approx every 100s)
        if (Math.random() < 0.01) {
            triggerRandomEvent();
        }
      }

      // 3. Calculate Income
      let income = 0;
      
      businesses.forEach((biz) => {
        if (biz.owned) {
            const mgr = managers.find(m => m.businessId === biz.id && m.hired);
            const managerMult = mgr ? mgr.multiplier : 1;
            income += (biz.baseRevenue * biz.level * managerMult);
        }
      });
      
      // Global multiplier now includes Active Event
      const globalMultiplier = getGlobalMultiplier();
      const totalIncome = income * globalMultiplier;

      if (totalIncome > 0) {
          addMoney(totalIncome);
      }
    };

    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [businesses, managers, research, investors, activeEvent]); // Add activeEvent
};