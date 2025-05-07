import { getKaboom } from "./kaboom";
import { createPlayer, updatePlayerUI } from "./player";
import { spawnZombie, getZombieCount } from "./zombie";
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

// Start the main game
export function startGame(onGameOver: (score: number, wave: number) => void) {
  const k = getKaboom();
  const { playSuccess } = useAudio.getState();
  
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
          k.text(`Wave ${player.wave} complete!`, { size: 32, font: "gameFont" }),
          k.pos(k.width() / 2, k.height() / 2 - 50),
          k.color(1, 1, 1),
          k.anchor("center"),
          k.scale(1),
          k.lifespan(2),
        ]);
        
        const nextWaveText = k.add([
          k.text(`Next wave in ${WAVE_COOLDOWN} seconds...`, { size: 24, font: "gameFont" }),
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
        startWave();
      }
    }
  });
  
  // Game over when player dies
  player.on("die", () => {
    gameRunning = false;
    
    // Wait a moment before triggering game over
    k.wait(1, () => {
      // Pass final score and wave to the game over handler
      if (player) {
        onGameOver(player.score, player.wave);
      }
    });
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
    k.text(`Wave ${player.wave}`, { size: 40, font: "gameFont" }),
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
}
