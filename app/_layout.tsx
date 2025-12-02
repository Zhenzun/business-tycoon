import "../global.css";
import { useEffect } from "react";
import { AppState, AppStateStatus, View } from "react-native";
import { Stack } from "expo-router";
import { supabase } from "../lib/supabase";
import { useGameStore } from "../store/gameStore";
import { GlobalToast } from "../components/GlobalToast"; // Import Component

export default function RootLayout() {
  
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        await syncToCloud();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Toast Overlay */}
      <GlobalToast />
      
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </View>
  );
}

const syncToCloud = async () => {
  const state = useGameStore.getState();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        balance: state.money,
        gems: state.gems,
        investors: state.investors,
        last_daily_reward: state.lastDailyReward,
        game_stats: state.stats,
        claimed_achievements: state.claimedAchievements,
        last_sync: new Date().toISOString() 
      })
      .eq('id', user.id);

    if (profileError) throw profileError;

    const updates = state.businesses.map(b => ({
      user_id: user.id,
      business_type: b.id,
      level: b.level
    }));
    await supabase.from('user_businesses').upsert(updates, { onConflict: 'user_id, business_type' });

    const hiredManagers = state.managers.filter(m => m.hired).map(m => ({
        user_id: user.id,
        manager_id: m.id,
        hired: true
    }));
    
    if (hiredManagers.length > 0) {
        await supabase.from('user_managers').upsert(hiredManagers, { onConflict: 'user_id, manager_id' });
    }
  } catch (err) {
    console.error("Sync failed:", err);
  }
};