import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore, ANGEL_UPGRADES } from '../store/gameStore';
import { X, TrendingUp, Award } from 'lucide-react-native';
import { ScaleButton } from './ScaleButton';
import { formatCurrency } from '../utils/format';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const PrestigeModal = ({ visible, onClose }: Props) => {
    const { investors, angelUpgrades, buyAngelUpgrade } = useGameStore();

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View className="flex-1 bg-black/95 justify-center items-center px-6">
                <View className="bg-slate-900 w-full max-h-[80%] rounded-3xl border border-amber-600 shadow-2xl">
                    
                    {/* Header */}
                    <View className="p-5 border-b border-slate-800 flex-row justify-between items-center bg-amber-900/20 rounded-t-3xl">
                        <View className="flex-row items-center">
                            <Award size={28} color="#fbbf24" />
                            <View className="ml-3">
                                <Text className="text-amber-400 font-bold text-xl">Prestige Hall</Text>
                                <Text className="text-amber-200/60 text-xs">Permanent Empire Upgrades</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-black/40 p-2 rounded-full">
                            <X size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        <View className="bg-black/40 p-4 rounded-xl border border-amber-500/30 mb-6 flex-row justify-between items-center">
                            <Text className="text-slate-300 font-bold">Available Investors:</Text>
                            <Text className="text-amber-400 font-mono font-bold text-2xl">{formatCurrency(investors)}</Text>
                        </View>

                        {ANGEL_UPGRADES.map((item) => {
                            const isBought = angelUpgrades.includes(item.id);
                            const canAfford = investors >= item.cost;

                            return (
                                <View key={item.id} className={`p-4 rounded-xl mb-3 border ${isBought ? 'bg-slate-800 opacity-60 border-slate-700' : 'bg-slate-800 border-amber-500/20'}`}>
                                    <View className="flex-row justify-between items-center">
                                        <View className="flex-1 pr-3">
                                            <Text className={`font-bold text-base ${isBought ? 'text-emerald-400' : 'text-white'}`}>{item.name}</Text>
                                            <Text className="text-slate-400 text-xs mt-1">{item.description}</Text>
                                        </View>
                                        
                                        {isBought ? (
                                            <Text className="text-emerald-500 text-xs font-bold uppercase">Active</Text>
                                        ) : (
                                            <ScaleButton 
                                                onPress={() => buyAngelUpgrade(item.id)}
                                                disabled={!canAfford}
                                                className={`px-4 py-2 rounded-lg min-w-[80px] items-center ${canAfford ? 'bg-amber-600' : 'bg-slate-700'}`}
                                            >
                                                <View className="flex-row items-center">
                                                    <TrendingUp size={12} color="white" />
                                                    <Text className="text-white font-bold text-xs ml-1">{formatCurrency(item.cost)}</Text>
                                                </View>
                                            </ScaleButton>
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