import React from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { formatCurrency } from '../../utils/format';
import { ShoppingCart, Lock, TrendingUp, Gem, Clock } from 'lucide-react-native';

export default function ShopScreen() {
  const { money, gems, businesses, buyBusiness, buyTimeWarp } = useGameStore();
  const allBusinesses = businesses; 

  // Komponen Header Shop (Premium Store)
  const ListHeader = () => (
    <View className="mb-6">
        <View className="bg-gradient-to-r from-purple-900 to-slate-900 p-4 rounded-2xl border border-purple-500/30 mb-6">
            <View className="flex-row items-center mb-4">
                <Gem size={24} color="#d8b4fe" />
                <Text className="text-purple-200 text-lg font-bold ml-2">Time Warp (Gems)</Text>
            </View>
            
            <View className="flex-row justify-between space-x-3">
                {/* Paket 1 Jam */}
                <TouchableOpacity 
                    onPress={() => buyTimeWarp(1, 20)}
                    disabled={gems < 20}
                    className={`flex-1 p-3 rounded-xl border items-center ${gems >= 20 ? 'bg-slate-800 border-purple-500' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}
                >
                    <Clock size={20} color="#c084fc" className="mb-2"/>
                    <Text className="text-white font-bold text-xs">1 HOUR</Text>
                    <Text className="text-purple-300 font-bold mt-1 text-xs">20 💎</Text>
                </TouchableOpacity>

                {/* Paket 4 Jam */}
                <TouchableOpacity 
                    onPress={() => buyTimeWarp(4, 50)}
                    disabled={gems < 50}
                    className={`flex-1 p-3 rounded-xl border items-center ${gems >= 50 ? 'bg-slate-800 border-purple-500' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}
                >
                    <Clock size={20} color="#c084fc" className="mb-2"/>
                    <Text className="text-white font-bold text-xs">4 HOURS</Text>
                    <Text className="text-purple-300 font-bold mt-1 text-xs">50 💎</Text>
                </TouchableOpacity>

                {/* Paket 24 Jam */}
                <TouchableOpacity 
                    onPress={() => buyTimeWarp(24, 200)}
                    disabled={gems < 200}
                    className={`flex-1 p-3 rounded-xl border items-center ${gems >= 200 ? 'bg-slate-800 border-purple-500' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}
                >
                    <Clock size={20} color="#c084fc" className="mb-2"/>
                    <Text className="text-white font-bold text-xs">24 HOURS</Text>
                    <Text className="text-purple-300 font-bold mt-1 text-xs">200 💎</Text>
                </TouchableOpacity>
            </View>
        </View>

        <Text className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Business Acquisitions</Text>
    </View>
  );

  return (
    <SafeAreaView className="screen-container">
      {/* GLOBAL HEADER */}
      <View className="p-6 pb-2 border-b border-slate-800 bg-slate-900 z-10 flex-row justify-between items-center">
         <View>
            <Text className="text-header">Market</Text>
            <Text className="text-slate-400 text-xs">Spend Money & Gems</Text>
         </View>
         <View className="bg-purple-900/50 px-3 py-1 rounded-full border border-purple-500/50 flex-row items-center">
             <Gem size={14} color="#d8b4fe" />
             <Text className="text-purple-200 font-bold ml-2">{gems}</Text>
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
            <View className={`biz-card relative overflow-hidden ${isOwned ? 'opacity-70 border-slate-700' : 'border-slate-600'}`}>
              
              {isOwned && (
                <View className="absolute top-0 right-0 bg-emerald-500/20 px-3 py-1 rounded-bl-xl">
                  <Text className="text-emerald-400 text-xs font-bold">OWNED</Text>
                </View>
              )}

              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-xl font-bold text-white">{item.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <TrendingUp size={14} color="#94a3b8" />
                    <Text className="text-slate-400 text-sm ml-1">
                      Base Revenue: <Text className="text-emerald-400 font-bold">${formatCurrency(item.baseRevenue)}/sec</Text>
                    </Text>
                  </View>
                </View>
                
                {!isOwned && (
                  <Lock size={20} color={canAfford ? "#FBBF24" : "#475569"} />
                )}
              </View>

              {!isOwned ? (
                <View className="mt-4 pt-4 border-t border-slate-700/50 flex-row justify-between items-center">
                  <Text className="text-2xl font-bold text-amber-400">
                    ${formatCurrency(item.unlockCost)}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => buyBusiness(item.id)}
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
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="mt-2">
                  <Text className="text-slate-500 italic text-sm">
                    Business active and generating revenue.
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}