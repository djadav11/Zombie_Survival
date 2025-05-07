import { getKaboom } from "./kaboom";
import { useAudio } from "../stores/useAudio";

// Initialize game sounds
export function initGameSounds() {
  const { backgroundMusic, isMuted } = useAudio.getState();
  
  // Start background music if available and not muted
  if (backgroundMusic && !isMuted) {
    backgroundMusic.currentTime = 0;
    backgroundMusic.play().catch(error => {
      console.log("Background music play prevented:", error);
    });
  }
}

// Handle sound for zombie hit
export function playZombieHitSound() {
  const k = getKaboom();
  const { isMuted } = useAudio.getState();
  
  if (!isMuted) {
    k.play("hitSound", {
      volume: 0.2,
      detune: k.rand(-200, 200), // Randomize pitch for variety
    });
  }
}

// Handle sound for player being hit
export function playPlayerHitSound() {
  const k = getKaboom();
  const { isMuted } = useAudio.getState();
  
  if (!isMuted) {
    k.play("hitSound", {
      volume: 0.4,
      detune: -400, // Lower pitch for player hits
    });
  }
}

// Clean up sounds when game ends
export function cleanupSounds() {
  const { backgroundMusic } = useAudio.getState();
  
  // Stop background music
  if (backgroundMusic) {
    backgroundMusic.pause();
  }
}
