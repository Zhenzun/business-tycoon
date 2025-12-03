import React from 'react';
import { TouchableWithoutFeedback, GestureResponderEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { triggerHaptic } from '../utils/haptics';

interface ScaleButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  className?: string;
}

export const ScaleButton = ({ children, onPress, disabled, className }: ScaleButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.95); // Efek menyusut saat ditekan
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1); // Efek membal saat dilepas (HANYA ANIMASI)
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;
    
    triggerHaptic('light');
    
    // PERBAIKAN: Panggil onPress secara langsung (sinkron).
    // Menghapus requestAnimationFrame agar object 'event' tidak kadaluarsa/null
    // saat dibaca di fungsi handleTap (index.tsx).
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableWithoutFeedback 
        onPressIn={handlePressIn} 
        onPressOut={handlePressOut} 
        onPress={handlePress}
        disabled={disabled}
    >
      <Animated.View style={animatedStyle} className={className}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};