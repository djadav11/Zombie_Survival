import { useEffect, useState } from "react";
import GameContainer from "./components/GameContainer";
import StartScreen from "./components/StartScreen";
import GameOverScreen from "./components/GameOverScreen";
import VictoryScreen from "./components/VictoryScreen";
import ShopScreen from "./components/ShopScreen";
import "@fontsource/inter";
import { useAudio } from "./lib/stores/useAudio";
import { useGameStore } from "./lib/stores/useGameStore";
import { Howl } from "howler";

// Define game states
type GameState = "start" | "playing" | "gameOver" | "victory" | "shop";

function App() {
  // State for tracking the current game state
  const [gameState, setGameState] = useState<GameState>("start");
  const [wave, setWave] = useState(0);
  
  // Get game state from our store
  const { 
    level,
    currentScore,
    totalScore,
    playerUpgrades,
    setLevel,
    addScore,
    resetCurrentScore,
    purchaseUpgrade,
    resetGame
  } = useGameStore();
  
  const { 
    setBackgroundMusic, 
    setHitSound,
    setSuccessSound,
    toggleMute,
    isMuted 
  } = useAudio();

  // Load audio when the app initializes
  useEffect(() => {
    // Load and set background music
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);
    
    // Load hit sound for zombie hits and player damage
    const hitSfx = new Audio("/sounds/hit.mp3");
    setHitSound(hitSfx);
    
    // Load success sound for wave completion
    const successSfx = new Audio("/sounds/success.mp3");
    setSuccessSound(successSfx);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  // Start new game from beginning (level 1)
  const handleStartNewGame = () => {
    resetGame();
    setGameState("playing");
    setWave(1);
  };
  
  // Continue from current level
  const handleContinueGame = () => {
    resetCurrentScore();
    setGameState("playing");
    setWave(1);
  };
  
  // Handle shop purchase
  const handleUpgradePurchase = (upgradeId: string) => {
    purchaseUpgrade(upgradeId as keyof typeof playerUpgrades);
  };
  
  // Handle proceeding to next level
  const handleNextLevel = () => {
    // Move to the next level
    setLevel((level + 1) as typeof level);
    setGameState("playing");
    setWave(1);
  };
  
  // Handle game over or level completion
  const handleGameOver = (finalScore: number, finalWave: number) => {
    setWave(finalWave);
    addScore(finalScore);
    
    // Check if player won (reached wave 9, which means they completed wave 8)
    if (finalWave >= 9) {
      // Check if this was the final level
      if (level === 3) {
        setGameState("victory"); // Game victory
      } else {
        setGameState("shop"); // Go to shop between levels
      }
    } else {
      setGameState("gameOver"); // Game over
    }
  };

  // Render the appropriate screen based on game state
  return (
    <div className="w-screen h-screen bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Sound toggle button (top-right corner) */}
      <button 
        onClick={toggleMute} 
        className="absolute top-4 right-4 z-10 p-2 bg-background/80 text-foreground rounded-full"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* Level indicator (top-left corner) */}
      {gameState !== "start" && (
        <div className="absolute top-4 left-4 z-10 p-2 px-4 bg-primary/80 text-primary-foreground rounded-full">
          Level {level}
        </div>
      )}

      {gameState === "start" && <StartScreen onStartGame={handleStartNewGame} />}
      
      {gameState === "playing" && (
        <GameContainer 
          onGameOver={handleGameOver} 
          level={level}
          playerUpgrades={playerUpgrades}
        />
      )}
      
      {gameState === "gameOver" && (
        <GameOverScreen 
          score={currentScore} 
          wave={wave}
          onRestart={level === 1 ? handleStartNewGame : handleContinueGame} 
        />
      )}
      
      {gameState === "victory" && (
        <VictoryScreen 
          score={totalScore} 
          wave={wave}
          onRestart={handleStartNewGame} 
        />
      )}
      
      {gameState === "shop" && (
        <ShopScreen 
          level={level}
          score={currentScore}
          playerUpgrades={playerUpgrades}
          onUpgradePurchase={handleUpgradePurchase}
          onContinue={handleNextLevel}
        />
      )}
    </div>
  );
}

export default App;
