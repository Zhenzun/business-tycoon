import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
import { Zap, Play, Link as LinkIcon } from 'lucide-react-native';
import { Business, useGameStore, SYNERGIES } from '../store/gameStore';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  item: Business;
  money: number;
  onUpgrade: (id: string) => void;
  globalMultiplier: number;
  managerMultiplier: number;
}

export const BusinessCard = React.memo(({ item, money, onUpgrade, globalMultiplier, managerMultiplier }: Props) => {
  const { managers, triggerManagerSkill, lastSkillUsed, businesses } = useGameStore(); 
  const upgradeCost = Math.floor(item.baseCost * Math.pow(1.15, item.level));
  const canAfford = money >= upgradeCost;
  
  // Logic Sinergi Visual
  let synergyMult = 1;
  const activeSynergy = SYNERGIES.find(syn => 
      syn.businesses.includes(item.id) && syn.businesses.every(bid => businesses.find(b => b.id === bid)?.owned)
  );
  if (activeSynergy) synergyMult = activeSynergy.multiplier;

  const currentRevenue = item.baseRevenue * item.level * managerMultiplier * globalMultiplier * synergyMult;
  
  const isGoldTier = item.level >= 100;
  const isMaxed = item.level >= 500; 
  
  const activeManager = managers.find(m => m.businessId === item.id && m.hired);
  const now = Date.now();
  const cooldownEnd = activeManager ? (lastSkillUsed[activeManager.id] || 0) + (activeManager.skillCooldown * 1000) : 0;
  const isCooldown = now < cooldownEnd;
  
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

  const milestones = [25, 50, 100, 200, 300, 400, 500];
  const nextMilestone = milestones.find(m => m > item.level) || 500;
  const prevMilestone = milestones.slice().reverse().find(m => m <= item.level) || 0;
  const progressToMilestone = Math.min(100, Math.max(0, ((item.level - prevMilestone) / (nextMilestone - prevMilestone)) * 100));

  const progressBarColor = isGoldTier ? '#fbbf24' : '#10b981';

  return (
    <View className={`p-0.5 rounded-2xl mb-4 shadow-sm ${isGoldTier ? 'bg-amber-500' : 'bg-slate-700'}`}>
      <View className="bg-slate-800 p-4 rounded-2xl overflow-hidden relative">
      
        {isGoldTier && (
            <LinearGradient
                colors={['rgba(251, 191, 36, 0.05)', 'rgba(251, 191, 36, 0.1)', 'rgba(251, 191, 36, 0.05)']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
        )}

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
                
                {/* SYNERGY BADGE */}
                {activeSynergy && (
                    <View className="flex-row items-center mb-1 bg-blue-900/30 self-start px-2 py-0.5 rounded">
                        <LinkIcon size={10} color="#60a5fa" />
                        <Text className="text-blue-400 text-[10px] font-bold ml-1 uppercase">{activeSynergy.name} Linked (x{activeSynergy.multiplier})</Text>
                    </View>
                )}
                
                <View className="flex-row items-center mt-1">
                    <Zap size={14} color={progressBarColor} fill={progressBarColor} />
                    <Text className={`font-mono font-bold text-lg ml-1 ${isGoldTier ? 'text-amber-200' : 'text-emerald-400'}`}>
                    ${formatCurrency(currentRevenue)}/s
                    </Text>
                </View>

                {activeManager && (
                    <TouchableOpacity 
                        onPress={() => triggerManagerSkill(activeManager.id)}
                        disabled={isCooldown}
                        className={`mt-2 flex-row items-center self-start px-2 py-1 rounded-lg border ${
                            isCooldown 
                            ? 'bg-slate-700/50 border-slate-600' 
                            : 'bg-purple-900/30 border-purple-500/50'
                        }`}
                    >
                        <Play size={10} color={isCooldown ? "#64748b" : "#d8b4fe"} fill={isCooldown ? "none" : "#d8b4fe"} />
                        <Text className={`text-[10px] font-bold ml-1 ${isCooldown ? 'text-slate-500' : 'text-purple-300'}`}>
                            {isCooldown ? 'COOLDOWN' : `SKILL: ${activeManager.skillName}`}
                        </Text>
                    </TouchableOpacity>
                )}
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