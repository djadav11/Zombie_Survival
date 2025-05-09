import { getKaboom } from "./kaboom";
import { GameObj } from "kaboom";
import { useAudio } from "../stores/useAudio";

// Player properties
const PLAYER_SPEED = 200;
const PLAYER_MAX_HEALTH = 100;
const SHOOT_COOLDOWN = 0.3; // Time in seconds between shots

// Create the player game object
export function createPlayer() {
  const k = getKaboom();
  const { playHit } = useAudio.getState(); // Get audio functions from store

  // Create the player game object
  const player = k.add([
    k.sprite("player"),
    k.pos(k.width() / 2, k.height() / 2),
    k.area(),
    k.area({ shape: new k.Rect(k.vec2(0), 40, 40) }),
    k.health(PLAYER_MAX_HEALTH),
    k.color(1, 1, 1),
    k.rotate(0),
    k.scale(1),
    k.z(10),
    k.anchor("center"),
    "player", // tag
    {
      lastShootTime: 0,
      speed: PLAYER_SPEED,
      score: 0,
      wave: 1,
    },
  ]);

  // Handle player movement with WASD and arrow keys
  k.onUpdate(() => {
    let moveX = 0;
    let moveY = 0;

    // Check key presses
    if (k.isKeyDown("left") || k.isKeyDown("a")) moveX -= 1;
    if (k.isKeyDown("right") || k.isKeyDown("d")) moveX += 1;
    if (k.isKeyDown("up") || k.isKeyDown("w")) moveY -= 1;
    if (k.isKeyDown("down") || k.isKeyDown("s")) moveY += 1;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.7071; // 1/sqrt(2)
      moveY *= 0.7071;
    }

    // Update position
    player.move(moveX * player.speed, moveY * player.speed);

    // Keep player within bounds
    player.pos.x = k.clamp(player.pos.x, 20, k.width() - 20);
    player.pos.y = k.clamp(player.pos.y, 20, k.height() - 20);

    // Rotate player to face the mouse
    const mousePos = k.mousePos();
    player.angle = Math.atan2(
      mousePos.y - player.pos.y,
      mousePos.x - player.pos.x
    ) * (180 / Math.PI);
  });

  // Handle player shooting with mouse click
  k.onMousePress(() => {
    playerShoot(player);
  });

  // Alternative shooting with space bar
  k.onKeyPress("space", () => {
    playerShoot(player);
  });

  // Handle player damage and health
  player.on("hurt", () => {
    // Play hit sound when player gets hurt
    playHit();
    
    // Flash red on damage with better visual effect
    player.color = k.rgb(1, 0, 0);
    // Create a damage flash effect
    for (let i = 0; i < 5; i++) {
      k.add([
        k.rect(5, 5),
        k.pos(player.pos),
        k.color(1, 0, 0),
        k.lifespan(0.3),
        k.move(k.Vec2.fromAngle(k.rand(0, 360)), k.rand(60, 120)),
        k.scale(1),
      ]);
    }
    k.wait(0.1, () => {
      player.color = k.rgb(1, 1, 1);
    });
    
    // Game over if health reaches zero
    if (player.hp() <= 0) {
      player.trigger("die");
    }
  });

  return player;
}

// Player shooting function
function playerShoot(player: GameObj) {
  const k = getKaboom();
  const now = k.time();
  
  // Check cooldown
  if (now - player.lastShootTime < SHOOT_COOLDOWN) {
    return;
  }
  
  player.lastShootTime = now;
  
  // Calculate bullet direction based on player rotation
  const angle = player.angle * (Math.PI / 180); // Convert to radians
  const bulletSpeed = 500;
  const bulletDir = k.vec2(Math.cos(angle), Math.sin(angle));
  
  // Create muzzle flash effect
  for (let i = 0; i < 3; i++) {
    k.add([
      k.circle(3),
      k.pos(player.pos.add(bulletDir.scale(20))),
      k.color(1, 0.8, 0),
      k.lifespan(0.1),
      k.scale(k.rand(0.5, 1.5)),
      k.anchor("center"),
    ]);
  }
  
  // Create bullet
  const bullet = k.add([
    k.sprite("bullet"),
    k.pos(player.pos.add(bulletDir.scale(30))), // Start slightly in front of player
    k.area(),
    k.area({ shape: new k.Rect(k.vec2(0), 10, 10) }),
    k.scale(0.5),
    k.anchor("center"),
    k.rotate(player.angle),
    k.move(bulletDir, bulletSpeed),
    k.lifespan(1), // Delete after 1 second
    k.color(1, 1, 0),
    "bullet",
  ]);
  
  // Add trailing particles
  k.onUpdate(() => {
    if (bullet.exists()) {
      if (k.rand(0, 100) > 70) { // 30% chance per frame to spawn a particle
        k.add([
          k.circle(2),
          k.pos(bullet.pos),
          k.color(1, k.rand(0.5, 0.8), 0),
          k.lifespan(0.2),
          k.opacity(0.7),
          k.scale(k.rand(0.3, 0.6)),
        ]);
      }
    }
  });
  
  // Play shoot sound
  k.play("hitSound", {
    volume: 0.3,
    detune: k.rand(-100, 100),
  });
  
  return bullet;
}

// Update player UI display
export function updatePlayerUI(player: GameObj) {
  const k = getKaboom();
  
  // Health bar
  k.drawRect({
    pos: k.vec2(20, 20),
    width: 200,
    height: 20,
    color: k.rgb(50, 50, 50), // Use color instead of fill
  });
  
  // Current health
  k.drawRect({
    pos: k.vec2(20, 20),
    width: (player.hp() / PLAYER_MAX_HEALTH) * 200,
    height: 20,
    color: player.hp() < 30  // Use color instead of fill
      ? k.rgb(255, 50, 50) 
      : player.hp() < 60 
      ? k.rgb(255, 200, 50)
      : k.rgb(50, 200, 50),
  });
  
  // Health text
  k.drawText({
    text: `HP: ${Math.floor(player.hp())}`,
    pos: k.vec2(30, 25),
    size: 16,
    // Use default font
    color: k.rgb(255, 255, 255),
  });
  
  // Score and wave display
  k.drawText({
    text: `Score: ${player.score}`,
    pos: k.vec2(k.width() - 150, 25),
    size: 16,
    // Use default font
    color: k.rgb(255, 255, 255),
  });
  
  k.drawText({
    text: `Wave: ${player.wave}`,
    pos: k.vec2(k.width() - 150, 50),
    size: 16,
    // Use default font
    color: k.rgb(255, 255, 255),
  });
}
