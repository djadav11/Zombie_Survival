import { getKaboom } from "./kaboom";
import { GameObj } from "kaboom";
import { useAudio } from "../stores/useAudio";
import { PlayerUpgrades } from "./levels";

// Base player properties
const BASE_PLAYER_SPEED = 200;
const BASE_PLAYER_MAX_HEALTH = 100;
const BASE_BULLET_DAMAGE = 25;
const BASE_SHOOT_COOLDOWN = 0.3; // Time in seconds between shots

// Create the player game object
export function createPlayer(
  level: number = 1,
  upgrades: PlayerUpgrades = { health: 0, damage: 0, speed: 0, fireRate: 0 }
) {
  const k = getKaboom();
  const { playHit } = useAudio.getState(); // Get audio functions from store

  // Calculate player stats with upgrades
  const playerSpeed = BASE_PLAYER_SPEED * (1 + (upgrades.speed * 0.15));
  const playerMaxHealth = BASE_PLAYER_MAX_HEALTH + (upgrades.health * 25);
  const bulletDamage = BASE_BULLET_DAMAGE + (upgrades.damage * 10);
  const shootCooldown = BASE_SHOOT_COOLDOWN * (1 - (upgrades.fireRate * 0.1));
  
  // Format upgrade info text
  const upgradeText = upgrades.health > 0 || upgrades.damage > 0 || 
                      upgrades.speed > 0 || upgrades.fireRate > 0
    ? `Upgrades: Health +${upgrades.health * 25} | Damage +${upgrades.damage * 10} | Speed +${Math.floor(upgrades.speed * 15)}% | Fire Rate +${Math.floor(upgrades.fireRate * 10)}%`
    : '';
  
  // Create the player game object
  const player = k.add([
    k.sprite("player"),
    k.pos(k.width() / 2, k.height() / 2),
    k.area(),
    k.area({ shape: new k.Rect(k.vec2(0), 40, 40) }),
    k.health(playerMaxHealth),
    k.color(1, 1, 1),
    k.rotate(0),
    k.scale(1),
    k.z(10),
    k.anchor("center"),
    "player", // tag
    {
      lastShootTime: 0,
      speed: playerSpeed,
      bulletDamage: bulletDamage,
      shootCooldown: shootCooldown,
      score: 0,
      wave: 1,
      gameLevel: level,
      upgradeText: upgradeText,
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
    
    // More dramatic damage feedback
    // 1. Flash red
    player.color = k.rgb(1, 0, 0);
    
    // 2. Slight knockback effect (random direction)
    const knockbackAngle = k.rand(0, 360);
    const knockbackDir = k.vec2(
      Math.cos(knockbackAngle * (Math.PI / 180)),
      Math.sin(knockbackAngle * (Math.PI / 180))
    ).scale(15); // Knockback distance
    
    const origPos = player.pos.clone();
    player.pos = player.pos.add(knockbackDir);
    
    // 3. Screen shake effect
    k.shake(5);
    
    // Return to normal after a moment
    k.wait(0.15, () => {
      player.color = k.rgb(1, 1, 1);
      player.pos = origPos;
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
  if (now - player.lastShootTime < player.shootCooldown) {
    return;
  }
  
  player.lastShootTime = now;
  
  // Calculate bullet direction based on player rotation
  const angle = player.angle * (Math.PI / 180); // Convert to radians
  const bulletSpeed = 500;
  const bulletDir = k.vec2(Math.cos(angle), Math.sin(angle));
  
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
