/**
 * Audio Notification Utility for Pasar Desa Mandiri
 * Synthesizes clear, melodious chime sound effects using Web Audio API.
 * Does not require external sound files or internet connection.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function isAudioSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('pasar_desa_sound_enabled') !== 'false';
}

export function setAudioSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pasar_desa_sound_enabled', enabled ? 'true' : 'false');
}

/**
 * Play a note with sine wave and gentle exponential decay
 */
function playTone(freq: number, startTime: number, duration: number, volume: number = 0.2, type: OscillatorType = 'sine'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch {
    // Ignore audio playback error gracefully
  }
}

/**
 * Nada checkout berhasil (Ceria 4-nada menaik: C5 -> E5 -> G5 -> C6)
 */
export function playCheckoutChime(): void {
  if (!isAudioSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz)
  playTone(523.25, now + 0.00, 0.18, 0.25, 'triangle');
  playTone(659.25, now + 0.12, 0.18, 0.25, 'triangle');
  playTone(783.99, now + 0.24, 0.22, 0.28, 'sine');
  playTone(1046.50, now + 0.38, 0.45, 0.30, 'sine');
}

/**
 * Nada pesanan selesai (Triumphant celebratory chime)
 */
export function playOrderCompleteChime(): void {
  if (!isAudioSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // E5 -> G5 -> B5 -> C6 -> E6
  playTone(659.25, now + 0.00, 0.15, 0.22, 'sine');
  playTone(783.99, now + 0.10, 0.15, 0.22, 'sine');
  playTone(987.77, now + 0.20, 0.20, 0.25, 'sine');
  playTone(1046.50, now + 0.32, 0.50, 0.30, 'triangle');
}

/**
 * Nada notifikasi umum / status berubah (Ding-Dong lembut)
 */
export function playNotificationChime(): void {
  if (!isAudioSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // G5 -> D6
  playTone(783.99, now + 0.00, 0.20, 0.22, 'sine');
  playTone(1174.66, now + 0.14, 0.35, 0.25, 'sine');
}
