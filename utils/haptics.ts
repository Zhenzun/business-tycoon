import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useGameStore } from '../store/gameStore';

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'medium') => {
  if (Platform.OS === 'web') return;

  // Cek setting haptic dari store
  const state = useGameStore.getState();
  if (!state.settings.haptics) return;

  switch (type) {
    case 'light': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
    case 'medium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
    case 'heavy': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); break;
    case 'success': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
    case 'error': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); break;
  }
};