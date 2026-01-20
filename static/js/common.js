// Audio Context per generare suoni
let audioContext = null;

function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) {
    console.log("Audio non supportato");
  }
}

function playSound(frequency, duration, type = 'sine', volume = 0.3, fadeIn = 0.01, fadeOut = 0.05) {
  if(!audioContext) {
    initAudio();
    if(!audioContext) return;
  }
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  // Fade in e fade out più dolci
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + fadeIn);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration - fadeOut);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

function playClickSound() {
  // Suono più morbido e piacevole
  playSound(880, 0.12, 'sine', 0.15, 0.005, 0.03);
}

function playCardSound() {
  // Suono armonioso quando appare la card
  playSound(523.25, 0.18, 'sine', 0.2, 0.01, 0.05);
  setTimeout(() => {
    playSound(659.25, 0.15, 'sine', 0.18, 0.01, 0.04);
  }, 50);
}

function playNewTurnSound() {
  // Suono più elegante per nuovo turno
  playSound(440, 0.2, 'sine', 0.22, 0.01, 0.06);
  setTimeout(() => {
    playSound(554.37, 0.18, 'sine', 0.2, 0.01, 0.05);
  }, 60);
  setTimeout(() => {
    playSound(659.25, 0.16, 'sine', 0.18, 0.01, 0.04);
  }, 120);
}

function playButtonClickSound() {
  // Suono per click sui bottoni +/-
  playSound(660, 0.1, 'sine', 0.12, 0.003, 0.02);
}

function playPlayerCardSound(playerColor) {
  // Suono unico per ogni giocatore basato sul colore
  // Converti il colore hex in valori RGB
  const hex = playerColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calcola una frequenza base unica basata sui valori RGB
  // Usa una combinazione di R, G, B per creare frequenze diverse
  const colorHash = (r * 0.3 + g * 0.59 + b * 0.11); // Luminosità pesata
  const baseFreq = 350 + (colorHash % 400); // Frequenza base tra 350-750Hz
  
  // Crea un accordo armonioso per ogni colore (stesso per tutti)
  const freq1 = baseFreq;
  const freq2 = baseFreq * 1.25; // Quinta perfetta
  const freq3 = baseFreq * 1.5; // Ottava
  
  // Tipo di onda sempre 'sine' per suono armonioso e piacevole
  const waveType = 'sine';
  
  // Volume e durata uniformi per tutti
  playSound(freq1, 0.18, waveType, 0.2, 0.01, 0.05);
  setTimeout(() => {
    playSound(freq2, 0.15, waveType, 0.18, 0.01, 0.04);
  }, 50);
  setTimeout(() => {
    playSound(freq3, 0.12, waveType, 0.16, 0.01, 0.03);
  }, 100);
}

function playColorSelectSound() {
  // Suono per selezione colore
  playSound(523.25, 0.15, 'sine', 0.18, 0.005, 0.04);
  setTimeout(() => {
    playSound(659.25, 0.12, 'sine', 0.15, 0.005, 0.03);
  }, 40);
}

function playPageTransitionSound() {
  // Suono per cambio pagina
  playSound(440, 0.15, 'sine', 0.2, 0.01, 0.05);
  setTimeout(() => {
    playSound(523.25, 0.12, 'sine', 0.18, 0.01, 0.04);
  }, 50);
}

function playStartGameSound() {
  // Suono per inizio partita
  playSound(523.25, 0.18, 'sine', 0.22, 0.01, 0.06);
  setTimeout(() => {
    playSound(659.25, 0.16, 'sine', 0.2, 0.01, 0.05);
  }, 60);
  setTimeout(() => {
    playSound(783.99, 0.14, 'sine', 0.18, 0.01, 0.04);
  }, 120);
}

function playEndGameSound() {
  // Suono per fine partita
  playSound(392, 0.3, 'sine', 0.25, 0.01, 0.1);
  setTimeout(() => {
    playSound(329.63, 0.28, 'sine', 0.23, 0.01, 0.09);
  }, 100);
  setTimeout(() => {
    playSound(261.63, 0.25, 'sine', 0.2, 0.01, 0.08);
  }, 200);
}

function playConfirmSound() {
  // Suono per conferma azione
  playSound(659.25, 0.15, 'sine', 0.2, 0.01, 0.05);
  setTimeout(() => {
    playSound(783.99, 0.12, 'sine', 0.18, 0.01, 0.04);
  }, 50);
}

function playCancelSound() {
  // Suono per annullamento
  playSound(440, 0.12, 'sine', 0.15, 0.01, 0.04);
  setTimeout(() => {
    playSound(392, 0.1, 'sine', 0.13, 0.01, 0.03);
  }, 40);
}

function playSuccessSound() {
  // Suono per azione completata con successo
  playSound(523.25, 0.12, 'sine', 0.18, 0.005, 0.04);
  setTimeout(() => {
    playSound(659.25, 0.1, 'sine', 0.16, 0.005, 0.03);
  }, 50);
  setTimeout(() => {
    playSound(783.99, 0.08, 'sine', 0.14, 0.005, 0.02);
  }, 100);
}

function playHoverSound() {
  // Suono leggero per hover
  playSound(880, 0.08, 'sine', 0.1, 0.002, 0.02);
}

function playCardFlipSound() {
  // Suono per flip della card
  playSound(440, 0.1, 'sine', 0.15, 0.005, 0.03);
  setTimeout(() => {
    playSound(330, 0.08, 'sine', 0.12, 0.005, 0.02);
  }, 30);
}
