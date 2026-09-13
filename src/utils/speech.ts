// Web Speech API text-to-speech reader for young kids

class SpeechReader {
  public enabled: boolean = true;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public isHindi(text: string): boolean {
    // Unicode range for Devanagari is \u0900-\u097F
    return /[\u0900-\u097F]/.test(text);
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean emojis or strange characters that confuse TTS
    const cleanText = text.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.85; // Slightly slower for kids to understand easily
    utterance.pitch = 1.05; // Slightly warmer/friendlier pitch

    const hindiText = this.isHindi(text);

    if (hindiText) {
      utterance.lang = 'hi-IN';
      const hiVoice = this.voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
      if (hiVoice) {
        utterance.voice = hiVoice;
      }
    } else {
      utterance.lang = 'en-IN';
      const enVoice = this.voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en'));
      if (enVoice) {
        utterance.voice = enVoice;
      }
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechReader = new SpeechReader();
