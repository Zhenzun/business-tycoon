import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Trophy } from 'lucide-react-native';

type Player = {
  id: string;
  username: string; // Pastikan user set username saat signup/profile
  balance: number;
};

export default function LeaderboardScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    setRefreshing(true);
    // QUERY "DEWA": Ambil 10 orang terkaya
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, balance')
      .order('balance', { ascending: false })
      .limit(20);

    if (data) setPlayers(data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // OPTIONAL: Realtime Subscription (Hanya untuk fitur premium/server kuat)
    // Untuk hemat resource, refresh manual/interval saja sudah cukup.
  }, []);

  return (
    <SafeAreaView className="screen-container">
      <View className="p-6 border-b border-slate-800 flex-row items-center">
        <Trophy size={32} color="#FBBF24" />
        <View className="ml-4">
            <Text className="text-header">Top Tycoons</Text>
            <Text className="text-slate-400">Global Elite Ranking</Text>
        </View>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchLeaderboard} tintColor="#fff"/>}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item, index }) => (
          <View className={`p-4 mb-3 rounded-xl flex-row items-center justify-between ${index < 3 ? 'bg-slate-800 border border-amber-500/50' : 'bg-slate-800'}`}>
            <View className="flex-row items-center">
              <Text className={`font-bold text-xl w-8 ${index === 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                #{index + 1}
              </Text>
              <Text className="text-white font-semibold text-lg ml-2">
                {item.username || 'Anonymous CEO'}
              </Text>
            </View>
            <Text className="text-emerald-400 font-mono font-bold">
              ${item.balance.toLocaleString()}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}