import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave para persistência do toggle de som
const SOUND_ENABLED_KEY = '@ackadmy:sound_enabled';

// Estado em memória para evitar I/O em cada play
let _soundEnabled: boolean = true;
let _soundStateLoaded = false;

async function loadSoundState() {
  if (_soundStateLoaded) return;
  try {
    const val = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
    // padrão: sons ativados
    _soundEnabled = val === null ? true : val === 'true';
  } catch {
    _soundEnabled = true;
  } finally {
    _soundStateLoaded = true;
  }
}

// Inicializa logo que o módulo é importado
loadSoundState();

// Web synthesized Audio
class WebAudioSynthesizer {
  private ctx: any = null;

  private getCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  playCorrect() {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.type = "sine";
      
      // Ascending C5 to E5 arpeggio
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  playWrong() {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.type = "triangle";
      
      // Low descending buzz
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.25);
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  playVictory() {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Synthesize a beautiful arpeggio chord arpeggiating C4 -> E4 -> G4 -> C5
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.8);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.8);
      });
    } catch {}
  }

  playBadge() {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Fanfarra curta ascendente: G4 -> B4 -> D5 -> G5
      const notes = [392.00, 493.88, 587.33, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.13, now + idx * 0.08 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {}
  }

  playHintUsed() {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      osc.type = "sine";
      // Click suave neutro
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  playXpSpent() {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      osc.type = "triangle";
      // Tick descendente curto
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.1);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }
}

const LOCAL_SOUNDS: Record<string, any> = {
  correct: require('../assets/sounds/correct.wav'),
  wrong: require('../assets/sounds/wrong.wav'),
  victory: require('../assets/sounds/victory.wav'),
  badge: require('../assets/sounds/badge.wav'),
  hint: require('../assets/sounds/hint.wav'),
  xp_spent: require('../assets/sounds/xp_spent.wav'),
};

class MobileAudioPlayer {
  private soundEnabled: () => boolean;

  constructor(soundEnabled: () => boolean) {
    this.soundEnabled = soundEnabled;
  }

  async play(type: "correct" | "wrong" | "victory" | "badge" | "hint" | "xp_spent") {
    if (!this.soundEnabled()) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const soundSource = LOCAL_SOUNDS[type];
      if (!soundSource) return;

      const { sound } = await Audio.Sound.createAsync(
        soundSource,
        { shouldPlay: true }
      );
      
      // Automatically unload the sound after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (err) {
      console.warn(`Error playing native sound (${type}):`, err);
    }
  }
}

const webSynth = new WebAudioSynthesizer();
const mobilePlayer = new MobileAudioPlayer(() => _soundEnabled);

export const audioService = {
  /** Retorna true se os sons estão desativados */
  isMuted(): boolean {
    return !_soundEnabled;
  },

  /** Ativa ou desativa os sons globalmente e persiste no AsyncStorage */
  async setMuted(muted: boolean): Promise<void> {
    _soundEnabled = !muted;
    try {
      await AsyncStorage.setItem(SOUND_ENABLED_KEY, String(!muted));
    } catch {}
  },

  /** Força recarregar o estado de som do AsyncStorage */
  async refreshSoundState(): Promise<void> {
    _soundStateLoaded = false;
    await loadSoundState();
  },

  playCorrect() {
    try {
      if (!_soundEnabled) return;
      if (Platform.OS === 'web') {
        webSynth.playCorrect();
      } else {
        mobilePlayer.play("correct").catch(() => {});
      }
    } catch {}
  },

  playWrong() {
    try {
      if (!_soundEnabled) return;
      if (Platform.OS === 'web') {
        webSynth.playWrong();
      } else {
        mobilePlayer.play("wrong").catch(() => {});
      }
    } catch {}
  },

  playVictory() {
    try {
      if (!_soundEnabled) return;
      if (Platform.OS === 'web') {
        webSynth.playVictory();
      } else {
        mobilePlayer.play("victory").catch(() => {});
      }
    } catch {}
  },

  /** Toca ao desbloquear uma conquista/badge */
  playBadge() {
    try {
      if (!_soundEnabled) return;
      if (Platform.OS === 'web') {
        webSynth.playBadge();
      } else {
        mobilePlayer.play("badge").catch(() => {});
      }
    } catch {}
  },

  /** Toca ao usar dica (custo de XP) */
  playHintUsed() {
    try {
      if (!_soundEnabled) return;
      if (Platform.OS === 'web') {
        webSynth.playHintUsed();
      } else {
        mobilePlayer.play("hint").catch(() => {});
      }
    } catch {}
  },

  /** Toca ao gastar XP com power-up */
  playXpSpent() {
    try {
      if (!_soundEnabled) return;
      if (Platform.OS === 'web') {
        webSynth.playXpSpent();
      } else {
        mobilePlayer.play("xp_spent").catch(() => {});
      }
    } catch {}
  },
};
