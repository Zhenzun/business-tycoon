import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export const useGameLoop = () => {
  // 1. Ambil state 'investors' dari store
  const { businesses, managers, investors, addMoney } = useGameStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // The Loop (Passive Income)
  useEffect(() => {
    const tick = () => {
      let income = 0;
      
      // 2. Hitung Multiplier Global dari Investor (Setiap 1 investor = +2% revenue)
      const investorMultiplier = 1 + (investors * 0.02);

      businesses.forEach((biz) => {
        if (biz.owned) {
            // Cek apakah ada manager untuk bisnis ini
            const mgr = managers.find(m => m.businessId === biz.id && m.hired);
            const managerMult = mgr ? mgr.multiplier : 1;
            
            // Hitung revenue bisnis individual
            income += (biz.baseRevenue * biz.level * managerMult);
        }
      });
      
      // 3. Terapkan Global Boost ke total income
      const totalIncome = income * investorMultiplier;

      if (totalIncome > 0) addMoney(totalIncome);
    };

    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [businesses, managers, investors]); // 4. Wajib tambahkan 'investors' ke dependency array
};