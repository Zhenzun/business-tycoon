import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export const useGameLoop = () => {
  const addMoney = useGameStore((state) => state.addMoney);
  const triggerRandomEvent = useGameStore((state) => state.triggerRandomEvent);
  const clearEvent = useGameStore((state) => state.clearEvent);
  const tickStocks = useGameStore((state) => state.tickStocks);
  const changeWeather = useGameStore((state) => state.changeWeather);
  const decayCombo = useGameStore((state) => state.decayCombo); // [NEW]
  
  const gameInterval = useRef<NodeJS.Timeout | null>(null);
  const stockInterval = useRef<NodeJS.Timeout | null>(null);
  const weatherInterval = useRef<NodeJS.Timeout | null>(null);
  const comboInterval = useRef<NodeJS.Timeout | null>(null); // [NEW]

  useEffect(() => {
    // --- MAIN GAME LOOP (1s) ---
    gameInterval.current = setInterval(() => {
      const state = useGameStore.getState(); 
      const { businesses, getBusinessRevenue, activeEvent } = state;

      if (activeEvent && activeEvent.startTime) {
        const elapsed = (Date.now() - activeEvent.startTime) / 1000;
        if (elapsed >= activeEvent.duration) {
            clearEvent(); 
        }
      } else {
        if (Math.random() < 0.01) {
            triggerRandomEvent();
        }
      }

      let income = 0;
      businesses.forEach((biz) => {
        if (biz.owned) {
            // Gunakan helper baru untuk kalkulasi sinergi & manager
            income += getBusinessRevenue(biz.id);
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

    // --- WEATHER LOOP (30s) ---
    weatherInterval.current = setInterval(() => {
        if (Math.random() < 0.3) {
            changeWeather();
        }
    }, 30000);

    // --- [NEW] COMBO DECAY LOOP (100ms) ---
    comboInterval.current = setInterval(() => {
        decayCombo();
    }, 100);

    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
      if (stockInterval.current) clearInterval(stockInterval.current);
      if (weatherInterval.current) clearInterval(weatherInterval.current);
      if (comboInterval.current) clearInterval(comboInterval.current);
    };
  }, []);
};