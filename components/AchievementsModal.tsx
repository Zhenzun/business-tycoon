import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore, ACHIEVEMENT_DEFS } from '../store/gameStore';
import { Trophy, Check, X, Gem } from 'lucide-react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const AchievementsModal = ({ visible, onClose }: Props) => {
    const { stats, lifetimeEarnings, investors, claimedAchievements, claimAchievement } = useGameStore();

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-slate-900 h-[80%] rounded-t-3xl border-t border-slate-700">
                    
                    {/* Header */}
                    <View className="p-6 border-b border-slate-800 flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Trophy size={28} color="#FBBF24" />
                            <Text className="text-white font-bold text-2xl ml-3">Achievements</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-slate-800 p-2 rounded-full">
                            <X size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* List */}
                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {ACHIEVEMENT_DEFS.map((item) => {
                            // Cek Kondisi Realtime untuk Render UI
                            let current = 0;
                            if (item.type === 'taps') current = stats.totalTaps;
                            if (item.type === 'money') current = lifetimeEarnings;
                            if (item.type === 'upgrades') current = stats.totalBizUpgrades;
                            if (item.type === 'investors') current = investors;

                            const isCompleted = current >= item.target;
                            const isClaimed = claimedAchievements.includes(item.id);
                            
                            // Format progress text
                            let progressText = `${current} / ${item.target}`;
                            if (item.type === 'money') progressText = `$${(current/1000000).toFixed(1)}M / $${item.target/1000000}M`;

                            return (
                                <View key={item.id} className={`p-4 rounded-xl mb-4 border ${isCompleted && !isClaimed ? 'bg-slate-800 border-amber-500' : 'bg-slate-800 border-slate-700 opacity-90'}`}>
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1">
                                            <Text className="text-white font-bold text-lg">{item.title}</Text>
                                            <Text className="text-slate-400 text-xs mb-2">{item.description}</Text>
                                            
                                            {/* Progress Text */}
                                            <Text className={`text-xs font-mono ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                Progress: {progressText}
                                            </Text>
                                        </View>

                                        {/* Action Button */}
                                        {isClaimed ? (
                                            <View className="bg-emerald-500/20 px-3 py-1 rounded-lg flex-row items-center">
                                                <Check size={14} color="#34d399" />
                                                <Text className="text-emerald-400 font-bold text-xs ml-1">CLAIMED</Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => claimAchievement(item.id)}
                                                disabled={!isCompleted}
                                                className={`px-4 py-2 rounded-lg flex-row items-center ${
                                                    isCompleted ? 'bg-amber-500' : 'bg-slate-700 opacity-50'
                                                }`}
                                            >
                                                <Gem size={14} color={isCompleted ? 'black' : 'gray'} />
                                                <Text className={`font-bold text-xs ml-1 ${isCompleted ? 'text-black' : 'text-gray-400'}`}>
                                                    {item.reward}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};