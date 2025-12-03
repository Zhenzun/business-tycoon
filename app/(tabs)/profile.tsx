import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Alert, ActivityIndicator, ScrollView, Switch, TextInput, TouchableOpacity, Share } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../store/gameStore';
import { formatCurrency } from '../../utils/format';
import { ScaleButton } from '../../components/ScaleButton';
import { triggerHaptic } from '../../utils/haptics';
import { playSound } from '../../utils/sound';
import { Confetti } from '../../components/Confetti';
import { PrestigeModal } from '../../components/PrestigeModal'; // [UPDATED]
import { LogOut, CloudUpload, TrendingUp, Settings, Volume2, VolumeX, Smartphone, Crown, Activity, Save, Download } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    investors, lifetimeEarnings, prestige, stats, 
    settings, toggleSfx, toggleHaptics, loadSaveData, exportSaveData 
  } = useGameStore();
  
  const [userEmail, setUserEmail] = useState<string | null>('Guest');
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPrestigeShop, setShowPrestigeShop] = useState(false); // [UPDATED]
  const [importString, setImportString] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email || 'Tycoon CEO');
    });
  }, []);

  const handleLogout = async () => {
    triggerHaptic('medium');
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  const handleExportSave = async () => {
      const saveString = exportSaveData();
      try {
          await Share.share({
              message: saveString,
              title: "Tycoon Idle Save Data"
          });
      } catch (error) {
          Alert.alert("Error", "Could not share save data.");
      }
  };

  const handleImportSave = () => {
      if (!importString) return;
      
      Alert.alert(
          "Warning",
          "Importing data will OVERWRITE your current progress. Are you sure?",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Overwrite", style: "destructive", onPress: () => {
                  const success = loadSaveData(importString);
                  if (success) {
                      Alert.alert("Success", "Save data loaded!");
                      setShowImport(false);
                      setImportString("");
                  } else {
                      Alert.alert("Error", "Invalid save string.");
                  }
              }}
          ]
      );
  };

  const potentialInvestors = Math.floor(Math.sqrt(lifetimeEarnings / 10000)); 
  const newInvestorsClaimed = Math.max(0, potentialInvestors - investors);
  const canPrestige = newInvestorsClaimed > 0;

  const handlePrestige = () => {
    if (!canPrestige) {
        triggerHaptic('error');
        Alert.alert("Not enough value", "Earn more money to attract Investors!");
        return;
    }

    triggerHaptic('warning');
    Alert.alert(
        "PRESTIGE",
        "Reset? You will lose money/businesses but gain Investors.",
        [
            { text: "Cancel", style: "cancel" },
            { text: "DO IT", style: "destructive", onPress: () => {
                setShowConfetti(true);
                playSound('success'); 
                triggerHaptic('heavy');
                setTimeout(() => { prestige(); setShowConfetti(false); router.replace('/(tabs)'); }, 2500);
            }}
        ]
    );
  };

  return (
    <SafeAreaView className="screen-container relative">
      {showConfetti && <Confetti active={true} />}
      <PrestigeModal visible={showPrestigeShop} onClose={() => setShowPrestigeShop(false)} /> {/* [UPDATED] */}

      <ScrollView contentContainerStyle={{padding: 24}}>
        <Text className="text-header mb-8">HQ & Settings</Text>

        {/* SETTINGS CARD */}
        <View className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4 pb-2 border-b border-white/5">
                <Settings size={20} color="#94a3b8" />
                <Text className="text-slate-300 font-bold ml-2 text-lg">Preferences</Text>
            </View>
            <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                    {settings.sfx ? <Volume2 size={20} color="#cbd5e1"/> : <VolumeX size={20} color="#64748b"/>}
                    <Text className="text-white font-semibold ml-3">Sound Effects</Text>
                </View>
                <Switch value={settings.sfx} onValueChange={toggleSfx} trackColor={{ false: "#334155", true: "#2563eb" }} thumbColor={settings.sfx ? "#60a5fa" : "#94a3b8"} />
            </View>
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <Smartphone size={20} color={settings.haptics ? "#cbd5e1" : "#64748b"} />
                    <Text className="text-white font-semibold ml-3">Haptic Vibration</Text>
                </View>
                <Switch value={settings.haptics} onValueChange={toggleHaptics} trackColor={{ false: "#334155", true: "#2563eb" }} thumbColor={settings.haptics ? "#60a5fa" : "#94a3b8"} />
            </View>
        </View>

        {/* DATA MANAGEMENT CARD */}
        <View className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-6">
            <View className="flex-row items-center mb-4 pb-2 border-b border-white/5">
                <Save size={20} color="#34d399" />
                <Text className="text-slate-300 font-bold ml-2 text-lg">Data Management</Text>
            </View>
            
            <View className="flex-row space-x-3 mb-4">
                <ScaleButton onPress={handleExportSave} className="flex-1 bg-blue-600 py-3 rounded-xl items-center flex-row justify-center">
                    <CloudUpload size={16} color="white" />
                    <Text className="text-white font-bold ml-2">Export Save</Text>
                </ScaleButton>
                <ScaleButton onPress={() => setShowImport(!showImport)} className="flex-1 bg-slate-700 py-3 rounded-xl items-center flex-row justify-center">
                    <Download size={16} color="white" />
                    <Text className="text-white font-bold ml-2">Import</Text>
                </ScaleButton>
            </View>

            {showImport && (
                <View>
                    <TextInput 
                        value={importString}
                        onChangeText={setImportString}
                        placeholder="Paste save string here..."
                        placeholderTextColor="#64748b"
                        className="bg-slate-900 text-white p-3 rounded-lg border border-slate-600 mb-2 h-20"
                        multiline
                    />
                    <ScaleButton onPress={handleImportSave} className="bg-red-600 py-2 rounded-lg items-center">
                        <Text className="text-white font-bold">LOAD DATA</Text>
                    </ScaleButton>
                </View>
            )}
        </View>

        {/* STATS OVERVIEW */}
        <View className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-6">
            <View className="flex-row items-center mb-4 pb-2 border-b border-white/5">
                <Activity size={20} color="#34d399" />
                <Text className="text-slate-300 font-bold ml-2 text-lg">Career Stats</Text>
            </View>
            <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400">Total Taps</Text>
                <Text className="text-white font-mono">{stats.totalTaps.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400">Lifetime Earnings</Text>
                <Text className="text-emerald-400 font-mono">${formatCurrency(lifetimeEarnings)}</Text>
            </View>
            <View className="flex-row justify-between">
                <Text className="text-slate-400">Start Date</Text>
                <Text className="text-white text-xs">{new Date(stats.startTime).toLocaleDateString()}</Text>
            </View>
        </View>

        {/* PRESTIGE CARD */}
        <View className="bg-gradient-to-br from-slate-800 to-black p-1 rounded-3xl border border-amber-500/50 mb-8 shadow-lg shadow-amber-900/20">
            <View className="bg-slate-900 p-5 rounded-[22px]">
                <View className="flex-row items-center mb-2">
                    <TrendingUp size={24} color="#FBBF24" />
                    <Text className="text-amber-400 text-xl font-bold ml-2 tracking-tight">Market IPO</Text>
                </View>
                
                <View className="flex-row justify-between mb-6 bg-slate-950 p-4 rounded-xl border border-white/5">
                    <View>
                        <Text className="text-slate-500 text-[10px] uppercase font-bold">Investors</Text>
                        <Text className="text-white font-mono font-bold text-lg">{formatCurrency(investors)}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-slate-500 text-[10px] uppercase font-bold">Claimable</Text>
                        <Text className={`font-mono font-bold text-lg ${canPrestige ? 'text-emerald-400' : 'text-slate-600'}`}>+{formatCurrency(newInvestorsClaimed)}</Text>
                    </View>
                </View>

                {/* TWO BUTTONS: PRESTIGE & SHOP */}
                <View className="flex-row space-x-3">
                    <ScaleButton 
                        onPress={() => setShowPrestigeShop(true)}
                        className="flex-1 bg-slate-800 py-4 rounded-xl items-center flex-row justify-center border border-amber-500/30"
                    >
                        <Crown size={18} color="#fbbf24" style={{marginRight:6}}/>
                        <Text className="text-amber-400 font-bold text-xs">PRESTIGE SHOP</Text>
                    </ScaleButton>

                    <ScaleButton 
                        onPress={handlePrestige}
                        disabled={!canPrestige}
                        className={`flex-[2] py-4 rounded-xl items-center justify-center ${canPrestige ? 'bg-amber-500' : 'bg-slate-700'}`}
                    >
                        <Text className={`font-extrabold tracking-widest ${canPrestige ? 'text-black' : 'text-slate-600'}`}>
                            RESET
                        </Text>
                    </ScaleButton>
                </View>
            </View>
        </View>

        {/* LOGOUT */}
        <ScaleButton onPress={handleLogout} className="bg-red-900/10 p-4 rounded-xl border border-red-900/30 flex-row items-center active:bg-red-900/20 mb-10">
            <LogOut size={20} color="#ef4444" />
            <Text className="text-red-400 font-bold ml-4">Retire (Logout)</Text>
        </ScaleButton>
      </ScrollView>
    </SafeAreaView>
  );
}