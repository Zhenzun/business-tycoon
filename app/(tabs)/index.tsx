import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, SafeAreaView, Modal, StatusBar } from 'react-native';
import { useGameStore, WeatherType } from '../../store/gameStore';
import { useGameLoop } from '../../hooks/useGameLoop';
import { FloatingText } from '../../components/FloatingText';
import { DailyRewardModal } from '../../components/DailyRewardModal'; 
import { AchievementsModal } from '../../components/AchievementsModal';
import { ResearchModal } from '../../components/ResearchModal';
import { GachaSystemModal } from '../../components/GachaSystemModal'; 
import { BusinessCard } from '../../components/BusinessCard';
import { ScaleButton } from '../../components/ScaleButton';
import { CEORoomModal } from '../../components/CEORoomModal';
import { triggerHaptic } from '../../utils/haptics';
import { formatCurrency } from '../../utils/format';
import { loadSounds, playSound } from '../../utils/sound';
import { Coins, Briefcase, Gem, Trophy, Flame, Microscope, CircleDollarSign, TrendingUp, Sun, CloudRain, CloudLightning, Zap, UserCog } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

type ActiveAnim = { id: number; text: string; x: number; y: number };

const WeatherIcon = ({ type }: { type: WeatherType }) => {
    switch (type) {
        case 'RAIN': return <CloudRain size={20} color="#60a5fa" />;
        case 'STORM': return <CloudLightning size={20} color="#a8a29e" />;
        case 'GOLDEN_HOUR': return <Sun size={20} color="#fbbf24" fill="#fbbf24" />;
        default: return <Sun size={20} color="#fcd34d" />;
    }
};

const getWeatherColor = (type: WeatherType) => {
    switch (type) {
        case 'RAIN': return 'bg-blue-900/40 border-blue-500/30';
        case 'STORM': return 'bg-slate-800 border-slate-500';
        case 'GOLDEN_HOUR': return 'bg-amber-500/20 border-amber-500';
        default: return 'bg-sky-500/10 border-sky-500/30';
    }
};

