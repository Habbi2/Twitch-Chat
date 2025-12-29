import confetti from 'canvas-confetti';

// Gothic color palette for confetti - bone, blood, ember, ash
const GOTHIC_COLORS = ['#e8e4d9', '#8b0000', '#b8860b', '#5c3a21', '#a89f8f', '#4a0000'];

/**
 * Fire pixel-style confetti for subscriber events - FPS optimized
 */
export function fireSubConfetti() {
  const defaults = {
    particleCount: 40, // Reduced from 100
    spread: 70,
    origin: { y: 0.6 },
    colors: GOTHIC_COLORS,
    shapes: ['square'] as confetti.Shape[], // Pixel-style squares only!
    scalar: 1.5,
    gravity: 1.2,
    ticks: 100, // Reduced from 150
    disableForReducedMotion: true,
  };

  // First burst
  confetti(defaults);

  // Second burst for more impact - reduced
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 25, // Reduced from 50
      spread: 100,
      startVelocity: 45,
      origin: { y: 0.7 },
    });
  }, 150);

  // Side bursts - reduced
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 15, // Reduced from 30
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
    });
    confetti({
      ...defaults,
      particleCount: 15, // Reduced from 30
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
    });
  }, 300);
}

/**
 * Fire pixel fireworks for bits/cheers - FPS optimized
 * Intensity scales with bit amount
 */
export function fireBitsFireworks(bits: number) {
  const duration = Math.min(2000 + bits * 5, 4000); // Reduced: 2-4 seconds based on bits
  const animationEnd = Date.now() + duration;
  const intensity = Math.min(bits / 500, 1) + 0.3; // 0.3 to 1.3 intensity

  const colors = GOTHIC_COLORS;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    // Random bursts from random positions - reduced particle count
    confetti({
      particleCount: Math.floor(15 * intensity), // Reduced from 30
      spread: 360,
      startVelocity: 30 + Math.random() * 20,
      gravity: 0.8,
      shapes: ['square'] as confetti.Shape[],
      colors,
      origin: {
        x: Math.random(),
        y: Math.random() * 0.5,
      },
      ticks: 80, // Reduced from 100
      scalar: 1.2,
      disableForReducedMotion: true,
    });
  }, 300); // Increased interval from 200ms

  return () => clearInterval(interval);
}

/**
 * Fire raid celebration - FPS optimized
 */
export function fireRaidCelebration(viewers: number) {
  const intensity = Math.min(viewers / 100, 1.5) + 0.5; // Reduced max intensity
  const duration = 3000; // Reduced from 4000
  const animationEnd = Date.now() + duration;

  // Initial burst - reduced
  confetti({
    particleCount: Math.floor(80 * intensity), // Reduced from 150
    spread: 180,
    startVelocity: 50,
    gravity: 0.6,
    shapes: ['square'] as confetti.Shape[],
    colors: GOTHIC_COLORS,
    origin: { x: 0.5, y: 0.3 },
    ticks: 150, // Reduced from 200
    scalar: 2,
    disableForReducedMotion: true,
  });

  // Continuous celebration - reduced frequency
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    // Skulls arriving from sides - reduced
    confetti({
      particleCount: 10, // Reduced from 20
      angle: 60,
      spread: 30,
      startVelocity: 40,
      origin: { x: 0, y: 0.3 },
      colors: ['#e8e4d9', '#8b0000'],
      shapes: ['square'] as confetti.Shape[],
      scalar: 1.5,
      disableForReducedMotion: true,
    });

    confetti({
      particleCount: 10, // Reduced from 20
      angle: 120,
      spread: 30,
      startVelocity: 40,
      origin: { x: 1, y: 0.3 },
      colors: ['#e8e4d9', '#8b0000'],
      shapes: ['square'] as confetti.Shape[],
      scalar: 1.5,
      disableForReducedMotion: true,
    });
  }, 400); // Increased from 300ms

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
