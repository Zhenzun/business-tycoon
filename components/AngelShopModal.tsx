import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore, ANGEL_UPGRADES } from '../store/gameStore';
import { X, Crown, TrendingUp } from 'lucide-react-native';
import { ScaleButton } from './ScaleButton';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const AngelShopModal = ({ visible, onClose }: Props) => {
    const { investors, angelUpgrades, buyAngelUpgrade } = useGameStore();

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View className="flex-1 bg-black/90 justify-center items-center px-4">
                <View className="bg-slate-900 w-full max-w-sm rounded-3xl border border-amber-500 shadow-2xl shadow-amber-500/20 max-h-[80%]">
                    
                    {/* Header */}
                    <View className="p-6 border-b border-white/10 bg-amber-900/20 rounded-t-3xl flex-row justify-between items-center">
                        <View>
                            <View className="flex-row items-center">
                                <Crown size={24} color="#fbbf24" />
                                <Text className="text-amber-400 font-bold text-xl ml-2">Angel Shop</Text>
                            </View>
                            <Text className="text-amber-200/60 text-xs mt-1">Spend Investors for PERMANENT buffs</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-black/30 p-2 rounded-full">
                            <X size={20} color="#fbbf24" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        <View className="flex-row justify-between items-center mb-6 bg-black/40 p-4 rounded-xl border border-amber-500/30">
                            <Text className="text-slate-300 font-bold">Available Investors:</Text>
                            <Text className="text-amber-400 font-mono font-bold text-xl">{investors}</Text>
                        </View>

                        {ANGEL_UPGRADES.map((item) => {
                            const isBought = angelUpgrades.includes(item.id);
                            const canAfford = investors >= item.cost;

                            return (
                                <View key={item.id} className={`p-4 rounded-xl mb-4 border ${isBought ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800 border-amber-500/30'}`}>
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1 pr-4">
                                            <Text className={`font-bold text-lg ${isBought ? 'text-slate-500' : 'text-white'}`}>{item.name}</Text>
                                            <Text className="text-slate-400 text-xs mt-1">{item.description}</Text>
                                        </View>
                                        
                                        {isBought ? (
                                            <View className="bg-slate-700 px-3 py-1 rounded">
                                                <Text className="text-slate-400 text-xs font-bold">OWNED</Text>
                                            </View>
                                        ) : (
                                            <ScaleButton 
                                                onPress={() => buyAngelUpgrade(item.id)}
                                                disabled={!canAfford}
                                                className={`px-4 py-2 rounded-lg items-center ${canAfford ? 'bg-amber-600' : 'bg-slate-700 opacity-50'}`}
                                            >
                                                <Text className="text-white font-bold text-xs">BUY</Text>
                                                <View className="flex-row items-center mt-1">
                                                    <TrendingUp size={10} color="white" />
                                                    <Text className="text-white font-bold text-[10px] ml-1">{item.cost}</Text>
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