import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
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
import { Zap } from 'lucide-react-native';
import { Business } from '../store/gameStore';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  item: Business;
  money: number;
  onUpgrade: (id: string) => void;
  globalMultiplier: number;
  managerMultiplier: number;
}

export const BusinessCard = React.memo(({ item, money, onUpgrade, globalMultiplier, managerMultiplier }: Props) => {
  const upgradeCost = Math.floor(item.baseCost * Math.pow(1.15, item.level));
  const canAfford = money >= upgradeCost;
  const currentRevenue = item.baseRevenue * item.level * managerMultiplier * globalMultiplier;
  
  // Logic visual
  const isGoldTier = item.level >= 100;
  const isMaxed = item.level >= 500; 
  
  // Progress Bar Animasi Produksi
  const progress = useSharedValue(0);

  useEffect(() => {
    if (item.level > 0) {
      const duration = Math.max(200, 2000 - (item.level * 10)); 
      progress.value = withRepeat(
        withTiming(1, { duration: duration, easing: Easing.linear }),
        -1, false 
      );
    } else {
        cancelAnimation(progress);
        progress.value = 0;
    }
  }, [item.level]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // Milestone Progress
  const milestones = [25, 50, 100, 200, 300, 400, 500];
  const nextMilestone = milestones.find(m => m > item.level) || 500;
  const prevMilestone = milestones.slice().reverse().find(m => m <= item.level) || 0;
  const progressToMilestone = Math.min(100, Math.max(0, ((item.level - prevMilestone) / (nextMilestone - prevMilestone)) * 100));

  // Warna Progress Bar Dinamis
  const progressBarColor = isGoldTier ? '#fbbf24' : '#10b981';

  return (
    <View className={`p-0.5 rounded-2xl mb-4 shadow-sm ${isGoldTier ? 'bg-amber-500' : 'bg-slate-700'}`}>
      <View className="bg-slate-800 p-4 rounded-2xl overflow-hidden relative">
      
        {/* GOLDEN GLOW EFFECT */}
        {isGoldTier && (
            <LinearGradient
                colors={['rgba(251, 191, 36, 0.05)', 'rgba(251, 191, 36, 0.1)', 'rgba(251, 191, 36, 0.05)']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
        )}

        {/* Background Production Bar */}
        <View className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900">
            <Animated.View 
                className="h-full" 
                style={[animatedProgressStyle, { backgroundColor: progressBarColor }]} 
            />
        </View>

        <View className="flex-row justify-between items-start">
            <View className="flex-1">
            <View className="flex-row items-center mb-1">
                <Text className={`text-xl font-bold mr-2 ${isGoldTier ? 'text-amber-400' : 'text-white'}`}>{item.name}</Text>
                <View className={`px-2 py-0.5 rounded border ${isGoldTier ? 'bg-amber-900/50 border-amber-500/30' : 'bg-blue-900/50 border-blue-500/30'}`}>
                    <Text className={`text-[10px] font-bold ${isGoldTier ? 'text-amber-300' : 'text-blue-300'}`}>Lvl {item.level}</Text>
                </View>
            </View>
            
            <View className="flex-row items-center">
                <Zap size={14} color={progressBarColor} fill={progressBarColor} />
                <Text className={`font-mono font-bold text-lg ml-1 ${isGoldTier ? 'text-amber-200' : 'text-emerald-400'}`}>
                ${formatCurrency(currentRevenue)}/s
                </Text>
            </View>
            </View>

            <ScaleButton
            onPress={() => onUpgrade(item.id)}
            disabled={!canAfford}
            className={`px-4 py-2 rounded-xl flex-row items-center border-b-4 min-w-[100px] justify-center ${
                canAfford 
                    ? (isGoldTier ? 'bg-amber-600 border-amber-800' : 'bg-blue-600 border-blue-800')
                    : 'bg-slate-700 border-slate-900 opacity-50'
            }`}
            >
                <View className="items-center">
                    <Text className="text-white font-bold text-[10px] uppercase mb-0.5">Upgrade</Text>
                    <Text className="text-white font-mono font-bold text-xs">${formatCurrency(upgradeCost)}</Text>
                </View>
            </ScaleButton>
        </View>

        {/* Milestone Bar (Updated Visual) */}
        <View className="mt-4 flex-row items-center space-x-2">
            <View className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <View 
                    className={`h-full ${isGoldTier ? 'bg-amber-500' : 'bg-blue-500'}`} 
                    style={{ width: `${progressToMilestone}%` }} 
                />
            </View>
            <Text className="text-slate-500 text-[10px] font-bold w-16 text-right">
                {isMaxed ? 'MAX' : `${item.level} / ${nextMilestone}`}
            </Text>
        </View>
      </View>
    </View>
  );
});