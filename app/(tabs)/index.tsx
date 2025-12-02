import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Modal, ScrollView } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { useGameLoop } from '../../hooks/useGameLoop';
import { FloatingText } from '../../components/FloatingText';
import { DailyRewardModal } from '../../components/DailyRewardModal'; 
import { AchievementsModal } from '../../components/AchievementsModal'; // IMPORT MODAL
import { triggerHaptic } from '../../utils/haptics';
import { formatCurrency } from '../../utils/format';
import { Coins, Zap, CircleDollarSign, Briefcase, X, Gem, Trophy } from 'lucide-react-native';
import { Stack } from 'expo-router';

type ActiveAnim = { id: number; text: string; x: number; y: number };

export default function Dashboard() {
  const { money, gems, businesses, managers, addMoney, upgradeBusiness, hireManager, calculateOfflineEarnings, registerTap } = useGameStore(); // AMBIL registerTap
  const [animations, setAnimations] = useState<ActiveAnim[]>([]);
  
  const [showManagers, setShowManagers] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false); // STATE MODAL
  const [offlineEarnings, setOfflineEarnings] = useState(0);

  useGameLoop();

  useEffect(() => {
    const earned = calculateOfflineEarnings();
    if (earned > 0) {
        setOfflineEarnings(earned);
    }
  }, []);

  const handleTap = (event: any) => {
    triggerHaptic('light'); 
    const amount = 10; 
    addMoney(amount);
    registerTap(); // <--- REKAM STATS

    const { pageX, pageY } = event.nativeEvent;
    const id = Date.now();
    
    setAnimations((prev) => [
      ...prev,
      { id, text: `$${formatCurrency(amount)}`, x: pageX - 20, y: pageY - 50 },
    ]);
  };

  const removeAnimation = (id: number) => {
    setAnimations((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <SafeAreaView className="screen-container relative">
      <Stack.Screen options={{ headerShown: false }} />

      {/* MODALS */}
      <DailyRewardModal />
      <AchievementsModal visible={showAchievements} onClose={() => setShowAchievements(false)} />
      
      {/* MANAGER MODAL */}
      <Modal visible={showManagers} animationType="slide" transparent={true}>
         <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-slate-900 rounded-t-3xl h-[75%] border-t border-slate-700">
                <View className="p-6 border-b border-slate-800 flex-row justify-between items-center">
                    <Text className="text-header text-2xl">Recruit Staff</Text>
                    <TouchableOpacity onPress={() => setShowManagers(false)}>
                        <X size={28} color="white" />
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={{padding: 20}}>
                    {managers.map(mgr => (
                        <View key={mgr.id} className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700 flex-row justify-between items-center">
                             <View className="flex-1 pr-2">
                                <Text className="text-white font-bold text-lg">{mgr.name}</Text>
                                <Text className="text-slate-400 text-xs">{mgr.description}</Text>
                                <Text className="text-amber-400 font-bold mt-1">Cost: ${formatCurrency(mgr.cost)}</Text>
                            </View>
                            {mgr.hired ? (
                                <View className="bg-emerald-500/20 px-3 py-2 rounded-lg"><Text className="text-emerald-400 font-bold text-xs">HIRED</Text></View>
                            ) : (
                                <TouchableOpacity onPress={() => hireManager(mgr.id)} disabled={money < mgr.cost} className={`px-4 py-2 rounded-lg ${money >= mgr.cost ? 'bg-blue-600' : 'bg-slate-700 opacity-50'}`}>
                                    <Text className="text-white font-bold text-xs">HIRE</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
      </Modal>

      {/* --- HEADER --- */}
      <View className="p-6 bg-slate-800 rounded-b-3xl shadow-lg border-b border-slate-700 z-10">
        <View className="flex-row justify-between items-start">
            <View>
                <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest">Net Worth</Text>
                <View className="flex-row items-center mt-2">
                    <Coins size={32} color="#FBBF24" />
                    <Text className="text-money text-4xl ml-3">${formatCurrency(money)}</Text>
                </View>
                <View className="flex-row items-center mt-2 bg-slate-900/50 self-start px-2 py-1 rounded-lg">
                    <Gem size={14} color="#d8b4fe" />
                    <Text className="text-purple-200 text-xs font-bold ml-1">{gems} Gems</Text>
                </View>
            </View>

            {/* BUTTON GROUP */}
            <View className="space-y-2">
                {/* Manager Button */}
                <TouchableOpacity 
                    onPress={() => setShowManagers(true)}
                    className="bg-purple-600 p-3 rounded-xl items-center justify-center border border-purple-400 shadow-md w-12 h-12"
                >
                    <Briefcase size={20} color="white" />
                </TouchableOpacity>

                {/* Achievement Button (NEW) */}
                <TouchableOpacity 
                    onPress={() => setShowAchievements(true)}
                    className="bg-amber-500 p-3 rounded-xl items-center justify-center border border-amber-300 shadow-md w-12 h-12"
                >
                    <Trophy size={20} color="black" />
                </TouchableOpacity>
            </View>
        </View>
      </View>

      {/* --- CLICKER AREA --- */}
      <View className="items-center justify-center py-6">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleTap}
          className="bg-brand-secondary p-8 rounded-full border-4 border-brand-primary shadow-lg shadow-blue-500/50"
        >
          <CircleDollarSign size={64} color="white" />
        </TouchableOpacity>
        <Text className="text-slate-500 mt-2 text-xs font-bold animate-pulse">TAP TO EARN</Text>
      </View>

      {/* --- BUSINESS LIST --- */}
      <View className="flex-1 px-4">
        <Text className="text-white font-bold text-lg mb-4">Your Empire</Text>
        <FlatList
          data={businesses.filter((b) => b.owned)}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const upgradeCost = Math.floor(item.baseCost * Math.pow(1.15, item.level));
            const canAfford = money >= upgradeCost;
            const activeManager = managers.find(m => m.businessId === item.id && m.hired);
            const multiplier = activeManager ? activeManager.multiplier : 1;
            const currentRevenue = item.baseRevenue * item.level * multiplier;
            const milestones = [25, 50, 100, 200, 300, 400, 500, 1000];
            const nextMilestone = milestones.find(m => m > item.level) || 1000;

            return (
              <View className="biz-card flex-row justify-between items-center">
                <View>
                  <View className="flex-row items-center">
                    <Text className="text-xl font-bold text-white">{item.name}</Text>
                    {activeManager && (
                        <View className="bg-amber-500 px-2 py-0.5 rounded ml-2">
                            <Text className="text-black text-[10px] font-bold">x{multiplier}</Text>
                        </View>
                    )}
                  </View>
                  <Text className="text-emerald-400 font-semibold text-sm">
                    ${formatCurrency(currentRevenue)}/sec
                  </Text>
                  
                  <Text className="text-slate-500 text-[10px] mt-1">
                    Target: Lvl {nextMilestone} (x2 Profit)
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => upgradeBusiness(item.id)}
                  disabled={!canAfford}
                  className={`px-4 py-2 rounded-lg flex-row items-center transition-all min-w-[100px] justify-center ${
                    canAfford ? 'bg-blue-600 active:bg-blue-700' : 'btn-disabled'
                  }`}
                >
                  <Zap size={14} color="white" style={{ marginRight: 4 }} />
                  <View className="items-center">
                    <Text className="text-white font-bold text-xs">LVL UP</Text>
                    <Text className="text-white/80 text-[10px] font-mono">${formatCurrency(upgradeCost)}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>

      {/* --- FLOATING TEXT --- */}
      {animations.map((anim) => (
        <FloatingText key={anim.id} text={anim.text} x={anim.x} y={anim.y} onComplete={() => removeAnimation(anim.id)}/>
      ))}

      {/* --- MODAL: WELCOME BACK (Offline Earnings) --- */}
      <Modal visible={offlineEarnings > 0} transparent animationType="fade">
        <View className="flex-1 bg-black/90 items-center justify-center px-8">
            <View className="bg-slate-800 w-full p-6 rounded-3xl border-2 border-amber-500 items-center shadow-2xl shadow-amber-500/20">
                <Text className="text-slate-400 uppercase tracking-widest font-bold mb-2">Welcome back CEO!</Text>
                <Text className="text-white text-lg text-center mb-4">While you were away, your empire earned:</Text>
                <Text className="text-5xl font-extrabold text-emerald-400 mb-8">${formatCurrency(offlineEarnings)}</Text>
                <TouchableOpacity onPress={() => { triggerHaptic('success'); setOfflineEarnings(0); }} className="bg-amber-500 w-full py-4 rounded-xl items-center shadow-lg">
                    <Text className="text-black font-bold text-xl">COLLECT CASH</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}