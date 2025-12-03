import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { Zap } from 'lucide-react-native';

export const ComboMeter = () => {
  const { combo, maxCombo } = useGameStore();
  const progressWidth = useSharedValue(0);
  const scale = useSharedValue(1);

  // Normalisasi progress (0 - 100%)
  const percentage = Math.min(100, (combo / maxCombo) * 100);

  useEffect(() => {
    progressWidth.value = withTiming(percentage, { duration: 100 });
    
    // Efek "Pulse" saat combo tinggi
    if (percentage > 80) {
        scale.value = withSpring(1.1);
    } else {
        scale.value = withTiming(1);
    }
  }, [combo]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
    backgroundColor: percentage >= 100 ? '#fbbf24' : '#3b82f6' // Gold jika max, Biru jika biasa
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  if (combo === 0) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.infoRow}>
        <View style={styles.iconRow}>
            <Zap size={16} color={percentage >= 100 ? "#fbbf24" : "#60a5fa"} fill={percentage >= 100 ? "#fbbf24" : "none"} />
            <Text style={styles.label}>COMBO x{(1 + combo/100).toFixed(2)}</Text>
        </View>
        <Text style={styles.value}>{Math.floor(combo)}</Text>
      </View>
      
      <View style={styles.bgBar}>
        <Animated.View style={[styles.fgBar, barStyle]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    color: '#94a3b8',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  bgBar: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fgBar: {
    height: '100%',
    borderRadius: 4,
  }
});