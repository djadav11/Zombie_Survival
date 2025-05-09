import { getKaboom } from "./kaboom";

// Create UI elements for the game
export function createGameUI() {
  const k = getKaboom();
  
  // Game title
  k.add([
    k.text("Zombie Survival", { size: 36 }), // Use default font
    k.pos(k.width() / 2, 50),
    k.anchor("center"),
    k.color(1, 1, 1),
    k.z(100),
  ]);
  
  // Controls info
  const controls = [
    "WASD / Arrows: Move",
    "Mouse / Space: Shoot",
    "Survive as long as possible!"
  ];
  
  // Add control instructions
  controls.forEach((control, index) => {
    k.add([
      k.text(control, { size: 16 }), // Use default font
      k.pos(k.width() / 2, k.height() - 80 + (index * 20)),
      k.anchor("center"),
      k.color(0.8, 0.8, 0.8),
      k.z(100),
    ]);
  });
}

// Show a countdown before game starts
export function showCountdown(onComplete: () => void) {
  const k = getKaboom();
  
  let count = 3;
  
  // Create the countdown text object
  const countdownText = k.add([
    k.text(`${count}`, { size: 80 }), // Use default font
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor("center"),
    k.color(1, 1, 1),
    k.scale(1),
    k.z(100),
  ]);
  
  // Update countdown every second
  const timer = k.loop(1, () => {
    count -= 1;
    
    if (count > 0) {
      countdownText.text = `${count}`;
      // Scale animation
      countdownText.scale = k.vec2(1.5, 1.5);
      k.tween(
        countdownText.scale,
        k.vec2(1, 1),
        0.5,
        (val) => countdownText.scale = val,
        k.easings.easeOutElastic
      );
    } else {
      countdownText.text = "GO!";
      countdownText.color = k.rgb(0, 1, 0);
      
      // Scale and fade animation
      countdownText.scale = k.vec2(1.5, 1.5);
      k.tween(
        countdownText.scale,
        k.vec2(0.5, 0.5),
        0.5,
        (val) => countdownText.scale = val
      );
      
      // Complete countdown
      k.wait(0.5, () => {
        countdownText.destroy();
        timer.cancel();
        onComplete();
      });
    }
  });
}

// Draw confined game area boundaries
export function drawGameBoundaries() {
  const k = getKaboom();
  
  // Add background
  k.add([
    k.sprite("background"),
    k.pos(0, 0),
    k.scale(1),
    k.anchor("topleft"),
    k.z(-10), // Behind everything
  ]);
  
  // Top wall
  k.add([
    k.sprite("wall"),
    k.scale(k.width() / 100, 20 / 100),
    k.pos(0, 0),
    k.opacity(0.9),
    k.area(),
    k.body({ isStatic: true }),
    "wall",
  ]);
  
  // Bottom wall
  k.add([
    k.sprite("wall"),
    k.scale(k.width() / 100, 20 / 100),
    k.pos(0, k.height() - 20),
    k.opacity(0.9),
    k.area(),
    k.body({ isStatic: true }),
    "wall",
  ]);
  
  // Left wall
  k.add([
    k.sprite("wall"),
    k.scale(20 / 100, k.height() / 100),
    k.pos(0, 0),
    k.opacity(0.9),
    k.area(),
    k.body({ isStatic: true }),
    "wall",
  ]);
  
  // Right wall
  k.add([
    k.sprite("wall"),
    k.scale(20 / 100, k.height() / 100),
    k.pos(k.width() - 20, 0),
    k.opacity(0.9),
    k.area(),
    k.body({ isStatic: true }),
    "wall",
  ]);
}
