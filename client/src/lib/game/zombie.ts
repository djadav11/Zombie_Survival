import { getKaboom } from "./kaboom";
import { GameObj } from "kaboom";
import { useAudio } from "../stores/useAudio";

// Zombie properties
const ZOMBIE_SPEED_BASE = 60;
const ZOMBIE_HEALTH_BASE = 40;
const ZOMBIE_DAMAGE = 10;
const ZOMBIE_ATTACK_COOLDOWN = 0.8; // Seconds between attacks

// Spawn a new zombie at a random position around the edges
export function spawnZombie(wave: number, target: GameObj) {
  const k = getKaboom();
  
  // Increase difficulty with each wave
  const speedMultiplier = 1 + (wave * 0.05);
  const healthMultiplier = 1 + (wave * 0.1);
  const zombieSpeed = ZOMBIE_SPEED_BASE * speedMultiplier;
  const zombieHealth = ZOMBIE_HEALTH_BASE * healthMultiplier;
  
  // Determine spawn position (outside the screen edges)
  let spawnPos;
  const side = k.rand(0, 4); // 0: top, 1: right, 2: bottom, 3: left
  
  switch (Math.floor(side)) {
    case 0: // top
      spawnPos = k.vec2(k.rand(0, k.width()), -20);
      break;
    case 1: // right
      spawnPos = k.vec2(k.width() + 20, k.rand(0, k.height()));
      break;
    case 2: // bottom
      spawnPos = k.vec2(k.rand(0, k.width()), k.height() + 20);
      break;
    case 3: // left
      spawnPos = k.vec2(-20, k.rand(0, k.height()));
      break;
    default:
      spawnPos = k.vec2(0, 0);
  }
  
  // Create the zombie
  const zombie = k.add([
    k.sprite("zombie"),
    k.pos(spawnPos),
    k.area(),
    k.area({ shape: new k.Rect(k.vec2(0), 40, 40) }),
    k.health(zombieHealth),
    k.scale(1),
    k.anchor("center"),
    k.rotate(0),
    k.color(0.8, 0.2, 0.2), // Red tint for zombies
    "zombie", // tag
    {
      speed: zombieSpeed,
      damage: ZOMBIE_DAMAGE,
      lastAttackTime: 0,
      value: Math.floor(10 * healthMultiplier), // Point value increases with difficulty
    },
  ]);
  
  // Zombie movement AI - follow the player
  zombie.onUpdate(() => {
    if (!target.exists()) return;
    
    // Calculate direction to player
    const dir = target.pos.sub(zombie.pos).unit();
    
    // Move towards player
    zombie.move(dir.scale(zombie.speed));
    
    // Rotate to face player
    zombie.angle = Math.atan2(dir.y, dir.x) * (180 / Math.PI);
  });
  
  // Zombie collision with player
  zombie.onCollide("player", (player) => {
    const now = k.time();
    
    // Check attack cooldown
    if (now - zombie.lastAttackTime < ZOMBIE_ATTACK_COOLDOWN) {
      return;
    }
    
    zombie.lastAttackTime = now;
    
    // Damage the player
    player.hurt(zombie.damage);
  });
  
  // Zombie hit by bullet
  zombie.onCollide("bullet", (bullet) => {
    // Destroy the bullet
    bullet.destroy();
    
    // Damage the zombie
    zombie.hurt(25);
    
    // Flash the zombie
    zombie.color = k.rgb(1, 1, 1);
    k.wait(0.1, () => {
      zombie.color = k.rgb(0.8, 0.2, 0.2);
    });
    
    // Check if zombie is dead
    if (zombie.hp() <= 0) {
      // Add score to player
      const player = k.get("player")[0];
      if (player) {
        player.score += zombie.value;
      }
      
      // Play hit sound effect for zombie death
      const { playHit } = useAudio.getState();
      playHit();
      
      // Enhanced particles for zombie death
      // Blood splatter
      for (let i = 0; i < 15; i++) {
        k.add([
          k.circle(k.rand(2, 5)),
          k.pos(zombie.pos),
          k.color(0.8, 0.2, 0.2),
          k.lifespan(k.rand(0.3, 0.8)),
          k.move(k.Vec2.fromAngle(k.rand(0, 360)), k.rand(50, 200)),
          k.scale(1),
          k.opacity(0.8),
        ]);
      }
      
      // Smoky decay effect
      for (let i = 0; i < 8; i++) {
        k.add([
          k.circle(8),
          k.pos(zombie.pos),
          k.color(0.3, 0.1, 0.1),
          k.opacity(0.4),
          k.lifespan(0.7),
          k.move(k.Vec2.fromAngle(k.rand(0, 360)), k.rand(20, 60)),
          k.scale(k.rand(0.5, 1.5)),
        ]);
      }
      
      // Shock wave
      const shockwave = k.add([
        k.circle(5),
        k.pos(zombie.pos),
        k.opacity(0.5),
        k.color(0.9, 0.3, 0.3),
        k.outline(2, k.rgb(0.5, 0, 0)),
        k.anchor("center"),
        k.lifespan(0.3),
      ]);
      
      // Animate shockwave expansion
      k.tween(
        5,
        40,
        0.3,
        (val) => {
          if (shockwave.exists()) {
            // Set radius property of the circle through the proper API
            const radius = val;
            
            // Recreate circle with new size instead of directly modifying radius
            shockwave.use(k.circle(radius));
            
            // Adjust opacity based on size
            shockwave.opacity = 0.5 - (val / 80);
          }
        },
        k.easings.easeOutQuart
      );
      
      // Destroy the zombie
      zombie.destroy();
    }
  });
  
  return zombie;
}

// Get count of currently active zombies
export function getZombieCount(): number {
  const k = getKaboom();
  return k.get("zombie").length;
}

// Clean up all zombies (e.g., when restarting game)
export function destroyAllZombies() {
  const k = getKaboom();
  k.get("zombie").forEach(zombie => zombie.destroy());
}
