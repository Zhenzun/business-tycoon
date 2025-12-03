import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Modal, TextInput, StatusBar } from 'react-native';
import { useGameStore, Stock } from '../store/gameStore';
import { formatCurrency } from '../utils/format';
import { TrendingUp, TrendingDown, ArrowLeft, Minus } from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router'; 
import { ScaleButton } from '../components/ScaleButton';
import { StockChart } from '../components/StockChart';

export default function StockMarketScreen() {
  const router = useRouter();
  const { stocks, portfolio, money, buyStock, sellStock, activeEvent } = useGameStore();
  
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeAmount, setTradeAmount] = useState('1');
  const [marketNews, setMarketNews] = useState("Market is stable.");

  useEffect(() => {
      if (activeEvent?.id === 'market_boom') setMarketNews("BULL RUN! Stocks are soaring!");
      else if (activeEvent?.id === 'market_crash') setMarketNews("PANIC! Market is crashing!");
      else setMarketNews("Analysts predict mild volatility.");
  }, [activeEvent]);

  const handleTrade = (type: 'buy' | 'sell') => {
      if (!selectedStock) return;
      const amount = parseInt(tradeAmount);
      if (isNaN(amount) || amount <= 0) return;

      if (type === 'buy') buyStock(selectedStock.id, amount);
      else sellStock(selectedStock.id, amount);
  };

  const calculateTotalValue = () => {
      let total = 0;
      stocks.forEach(stock => {
          const qty = portfolio[stock.id] || 0;
          total += qty * stock.price;
      });
      return total;
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Custom Header */}
      <View className="p-6 border-b border-slate-800 flex-row items-center justify-between bg-slate-900 z-10">
        <View className="flex-row items-center">
            <ScaleButton onPress={() => router.back()} className="bg-slate-800 p-2 rounded-full mr-4 border border-slate-700">
                <ArrowLeft size={24} color="white" />
            </ScaleButton>
            <View>
                <Text className="text-white font-bold text-2xl">Wall Street</Text>
                <Text className="text-slate-400 text-xs">Portfolio: <Text className="text-emerald-400 font-bold">${formatCurrency(calculateTotalValue())}</Text></Text>
            </View>
        </View>
        <View className="bg-slate-800 p-2 rounded-lg border border-slate-700">
            <Text className="text-slate-500 text-[10px] uppercase font-bold text-center">Cash</Text>
            <Text className="text-white font-mono font-bold text-sm">${formatCurrency(money)}</Text>
        </View>
      </View>

      {/* News Ticker */}
      <View className={`py-2 px-4 ${activeEvent?.id === 'market_crash' ? 'bg-red-900/30' : activeEvent?.id === 'market_boom' ? 'bg-emerald-900/30' : 'bg-slate-800/50'}`}>
          <Text className={`text-xs font-bold text-center ${activeEvent?.id === 'market_crash' ? 'text-red-400' : activeEvent?.id === 'market_boom' ? 'text-emerald-400' : 'text-slate-400'}`}>
              NEWS: {marketNews}
          </Text>
      </View>

      {/* Stock List */}
      <FlatList 
        data={stocks}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => {
            const isUp = item.price >= item.previousPrice;
            const owned = portfolio[item.id] || 0;
            const changePercent = ((item.price - item.previousPrice) / item.previousPrice) * 100;
            const chartColor = isUp ? '#34d399' : '#f87171';

            // [NEW] Trend Icon Logic
            let TrendIcon = Minus;
            let trendColor = "#94a3b8"; 
            if (item.trend === 'BULL') { TrendIcon = TrendingUp; trendColor = "#34d399"; }
            if (item.trend === 'BEAR') { TrendIcon = TrendingDown; trendColor = "#f87171"; }

            return (
                <ScaleButton 
                    onPress={() => { setSelectedStock(item); setTradeAmount('1'); }}
                    className="bg-slate-800 p-4 rounded-2xl mb-4 border border-slate-700 overflow-hidden"
                >
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-row items-center">
                            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isUp ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                <Text className={`font-bold text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>{item.symbol.substring(0,2)}</Text>
                            </View>
                            <View>
                                <Text className="text-white font-bold text-lg">{item.symbol}</Text>
                                {/* [NEW] Trend Indicator */}
                                <View className="flex-row items-center mt-0.5">
                                    <TrendIcon size={12} color={trendColor} />
                                    <Text style={{color: trendColor}} className="text-[10px] font-bold ml-1 uppercase">
                                        {item.trend} ({item.trendDuration}s)
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-white font-mono font-bold text-lg">${item.price.toFixed(2)}</Text>
                            <View className={`flex-row items-center ${isUp ? 'bg-emerald-500/20' : 'bg-red-500/20'} px-1.5 py-0.5 rounded`}>
                                {isUp ? <TrendingUp size={10} color="#34d399" /> : <TrendingDown size={10} color="#f87171" />}
                                <Text className={`text-[10px] font-bold ml-1 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {Math.abs(changePercent).toFixed(2)}%
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Mini Chart */}
                    <StockChart data={item.history} color={chartColor} height={40} />
                    
                    {owned > 0 && (
                        <View className="mt-3 pt-3 border-t border-white/5 flex-row justify-between items-center">
                            <Text className="text-slate-500 text-xs">Your Position</Text>
                            <Text className="text-white font-bold text-xs">{owned} Shares <Text className="text-slate-500">(${formatCurrency(owned * item.price)})</Text></Text>
                        </View>
                    )}
                </ScaleButton>
            );
        }}
      />

      {/* Trade Modal */}
      <Modal visible={!!selectedStock} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-slate-900 p-6 rounded-t-3xl border-t border-slate-700">
                {selectedStock && (
                    <>
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-2xl font-bold text-white">{selectedStock.name}</Text>
                                <Text className="text-slate-400 text-xs font-bold">{selectedStock.symbol}</Text>
                            </View>
                            <ScaleButton onPress={() => setSelectedStock(null)} className="bg-slate-800 p-2 rounded-full border border-slate-700">
                                <Text className="text-white font-bold px-2">✕</Text>
                            </ScaleButton>
                        </View>

                        <View className="mb-6 h-24 bg-slate-950 rounded-xl p-4 justify-end border border-slate-800">
                             <StockChart 
                                data={selectedStock.history} 
                                color={selectedStock.price >= selectedStock.previousPrice ? '#34d399' : '#f87171'} 
                                height={60} 
                             />
                        </View>

                        <View className="flex-row justify-between mb-6">
                            <View className="bg-slate-800 p-3 rounded-xl flex-1 mr-2 items-center border border-slate-700">
                                <Text className="text-slate-400 text-[10px] uppercase font-bold">Price</Text>
                                <Text className="text-white font-mono font-bold text-lg">${selectedStock.price.toFixed(2)}</Text>
                            </View>
                            <View className="bg-slate-800 p-3 rounded-xl flex-1 ml-2 items-center border border-slate-700">
                                <Text className="text-slate-400 text-[10px] uppercase font-bold">You Own</Text>
                                <Text className="text-white font-mono font-bold text-lg">{portfolio[selectedStock.id] || 0}</Text>
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-slate-300 mb-3 font-bold text-xs uppercase tracking-wider">Trading Amount</Text>
                            <View className="flex-row space-x-2">
                                {[1, 10, 100, 1000].map(amt => (
                                    <TouchableOpacity 
                                        key={amt} 
                                        onPress={() => setTradeAmount(amt.toString())}
                                        className={`px-3 py-2 rounded-lg border ${parseInt(tradeAmount) === amt ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
                                    >
                                        <Text className="text-white font-bold text-xs">x{amt}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TextInput 
                                    value={tradeAmount}
                                    onChangeText={setTradeAmount}
                                    keyboardType="numeric"
                                    className="flex-1 bg-slate-950 text-white px-4 py-2 rounded-lg border border-slate-700 font-bold text-center"
                                />
                            </View>
                        </View>

                        <View className="flex-row space-x-4 mb-4">
                            <ScaleButton 
                                onPress={() => handleTrade('buy')}
                                disabled={money < selectedStock.price * parseInt(tradeAmount || '0')}
                                className="flex-1 bg-emerald-600 py-4 rounded-xl items-center shadow-lg border-b-4 border-emerald-800 active:border-b-0"
                            >
                                <Text className="text-white font-bold text-lg">BUY</Text>
                                <Text className="text-emerald-200 text-[10px] font-bold">-${formatCurrency(selectedStock.price * parseInt(tradeAmount || '0'))}</Text>
                            </ScaleButton>

                            <ScaleButton 
                                onPress={() => handleTrade('sell')}
                                disabled={(portfolio[selectedStock.id] || 0) < parseInt(tradeAmount || '0')}
                                className="flex-1 bg-red-600 py-4 rounded-xl items-center shadow-lg border-b-4 border-red-800 active:border-b-0"
                            >
                                <Text className="text-white font-bold text-lg">SELL</Text>
                                <Text className="text-red-200 text-[10px] font-bold">+${formatCurrency(selectedStock.price * parseInt(tradeAmount || '0'))}</Text>
                            </ScaleButton>
                        </View>
                    </>
                )}
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}