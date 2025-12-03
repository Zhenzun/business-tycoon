import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, SafeAreaView, Modal, StatusBar } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { useGameLoop } from '../../hooks/useGameLoop';
import { FloatingText } from '../../components/FloatingText';
import { DailyRewardModal } from '../../components/DailyRewardModal'; 
import { AchievementsModal } from '../../components/AchievementsModal';
import { ResearchModal } from '../../components/ResearchModal';
import { GachaSystemModal } from '../../components/GachaSystemModal'; // [UPDATE] Import Gacha
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
    playSound('tap'); 

    const baseTapPower = 10;
    const amount = baseTapPower * globalMult;
    
    addMoney(amount);
    registerTap();

    const pageX = event?.nativeEvent?.pageX ?? 200;
    const pageY = event?.nativeEvent?.pageY ?? 400;
    
    const id = Date.now();
    const randomX = (Math.random() - 0.5) * 60;
    
    setAnimations((prev) => [
      ...prev,
      { id, text: `+$${formatCurrency(amount)}`, x: pageX + randomX - 20, y: pageY - 40 },
    ]);
  };

  const removeAnimation = useCallback((id: number) => {
    setAnimations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleUpgradeBusiness = useCallback((id: string) => {
      playSound('upgrade');
      upgradeBusiness(id);
  }, []);

  // --- COMPONENT: Bagian Atas List (Clicker & Judul) ---
  const ListHeader = () => (
    <View className="mb-4">
      {/* CLICKER AREA */}
      <View className="items-center justify-center py-8 bg-slate-900/50 mb-6 border-b border-white/5">
        <ScaleButton
          onPress={handleTap}
          className="bg-gradient-to-b from-blue-500 to-blue-700 p-6 rounded-full border-[6px] border-blue-400/20 shadow-[0_0_40px_rgba(59,130,246,0.5)] active:scale-95"
        >
          <CircleDollarSign size={72} color="white" />
        </ScaleButton>
        <Text className="text-slate-500 text-[10px] font-bold mt-4 uppercase tracking-[0.2em]">Tap to Earn</Text>
      </View>

      {/* SECTION TITLE */}
      <View className="flex-row justify-between items-center px-4 mb-2">
          <Text className="text-white font-bold text-xl tracking-tight">Investments</Text>
          <View className="bg-emerald-900/40 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <Text className="text-emerald-400 text-[10px] font-bold">
                 GLOBAL BOOST: x{globalMult.toFixed(2)}
              </Text>
          </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- MODALS --- */}
      <DailyRewardModal />
      <AchievementsModal visible={showAchievements} onClose={() => setShowAchievements(false)} />
      <ResearchModal visible={showResearch} onClose={() => setShowResearch(false)} />
      
      {/* [UPDATE] Pakai Gacha System */}
      <GachaSystemModal visible={showManagers} onClose={() => setShowManagers(false)} />

      {/* --- FIXED HEADER (Money & Menu) --- */}
      <View className="bg-slate-900 pt-2 pb-3 px-5 border-b border-slate-800 z-20 shadow-xl">
        
        {/* EVENT BANNER */}
        {activeEvent && (
            <View className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-1.5 mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center px-1">
                    <Flame size={14} color="#f97316" />
                    <Text className="text-orange-400 font-bold ml-2 text-[10px] uppercase">{activeEvent.name} Active</Text>
                </View>
                <View className="bg-orange-500 px-2 py-0.5 rounded">
                    <Text className="text-black font-extrabold text-[10px]">x{activeEvent.multiplier}</Text>
                </View>
            </View>
        )}

        <View className="flex-row justify-between items-end">
            {/* Money Display */}
            <View>
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Net Worth</Text>
                <View className="flex-row items-center">
                    <Coins size={26} color="#FBBF24" />
                    <Text className="text-white text-3xl font-extrabold ml-2 tracking-tighter">${formatCurrency(money)}</Text>
                </View>
                <View className="flex-row items-center mt-1 bg-purple-900/30 self-start px-2 py-0.5 rounded border border-purple-500/20">
                    <Gem size={10} color="#d8b4fe" />
                    <Text className="text-purple-200 text-[10px] font-bold ml-1">{formatCurrency(gems)} Gems</Text>
                </View>
            </View>

            {/* Menu Buttons Grid */}
            <View className="flex-row gap-2">
                 {/* [UPDATE] Tombol Manager sekarang untuk Gacha */}
                 <ScaleButton onPress={() => setShowManagers(true)} className="bg-slate-800 p-2 rounded-lg border border-purple-500/50 items-center justify-center w-10 h-10 shadow shadow-purple-500/20">
                    <Briefcase size={18} color="#a78bfa" />
                </ScaleButton>
                <ScaleButton onPress={() => setShowResearch(true)} className="bg-slate-800 p-2 rounded-lg border border-slate-700 items-center justify-center w-10 h-10">
                    <Microscope size={18} color="#60a5fa" />
                </ScaleButton>
                <ScaleButton onPress={() => router.push('/stock')} className="bg-slate-800 p-2 rounded-lg border border-slate-700 items-center justify-center w-10 h-10">
                    <TrendingUp size={18} color="#34d399" />
                </ScaleButton>
                 <ScaleButton onPress={() => setShowAchievements(true)} className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/50 items-center justify-center w-10 h-10">
                    <Trophy size={18} color="#fbbf24" />
                </ScaleButton>
            </View>
        </View>
      </View>

      {/* --- SCROLLABLE CONTENT --- */}
      <FlatList
        data={businesses.filter((b) => b.owned)}
        ListHeaderComponent={ListHeader}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        className="px-4"
        renderItem={({ item }) => {
          const activeManager = managers.find(m => m.businessId === item.id && m.hired);
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

      {/* --- FLOATING TEXT ANIMATIONS --- */}
      <View className="absolute inset-0 pointer-events-none z-50" pointerEvents="none">
        {animations.map((anim) => (
            <FloatingText key={anim.id} text={anim.text} x={anim.x} y={anim.y} onComplete={() => removeAnimation(anim.id)}/>
        ))}
      </View>

      {/* --- OFFLINE EARNINGS MODAL --- */}
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