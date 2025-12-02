import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { Microscope, X, Beaker, ArrowUp } from 'lucide-react-native';
import { ScaleButton } from './ScaleButton';
import { formatCurrency } from '../utils/format';
import { triggerHaptic } from '../utils/haptics';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const ResearchModal = ({ visible, onClose }: Props) => {
    const { research, money, buyResearch } = useGameStore();

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-slate-900 h-[75%] rounded-t-3xl border-t border-slate-700">
                    {/* Header */}
                    <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-blue-900/10 rounded-t-3xl">
                        <View className="flex-row items-center">
                            <Microscope size={28} color="#60a5fa" />
                            <Text className="text-white font-bold text-2xl ml-3">Research Lab</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-slate-800 p-2 rounded-full">
                            <X size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        <Text className="text-slate-400 mb-4 text-sm">
                            Invest in technology to permanently increase your global profit multiplier until prestige.
                        </Text>

                        {research.map((item) => {
                            const cost = Math.floor(item.baseCost * Math.pow(2, item.currentLevel)); // Rumus cost
                            const canAfford = money >= cost;
                            const isMaxed = item.currentLevel >= item.maxLevel;

                            return (
                                <View key={item.id} className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700">
                                    <View className="flex-row justify-between items-start mb-2">
                                        <View className="flex-1 pr-2">
                                            <Text className="text-white font-bold text-lg">{item.name}</Text>
                                            <Text className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                                                {item.description}
                                            </Text>
                                            <Text className="text-slate-500 text-xs">
                                                Level: <Text className="text-white">{item.currentLevel} / {item.maxLevel}</Text>
                                            </Text>
                                        </View>
                                        <View className="bg-slate-900 p-2 rounded-lg">
                                            <Beaker size={24} color={isMaxed ? "#10b981" : "#60a5fa"} />
                                        </View>
                                    </View>

                                    {isMaxed ? (
                                        <View className="bg-emerald-900/30 p-2 rounded-lg items-center border border-emerald-500/30 mt-2">
                                            <Text className="text-emerald-400 font-bold text-xs">RESEARCH COMPLETED</Text>
                                        </View>
                                    ) : (
                                        <ScaleButton
                                            onPress={() => buyResearch(item.id)}
                                            disabled={!canAfford}
                                            className={`flex-row justify-between items-center px-4 py-3 rounded-xl mt-2 border-b-4 ${
                                                canAfford ? 'bg-blue-600 border-blue-800' : 'bg-slate-700 border-slate-900 opacity-50'
                                            }`}
                                        >
                                            <Text className="text-white font-bold text-sm">RESEARCH</Text>
                                            <Text className="text-white font-mono font-bold">${formatCurrency(cost)}</Text>
                                        </ScaleButton>
                                    )}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};