import React from 'react';
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { formatCurrency } from '../../utils/format';
import { ShoppingCart, Lock, TrendingUp, Gem, Clock } from 'lucide-react-native';
import { ScaleButton } from '../../components/ScaleButton'; // Komponen Interaktif
import { triggerHaptic } from '../../utils/haptics'; // Haptic
import { playSound } from '../../utils/sound'; // Audio

export default function ShopScreen() {
  const { money, gems, businesses, buyBusiness, buyTimeWarp } = useGameStore();
  
  // Sort agar bisnis yang belum terbeli ada di bawah tapi tetap terlihat (opsional, tergantung selera)
  // Di sini saya biarkan urut ID agar rapi, tapi visualnya dibedakan.
  const allBusinesses = businesses; 

  const handleBuy = (action: () => void, cost: number, type: 'money' | 'gem') => {
    if ((type === 'money' && money >= cost) || (type === 'gem' && gems >= cost)) {
        triggerHaptic('success');
        playSound('cash'); // Suara "Cha-ching!" saat beli
        action();
    } else {
        triggerHaptic('error');
        // playSound('error'); // Opsional jika punya sound error
    }
  };

  // Komponen Header Shop (Premium Store)
  const ListHeader = () => (
    <View className="mb-6">
        {/* TIME WARP CARD */}
        <View className="bg-slate-800 p-5 rounded-2xl border border-purple-500/30 mb-6 shadow-lg">
            <View className="flex-row items-center mb-4 border-b border-white/10 pb-3">
                <Gem size={24} color="#d8b4fe" />
                <Text className="text-purple-200 text-lg font-bold ml-2">Time Warp</Text>
                <View className="ml-auto bg-purple-900/50 px-2 py-1 rounded">
                    <Text className="text-purple-300 text-xs font-bold">INSTANT CASH</Text>
                </View>
            </View>
            
            <View className="flex-row justify-between space-x-2">
                {[
                    { hours: 1, cost: 20 },
                    { hours: 4, cost: 50 },
                    { hours: 24, cost: 200 }
                ].map((pack) => (
                    <ScaleButton 
                        key={pack.hours}
                        onPress={() => handleBuy(() => buyTimeWarp(pack.hours, pack.cost), pack.cost, 'gem')}
                        disabled={gems < pack.cost}
                        className={`flex-1 p-3 rounded-xl border items-center justify-center ${
                            gems >= pack.cost 
                            ? 'bg-slate-700 border-purple-500 shadow-sm' 
                            : 'bg-slate-800/50 border-slate-700 opacity-40'
                        }`}
                    >
                        <Clock size={20} color={gems >= pack.cost ? "#c084fc" : "#64748b"} className="mb-2"/>
                        <Text className="text-white font-bold text-xs">{pack.hours}H</Text>
                        <Text className="text-purple-300 font-bold mt-1 text-xs">{pack.cost} 💎</Text>
                    </ScaleButton>
                ))}
            </View>
        </View>

        <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 px-1">Acquisitions</Text>
    </View>
  );

  return (
    <SafeAreaView className="screen-container">
      {/* GLOBAL HEADER */}
      <View className="p-6 pb-4 border-b border-slate-800 bg-slate-900 z-10 flex-row justify-between items-center shadow-md">
         <View>
            <Text className="text-header">Market</Text>
            <Text className="text-slate-400 text-xs mt-1">Expand your empire</Text>
         </View>
         <View className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700 flex-row items-center">
             <Gem size={16} color="#d8b4fe" />
             <Text className="text-purple-200 font-bold ml-2 text-sm">{formatCurrency(gems)}</Text>
         </View>
      </View>

      <FlatList
        data={allBusinesses}
        ListHeaderComponent={ListHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => {
          const isOwned = item.owned;
          const canAfford = money >= item.unlockCost;
          
          return (
            <View className={`biz-card relative overflow-hidden mb-4 ${isOwned ? 'opacity-60 bg-slate-900 border-slate-800' : 'bg-slate-800 border-slate-700'}`}>
              
              {isOwned && (
                <View className="absolute top-3 right-3 bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-500/30">
                  <Text className="text-emerald-400 text-[10px] font-bold">OWNED</Text>
                </View>
              )}

              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className={`text-xl font-bold ${isOwned ? 'text-slate-400' : 'text-white'}`}>{item.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <TrendingUp size={14} color="#94a3b8" />
                    <Text className="text-slate-400 text-sm ml-1">
                      Revenue: <Text className="text-emerald-400 font-bold">${formatCurrency(item.baseRevenue)}/s</Text>
                    </Text>
                  </View>
                </View>
                
                {!isOwned && (
                  <Lock size={20} color={canAfford ? "#FBBF24" : "#475569"} style={{marginTop: 4}} />
                )}
              </View>

              {!isOwned ? (
                <View className="mt-2 pt-3 border-t border-white/5 flex-row justify-between items-center">
                  <Text className="text-2xl font-bold text-amber-400">
                    ${formatCurrency(item.unlockCost)}
                  </Text>
                  
                  <ScaleButton
                    onPress={() => handleBuy(() => buyBusiness(item.id), item.unlockCost, 'money')}
                    disabled={!canAfford}
                    className={`px-6 py-3 rounded-xl flex-row items-center ${
                      canAfford 
                        ? 'bg-blue-600 shadow-lg shadow-blue-500/30' 
                        : 'bg-slate-700 opacity-50'
                    }`}
                  >
                    <ShoppingCart size={18} color={canAfford ? 'white' : '#94a3b8'} style={{marginRight: 8}}/>
                    <Text className={`font-bold ${canAfford ? 'text-white' : 'text-slate-400'}`}>
                      BUY
                    </Text>
                  </ScaleButton>
                </View>
              ) : (
                <Text className="text-slate-600 italic text-xs mt-2">
                   Generating passive income for your empire.
                </Text>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}