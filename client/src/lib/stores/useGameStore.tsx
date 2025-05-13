import { create } from 'zustand';

export type GameLevel = 1 | 2 | 3;

export interface PlayerUpgrades {
  health: number;
  damage: number;
  speed: number;
  fireRate: number;
}

interface GameState {
  // Game progress
  level: GameLevel;
  currentScore: number;
  totalScore: number;
  
  // Player upgrades
  playerUpgrades: PlayerUpgrades;
  
  // Actions
  setLevel: (level: GameLevel) => void;
  addScore: (score: number) => void;
  resetCurrentScore: () => void;
  purchaseUpgrade: (upgradeId: keyof PlayerUpgrades) => boolean;
  resetGame: () => void;
}

// Cost for each upgrade
const UPGRADE_COSTS = {
  health: 50,
  damage: 75,
  speed: 60,
  fireRate: 100
};

// Maximum level for each upgrade
const MAX_UPGRADE_LEVELS = {
  health: 5,
  damage: 5,
  speed: 3,
  fireRate: 3
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  level: 1,
  currentScore: 0,
  totalScore: 0,
  playerUpgrades: {
    health: 0,
    damage: 0,
    speed: 0,
    fireRate: 0
  },
  
  // Actions
  setLevel: (level) => set({ level }),
  
  addScore: (score) => set((state) => ({ 
    currentScore: state.currentScore + score,
    totalScore: state.totalScore + score
  })),
  
  resetCurrentScore: () => set({ currentScore: 0 }),
  
  purchaseUpgrade: (upgradeId) => {
    const { currentScore, playerUpgrades } = get();
    
    // Get the cost for this upgrade
    const cost = UPGRADE_COSTS[upgradeId];
    const maxLevel = MAX_UPGRADE_LEVELS[upgradeId];
    const currentLevel = playerUpgrades[upgradeId];
    
    // Check if player can afford and upgrade isn't maxed
    if (currentScore >= cost && currentLevel < maxLevel) {
      set((state) => ({
        currentScore: state.currentScore - cost,
        playerUpgrades: {
          ...state.playerUpgrades,
          [upgradeId]: state.playerUpgrades[upgradeId] + 1
        }
      }));
      return true;
    }
    
    return false;
  },
  
  resetGame: () => set({
    level: 1,
    currentScore: 0,
    totalScore: 0,
    playerUpgrades: {
      health: 0,
      damage: 0,
      speed: 0,
      fireRate: 0
    }
  })
}));