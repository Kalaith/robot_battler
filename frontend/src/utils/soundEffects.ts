// Simple sound effect utility using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  private createBeep(frequency: number, duration: number, volume = 0.3) {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playAttack() {
    // Sharp attack sound
    this.createBeep(800, 0.1, 0.2);
    setTimeout(() => this.createBeep(600, 0.1, 0.1), 50);
  }

  playHit() {
    // Impact sound
    this.createBeep(300, 0.15, 0.3);
  }

  playCriticalHit() {
    // Critical hit combo
    this.createBeep(1000, 0.1, 0.2);
    setTimeout(() => this.createBeep(1200, 0.1, 0.2), 50);
    setTimeout(() => this.createBeep(1400, 0.1, 0.2), 100);
  }

  playDefend() {
    // Shield sound
    this.createBeep(400, 0.2, 0.15);
  }

  playVictory() {
    // Victory fanfare
    const notes = [523, 659, 784, 1047]; // C, E, G, C
    notes.forEach((note, index) => {
      setTimeout(() => this.createBeep(note, 0.3, 0.2), index * 150);
    });
  }

  playDefeat() {
    // Defeat sound
    this.createBeep(200, 0.5, 0.3);
    setTimeout(() => this.createBeep(150, 0.5, 0.2), 200);
  }

  playPurchase() {
    // Purchase success
    this.createBeep(800, 0.1, 0.2);
    setTimeout(() => this.createBeep(1000, 0.1, 0.2), 100);
  }

  playError() {
    // Error buzz
    this.createBeep(150, 0.3, 0.25);
  }

  playUIClick() {
    // Subtle UI click
    this.createBeep(600, 0.05, 0.1);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export const soundEffects = new SoundEffects();
