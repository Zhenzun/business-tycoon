import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { ScaleButton } from './ScaleButton';
import { AlertTriangle, ShieldAlert } from 'lucide-react-native';

export const DecisionModal = () => {
    const { activeDecision, resolveDecision } = useGameStore();

    if (!activeDecision) return null;

    return (
        <Modal visible={!!activeDecision} transparent animationType="fade">
            <View className="flex-1 bg-black/90 justify-center items-center px-6">
                <View className="bg-slate-900 w-full p-6 rounded-3xl border-2 border-amber-500 shadow-2xl relative overflow-hidden">
                    
                    {/* Background Pattern */}
                    <View className="absolute -top-10 -right-10 bg-amber-500/10 w-40 h-40 rounded-full" />

                    <View className="items-center mb-6">
                        <View className="bg-amber-900/30 p-4 rounded-full mb-3 border border-amber-500/30">
                            <ShieldAlert size={48} color="#fbbf24" />
                        </View>
                        <Text className="text-amber-400 font-bold text-xs tracking-widest uppercase mb-1">Incoming Alert</Text>
                        <Text className="text-white font-extrabold text-2xl text-center">{activeDecision.title}</Text>
                        <Text className="text-slate-400 text-center mt-2 leading-5">
                            {activeDecision.description}
                        </Text>
                    </View>

                    <View className="space-y-3">
                        {activeDecision.options.map((opt, index) => (
                            <ScaleButton 
                                key={index}
                                onPress={() => resolveDecision(index)}
                                className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex-row justify-between items-center active:bg-slate-700"
                            >
                                <View>
                                    <Text className="text-white font-bold text-sm">{opt.label}</Text>
                                    {opt.risk && <Text className="text-red-400 text-[10px] mt-0.5">⚠️ {opt.risk * 100}% Failure Risk</Text>}
                                </View>
                                {opt.cost && (
                                    <View className="bg-slate-900 px-2 py-1 rounded">
                                        <Text className="text-slate-300 text-xs font-mono">Cost: {opt.cost}</Text>
                                    </View>
                                )}
                            </ScaleButton>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};