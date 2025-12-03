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
  const opacity = useSharedValue(0); // 1. Tambahkan state animasi opacity

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

    // 2. Logika Opacity: Jika combo > 0 tampil (1), jika 0 sembunyi tapi tetap memakan tempat (0)
    opacity.value = withTiming(combo > 0 ? 1 : 0, { duration: 200 });

  }, [combo]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
    backgroundColor: percentage >= 100 ? '#fbbf24' : '#3b82f6' 
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value // 3. Terapkan opacity ke container
  }));

  // 4. PENTING: Baris "if (combo === 0) return null;" DIHAPUS agar layout tidak naik turun!

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
    minHeight: 60, // 5. Tambahkan minHeight agar ukurannya konsisten (tempat 'dipesan')
    justifyContent: 'center', // Agar konten tetap di tengah
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