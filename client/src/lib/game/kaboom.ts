import kaboom, { KaboomCtx } from "kaboom";

// Global kaboom instance
let k: KaboomCtx | null = null;

// Initialize kaboom with optimal settings for this game
export function initKaboom(canvasElement: HTMLCanvasElement) {
  // Initialize only once
  if (k) return k;

  // Initialize with canvas element and configuration
  k = kaboom({
    canvas: canvasElement,
    width: 800,
    height: 600,
    background: [40, 10, 10], // Darker red for zombie-themed background
    scale: 1,
    debug: false,
    crisp: true,
    global: false, // Don't add to global namespace
  });

  console.log('Kaboom initialized!');
  return k;
}

// Get the existing kaboom instance
export function getKaboom(): KaboomCtx {
  if (!k) {
    throw new Error('Kaboom not initialized! Call initKaboom first.');
  }
  return k;
}

// Clean up kaboom instance
export function destroyKaboom() {
  if (k) {
    k.quit();
    k = null;
    console.log('Kaboom destroyed');
  }
}
