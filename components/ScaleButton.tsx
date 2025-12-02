import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { triggerHaptic } from '../utils/haptics';

export const ScaleButton = ({ children, onPress, disabled, className }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.95); // Menyusut sedikit saat ditekan
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1); // Kembali ke ukuran semula (membal)
    triggerHaptic('light');
    if (onPress) onPress();
  };

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled}>
      <Animated.View style={animatedStyle} className={className}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};