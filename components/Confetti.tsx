import React, { useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  Easing, 
  withRepeat
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];

const Particle = ({ delay, startX }: { delay: number, startX: number }) => {
  const translateY = useSharedValue(-50);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(height + 100, { duration: 2500, easing: Easing.linear }));
    rotate.value = withDelay(delay, withRepeat(withTiming(360, { duration: 1000 }), -1));
    opacity.value = withDelay(delay + 1500, withTiming(0, { duration: 1000 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
    left: startX,
  }));

  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  return (
    <Animated.View style={[styles.particle, style, { backgroundColor: color }]} />
  );
};

export const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null;

  // Generate 50 partikel
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    startX: Math.random() * width,
    delay: Math.random() * 500,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Particle key={p.id} delay={p.delay} startX={p.startX} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});