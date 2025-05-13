import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/lib/stores/useGameStore";

interface GameOverScreenProps {
  score: number;
  wave: number;
  onRestart: () => void;
}

export default function GameOverScreen({ score, wave, onRestart }: GameOverScreenProps) {
  // Get the current game level from the game store
  const level = useGameStore((state) => state.level);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md bg-card text-card-foreground border border-destructive shadow-lg">
        <CardHeader className="space-y-1 text-center bg-destructive text-destructive-foreground p-6">
          <CardTitle className="text-3xl font-bold">Game Over</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">You survived until:</h3>
            <p className="text-4xl font-bold">Wave {wave}</p>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Final Score:</h3>
            <p className="text-4xl font-bold">{score}</p>
          </div>
          
          <div className="border border-border rounded-md p-4 bg-muted/50 text-muted-foreground">
            <p className="text-center">The zombies have overwhelmed you on Level {level}, but your fight will be remembered!</p>
            {level > 1 && (
              <p className="text-center mt-2 text-sm">
                Thanks to your upgrades, you can continue from Level {level}!
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center p-6 pt-0">
          <Button 
            onClick={onRestart} 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
