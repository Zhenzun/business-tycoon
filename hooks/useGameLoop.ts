import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export const useGameLoop = () => {
  // Kita tidak butuh dependencies dari store di sini agar loop tidak reset terus
  const addMoney = useGameStore((state) => state.addMoney);
  const triggerRandomEvent = useGameStore((state) => state.triggerRandomEvent);
  const clearEvent = useGameStore((state) => state.clearEvent);
  const tickStocks = useGameStore((state) => state.tickStocks);
  
  const gameInterval = useRef<NodeJS.Timeout | null>(null);
  const stockInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // --- MAIN GAME LOOP (1s) ---
    gameInterval.current = setInterval(() => {
      // PENTING: Ambil state terbaru LANGSUNG dari store (GetState), bukan dari props/hook
      const state = useGameStore.getState(); 
      const { businesses, managers, activeEvent } = state;

      // 1. Handle Active Event Duration
      if (activeEvent && activeEvent.startTime) {
        const elapsed = (Date.now() - activeEvent.startTime) / 1000;
        if (elapsed >= activeEvent.duration) {
            clearEvent(); 
        }
      } else {
        // 2. Random Event Trigger (~1% chance per detik)
        if (Math.random() < 0.01) {
            triggerRandomEvent();
        }
      }

      // 3. Calculate Income
      let income = 0;
      businesses.forEach((biz) => {
        if (biz.owned) {
            const mgr = managers.find(m => m.businessId === biz.id && m.hired);
            // Default level 1 jika tidak ada manager, tapi jika ada manager hitung boostnya
            const managerMult = mgr ? mgr.multiplier * (mgr.level || 1) : 1;
            
            // Logic Idle: Revenue x Level x ManagerBoost
            // Note: Biasanya Idle game, manager menjalankan bisnis otomatis. 
            // Jika logic kamu "Manager meningkatkan profit", ini sudah benar.
            income += (biz.baseRevenue * biz.level * managerMult);
        }
      });
      
      const globalMultiplier = state.getGlobalMultiplier();
      const totalIncome = income * globalMultiplier;

      if (totalIncome > 0) {
          addMoney(totalIncome);
      }
    }, 1000);

    // --- STOCK MARKET LOOP (5s) ---
    stockInterval.current = setInterval(() => {
        tickStocks();
    }, 5000); 

    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
      if (stockInterval.current) clearInterval(stockInterval.current);
    };
  }, []); // Dependency array KOSONG agar loop stabil
};