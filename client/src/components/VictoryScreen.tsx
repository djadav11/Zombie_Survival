import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/lib/stores/useGameStore";
import { useEffect, useState } from "react";

interface VictoryScreenProps {
  score: number;
  wave: number;
  onRestart: () => void;
}

export default function VictoryScreen({ score, wave, onRestart }: VictoryScreenProps) {
  // Get player upgrades information
  const { playerUpgrades } = useGameStore();
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Hide confetti after a while to avoid performance issues
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 5}s linear infinite`,
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                width: `${5 + Math.random() * 10}px`,
                height: `${5 + Math.random() * 10}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}
      
      <Card className="w-full max-w-md bg-card text-card-foreground border border-primary shadow-lg z-10">
        <CardHeader className="space-y-1 text-center bg-primary text-primary-foreground p-6">
          <CardTitle className="text-3xl font-bold">COMPLETE VICTORY!</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">You conquered all 3 levels!</h3>
            <p className="text-xl">Finished on Wave {wave}</p>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Final Score:</h3>
            <p className="text-4xl font-bold">{score}</p>
          </div>
          
          <div className="border border-border rounded-md p-4 bg-muted/50">
            <h3 className="font-bold mb-2 text-center">Final Character Stats:</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background/50 p-2 rounded">
                <span className="font-medium">Health:</span> +{playerUpgrades.health * 25}
              </div>
              <div className="bg-background/50 p-2 rounded">
                <span className="font-medium">Damage:</span> +{playerUpgrades.damage * 10}
              </div>
              <div className="bg-background/50 p-2 rounded">
                <span className="font-medium">Speed:</span> +{playerUpgrades.speed * 15}%
              </div>
              <div className="bg-background/50 p-2 rounded">
                <span className="font-medium">Fire Rate:</span> +{playerUpgrades.fireRate * 10}%
              </div>
            </div>
          </div>
          
          <div className="border border-primary/20 rounded-md p-4 bg-primary/5 text-foreground">
            <p className="text-center">Congratulations! You've survived the zombie apocalypse!</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center p-6 pt-0">
          <Button 
            onClick={onRestart} 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}