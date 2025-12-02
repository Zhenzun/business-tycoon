import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay, 
  withTiming,
  runOnJS 
} from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { CheckCircle, Info, AlertTriangle } from 'lucide-react-native';

export const GlobalToast = () => {
  const toast = useGameStore((state) => state.toast);
  const hideToast = useGameStore((state) => state.hideToast);
  
  const translateY = useSharedValue(-100); // Mulai di luar layar atas

  useEffect(() => {
    if (toast) {
      // Masuk ke layar
      translateY.value = withSpring(50, { damping: 12 }); // Posisi Y = 50 (SafeArea)
    } else {
      // Keluar layar
      translateY.value = withTiming(-100, { duration: 300 });
    }
  }, [toast]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999, // Paling atas
  }));

  if (!toast) return null;

  // Tentukan warna dan ikon berdasarkan tipe
  let bgColor = '#1e293b'; // Slate 800 default
  let icon = <Info size={24} color="#3b82f6" />; // Blue

  if (toast.type === 'success') {
      bgColor = '#064e3b'; // Emerald 900
      icon = <CheckCircle size={24} color="#34d399" />;
  } else if (toast.type === 'warning') {
      bgColor = '#451a03'; // Amber 900
      icon = <AlertTriangle size={24} color="#fbbf24" />;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor: bgColor }]}>
      {icon}
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 12,
    fontSize: 14,
  }
});