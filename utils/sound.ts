import { Audio } from 'expo-av';
import { useGameStore } from '../store/gameStore';

// Cache untuk menyimpan objek suara
const soundCache: { [key: string]: Audio.Sound } = {};

// Mapping file suara (Pastikan file mp3 ada di folder assets/sounds)
const soundMap: { [key: string]: any } = {
  // 'tap': require('../assets/sounds/coin.mp3'),
  // 'upgrade': require('../assets/sounds/upgrade.mp3'),
  // 'success': require('../assets/sounds/success.mp3'),
};

export const loadSounds = async () => {
  try {
    for (const key in soundMap) {
      const { sound } = await Audio.Sound.createAsync(soundMap[key]);
      soundCache[key] = sound;
    }
  } catch (error) {
    // console.log("Audio load error:", error);
  }
};

export const playSound = async (name: string) => {
  // Cek setting sfx dari store
  const state = useGameStore.getState();
  if (!state.settings.sfx) return;

  try {
    const sound = soundCache[name];
    if (sound) {
      await sound.replayAsync();
    }
  } catch (error) {
    // Silent fail
  }
};