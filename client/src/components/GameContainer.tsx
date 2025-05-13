import { useRef, useEffect, useState } from "react";
import { initKaboom, destroyKaboom, getKaboom } from "../lib/game/kaboom";
import { loadGameAssets } from "../lib/game/sprites";
import { startGame, stopGame } from "../lib/game/levels";
import { createGameUI, showCountdown, drawGameBoundaries } from "../lib/game/ui";
import { initGameSounds, cleanupSounds } from "../lib/game/sounds";

interface PlayerUpgrades {
  health: number;
  damage: number;
  speed: number;
  fireRate: number;
}

interface GameContainerProps {
  onGameOver: (score: number, wave: number) => void;
  level: number;
  playerUpgrades: PlayerUpgrades;
}

export default function GameContainer({ onGameOver, level, playerUpgrades }: GameContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize game when component mounts
  useEffect(() => {
    // Initialize only if canvas ref is available
    if (!canvasRef.current) return;

    // Init Kaboom with the canvas
    const k = initKaboom(canvasRef.current);
    
    // Load assets
    loadGameAssets();
    
    // Mark loading as complete
    setIsLoading(false);
    
    console.log("Game initialized");

    // Set up game on first render
    const setupGame = () => {
      // Create UI elements
      createGameUI();
      
      // Draw game boundaries
      drawGameBoundaries();
      
      // Initialize sounds
      initGameSounds();
      
      // Show countdown before starting
      showCountdown(() => {
        // Start game after countdown with level and upgrades
        startGame(
          (score, wave) => {
            // Handle game over by calling the prop callback
            onGameOver(score, wave);
          },
          level,
          playerUpgrades
        );
      });
    };
    
    // Begin setup once assets are loaded
    k.onLoad(setupGame);

    // Cleanup when component unmounts
    return () => {
      console.log("Cleaning up game");
      stopGame();
      cleanupSounds();
      destroyKaboom();
    };
  }, [onGameOver]);

  return (
    <div className="relative w-full max-w-[800px] h-[600px] bg-black rounded-lg overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      )}
      
      {/* Game canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
}