export default function Dashboard() {
  const router = useRouter();
  const { 
    money, gems, businesses, managers, 
    addMoney, upgradeBusiness, 
    calculateOfflineEarnings, registerTap, 
    getGlobalMultiplier, activeEvent, 
    weather, newsTicker // [NEW] Get state
  } = useGameStore();
  
  const [animations, setAnimations] = useState<ActiveAnim[]>([]);
  const [showManagers, setShowManagers] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState(0);
  const [showCeoRoom, setShowCeoRoom] = useState(false);

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
    
    setAnimations((prev) => [
      ...prev,
      { id, text: `+$${formatCurrency(amount)}`, x: pageX + (Math.random() - 0.5) * 60 - 20, y: pageY - 40 },
    ]);
  };
  const id = Date.now(); // moved out for key

  const removeAnimation = useCallback((id: number) => {
    setAnimations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleUpgradeBusiness = useCallback((id: string) => {
      playSound('upgrade');
      upgradeBusiness(id);
  }, []);

  // --- COMPONENT: Bagian Atas List ---
  const ListHeader = () => (
    <View className="mb-6 px-4">
      {/* NEWS TICKER [NEW] */}
      <View className="bg-black/30 mb-4 py-2 px-3 rounded-lg border border-white/5 overflow-hidden">
          <Text className="text-slate-400 text-xs font-mono" numberOfLines={1}>
              📰 {newsTicker}
          </Text>
      </View>

      {/* WEATHER & BOOST WIDGET [NEW] */}
      <View className={`flex-row items-center justify-between p-3 rounded-xl border mb-6 ${getWeatherColor(weather)}`}>
          <View className="flex-row items-center">
              <WeatherIcon type={weather} />
              <View className="ml-3">
                  <Text className="text-white font-bold text-sm uppercase">{weather.replace('_', ' ')}</Text>
                  <Text className="text-slate-300 text-[10px]">Multiplier Active</Text>
              </View>
          </View>
          <View className="bg-black/40 px-3 py-1.5 rounded-lg">
              <Text className="text-emerald-400 font-bold text-xs">x{globalMult.toFixed(2)}</Text>
          </View>
      </View>

      {/* CLICKER AREA */}
      <View className="items-center justify-center mb-8">
        <ScaleButton
          onPress={handleTap}
          className={`p-8 rounded-full border-[8px] shadow-[0_0_50px_rgba(59,130,246,0.6)] active:scale-95 ${weather === 'GOLDEN_HOUR' ? 'bg-amber-500 border-amber-300/30' : 'bg-blue-600 border-blue-400/20'}`}
        >
          {weather === 'GOLDEN_HOUR' ? (
              <Zap size={80} color="white" fill="white" />
          ) : (
              <CircleDollarSign size={80} color="white" />
          )}
        </ScaleButton>
        <Text className="text-slate-500 text-[10px] font-bold mt-6 uppercase tracking-[0.3em]">
            Tap to Generate Wealth
        </Text>
      </View>

      <Text className="text-white font-bold text-xl mb-2">My Assets</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <Stack.Screen options={{ headerShown: false }} />

      <DailyRewardModal />
      <AchievementsModal visible={showAchievements} onClose={() => setShowAchievements(false)} />
      <ResearchModal visible={showResearch} onClose={() => setShowResearch(false)} />
      <GachaSystemModal visible={showManagers} onClose={() => setShowManagers(false)} />
      <CEORoomModal visible={showCeoRoom} onClose={() => setShowCeoRoom(false)} />

      {/* --- FIXED HEADER --- */}
      <View className="bg-slate-900/95 pt-2 pb-3 px-5 border-b border-slate-800 z-20 shadow-xl backdrop-blur-md">
        
        {/* EVENT BANNER (Override if Active) */}
        {activeEvent && (
            <Animated.View entering={FadeInUp} exiting={FadeOutUp} className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-2 mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center px-1">
                    <Flame size={14} color="#f97316" />
                    <Text className="text-orange-400 font-bold ml-2 text-[10px] uppercase">{activeEvent.name} Active</Text>
                </View>
                <View className="bg-orange-500 px-2 py-0.5 rounded">
                    <Text className="text-black font-extrabold text-[10px]">x{activeEvent.multiplier}</Text>
                </View>
            </Animated.View>
        )}

        <View className="flex-row justify-between items-end">
            <View>
                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Liquid Capital</Text>
                <View className="flex-row items-center">
                    <Coins size={24} color="#FBBF24" />
                    <Text className="text-white text-3xl font-black ml-2 tracking-tight">${formatCurrency(money)}</Text>
                </View>
                <View className="flex-row items-center mt-1 bg-purple-900/30 self-start px-2 py-0.5 rounded-full border border-purple-500/20">
                    <Gem size={10} color="#d8b4fe" />
                    <Text className="text-purple-200 text-[10px] font-bold ml-1">{formatCurrency(gems)}</Text>
                </View>
            </View>

            {/* Menu Grid */}
            <View className="flex-row gap-2">
                <ScaleButton onPress={() => setShowCeoRoom(true)} className="bg-blue-600 p-2.5 rounded-xl border border-blue-400/50 items-center justify-center w-11 h-11 shadow-lg shadow-blue-500/30">
                    <UserCog size={20} color="white" />
                </ScaleButton>
                <ScaleButton onPress={() => setShowManagers(true)} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/50 items-center justify-center w-11 h-11">
                    <Briefcase size={20} color="#a78bfa" />
                </ScaleButton>
                <ScaleButton onPress={() => setShowResearch(true)} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/50 items-center justify-center w-11 h-11">
                    <Microscope size={20} color="#60a5fa" />
                </ScaleButton>
                <ScaleButton onPress={() => router.push('/stock')} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/50 items-center justify-center w-11 h-11">
                    <TrendingUp size={20} color="#34d399" />
                </ScaleButton>
                <ScaleButton onPress={() => setShowAchievements(true)} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700/50 items-center justify-center w-11 h-11">
                    <Trophy size={20} color="#fbbf24" />
                </ScaleButton>
            </View>
        </View>
      </View>

      <FlatList
        data={businesses.filter((b) => b.owned)}
        ListHeaderComponent={ListHeader}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="pt-4"
        renderItem={({ item }) => {
          const activeManager = managers.find(m => m.businessId === item.id && m.hired);
          const mgrMult = activeManager ? activeManager.multiplier * (activeManager.level || 1) : 1;

          return (
            <View className="px-4">
                <BusinessCard 
                item={item}
                money={money}
                onUpgrade={handleUpgradeBusiness}
                globalMultiplier={globalMult}
                managerMultiplier={mgrMult}
                />
            </View>
          );
        }}
      />

      <View className="absolute inset-0 pointer-events-none z-50" pointerEvents="none">
        {animations.map((anim) => (
            <FloatingText key={anim.id} text={anim.text} x={anim.x} y={anim.y} onComplete={() => removeAnimation(anim.id)}/>
        ))}
      </View>

      {/* Offline Earnings */}
      <Modal visible={offlineEarnings > 0} transparent animationType="fade">
        <View className="flex-1 bg-black/90 items-center justify-center px-6">
            <View className="bg-slate-900 w-full p-6 rounded-[32px] border border-emerald-500/30 items-center shadow-2xl">
                <View className="bg-emerald-500/20 p-4 rounded-full mb-4">
                    <Coins size={40} color="#34d399" />
                </View>
                <Text className="text-white text-2xl font-bold text-center mb-2">While you were away...</Text>
                <Text className="text-slate-400 text-center mb-8">Your automated businesses kept working.</Text>
                
                <View className="bg-slate-950 w-full py-8 rounded-2xl border border-slate-800 mb-8 items-center">
                    <Text className="text-5xl font-black text-emerald-400 tracking-tighter">+${formatCurrency(offlineEarnings)}</Text>
                </View>
                
                <ScaleButton onPress={() => { triggerHaptic('success'); playSound('cash'); setOfflineEarnings(0); }} className="bg-emerald-500 w-full py-4 rounded-2xl items-center shadow-lg shadow-emerald-500/20">
                    <Text className="text-slate-900 font-extrabold text-lg tracking-wider">CLAIM PROFITS</Text>
                </ScaleButton>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}