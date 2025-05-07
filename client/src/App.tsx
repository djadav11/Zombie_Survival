import { useEffect, useState } from "react";
import GameContainer from "./components/GameContainer";
import StartScreen from "./components/StartScreen";
import GameOverScreen from "./components/GameOverScreen";
import "@fontsource/inter";
import { useAudio } from "./lib/stores/useAudio";
import { Howl } from "howler";

// Define game states
type GameState = "start" | "playing" | "gameOver";

function App() {
  // State for tracking the current game state
  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(0);
  
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

  // Start new game
  const handleStartGame = () => {
    setGameState("playing");
    setScore(0);
    setWave(1);
  };

  // Handle game over
  const handleGameOver = (finalScore: number, finalWave: number) => {
    setScore(finalScore);
    setWave(finalWave);
    setGameState("gameOver");
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

      {gameState === "start" && <StartScreen onStartGame={handleStartGame} />}
      
      {gameState === "playing" && (
        <GameContainer onGameOver={handleGameOver} />
      )}
      
      {gameState === "gameOver" && (
        <GameOverScreen 
          score={score} 
          wave={wave}
          onRestart={handleStartGame} 
        />
      )}
    </div>
  );
}

export default App;
