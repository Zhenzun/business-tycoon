import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  withSequence,
  Easing
} from 'react-native-reanimated';

interface FloatingTextProps {
  text: string;
  x: number;
  y: number;
  onComplete: () => void;
}

export const FloatingText: React.FC<FloatingTextProps> = ({ text, x, y, onComplete }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Style animasi
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
      position: 'absolute',
      left: x,
      top: y,
      zIndex: 100, // Pastikan di atas elemen lain
    };
  });

  useEffect(() => {
    // Animasi: Gerak ke atas 50px dan fade out dalam 800ms
    translateY.value = withTiming(-50, { duration: 800, easing: Easing.out(Easing.exp) });
    opacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)(); // Panggil callback hapus component
        }
      })
    );
  }, []);

  return (
    <Animated.View style={animatedStyle} pointerEvents="none">
      <Text className="text-emerald-400 font-bold text-2xl shadow-sm">+{text}</Text>
    </Animated.View>
  );
};