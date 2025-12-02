import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../store/gameStore';
import { formatCurrency } from '../../utils/format'; // Import Format
import { LogOut, CloudUpload, User as UserIcon, TrendingUp } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { money, businesses, managers, investors, lifetimeEarnings, prestige } = useGameStore();
  const [userEmail, setUserEmail] = useState<string | null>('Guest');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email || 'Tycoon CEO');
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  const handleManualSync = async () => {
      setLoading(true);
      setTimeout(() => { setLoading(false); Alert.alert("Synced", "Data saved!"); }, 1000);
  };

  // Logic Hitung Potensi Prestige
  const potentialInvestors = Math.floor(Math.sqrt(lifetimeEarnings / 10000));
  const newInvestorsClaimed = potentialInvestors - investors;
  const canPrestige = newInvestorsClaimed > 0;

  const handlePrestige = () => {
    if (!canPrestige) {
        Alert.alert("Not enough value", "You need to earn more money before selling your empire!");
        return;
    }

    Alert.alert(
        "Sell Empire?",
        `You will reset everything but gain ${newInvestorsClaimed} Investors (+${newInvestorsClaimed * 2}% Bonus). This cannot be undone!`,
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "SELL EVERYTHING", 
                style: "destructive", 
                onPress: () => {
                    prestige();
                    router.replace('/(tabs)');
                }
            }
        ]
    );
  };

  return (
    <SafeAreaView className="screen-container">
      <ScrollView contentContainerStyle={{padding: 24}}>
        <Text className="text-header mb-8">HQ Settings</Text>

        {/* PROFILE CARD */}
        <View className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex-row items-center mb-8">
          <View className="bg-blue-600/20 p-4 rounded-full mr-4">
            <UserIcon size={32} color="#3b82f6" />
          </View>
          <View>
            <Text className="text-slate-400 text-xs uppercase font-bold tracking-wider">CEO Profile</Text>
            <Text className="text-white text-lg font-bold">{userEmail}</Text>
            <Text className="text-emerald-400 text-sm mt-1">{investors} Active Investors</Text>
            <Text className="text-slate-500 text-xs mt-1">Lifetime: ${formatCurrency(lifetimeEarnings)}</Text>
          </View>
        </View>

        {/* PRESTIGE CARD */}
        <View className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl border-2 border-amber-500/50 mb-8">
            <View className="flex-row items-center mb-2">
                <TrendingUp size={24} color="#FBBF24" />
                <Text className="text-amber-400 text-xl font-bold ml-2">Market IPO</Text>
            </View>
            <Text className="text-slate-300 mb-4">
                Sell your company to investors. Reset progress for a permanent profit boost.
            </Text>
            
            <View className="flex-row justify-between mb-4">
                <View>
                    <Text className="text-slate-500 text-xs uppercase">Current Bonus</Text>
                    <Text className="text-white font-bold text-lg">+{investors * 2}%</Text>
                </View>
                <View>
                    <Text className="text-slate-500 text-xs uppercase">On Sale</Text>
                    <Text className={`font-bold text-lg ${canPrestige ? 'text-emerald-400' : 'text-slate-600'}`}>
                        +{newInvestorsClaimed > 0 ? newInvestorsClaimed : 0} Investors
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                onPress={handlePrestige}
                className={`py-3 rounded-xl items-center ${canPrestige ? 'bg-amber-500' : 'bg-slate-700'}`}
            >
                <Text className={`font-bold ${canPrestige ? 'text-black' : 'text-slate-500'}`}>
                    PRESTIGE (RESET)
                </Text>
            </TouchableOpacity>
        </View>

        {/* MENU ACTIONS */}
        <View className="space-y-4">
          <TouchableOpacity onPress={handleManualSync} disabled={loading} className="bg-slate-800 p-4 rounded-xl border border-slate-600 flex-row items-center">
            <CloudUpload size={24} color="#3b82f6" />
            <Text className="text-white font-bold ml-4">Force Cloud Save</Text>
            {loading && <ActivityIndicator color="white" className="ml-auto" />}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} className="bg-red-900/20 p-4 rounded-xl border border-red-900/50 flex-row items-center">
            <LogOut size={24} color="#ef4444" />
            <Text className="text-red-400 font-bold ml-4">Retire (Logout)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}