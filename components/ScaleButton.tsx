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

  const handlePressOut = (event: GestureResponderEvent) => {
    if (disabled) return;
    scale.value = withSpring(1); // Efek membal saat dilepas
    triggerHaptic('light');
    
    // FIX: Meneruskan event sentuhan ke fungsi parent
    if (onPress) onPress(event);
  };

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled}>
      <Animated.View style={animatedStyle} className={className}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};