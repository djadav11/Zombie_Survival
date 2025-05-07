import { getKaboom } from "./kaboom";

// Load all sprites and assets used in the game
export function loadGameAssets() {
  const k = getKaboom();

  // Load player sprite
  k.loadSprite("player", "/sprites/player.svg", {
    sliceX: 1,
    sliceY: 1,
    anims: {
      idle: { from: 0, to: 0 },
    },
  });

  // Load zombie sprite
  k.loadSprite("zombie", "/sprites/zombie.svg", {
    sliceX: 1,
    sliceY: 1,
    anims: {
      walk: { from: 0, to: 0 },
    },
  });

  // Load wall sprite for game boundaries
  k.loadSprite("wall", "/sprites/wall.svg");

  // Load bullet sprite
  k.loadSprite("bullet", "/sprites/bullet.svg");

  // Load sounds
  k.loadSound("hitSound", "/sounds/hit.mp3");
  k.loadSound("successSound", "/sounds/success.mp3");
  
  // Load fonts
  k.loadFont("gameFont", "inter");

  console.log("All game assets loaded");
}
