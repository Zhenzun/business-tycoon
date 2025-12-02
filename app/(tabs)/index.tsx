import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Modal, ScrollView } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { useGameLoop } from '../../hooks/useGameLoop';
import { FloatingText } from '../../components/FloatingText';
import { DailyRewardModal } from '../../components/DailyRewardModal'; 
import { AchievementsModal } from '../../components/AchievementsModal';
import { ScaleButton } from '../../components/ScaleButton';
import { triggerHaptic } from '../../utils/haptics';
import { formatCurrency } from '../../utils/format';
import { loadSounds, playSound } from '../../utils/sound';
import { Coins, Zap, CircleDollarSign, Briefcase, X, Gem, Trophy, Flame } from 'lucide-react-native';
import { Stack } from 'expo-router';

type ActiveAnim = { id: number; text: string; x: number; y: number };

export default function Dashboard() {
  const { 
    money, gems, businesses, managers, 
    addMoney, upgradeBusiness, hireManager, 
    calculateOfflineEarnings, registerTap, 
    getGlobalMultiplier, activeEvent // AMBIL ACTIVE EVENT
  } = useGameStore();
  
  const [animations, setAnimations] = useState<ActiveAnim[]>([]);
  const [showManagers, setShowManagers] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState(0);

  useGameLoop();

  useEffect(() => {
    loadSounds();
    const earned = calculateOfflineEarnings();
    if (earned > 0) {
        setOfflineEarnings(earned);
    }
  }, []);

  const handleTap = (event: any) => {
    triggerHaptic('light'); 
    playSound('tap'); 

    const baseTapPower = 10;
    const globalMult = getGlobalMultiplier(); 
    const amount = baseTapPower * globalMult;
    
    addMoney(amount);
    registerTap();

    const { pageX, pageY } = event.nativeEvent;
    const id = Date.now();
    const randomX = (Math.random() - 0.5) * 40;
    
    setAnimations((prev) => [
      ...prev,
      { id, text: `+$${formatCurrency(amount)}`, x: pageX + randomX - 20, y: pageY - 50 },
    ]);
  };

  const removeAnimation = (id: number) => {
    setAnimations((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <SafeAreaView className="screen-container relative">
      <Stack.Screen options={{ headerShown: false }} />

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
                                <ScaleButton onPress={() => hireManager(mgr.id)} disabled={money < mgr.cost} className={`px-4 py-2 rounded-lg ${money >= mgr.cost ? 'bg-blue-600' : 'bg-slate-700 opacity-50'}`}>
                                    <Text className="text-white font-bold text-xs">HIRE</Text>
                                </ScaleButton>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
      </Modal>

      {/* --- HEADER --- */}
      <View className="bg-slate-800 rounded-b-3xl shadow-lg border-b border-slate-700 z-10 pb-6 pt-2 px-6">
        
        {/* EVENT BANNER */}
        {activeEvent && (
            <View className="bg-orange-500/20 border border-orange-500 rounded-xl p-3 mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Flame size={20} color="#f97316" />
                    <Text className="text-orange-400 font-bold ml-2 text-sm">{activeEvent.name}</Text>
                </View>
                <View className="bg-orange-500 px-2 py-1 rounded">
                    <Text className="text-black font-extrabold text-xs">x{activeEvent.multiplier} BOosT</Text>
                </View>
            </View>
        )}

        <View className="flex-row justify-between items-start">
            <View>
                <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest">Net Worth</Text>
                <View className="flex-row items-center mt-2">
                    <Coins size={32} color="#FBBF24" />
                    <Text className="text-money text-4xl ml-3">${formatCurrency(money)}</Text>
                </View>
                <View className="flex-row items-center mt-2 bg-slate-900/50 self-start px-2 py-1 rounded-lg border border-purple-500/30">
                    <Gem size={14} color="#d8b4fe" />
                    <Text className="text-purple-200 text-xs font-bold ml-1">{gems} Gems</Text>
                </View>
            </View>

            <View className="space-y-2">
                <ScaleButton 
                    onPress={() => setShowManagers(true)}
                    className="bg-purple-600 p-3 rounded-xl items-center justify-center border border-purple-400 shadow-md w-12 h-12"
                >
                    <Briefcase size={20} color="white" />
                </ScaleButton>

                <ScaleButton 
                    onPress={() => setShowAchievements(true)}
                    className="bg-amber-500 p-3 rounded-xl items-center justify-center border border-amber-300 shadow-md w-12 h-12"
                >
                    <Trophy size={20} color="black" />
                </ScaleButton>
            </View>
        </View>
      </View>

      {/* --- CLICKER AREA (BIG BUTTON) --- */}
      <View className="items-center justify-center py-8">
        <ScaleButton
          onPress={handleTap}
          className="bg-brand-secondary p-8 rounded-full border-4 border-brand-primary shadow-[0_0_40px_rgba(59,130,246,0.5)] active:shadow-none"
        >
          <CircleDollarSign size={80} color="white" />
        </ScaleButton>
        <Text className="text-slate-500 mt-4 text-xs font-bold uppercase tracking-widest">Tap to Earn</Text>
      </View>

      {/* --- BUSINESS LIST --- */}
      <View className="flex-1 px-4">
        <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-bold text-lg">Your Empire</Text>
            <View className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <Text className="text-slate-400 text-xs font-bold">
                   Total Boost: <Text className="text-emerald-400">x{getGlobalMultiplier().toFixed(1)}</Text>
                </Text>
            </View>
        </View>
        
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
            
            const globalMult = getGlobalMultiplier();
            const currentRevenue = item.baseRevenue * item.level * multiplier * globalMult;
            
            const milestones = [25, 50, 100, 200, 300, 400, 500, 1000];
            const nextMilestone = milestones.find(m => m > item.level) || 1000;
            const progressToMilestone = Math.min(100, Math.max(0, (item.level / nextMilestone) * 100));

            return (
              <View className="biz-card mb-4 overflow-hidden">
                <View className="flex-row justify-between items-center">
                    <View>
                      <View className="flex-row items-center">
                        <Text className="text-xl font-bold text-white">{item.name}</Text>
                        <View className="bg-slate-700 px-2 py-0.5 rounded ml-2">
                            <Text className="text-slate-300 text-[10px] font-bold">Lvl {item.level}</Text>
                        </View>
                      </View>
                      
                      <Text className="text-emerald-400 font-mono font-bold text-sm mt-1">
                        ${formatCurrency(currentRevenue)}/sec
                      </Text>
                    </View>

                    <ScaleButton
                      onPress={() => {
                          playSound('upgrade');
                          upgradeBusiness(item.id);
                      }}
                      disabled={!canAfford}
                      className={`px-4 py-3 rounded-xl flex-row items-center min-w-[110px] justify-center border-b-4 ${
                        canAfford 
                            ? 'bg-blue-600 border-blue-800' 
                            : 'bg-slate-700 border-slate-900 opacity-50'
                      }`}
                    >
                      <View className="items-center">
                        <Text className="text-white font-bold text-xs uppercase">Upgrade</Text>
                        <Text className="text-white/90 text-[10px] font-mono">${formatCurrency(upgradeCost)}</Text>
                      </View>
                    </ScaleButton>
                </View>

                <View className="mt-3 bg-slate-900 h-1.5 rounded-full overflow-hidden w-full flex-row">
                    <View 
                        className="bg-amber-500 h-full rounded-full" 
                        style={{ width: `${progressToMilestone}%` }} 
                    />
                </View>
                <Text className="text-slate-500 text-[10px] mt-1 text-right">
                    x2 Boost at Lvl {nextMilestone}
                </Text>
              </View>
            );
          }}
        />
      </View>

      {animations.map((anim) => (
        <FloatingText key={anim.id} text={anim.text} x={anim.x} y={anim.y} onComplete={() => removeAnimation(anim.id)}/>
      ))}

      <Modal visible={offlineEarnings > 0} transparent animationType="fade">
        <View className="flex-1 bg-black/90 items-center justify-center px-8">
            <View className="bg-slate-800 w-full p-6 rounded-3xl border-2 border-amber-500 items-center shadow-2xl">
                <Text className="text-slate-400 uppercase tracking-widest font-bold mb-2">Welcome back CEO!</Text>
                <Text className="text-white text-lg text-center mb-4">While you were sleeping, your managers earned:</Text>
                <Text className="text-5xl font-extrabold text-emerald-400 mb-8">${formatCurrency(offlineEarnings)}</Text>
                <ScaleButton onPress={() => { triggerHaptic('success'); playSound('cash'); setOfflineEarnings(0); }} className="bg-amber-500 w-full py-4 rounded-xl items-center shadow-lg border-b-4 border-amber-700">
                    <Text className="text-black font-extrabold text-xl tracking-wider">COLLECT CASH</Text>
                </ScaleButton>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}