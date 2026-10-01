let activeAudio: HTMLAudioElement | null = null;

function speakWithBrowserVoice(text: string): boolean {
  if (!('speechSynthesis' in window)) return false;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const naturalVoiceNames = [
    'Samantha',
    'Ava',
    'Allison',
    'Karen',
    'Daniel',
    'Alex',
    'Google US English',
    'Microsoft Aria Online',
  ];
  const preferredVoice =
    voices.find((voice) => naturalVoiceNames.some((name) => voice.name.includes(name))) ||
    voices.find((voice) => voice.lang.startsWith('en-US')) ||
    voices.find((voice) => voice.lang.startsWith('en-GB')) ||
    voices.find((voice) => voice.lang.startsWith('en'));
  if (preferredVoice) utterance.voice = preferredVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function playPronunciation(text: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const cleaned = text.split('/')[0].split('(')[0].trim();
    if (!cleaned) return false;

    window.speechSynthesis?.cancel();
    activeAudio?.pause();

    const voices = window.speechSynthesis?.getVoices() || [];
    const hasNaturalLocalVoice = voices.some((voice) =>
      ['Samantha', 'Ava', 'Allison', 'Karen', 'Daniel', 'Alex', 'Google US English', 'Microsoft Aria Online']
        .some((name) => voice.name.includes(name))
    );

    if (hasNaturalLocalVoice) {
      return speakWithBrowserVoice(cleaned);
    }

    // Google TTS provides a more natural voice than the local browser voices.
    const audio = new Audio(
      `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-US&q=${encodeURIComponent(cleaned)}`
    );
    activeAudio = audio;
    audio.onended = () => {
      if (activeAudio === audio) activeAudio = null;
    };
    audio.onerror = () => {
      if (activeAudio === audio) {
        activeAudio = null;
        speakWithBrowserVoice(cleaned);
      }
    };

    void audio.play().catch(() => {
      if (activeAudio === audio) {
        activeAudio = null;
        speakWithBrowserVoice(cleaned);
      }
    });
    return true;
  } catch (err) {
    console.error('Natural speech error:', err);
    return speakWithBrowserVoice(text);
  }
}
