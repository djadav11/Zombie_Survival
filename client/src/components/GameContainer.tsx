import { useRef, useEffect, useState } from "react";
import { initKaboom, destroyKaboom, getKaboom } from "../lib/game/kaboom";
import { loadGameAssets } from "../lib/game/sprites";
import { startGame, stopGame } from "../lib/game/levels";
import { createGameUI, showCountdown, drawGameBoundaries } from "../lib/game/ui";
import { initGameSounds, cleanupSounds } from "../lib/game/sounds";
import { createBackground } from "../lib/game/background";

interface GameContainerProps {
  onGameOver: (score: number, wave: number) => void;
}

export default function GameContainer({ onGameOver }: GameContainerProps) {
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
      // Create detailed background first (so it's behind everything)
      createBackground();
      
      // Create UI elements
      createGameUI();
      
      // Draw game boundaries
      drawGameBoundaries();
      
      // Initialize sounds
      initGameSounds();
      
      // Show countdown before starting
      showCountdown(() => {
        // Start game after countdown
        startGame((score, wave) => {
          // Handle game over by calling the prop callback
          onGameOver(score, wave);
        });
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
      {/* Loading overlay with zombie-themed animation */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
          <div className="w-16 h-16 mb-4 relative">
            <div className="w-full h-full rounded-full border-4 border-red-800 border-t-red-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-red-500 text-2xl font-bold animate-pulse">Loading Zombie Survival...</div>
          <div className="text-gray-400 mt-2 text-sm">Grab your weapons!</div>
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
