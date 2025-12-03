import React, { useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { X, PieChart, TrendingUp } from 'lucide-react-native';
import { formatCurrency } from '../utils/format';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export const AnalyticsModal = ({ visible, onClose }: Props) => {
    const { getAnalyticsData } = useGameStore();
    
    // Ambil data real-time saat modal dibuka (via render)
    const { labels, data } = getAnalyticsData();
    const totalRevenue = data.reduce((a, b) => a + b, 0);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/90 justify-end">
                <View className="bg-slate-900 h-[60%] rounded-t-3xl border-t border-slate-700">
                    <View className="p-6 border-b border-slate-800 flex-row justify-between items-center bg-emerald-900/20 rounded-t-3xl">
                        <View className="flex-row items-center">
                            <PieChart size={24} color="#34d399" />
                            <Text className="text-white font-bold text-xl ml-3">Revenue Report</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-slate-800 p-2 rounded-full">
                            <X size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        <View className="items-center mb-6">
                            <Text className="text-slate-400 text-xs uppercase tracking-widest">Total Income</Text>
                            <Text className="text-emerald-400 font-extrabold text-3xl">${formatCurrency(totalRevenue)}/min</Text>
                        </View>

                        <Text className="text-white font-bold mb-4">Top Performers</Text>
                        
                        {labels.map((label, index) => {
                            const value = data[index];
                            if (value === 0) return null;
                            const percentage = totalRevenue > 0 ? (value / totalRevenue) * 100 : 0;

                            return (
                                <View key={index} className="mb-4">
                                    <View className="flex-row justify-between mb-1">
                                        <Text className="text-slate-300 font-bold text-sm">{label}</Text>
                                        <Text className="text-white font-mono text-xs">
                                            {percentage.toFixed(1)}% (${formatCurrency(value)}/m)
                                        </Text>
                                    </View>
                                    <View className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <View 
                                            className="h-full bg-emerald-500" 
                                            style={{ width: `${percentage}%` }} 
                                        />
                                    </View>
                                </View>
                            );
                        })}

                        {totalRevenue === 0 && (
                            <Text className="text-slate-500 text-center italic mt-4">
                                Start buying businesses to generate revenue data.
                            </Text>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};