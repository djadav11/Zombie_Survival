import { getKaboom } from "./kaboom";

// Create background decorative elements
function createBackgroundEffects(k: any) {
  // Add subtle grid pattern
  for (let x = 0; x < k.width(); x += 50) {
    for (let y = 0; y < k.height(); y += 50) {
      k.add([
        k.rect(1, 1),
        k.pos(x, y),
        k.color(0.4, 0.4, 0.6),
        k.opacity(0.3),
        k.z(-10),
      ]);
    }
  }
  
  // Add some floating particles
  for (let i = 0; i < 30; i++) {
    const particle = k.add([
      k.circle(k.rand(1, 3)),
      k.pos(k.rand(0, k.width()), k.rand(0, k.height())),
      k.color(0.5, 0.5, 0.8),
      k.opacity(k.rand(0.1, 0.3)),
      k.z(-5),
    ]);
    
    // Random slow movement
    const angle = k.rand(0, 360);
    const speed = k.rand(5, 15);
    const dir = k.Vec2.fromAngle(angle);
    
    particle.onUpdate(() => {
      particle.move(dir.scale(speed * k.dt()));
      
      // Wrap around screen
      if (particle.pos.x > k.width()) particle.pos.x = 0;
      if (particle.pos.x < 0) particle.pos.x = k.width();
      if (particle.pos.y > k.height()) particle.pos.y = 0;
      if (particle.pos.y < 0) particle.pos.y = k.height();
    });
  }
  
  // Add decorative elements in corners
  const cornerSize = 60;
  const cornerPositions = [
    [cornerSize, cornerSize],                          // Top-left
    [k.width() - cornerSize, cornerSize],              // Top-right
    [cornerSize, k.height() - cornerSize],             // Bottom-left
    [k.width() - cornerSize, k.height() - cornerSize], // Bottom-right
  ];
  
  cornerPositions.forEach(pos => {
    // Decorative corner element
    k.add([
      k.circle(20),
      k.pos(pos[0], pos[1]),
      k.color(0.2, 0.2, 0.3),
      k.opacity(0.4),
      k.outline(2, k.rgb(0.4, 0.4, 0.7)),
      k.z(-8),
    ]);
    
    // Inner detail
    k.add([
      k.circle(8),
      k.pos(pos[0], pos[1]),
      k.color(0.3, 0.3, 0.5),
      k.opacity(0.5),
      k.z(-7),
    ]);
  });
}

// Create UI elements for the game
export function createGameUI() {
  const k = getKaboom();
  
  // Add background details for visual interest
  createBackgroundEffects(k);
  
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
  
  // Top wall
  k.add([
    k.sprite("wall"),
    k.rect(k.width(), 20),
    k.pos(0, 0),
    k.color(0.3, 0.5, 0.7),
    k.opacity(0.8),
    k.area(),
    k.body({ isStatic: true }),
    "wall",
  ]);
  
  // Bottom wall
  k.add([
    k.sprite("wall"),
    k.rect(k.width(), 20),
    k.pos(0, k.height() - 20),
    k.color(0.3, 0.5, 0.7),
    k.opacity(0.8),
    k.area(),
    k.body({ isStatic: true }),
    "wall",
  ]);
  
  // Left wall
  k.add([
    k.sprite("wall"),
    k.rect(20, k.height()),
    k.pos(0, 0),
    k.color(0.3, 0.5, 0.7),
    k.opacity(0.8),
    k.area(),
    k.body({ isStatic: true }),
    "wall",
  ]);
  
  // Right wall
  k.add([
    k.sprite("wall"),
    k.rect(20, k.height()),
    k.pos(k.width() - 20, 0),
    k.color(0.3, 0.5, 0.7),
    k.opacity(0.8),
    k.area(),
    k.body({ isStatic: true }),
    "wall",
  ]);
  
  // Add some glowing dots along the walls for sci-fi effect
  const wallDotSpacing = 60;
  
  // Function to create an animated glowing dot
  const createGlowDot = (x: number, y: number) => {
    const dot = k.add([
      k.circle(3),
      k.pos(x, y),
      k.color(0.2, 0.8, 1),
      k.opacity(0.8),
      k.z(3),
      { 
        pulseBeat: k.rand(0, Math.PI * 2), // Random starting phase
        pulseSpeed: k.rand(0.8, 1.5),      // Random pulsing speed
      }
    ]);
    
    // Animate the dot
    dot.onUpdate(() => {
      // Pulse effect
      dot.pulseBeat += dot.pulseSpeed * k.dt();
      
      // Calculate sine wave for pulsing
      const pulse = (Math.sin(dot.pulseBeat) + 1) / 2; // Range 0 to 1
      
      // Apply to scale and opacity
      dot.opacity = 0.4 + (pulse * 0.6);
      
      // Update the circle size by recreating it
      const newRadius = 2 + (pulse * 2);
      dot.use(k.circle(newRadius));
      
      // Create occasional "spark" effect
      if (k.rand(0, 1000) < 5) { // 0.5% chance per frame
        k.add([
          k.circle(1),
          k.pos(dot.pos.x, dot.pos.y),
          k.color(0.9, 0.9, 1),
          k.opacity(0.9),
          k.scale(1),
          k.lifespan(0.2),
          k.z(3),
        ]);
      }
    });
    
    return dot;
  };
  
  // Top and bottom wall dots
  for (let x = 40; x < k.width() - 40; x += wallDotSpacing) {
    createGlowDot(x, 10);       // Top wall dots
    createGlowDot(x, k.height() - 10); // Bottom wall dots
  }
  
  // Left and right wall dots
  for (let y = 40; y < k.height() - 40; y += wallDotSpacing) {
    createGlowDot(10, y);           // Left wall dots
    createGlowDot(k.width() - 10, y); // Right wall dots
  }
}
