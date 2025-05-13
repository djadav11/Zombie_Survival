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
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md bg-card text-card-foreground border border-primary shadow-lg">
        <CardHeader className="space-y-1 text-center bg-primary text-primary-foreground p-6">
          <CardTitle className="text-3xl font-bold">VICTORY!</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">You completed all waves!</h3>
            <p className="text-4xl font-bold">Wave {wave}</p>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Final Score:</h3>
            <p className="text-4xl font-bold">{score}</p>
          </div>
          
          <div className="border border-border rounded-md p-4 bg-muted/50 text-muted-foreground">
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