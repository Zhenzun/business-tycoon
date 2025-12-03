import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming, 
} from 'react-native-reanimated';
import { useGameStore, Manager } from '../store/gameStore';
import { X, Sparkles, User, Briefcase, ArrowUpCircle } from 'lucide-react-native';
import { ScaleButton } from './ScaleButton';
import { playSound } from '../utils/sound';
import { formatCurrency } from '../utils/format';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const GachaSystemModal = ({ visible, onClose }: Props) => {
    const { gems, managers, money, summonManager, upgradeManager } = useGameStore();
    const [result, setResult] = useState<Manager | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [tab, setTab] = useState<'summon' | 'list'>('summon');

    // Animasi Kartu Gacha
    const scale = useSharedValue(0);
    const rotate = useSharedValue('0deg');

    const handleSummon = () => {
        const res = summonManager();
        if (res.success && res.manager) {
            setIsAnimating(true);
            playSound('upgrade'); 
            
            // Reset animasi
            scale.value = 0;
            rotate.value = '0deg';

            // Sequence Animasi Suspense
            setTimeout(() => {
                setResult(res.manager!);
                scale.value = withSpring(1, { damping: 12 });
                rotate.value = withSequence(
                    withTiming('10deg', { duration: 100 }),
                    withTiming('-10deg', { duration: 100 }),
                    withTiming('0deg', { duration: 100 })
                );
                setIsAnimating(false);
            }, 500); 
        } else {
            alert(res.message);
        }
    };

    const reset = () => {
        setResult(null);
    };

    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { rotate: rotate.value }]
    }));

    const getRarityColor = (rarity: string) => {
        switch(rarity) {
            case 'Legendary': return 'bg-amber-500 border-amber-300';
            case 'Rare': return 'bg-purple-600 border-purple-400';
            default: return 'bg-slate-600 border-slate-400';
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/90 justify-end">
                <View className="bg-slate-900 h-[85%] rounded-t-3xl border-t border-slate-700 overflow-hidden">
                    
                    {/* Header */}
                    <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-indigo-900/20">
                        <View className="flex-row items-center">
                            <Briefcase size={24} color="#a78bfa" />
                            <Text className="text-white font-bold text-xl ml-2">Headhunter Agency</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-slate-800 p-2 rounded-full">
                            <X size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row border-b border-slate-800">
                        <TouchableOpacity onPress={() => setTab('summon')} className={`flex-1 p-4 items-center ${tab === 'summon' ? 'border-b-2 border-indigo-500 bg-indigo-500/10' : ''}`}>
                            <Text className={`font-bold ${tab === 'summon' ? 'text-indigo-400' : 'text-slate-500'}`}>SUMMON</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTab('list')} className={`flex-1 p-4 items-center ${tab === 'list' ? 'border-b-2 border-indigo-500 bg-indigo-500/10' : ''}`}>
                            <Text className={`font-bold ${tab === 'list' ? 'text-indigo-400' : 'text-slate-500'}`}>MY STAFF</Text>
                        </TouchableOpacity>
                    </View>

                    {tab === 'summon' ? (
                        <View className="flex-1 justify-center items-center px-6">
                            {/* Gacha Stage */}
                            <View className="h-80 justify-center items-center w-full mb-8">
                                {result ? (
                                    <Animated.View style={[cardStyle, { width: '100%', alignItems: 'center' }]}>
                                        <View className={`p-1 rounded-3xl ${getRarityColor(result.rarity)} shadow-[0_0_50px_rgba(251,191,36,0.3)]`}>
                                            <View className="bg-slate-900 p-8 rounded-[20px] items-center w-72 border border-white/10">
                                                <Sparkles size={64} color={result.rarity === 'Legendary' ? '#fbbf24' : 'white'} />
                                                <Text className={`font-extrabold text-3xl mt-6 text-center ${result.rarity === 'Legendary' ? 'text-amber-400' : 'text-white'}`}>
                                                    {result.name}
                                                </Text>
                                                <View className={`px-3 py-1 rounded-full mt-2 ${result.rarity === 'Legendary' ? 'bg-amber-500/20' : 'bg-slate-700'}`}>
                                                    <Text className={`text-xs uppercase tracking-widest font-bold ${result.rarity === 'Legendary' ? 'text-amber-300' : 'text-slate-400'}`}>{result.rarity}</Text>
                                                </View>
                                                
                                                <Text className="text-center text-slate-300 text-sm my-6 leading-5">{result.description}</Text>
                                                
                                                <View className="bg-emerald-900/40 px-6 py-3 rounded-xl border border-emerald-500/30 w-full items-center">
                                                    <Text className="text-emerald-400 font-bold text-lg">Effect: x{result.multiplier}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Animated.View>
                                ) : (
                                    <View className="items-center opacity-40">
                                        <User size={100} color="#cbd5e1" />
                                        <Text className="text-slate-500 mt-6 font-bold text-lg">Hire a new talent</Text>
                                        <Text className="text-slate-600 text-sm">Legendary chance: 5%</Text>
                                    </View>
                                )}
                            </View>

                            {/* Actions */}
                            {result ? (
                                <ScaleButton onPress={reset} className="w-full bg-slate-700 py-4 rounded-2xl items-center mb-3 border-b-4 border-slate-900 active:border-b-0">
                                    <Text className="text-white font-bold tracking-widest">BACK</Text>
                                </ScaleButton>
                            ) : (
                                <ScaleButton 
                                    onPress={handleSummon} 
                                    disabled={isAnimating}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-5 rounded-2xl items-center shadow-lg shadow-purple-500/30 flex-row justify-center border-t border-white/20 active:opacity-90"
                                >
                                    <Sparkles size={24} color="white" style={{marginRight: 10}}/>
                                    <View>
                                        <Text className="text-white font-extrabold text-xl tracking-wider">SUMMON</Text>
                                        <Text className="text-indigo-200 font-bold text-xs text-center mt-0.5">Cost: 100 💎</Text>
                                    </View>
                                </ScaleButton>
                            )}
                            
                            <Text className="text-slate-500 text-xs mt-6 font-bold">You have {gems} Gems</Text>
                        </View>
                    ) : (
                        <View className="flex-1 p-4">
                            {managers.filter(m => m.hired).length === 0 && (
                                <Text className="text-slate-500 text-center mt-10">No managers hired yet. Summon some!</Text>
                            )}
                            {managers.filter(m => m.hired).map(mgr => (
                                <View key={mgr.id} className="bg-slate-800 p-4 rounded-xl mb-3 border border-slate-700 flex-row justify-between items-center">
                                    <View>
                                        <View className="flex-row items-center">
                                            <Text className={`font-bold text-lg ${mgr.rarity === 'Legendary' ? 'text-amber-400' : 'text-white'}`}>{mgr.name}</Text>
                                            <View className="bg-indigo-900/50 px-2 py-0.5 rounded ml-2">
                                                <Text className="text-indigo-300 text-[10px] font-bold">Lvl {mgr.level || 1}</Text>
                                            </View>
                                        </View>
                                        <Text className="text-slate-400 text-xs">{mgr.description}</Text>
                                    </View>
                                    <ScaleButton 
                                        onPress={() => upgradeManager(mgr.id)}
                                        className="bg-slate-700 p-2 rounded-lg border border-slate-600"
                                    >
                                        <ArrowUpCircle size={20} color={money >= (mgr.cost * 10 * (mgr.level||1)) ? "#4ade80" : "#64748b"} />
                                    </ScaleButton>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};