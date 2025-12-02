import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  Easing,
  cancelAnimation
} from 'react-native-reanimated';
import { ScaleButton } from './ScaleButton';
import { formatCurrency } from '../utils/format';
import { Zap, Lock, ArrowUpCircle } from 'lucide-react-native';
import { Business } from '../store/gameStore';

interface Props {
  item: Business;
  money: number;
  onUpgrade: (id: string) => void;
  globalMultiplier: number;
  managerMultiplier: number;
}

const PRODUCTION_DURATION = 2000; // Contoh: 2 detik per siklus (bisa dibuat dinamis nanti)

export const BusinessCard = React.memo(({ item, money, onUpgrade, globalMultiplier, managerMultiplier }: Props) => {
  const upgradeCost = Math.floor(item.baseCost * Math.pow(1.15, item.level));
  const canAfford = money >= upgradeCost;
  const currentRevenue = item.baseRevenue * item.level * managerMultiplier * globalMultiplier;
  
  // Progress Bar Animasi Produksi
  const progress = useSharedValue(0);

  useEffect(() => {
    // Jika punya manager atau level > 0, jalankan animasi produksi
    if (item.level > 0) {
      // Semakin tinggi level, semakin cepat (simulasi visual)
      const duration = Math.max(200, 2000 - (item.level * 10)); 
      
      progress.value = withRepeat(
        withTiming(1, { duration: duration, easing: Easing.linear }),
        -1, // Infinite
        false // No reverse
      );
    } else {
        cancelAnimation(progress);
        progress.value = 0;
    }
  }, [item.level]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // Milestone Progress (Target level berikutnya: 25, 50, 100...)
  const milestones = [25, 50, 100, 200, 300, 400, 500, 1000];
  const nextMilestone = milestones.find(m => m > item.level) || 1000;
  const prevMilestone = milestones.slice().reverse().find(m => m <= item.level) || 0;
  const progressToMilestone = Math.min(100, Math.max(0, ((item.level - prevMilestone) / (nextMilestone - prevMilestone)) * 100));

  return (
    <View className="bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-4 shadow-sm overflow-hidden relative">
      
      {/* Background Production Bar (Subtle) */}
      <View className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
        <Animated.View className="h-full bg-emerald-500/50" style={animatedProgressStyle} />
      </View>

      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-xl font-bold text-white mr-2">{item.name}</Text>
            <View className="bg-blue-900/50 px-2 py-0.5 rounded border border-blue-500/30">
                <Text className="text-blue-300 text-[10px] font-bold">Lvl {item.level}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center">
            <Zap size={14} color="#34d399" fill="#34d399" />
            <Text className="text-emerald-400 font-mono font-bold text-lg ml-1">
              ${formatCurrency(currentRevenue)}/s
            </Text>
          </View>
        </View>

        <ScaleButton
          onPress={() => onUpgrade(item.id)}
          disabled={!canAfford}
          className={`px-4 py-2 rounded-xl flex-row items-center border-b-4 min-w-[100px] justify-center ${
            canAfford 
                ? 'bg-blue-600 border-blue-800' 
                : 'bg-slate-700 border-slate-900 opacity-50'
          }`}
        >
            <View className="items-center">
                <Text className="text-white font-bold text-[10px] uppercase mb-0.5">Upgrade</Text>
                <Text className="text-white font-mono font-bold text-xs">${formatCurrency(upgradeCost)}</Text>
            </View>
        </ScaleButton>
      </View>

      {/* Milestone Bar */}
      <View className="mt-4 flex-row items-center space-x-2">
        <View className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <View 
                className="h-full bg-amber-500" 
                style={{ width: `${progressToMilestone}%` }} 
            />
        </View>
        <Text className="text-slate-500 text-[10px] font-bold w-16 text-right">
            Next: x2 @ {nextMilestone}
        </Text>
      </View>
    </View>
  );
});