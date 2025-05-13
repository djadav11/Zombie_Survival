import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

// Define the upgrades available in the shop
interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
}

interface PlayerUpgrades {
  health: number;
  damage: number;
  speed: number;
  fireRate: number;
}

interface ShopScreenProps {
  level: number;
  score: number;
  playerUpgrades: PlayerUpgrades;
  onUpgradePurchase: (upgradeId: string) => void;
  onContinue: () => void;
}

const UPGRADES: Upgrade[] = [
  {
    id: "health",
    name: "Health Boost",
    description: "Increase max health by 25 per level",
    cost: 50,
    maxLevel: 5
  },
  {
    id: "damage",
    name: "Damage Up",
    description: "Increase bullet damage by 10 per level",
    cost: 75,
    maxLevel: 5
  },
  {
    id: "speed",
    name: "Speed Boost",
    description: "Increase movement speed by 15% per level",
    cost: 60, 
    maxLevel: 3
  },
  {
    id: "fireRate",
    name: "Rapid Fire",
    description: "Decrease shooting cooldown by 10% per level",
    cost: 100,
    maxLevel: 3
  }
];

export default function ShopScreen({ 
  level, 
  score, 
  playerUpgrades, 
  onUpgradePurchase, 
  onContinue 
}: ShopScreenProps) {
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  
  // Calculate if player can afford the selected upgrade
  const canAffordUpgrade = (upgradeId: string): boolean => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;
    
    return score >= upgrade.cost;
  };
  
  // Check if upgrade is at max level
  const isUpgradeMaxed = (upgradeId: string): boolean => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return true;
    
    const currentLevel = playerUpgrades[upgradeId as keyof PlayerUpgrades];
    return currentLevel >= upgrade.maxLevel;
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-3xl bg-card text-card-foreground">
        <CardHeader className="space-y-1 text-center bg-primary text-primary-foreground p-6">
          <CardTitle className="text-3xl font-bold">Upgrade Shop</CardTitle>
          <p className="text-lg">Level {level} Complete! - Available Points: {score}</p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UPGRADES.map((upgrade) => {
              const currentLevel = playerUpgrades[upgrade.id as keyof PlayerUpgrades];
              const isMaxed = isUpgradeMaxed(upgrade.id);
              const canAfford = canAffordUpgrade(upgrade.id);
              
              return (
                <div 
                  key={upgrade.id}
                  className={`border rounded-md p-4 transition-colors cursor-pointer ${
                    selectedUpgrade === upgrade.id 
                      ? 'border-primary bg-primary/10' 
                      : isMaxed
                        ? 'border-muted bg-muted/50 opacity-60'
                        : !canAfford
                          ? 'border-destructive/30 bg-destructive/5 opacity-80'
                          : 'border-border bg-background hover:bg-accent/50'
                  }`}
                  onClick={() => !isMaxed && setSelectedUpgrade(upgrade.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{upgrade.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      isMaxed 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {isMaxed ? 'MAX' : `Level ${currentLevel}/${upgrade.maxLevel}`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{upgrade.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-destructive'}`}>
                      Cost: {upgrade.cost}
                    </span>
                    <Button
                      size="sm"
                      variant={canAfford && !isMaxed ? "default" : "outline"}
                      disabled={!canAfford || isMaxed}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpgradePurchase(upgrade.id);
                      }}
                    >
                      {isMaxed ? 'Maxed' : 'Buy'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-muted/50 p-4 rounded-md border border-border">
            <h3 className="font-bold mb-2">Current Stats:</h3>
            <ul className="space-y-1">
              <li>Health: +{playerUpgrades.health * 25}</li>
              <li>Damage: +{playerUpgrades.damage * 10}</li>
              <li>Speed: +{playerUpgrades.speed * 15}%</li>
              <li>Fire Rate: +{playerUpgrades.fireRate * 10}%</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center p-6 pt-0">
          <Button 
            onClick={onContinue} 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continue to Level {level + 1}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}