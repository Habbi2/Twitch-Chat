import confetti from 'canvas-confetti';

// Arcade color palette for confetti
const ARCADE_COLORS = ['#FF0000', '#00FF00', '#FFFF00', '#00FFFF', '#FF00FF', '#FF6600'];

/**
 * Fire pixel-style confetti for subscriber events
 */
export function fireSubConfetti() {
  const defaults = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ARCADE_COLORS,
    shapes: ['square'] as confetti.Shape[], // Pixel-style squares only!
    scalar: 1.5,
    gravity: 1.2,
    ticks: 150,
    disableForReducedMotion: true,
  };

  // First burst
  confetti(defaults);

  // Second burst for more impact
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 50,
      spread: 100,
      startVelocity: 45,
      origin: { y: 0.7 },
    });
  }, 150);

  // Side bursts
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
    });
    confetti({
      ...defaults,
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
    });
  }, 300);
}

/**
 * Fire pixel fireworks for bits/cheers
 * Intensity scales with bit amount
 */
export function fireBitsFireworks(bits: number) {
  const duration = Math.min(3000 + bits * 10, 6000); // 3-6 seconds based on bits
  const animationEnd = Date.now() + duration;
  const intensity = Math.min(bits / 500, 1) + 0.3; // 0.3 to 1.3 intensity

  const colors = ['#FF0000', '#FF6600', '#FFFF00', '#FFFFFF', '#00FFFF', '#FF00FF'];

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    // Random bursts from random positions
    confetti({
      particleCount: Math.floor(30 * intensity),
      spread: 360,
      startVelocity: 30 + Math.random() * 20,
      gravity: 0.8,
      shapes: ['square'] as confetti.Shape[],
      colors,
      origin: {
        x: Math.random(),
        y: Math.random() * 0.5,
      },
      ticks: 100,
      scalar: 1.2,
      disableForReducedMotion: true,
    });
  }, 200);

  return () => clearInterval(interval);
}

/**
 * Fire raid celebration - massive pixel explosion
 */
export function fireRaidCelebration(viewers: number) {
  const intensity = Math.min(viewers / 100, 2) + 0.5; // Scale with viewer count
  const duration = 4000;
  const animationEnd = Date.now() + duration;

  // Initial massive burst
  confetti({
    particleCount: Math.floor(150 * intensity),
    spread: 180,
    startVelocity: 50,
    gravity: 0.6,
    shapes: ['square'] as confetti.Shape[],
    colors: ARCADE_COLORS,
    origin: { x: 0.5, y: 0.3 },
    ticks: 200,
    scalar: 2,
    disableForReducedMotion: true,
  });

  // Continuous celebration
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    // Ships arriving from sides
    confetti({
      particleCount: 20,
      angle: 60,
      spread: 30,
      startVelocity: 40,
      origin: { x: 0, y: 0.3 },
      colors: ['#00FF00', '#39FF14'],
      shapes: ['square'] as confetti.Shape[],
      scalar: 1.5,
      disableForReducedMotion: true,
    });

    confetti({
      particleCount: 20,
      angle: 120,
      spread: 30,
      startVelocity: 40,
      origin: { x: 1, y: 0.3 },
      colors: ['#00FF00', '#39FF14'],
      shapes: ['square'] as confetti.Shape[],
      scalar: 1.5,
      disableForReducedMotion: true,
    });
  }, 300);

  return () => clearInterval(interval);
}

/**
 * Simple screen flash effect (returns cleanup function)
 */
export function createScreenFlash(color: string, duration: number = 100): () => void {
  const flash = document.createElement('div');
  flash.className = 'screen-flash';
  flash.style.backgroundColor = color;
  document.body.appendChild(flash);

  const timeout = setTimeout(() => {
    flash.remove();
  }, duration);

  return () => {
    clearTimeout(timeout);
    flash.remove();
  };
}
