import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { User, X, Zap, Percent, Star, Lock } from 'lucide-react-native';
import { ScaleButton } from './ScaleButton';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const CEORoomModal = ({ visible, onClose }: Props) => {
    const { ceo, skills, artifacts, upgradeCeoSkill } = useGameStore();
    const [tab, setTab] = useState<'skills' | 'artifacts'>('skills');

    const xpProgress = Math.min(100, (ceo.xp / ceo.maxXp) * 100);

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 bg-black/90">
                <View className="bg-slate-900 flex-1 mt-10 rounded-t-3xl border-t border-slate-700">
                    
                    {/* Header: CEO Profile */}
                    <View className="p-6 bg-slate-800 rounded-t-3xl border-b border-slate-700">
                        <View className="flex-row justify-between items-start">
                            <View className="flex-row items-center">
                                <View className="bg-blue-600 p-3 rounded-full border-2 border-blue-400">
                                    <User size={32} color="white" />
                                </View>
                                <View className="ml-4">
                                    <Text className="text-white font-bold text-2xl">CEO Level {ceo.level}</Text>
                                    <Text className="text-slate-400 text-xs font-mono">Skill Points: {ceo.skillPoints}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} className="bg-slate-700 p-2 rounded-full">
                                <X size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* XP Bar */}
                        <View className="mt-4">
                            <View className="h-2 bg-slate-950 rounded-full overflow-hidden">
                                <View 
                                    className="h-full bg-blue-500" 
                                    style={{ width: `${xpProgress}%` }} 
                                />
                            </View>
                            <Text className="text-slate-500 text-[10px] text-right mt-1">
                                XP: {Math.floor(ceo.xp)} / {ceo.maxXp}
                            </Text>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row border-b border-slate-800">
                        <TouchableOpacity 
                            onPress={() => setTab('skills')} 
                            className={`flex-1 p-4 items-center ${tab === 'skills' ? 'border-b-2 border-blue-500 bg-blue-500/10' : ''}`}
                        >
                            <Text className={`font-bold ${tab === 'skills' ? 'text-blue-400' : 'text-slate-500'}`}>SKILLS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setTab('artifacts')} 
                            className={`flex-1 p-4 items-center ${tab === 'artifacts' ? 'border-b-2 border-amber-500 bg-amber-500/10' : ''}`}
                        >
                            <Text className={`font-bold ${tab === 'artifacts' ? 'text-amber-400' : 'text-slate-500'}`}>ARTIFACTS</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {tab === 'skills' ? (
                            // SKILLS LIST
                            skills.map(skill => {
                                const isMaxed = skill.level >= skill.maxLevel;
                                const canAfford = ceo.skillPoints >= skill.cost;

                                return (
                                    <View key={skill.id} className="bg-slate-800 p-4 rounded-xl mb-3 border border-slate-700 flex-row items-center justify-between">
                                        <View className="flex-1 pr-4">
                                            <Text className="text-white font-bold text-lg">{skill.name}</Text>
                                            <Text className="text-slate-400 text-xs">{skill.description}</Text>
                                            <Text className="text-blue-400 text-xs font-bold mt-1">
                                                Lvl {skill.level}/{skill.maxLevel} • +{skill.valuePerLevel * 100}% Effect
                                            </Text>
                                        </View>
                                        
                                        {isMaxed ? (
                                            <View className="bg-emerald-500/20 px-3 py-1 rounded">
                                                <Text className="text-emerald-400 font-bold text-xs">MAX</Text>
                                            </View>
                                        ) : (
                                            <ScaleButton 
                                                onPress={() => upgradeCeoSkill(skill.id)}
                                                disabled={!canAfford}
                                                className={`px-4 py-2 rounded-lg items-center ${canAfford ? 'bg-blue-600' : 'bg-slate-700 opacity-50'}`}
                                            >
                                                <Text className="text-white font-bold text-xs">UPGRADE</Text>
                                                <Text className="text-blue-200 text-[10px]">{skill.cost} SP</Text>
                                            </ScaleButton>
                                        )}
                                    </View>
                                );
                            })
                        ) : (
                            // ARTIFACTS LIST
                            <View className="flex-row flex-wrap justify-between">
                                {artifacts.map(art => (
                                    <View key={art.id} className={`w-[48%] aspect-square mb-4 rounded-2xl p-4 justify-between border ${art.owned ? (art.rarity === 'Mythic' ? 'bg-amber-900/20 border-amber-500' : 'bg-slate-800 border-blue-500/50') : 'bg-slate-900 border-slate-800 opacity-50'}`}>
                                        {art.owned ? (
                                            <>
                                                <Star size={24} color={art.rarity === 'Mythic' ? '#fbbf24' : '#60a5fa'} />
                                                <View>
                                                    <Text className="text-white font-bold text-sm">{art.name}</Text>
                                                    <Text className="text-slate-400 text-[10px] mt-1">{art.description}</Text>
                                                </View>
                                                <View className="bg-black/40 px-2 py-1 rounded self-start">
                                                    <Text className="text-white text-[10px] font-bold">{art.rarity}</Text>
                                                </View>
                                            </>
                                        ) : (
                                            <View className="flex-1 items-center justify-center">
                                                <Lock size={32} color="#475569" />
                                                <Text className="text-slate-600 font-bold text-xs mt-2">???</Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};