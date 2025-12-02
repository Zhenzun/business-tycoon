import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { Briefcase, X, ArrowUpCircle } from 'lucide-react-native';
import { ScaleButton } from './ScaleButton';
import { formatCurrency } from '../utils/format';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const ManagersModal = ({ visible, onClose }: Props) => {
    const { managers, money, hireManager, upgradeManager } = useGameStore();

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-slate-900 h-[80%] rounded-t-3xl border-t border-slate-700">
                    {/* Header */}
                    <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-purple-900/10 rounded-t-3xl">
                        <View className="flex-row items-center">
                            <Briefcase size={24} color="#a78bfa" />
                            <Text className="text-white font-bold text-2xl ml-3">Staff Management</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-slate-800 p-2 rounded-full">
                            <X size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        <Text className="text-slate-400 mb-6 text-sm">
                            Managers automate your businesses. Upgrade them to increase revenue multiplier!
                        </Text>

                        {managers.map(mgr => {
                            // Upgrade Cost Formula: Base Cost * 10 * Current Level
                            const currentLevel = mgr.level || 1;
                            const upgradeCost = mgr.cost * 10 * currentLevel;
                            const canUpgrade = money >= upgradeCost;
                            const canHire = money >= mgr.cost;

                            return (
                                <View key={mgr.id} className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700">
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-1 pr-2">
                                            <View className="flex-row items-center">
                                                <Text className="text-white font-bold text-lg mr-2">{mgr.name}</Text>
                                                {mgr.hired && (
                                                    <View className="bg-purple-900/50 px-2 py-0.5 rounded border border-purple-500/30">
                                                        <Text className="text-purple-300 text-[10px] font-bold">Lvl {currentLevel}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text className="text-slate-400 text-xs mt-1">{mgr.description}</Text>
                                            <Text className="text-emerald-400 font-bold text-xs mt-1">
                                                Current Boost: x{mgr.multiplier * currentLevel}
                                            </Text>
                                        </View>
                                    </View>

                                    {mgr.hired ? (
                                        <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-white/5">
                                            <View>
                                                <Text className="text-slate-500 text-[10px] uppercase font-bold">Next Level</Text>
                                                <Text className="text-white font-bold text-sm">x{mgr.multiplier * (currentLevel + 1)} Boost</Text>
                                            </View>
                                            
                                            <ScaleButton 
                                                onPress={() => upgradeManager(mgr.id)}
                                                disabled={!canUpgrade}
                                                className={`flex-row items-center px-4 py-2 rounded-lg border-b-4 ${canUpgrade ? 'bg-purple-600 border-purple-800' : 'bg-slate-700 border-slate-900 opacity-50'}`}
                                            >
                                                <ArrowUpCircle size={16} color="white" style={{marginRight: 6}} />
                                                <View>
                                                    <Text className="text-white font-bold text-[10px] uppercase">Upgrade</Text>
                                                    <Text className="text-white font-mono font-bold text-xs">${formatCurrency(upgradeCost)}</Text>
                                                </View>
                                            </ScaleButton>
                                        </View>
                                    ) : (
                                        <ScaleButton 
                                            onPress={() => hireManager(mgr.id)} 
                                            disabled={!canHire} 
                                            className={`w-full py-3 rounded-xl items-center border-b-4 mt-2 ${canHire ? 'bg-emerald-600 border-emerald-800' : 'bg-slate-700 border-slate-900 opacity-50'}`}
                                        >
                                            <Text className="text-white font-bold text-sm">HIRE (${formatCurrency(mgr.cost)})</Text>
                                        </ScaleButton>
                                    )}
                                </View>
                            );
                        })}
                        
                        <View className="h-10" />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};