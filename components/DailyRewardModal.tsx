import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { Gift, Check } from 'lucide-react-native';
import { triggerHaptic } from '../utils/haptics';

export const DailyRewardModal = () => {
  const { lastDailyReward, claimDailyReward } = useGameStore();
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Cek setiap kali komponen mount
    const checkAvailability = () => {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - lastDailyReward >= oneDay) {
            setVisible(true);
        } else {
            // Hitung waktu mundur (opsional untuk debug)
            const diff = oneDay - (now - lastDailyReward);
            const hours = Math.floor(diff / (1000 * 60 * 60));
            setTimeLeft(`${hours}h`);
        }
    };
    checkAvailability();
  }, [lastDailyReward]);

  const handleClaim = () => {
      const success = claimDailyReward();
      if (success) {
          triggerHaptic('success');
          setVisible(false);
      }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="bg-slate-800 w-full p-6 rounded-3xl border-2 border-purple-500 items-center shadow-2xl shadow-purple-500/30">
            <View className="bg-purple-600 p-4 rounded-full mb-4 shadow-lg">
                <Gift size={48} color="white" />
            </View>
            
            <Text className="text-white text-2xl font-bold mb-2">Daily Bonus</Text>
            <Text className="text-slate-400 text-center mb-6">
                Welcome back, CEO! Here is your daily supply of Gems to boost your empire.
            </Text>

            <View className="bg-slate-900/50 px-8 py-4 rounded-xl mb-6 border border-slate-700">
                <Text className="text-purple-400 text-4xl font-extrabold text-center">+50 💎</Text>
            </View>

            <TouchableOpacity 
                onPress={handleClaim}
                className="bg-purple-600 w-full py-4 rounded-xl flex-row justify-center items-center shadow-lg active:bg-purple-700"
            >
                <Check size={24} color="white" style={{marginRight:8}} />
                <Text className="text-white font-bold text-lg">CLAIM REWARD</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};