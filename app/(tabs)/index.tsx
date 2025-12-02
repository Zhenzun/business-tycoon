import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, SafeAreaView, Modal } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { useGameLoop } from '../../hooks/useGameLoop';
import { FloatingText } from '../../components/FloatingText';
import { DailyRewardModal } from '../../components/DailyRewardModal'; 
import { AchievementsModal } from '../../components/AchievementsModal';
import { ResearchModal } from '../../components/ResearchModal';
import { ManagersModal } from '../../components/ManagersModal'; // NEW COMPONENT
import { BusinessCard } from '../../components/BusinessCard';
import { ScaleButton } from '../../components/ScaleButton';
import { triggerHaptic } from '../../utils/haptics';
import { formatCurrency } from '../../utils/format';
import { loadSounds, playSound } from '../../utils/sound';
import { Coins, Briefcase, Gem, Trophy, Flame, Microscope, CircleDollarSign, TrendingUp } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

type ActiveAnim = { id: number; text: string; x: number; y: number };

export default function Dashboard() {
  const router = useRouter();
  const { 
    money, gems, businesses, managers, 
    addMoney, upgradeBusiness, 
    calculateOfflineEarnings, registerTap, 
    getGlobalMultiplier, activeEvent 
  } = useGameStore();
  
  const [animations, setAnimations] = useState<ActiveAnim[]>([]);
  const [showManagers, setShowManagers] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState(0);

  const globalMult = getGlobalMultiplier();

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
    const amount = baseTapPower * globalMult;
    
    addMoney(amount);
    registerTap();

    const { pageX, pageY } = event.nativeEvent;
    const id = Date.now();
    const randomX = (Math.random() - 0.5) * 60;
    
    setAnimations((prev) => [
      ...prev,
      { id, text: `+$${formatCurrency(amount)}`, x: pageX + randomX - 30, y: pageY - 60 },
    ]);
  };

  const removeAnimation = useCallback((id: number) => {
    setAnimations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleUpgradeBusiness = useCallback((id: string) => {
      playSound('upgrade');
      upgradeBusiness(id);
  }, []);

  return (
    <SafeAreaView className="screen-container relative">
      <Stack.Screen options={{ headerShown: false }} />

      <DailyRewardModal />
      <AchievementsModal visible={showAchievements} onClose={() => setShowAchievements(false)} />
      <ResearchModal visible={showResearch} onClose={() => setShowResearch(false)} />
      
      {/* NEW MANAGERS MODAL COMPONENT */}
      <ManagersModal visible={showManagers} onClose={() => setShowManagers(false)} />

      {/* --- HEADER --- */}
      <View className="bg-slate-900 pt-2 pb-4 px-6 border-b border-slate-800 z-10 shadow-lg">
        
        {/* EVENT BANNER */}
        {activeEvent && (
            <View className="bg-orange-500/10 border border-orange-500/50 rounded-xl p-2 mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center px-2">
                    <Flame size={18} color="#f97316" />
                    <Text className="text-orange-400 font-bold ml-2 text-xs uppercase">{activeEvent.name}</Text>
                </View>
                <View className="bg-orange-500 px-2 py-0.5 rounded">
                    <Text className="text-black font-extrabold text-[10px]">x{activeEvent.multiplier}</Text>
                </View>
            </View>
        )}

        <View className="flex-row justify-between items-center">
            {/* Money Display */}
            <View>
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Net Worth</Text>
                <View className="flex-row items-center">
                    <Coins size={28} color="#FBBF24" />
                    <Text className="text-white text-3xl font-extrabold ml-2 tracking-tight">${formatCurrency(money)}</Text>
                </View>
                <View className="flex-row items-center mt-1 bg-purple-900/30 self-start px-2 py-0.5 rounded-lg border border-purple-500/20">
                    <Gem size={12} color="#d8b4fe" />
                    <Text className="text-purple-200 text-[10px] font-bold ml-1">{formatCurrency(gems)} Gems</Text>
                </View>
            </View>

            {/* Menu Buttons Grid */}
            <View className="flex-row gap-2">
                <View className="gap-2">
                    <View className="flex-row gap-2">
                        <ScaleButton onPress={() => setShowManagers(true)} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 w-12 items-center justify-center">
                            <Briefcase size={20} color="#a78bfa" />
                        </ScaleButton>
                        <ScaleButton onPress={() => setShowResearch(true)} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 w-12 items-center justify-center">
                            <Microscope size={20} color="#60a5fa" />
                        </ScaleButton>
                    </View>
                    <ScaleButton onPress={() => router.push('/stock')} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex-row items-center justify-center">
                        <TrendingUp size={16} color="#34d399" style={{marginRight: 6}} />
                        <Text className="text-emerald-400 font-bold text-[10px]">STOCKS</Text>
                    </ScaleButton>
                </View>
                
                <View className="justify-center">
                     <ScaleButton onPress={() => setShowAchievements(true)} className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/50 h-full justify-center w-14 items-center">
                        <Trophy size={24} color="#fbbf24" />
                    </ScaleButton>
                </View>
            </View>
        </View>
      </View>

      {/* --- CLICKER AREA --- */}
      <View className="items-center justify-center py-6 bg-slate-900/50 border-b border-slate-800/50">
        <ScaleButton
          onPress={handleTap}
          className="bg-gradient-to-b from-blue-500 to-blue-700 p-5 rounded-full border-4 border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.4)] active:shadow-none"
        >
          <CircleDollarSign size={64} color="white" />
        </ScaleButton>
        <Text className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">Tap to Earn</Text>
      </View>

      {/* --- BUSINESS LIST --- */}
      <View className="flex-1 px-4 pt-4 bg-slate-950">
        <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-white font-bold text-lg">Investments</Text>
            <View className="bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-500/20">
                <Text className="text-emerald-400 text-[10px] font-bold">
                   MULTIPLIER: x{globalMult.toFixed(2)}
                </Text>
            </View>
        </View>
        
        <FlatList
          data={businesses.filter((b) => b.owned)}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const activeManager = managers.find(m => m.businessId === item.id && m.hired);
            // UPDATED: Scale manager multiplier
            const mgrMult = activeManager ? activeManager.multiplier * (activeManager.level || 1) : 1;

            return (
              <BusinessCard 
                item={item}
                money={money}
                onUpgrade={handleUpgradeBusiness}
                globalMultiplier={globalMult}
                managerMultiplier={mgrMult}
              />
            );
          }}
        />
      </View>

      {animations.map((anim) => (
        <FloatingText key={anim.id} text={anim.text} x={anim.x} y={anim.y} onComplete={() => removeAnimation(anim.id)}/>
      ))}

      {/* OFFLINE EARNINGS MODAL */}
      <Modal visible={offlineEarnings > 0} transparent animationType="fade">
        <View className="flex-1 bg-black/90 items-center justify-center px-8">
            <View className="bg-slate-900 w-full p-8 rounded-3xl border border-emerald-500/50 items-center shadow-2xl">
                <Text className="text-slate-400 text-xs uppercase tracking-[0.2em] font-bold mb-4">Welcome Back</Text>
                <Text className="text-white text-xl font-bold text-center mb-6">Passive Income Report</Text>
                
                <View className="bg-emerald-500/10 w-full py-6 rounded-2xl border border-emerald-500/30 mb-8 items-center">
                    <Text className="text-5xl font-extrabold text-emerald-400">${formatCurrency(offlineEarnings)}</Text>
                </View>
                
                <ScaleButton onPress={() => { triggerHaptic('success'); playSound('cash'); setOfflineEarnings(0); }} className="bg-emerald-500 w-full py-4 rounded-xl items-center shadow-lg shadow-emerald-500/20">
                    <Text className="text-white font-extrabold text-lg tracking-wider">COLLECT</Text>
                </ScaleButton>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}