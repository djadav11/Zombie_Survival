import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface StartScreenProps {
  onStartGame: () => void;
}

export default function StartScreen({ onStartGame }: StartScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md bg-card text-card-foreground">
        <CardHeader className="space-y-1 text-center bg-primary text-primary-foreground p-6">
          <CardTitle className="text-3xl font-bold">Zombie Survival</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-lg">
              Survive waves of zombies in a confined space. Can you make it to the final wave?
            </p>
          </div>
          
          <div className="space-y-2 border border-border rounded-md p-4 bg-muted/50">
            <h3 className="font-bold text-center">Controls:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Move: WASD or Arrow Keys</li>
              <li>Shoot: Mouse Click or Space Bar</li>
              <li>Mute/Unmute: 🔇/🔊 Button</li>
            </ul>
          </div>
          
          <div className="space-y-2 border border-border rounded-md p-4 bg-muted/50">
            <h3 className="font-bold text-center">Objective:</h3>
            <p>Survive through 3 levels of increasing difficulty, each with 8 waves of zombies. After each level, visit the Shop to upgrade your character with points earned!</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center p-6 pt-0">
          <Button 
            onClick={onStartGame} 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Start Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
