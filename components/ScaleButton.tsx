import React from 'react';
import { Pressable, GestureResponderEvent, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { triggerHaptic } from '../utils/haptics';
import { cssInterop } from 'nativewind';

interface ScaleButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

// 1. Buat komponen animasi
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// 2. PENTING: Daftarkan ke NativeWind agar className="bg-..." terbaca sebagai style
cssInterop(AnimatedPressable, { className: 'style' });

export const ScaleButton = ({ children, onPress, disabled, className, style }: ScaleButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1);
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;
    triggerHaptic('light');
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      className={className}
      style={[animatedStyle, style]} // Gabungkan style animasi dengan style dari className
    >
      {children}
    </AnimatedPressable>
  );
};