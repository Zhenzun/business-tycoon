import React from 'react';
import { View } from 'react-native';

interface StockChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export const StockChart: React.FC<StockChartProps> = ({ data, color = '#34d399', height = 60 }) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 2, opacity: 0.8 }}>
      {data.map((price, index) => {
        // Normalisasi tinggi bar antara 10% s/d 100% dari container height
        const normalizedHeight = ((price - min) / range) * 0.9 + 0.1; 
        
        return (
          <View
            key={index}
            style={{
              flex: 1,
              height: `${normalizedHeight * 100}%`,
              backgroundColor: color,
              borderRadius: 2,
              minHeight: 2,
            }}
          />
        );
      })}
    </View>
  );
};