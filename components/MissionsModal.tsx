import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { ClipboardList, CheckCircle, X } from 'lucide-react-native';
import { ScaleButton } from './ScaleButton';
import { formatCurrency } from '../utils/format';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const MissionsModal = ({ visible, onClose }: Props) => {
    const { missions, refreshMissions, claimMission } = useGameStore();

    useEffect(() => {
        if (visible) refreshMissions();
    }, [visible]);

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-slate-900 h-[70%] rounded-t-3xl border-t border-slate-700">
                    <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-indigo-900/20 rounded-t-3xl">
                        <View className="flex-row items-center">
                            <ClipboardList size={24} color="#a5b4fc" />
                            <Text className="text-white font-bold text-2xl ml-3">Daily Ops</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-slate-800 p-2 rounded-full">
                            <X size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {missions.map((mission) => {
                            const progress = Math.min(1, mission.current / mission.target);
                            
                            if (mission.claimed) return null;

                            return (
                                <View key={mission.id} className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700">
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View>
                                            <Text className="text-white font-bold text-lg">{mission.description}</Text>
                                            <Text className="text-slate-400 text-xs mt-1">
                                                Reward: <Text className="text-purple-400 font-bold">{mission.reward} Gems</Text>
                                            </Text>
                                        </View>
                                        {mission.completed ? (
                                            <CheckCircle size={24} color="#4ade80" />
                                        ) : (
                                            <Text className="text-slate-500 font-mono text-xs">
                                                {formatCurrency(mission.current)} / {formatCurrency(mission.target)}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Progress Bar */}
                                    <View className="h-2 bg-slate-950 rounded-full overflow-hidden mb-3">
                                        <View 
                                            className={`h-full ${mission.completed ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${progress * 100}%` }} 
                                        />
                                    </View>

                                    <ScaleButton
                                        disabled={!mission.completed}
                                        onPress={() => claimMission(mission.id)}
                                        className={`py-3 rounded-lg items-center ${
                                            mission.completed 
                                                ? 'bg-emerald-600 border-b-4 border-emerald-800' 
                                                : 'bg-slate-700 opacity-50'
                                        }`}
                                    >
                                        <Text className="text-white font-bold text-xs tracking-widest">
                                            {mission.completed ? 'CLAIM REWARD' : 'IN PROGRESS'}
                                        </Text>
                                    </ScaleButton>
                                </View>
                            );
                        })}
                        {missions.every(m => m.claimed) && (
                            <View className="items-center mt-10">
                                <Text className="text-slate-500">All missions completed. Come back tomorrow!</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};