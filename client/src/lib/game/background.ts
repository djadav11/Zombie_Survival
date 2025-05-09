import { getKaboom } from "./kaboom";

// Create a detailed background with tiles and details
export function createBackground() {
  const k = getKaboom();
  
  // First, draw the base background (darker ground)
  const bgSize = 40; // Size of each tile
  const cols = Math.ceil(k.width() / bgSize);
  const rows = Math.ceil(k.height() / bgSize);
  
  // Draw ground tiles with slight variations
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // Create a slightly varied color for each tile
      const colorVariation = k.rand(-5, 5);
      const r = k.clamp(35 + colorVariation, 25, 45);
      const g = k.clamp(10 + colorVariation, 5, 15);
      const b = k.clamp(10 + colorVariation, 5, 15);
      
      // Add tile with variations
      k.add([
        k.rect(bgSize, bgSize),
        k.pos(i * bgSize, j * bgSize),
        k.color(r/255, g/255, b/255),
        k.z(-10), // Ensure it's behind everything
      ]);
      
      // Randomly add details like cracks, blood splatters, etc.
      if (k.rand() < 0.2) { // 20% chance for a detail
        const detailType = Math.floor(k.rand(0, 3));
        
        switch(detailType) {
          case 0: // Small cracks
            drawCrack(k, i * bgSize + bgSize/2, j * bgSize + bgSize/2, bgSize * 0.6);
            break;
          case 1: // Blood splatter
            drawBloodSplatter(k, i * bgSize + bgSize/2, j * bgSize + bgSize/2, bgSize * 0.5);
            break;
          case 2: // Debris
            drawDebris(k, i * bgSize + bgSize/2, j * bgSize + bgSize/2, bgSize * 0.3);
            break;
        }
      }
    }
  }
  
  // Add some atmospheric overlay
  k.add([
    k.rect(k.width(), k.height()),
    k.pos(0, 0),
    k.color(0, 0, 0),
    k.opacity(0.1), // Very subtle darkening
    k.z(-5), // Above tiles but below everything else
  ]);
  
  console.log("Detailed background created");
}

// Helper to draw crack details
function drawCrack(k: any, x: number, y: number, size: number) {
  const angle = k.rand(0, 360);
  const lines = Math.floor(k.rand(2, 5));
  
  for (let i = 0; i < lines; i++) {
    const lineAngle = angle + k.rand(-30, 30);
    const lineLength = size * k.rand(0.4, 1);
    
    const endX = x + Math.cos(lineAngle * (Math.PI/180)) * lineLength;
    const endY = y + Math.sin(lineAngle * (Math.PI/180)) * lineLength;
    
    // Instead of using line, draw a thin rectangle
    const width = 1;
    const length = Math.sqrt(Math.pow(endX - x, 2) + Math.pow(endY - y, 2));
    const midX = (x + endX) / 2;
    const midY = (y + endY) / 2;
    
    k.add([
      k.rect(length, width),
      k.pos(midX, midY),
      k.anchor("center"),
      k.rotate(lineAngle),
      k.color(0.1, 0.1, 0.1),
      k.opacity(0.7),
      k.z(-9),
    ]);
  }
}

// Helper to draw blood splatters
function drawBloodSplatter(k: any, x: number, y: number, size: number) {
  const points = Math.floor(k.rand(3, 7));
  const baseSize = size * 0.5;
  
  for (let i = 0; i < points; i++) {
    const angle = k.rand(0, 360);
    const distance = baseSize * k.rand(0.1, 1);
    const splatterSize = baseSize * k.rand(0.2, 0.5);
    
    const posX = x + Math.cos(angle * (Math.PI/180)) * distance;
    const posY = y + Math.sin(angle * (Math.PI/180)) * distance;
    
    k.add([
      k.circle(splatterSize),
      k.pos(posX, posY),
      k.color(0.5, 0, 0),
      k.opacity(k.rand(0.4, 0.7)),
      k.z(-9),
    ]);
  }
}

// Helper to draw debris
function drawDebris(k: any, x: number, y: number, size: number) {
  const pieces = Math.floor(k.rand(2, 5));
  
  for (let i = 0; i < pieces; i++) {
    const angle = k.rand(0, 360);
    const distance = size * k.rand(0, 0.8);
    const debrisSize = size * k.rand(0.1, 0.3);
    
    const posX = x + Math.cos(angle * (Math.PI/180)) * distance;
    const posY = y + Math.sin(angle * (Math.PI/180)) * distance;
    
    // Random gray color for debris
    const gray = k.rand(0.1, 0.3);
    
    k.add([
      k.rect(debrisSize, debrisSize),
      k.pos(posX, posY),
      k.color(gray, gray, gray),
      k.z(-9),
      k.rotate(k.rand(0, 360)),
    ]);
  }
}