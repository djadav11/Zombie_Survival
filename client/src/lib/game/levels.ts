import { getKaboom } from "./kaboom";
import { createPlayer, updatePlayerUI } from "./player";
import { spawnZombie, getZombieCount, destroyAllZombies } from "./zombie";
import { GameObj } from "kaboom";
import { useAudio } from "../stores/useAudio";

// Wave properties
const WAVE_COOLDOWN = 5; // Seconds between waves
const ZOMBIES_PER_WAVE_BASE = 3;
const ZOMBIES_PER_WAVE_INCREMENT = 2;
const MAX_ZOMBIES_AT_ONCE = 20;

// Game state
let gameRunning = false;
let waveTimer = 0;
let waveActive = false;
let zombiesLeftToSpawn = 0;
let spawnInterval = 0.5; // Time between zombie spawns
let lastSpawnTime = 0;
let player: GameObj | null = null;
let gameOverCallback: ((score: number, wave: number) => void) | null = null;

// Start the main game
export function startGame(onGameOver: (score: number, wave: number) => void) {
  const k = getKaboom();
  const { playSuccess } = useAudio.getState();
  
  // Save the callback for later use
  gameOverCallback = onGameOver;
  
  // Reset game state
  gameRunning = true;
  
  // Create the player
  player = createPlayer();
  
  // Start with wave 1
  player.wave = 1;
  player.score = 0;
  
  // Start first wave
  startWave();
  
  // Main game loop
  k.onUpdate(() => {
    if (!gameRunning || !player) return;
    
    // Update player UI
    updatePlayerUI(player);
    
    // Handle wave progression
    if (waveActive) {
      // Still zombies to spawn in this wave?
      if (zombiesLeftToSpawn > 0) {
        const now = k.time();
        if (now - lastSpawnTime > spawnInterval && getZombieCount() < MAX_ZOMBIES_AT_ONCE) {
          spawnZombie(player.wave, player);
          zombiesLeftToSpawn--;
          lastSpawnTime = now;
        }
      } 
      // Wave complete?
      else if (getZombieCount() === 0) {
        waveActive = false;
        waveTimer = 0;
        
        // Play success sound
        playSuccess();
        
        // Display wave complete message
        const waveCompleteText = k.add([
          k.text(`Wave ${player.wave} complete!`, { size: 32 }), // Use default font
          k.pos(k.width() / 2, k.height() / 2 - 50),
          k.color(1, 1, 1),
          k.anchor("center"),
          k.scale(1),
          k.lifespan(2),
        ]);
        
        const nextWaveText = k.add([
          k.text(`Next wave in ${WAVE_COOLDOWN} seconds...`, { size: 24 }), // Use default font
          k.pos(k.width() / 2, k.height() / 2),
          k.color(1, 1, 1),
          k.anchor("center"),
          k.scale(1),
          k.lifespan(2),
        ]);
      }
    } else {
      // Wave cooldown
      waveTimer += k.dt();
      if (waveTimer >= WAVE_COOLDOWN) {
        player.wave++;
        
        // Check if player has completed all 8 waves
        if (player.wave > 8) {
          // Player wins the game!
          gameWin();
        } else {
          // Start the next wave
          startWave();
        }
      }
    }
  });
  
  // Game over when player dies
  player.on("die", () => {
    gameRunning = false;
    
    // Wait a moment before triggering game over
    k.wait(1, () => {
      // Pass final score and wave to the game over handler
      if (player && gameOverCallback) {
        gameOverCallback(player.score, player.wave);
      }
    });
  });
}

// Game win function - triggered when player completes all 8 waves
function gameWin() {
  const k = getKaboom();
  gameRunning = false;
  
  // Clear any remaining zombies
  destroyAllZombies();
  
  // Ensure we have a valid player object
  if (!player) return;
  
  // Add a victory message
  k.add([
    k.text("VICTORY!", { size: 80 }),
    k.pos(k.width() / 2, k.height() / 2 - 50),
    k.color(0.8, 0.8, 0.2), // Gold color
    k.anchor("center"),
    k.scale(1),
  ]);
  
  k.add([
    k.text(`You survived all 8 waves!`, { size: 32 }),
    k.pos(k.width() / 2, k.height() / 2 + 20),
    k.color(1, 1, 1),
    k.anchor("center"),
    k.scale(1),
  ]);
  
  const finalScore = player.score;
  const finalWave = player.wave;
  
  k.add([
    k.text(`Final Score: ${finalScore}`, { size: 32 }),
    k.pos(k.width() / 2, k.height() / 2 + 60),
    k.color(1, 1, 1),
    k.anchor("center"),
    k.scale(1),
  ]);
  
  // Add confetti-like particles for celebration
  for (let i = 0; i < 100; i++) {
    k.add([
      k.rect(8, 8),
      k.pos(k.rand(0, k.width()), k.rand(0, k.height())),
      k.color(k.rand(0, 1), k.rand(0, 1), k.rand(0, 1)),
      k.lifespan(3),
      k.move(k.Vec2.fromAngle(k.rand(0, 360)), k.rand(50, 150)),
      k.scale(k.rand(0.5, 2)),
    ]);
  }
  
  // Wait a moment before triggering game over with win status
  k.wait(4, () => {
    // Pass final score and wave to the game over handler
    if (gameOverCallback) {
      gameOverCallback(finalScore, finalWave);
    }
  });
}

// Start a new wave of zombies
function startWave() {
  const k = getKaboom();
  if (!player) return;
  
  waveActive = true;
  
  // Calculate number of zombies for this wave
  zombiesLeftToSpawn = ZOMBIES_PER_WAVE_BASE + ((player.wave - 1) * ZOMBIES_PER_WAVE_INCREMENT);
  
  // Adjust spawn interval for difficulty
  spawnInterval = Math.max(0.2, 0.5 - (player.wave * 0.03));
  
  // Display wave start message
  const waveStartText = k.add([
    k.text(`Wave ${player.wave}`, { size: 40 }), // Use default font
    k.pos(k.width() / 2, k.height() / 2),
    k.color(1, 0.5, 0.5),
    k.anchor("center"),
    k.scale(1),
    k.lifespan(2),
  ]);
  
  // Start spawning immediately
  lastSpawnTime = k.time() - spawnInterval;
}

// Cleanup and stop the game
export function stopGame() {
  gameRunning = false;
  player = null;
  gameOverCallback = null;
}
