import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { X, Sparkles, Crown, Lock } from 'lucide-react-native';
import { ScaleButton } from './ScaleButton';
import { formatCurrency } from '../utils/format';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const ArtifactsModal = ({ visible, onClose }: Props) => {
    const { artifacts, gems, discoverArtifact } = useGameStore();
    const [discoveredItem, setDiscoveredItem] = useState<any>(null);

    const handleDiscover = () => {
        const result = discoverArtifact();
        if (result.success && result.artifact) {
            setDiscoveredItem(result.artifact);
            setTimeout(() => setDiscoveredItem(null), 3000); // Auto hide animation
        } else {
            alert(result.message);
        }
    };

    const getRarityColor = (rarity: string) => {
        switch(rarity) {
            case 'Ancient': return 'text-red-500 border-red-500 bg-red-900/20';
            case 'Mythic': return 'text-amber-400 border-amber-500 bg-amber-900/20';
            case 'Epic': return 'text-purple-400 border-purple-500 bg-purple-900/20';
            case 'Rare': return 'text-blue-400 border-blue-500 bg-blue-900/20';
            default: return 'text-slate-400 border-slate-600 bg-slate-800';
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/90 justify-end">
                <View className="bg-slate-900 h-[85%] rounded-t-3xl border-t border-slate-700 relative">
                    
                    {/* Header */}
                    <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-purple-900/20">
                        <View className="flex-row items-center">
                            <Crown size={24} color="#d8b4fe" />
                            <Text className="text-white font-bold text-xl ml-2">Relic Vault</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-slate-800 p-2 rounded-full">
                            <X size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Gacha Area */}
                    <View className="p-6 items-center border-b border-slate-800 bg-slate-900">
                        {discoveredItem ? (
                            <View className="items-center animate-bounce">
                                <Sparkles size={48} color="#fbbf24" />
                                <Text className="text-white font-bold text-xl mt-2">{discoveredItem.name}</Text>
                                <Text className="text-amber-400 text-sm font-bold uppercase">{discoveredItem.rarity}</Text>
                            </View>
                        ) : (
                            <View className="w-full">
                                <Text className="text-slate-400 text-center text-xs mb-2 uppercase tracking-widest">Discover Ancient Power</Text>
                                <ScaleButton 
                                    onPress={handleDiscover}
                                    className="bg-purple-600 py-4 rounded-2xl items-center shadow-lg shadow-purple-500/30 border-t border-white/10"
                                >
                                    <View className="flex-row items-center">
                                        <Sparkles size={20} color="white" style={{marginRight: 8}} />
                                        <Text className="text-white font-bold text-lg">DISCOVER RELIC</Text>
                                    </View>
                                    <Text className="text-purple-200 text-xs mt-1 font-bold">250 💎</Text>
                                </ScaleButton>
                            </View>
                        )}
                    </View>

                    {/* Grid List */}
                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        <View className="flex-row flex-wrap justify-between">
                            {artifacts.map(art => {
                                const styleClass = getRarityColor(art.rarity);
                                return (
                                    <View key={art.id} className={`w-[48%] mb-4 p-4 rounded-2xl border ${art.owned ? styleClass : 'border-slate-800 bg-slate-900 opacity-50'}`}>
                                        {art.owned ? (
                                            <>
                                                <View className="flex-row justify-between items-start mb-2">
                                                    <Crown size={20} color={art.rarity === 'Ancient' ? '#ef4444' : '#fbbf24'} />
                                                    <Text className={`text-[10px] font-bold uppercase ${styleClass.split(' ')[0]}`}>{art.rarity}</Text>
                                                </View>
                                                <Text className="text-white font-bold text-sm mb-1">{art.name}</Text>
                                                <Text className="text-slate-400 text-[10px] leading-tight">{art.description}</Text>
                                            </>
                                        ) : (
                                            <View className="items-center py-4">
                                                <Lock size={32} color="#334155" />
                                                <Text className="text-slate-600 font-bold text-xs mt-2">Locked</Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};