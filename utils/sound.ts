import { Audio } from 'expo-av';
import { useGameStore } from '../store/gameStore';

// Cache untuk menyimpan objek suara agar tidak perlu reload berulang kali
const soundCache: { [key: string]: Audio.Sound } = {};

// Mapping file suara
// PENTING: Pastikan file .mp3 benar-benar ada di folder assets/sounds/
const soundMap: { [key: string]: any } = {
  'tap': require('../assets/sounds/tap.ogg'),
  'cash': require('../assets/sounds/cash.ogg'),
  'upgrade': require('../assets/sounds/upgrade.ogg'),
  'success': require('../assets/sounds/success.ogg'),
};

export const loadSounds = async () => {
  try {
    for (const key in soundMap) {
      // Unload sound lama jika ada (untuk mencegah memory leak saat hot reload)
      if (soundCache[key]) {
        await soundCache[key].unloadAsync();
      }
      
      const { sound } = await Audio.Sound.createAsync(soundMap[key]);
      soundCache[key] = sound;
    }
    console.log("Sounds loaded successfully");
  } catch (error) {
    console.log("Audio load error (Pastikan file mp3 ada di folder assets/sounds):", error);
  }
};

export const playSound = async (name: string) => {
  // Cek setting sfx dari store
  const state = useGameStore.getState();
  if (!state.settings.sfx) return;

  try {
    const sound = soundCache[name];
    if (sound) {
      // ReplayAsync otomatis rewind ke awal dan play
      await sound.replayAsync();
    } else {
        // Jika sound belum terload (misal dipanggil sebelum useEffect selesai), coba load on-the-fly (opsional)
        // console.log(`Sound ${name} not loaded yet`);
    }
  } catch (error) {
    // Silent fail agar game tidak crash
    console.log(`Failed to play sound: ${name}`, error);
  }
};