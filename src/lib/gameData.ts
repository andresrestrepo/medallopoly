export interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  token: string;
  money: number;
  isEliminated: boolean;
}

export interface PropertyOwnership {
  propertyId: number;
  ownerId: number;
}

export interface GameState {
  currentPlayer: number;
  lastRoll: [number, number] | null;
  gameLog: string[];
  ownedProperties: PropertyOwnership[];
  pendingPurchase: number | null; // property ID that can be purchased
  pendingRent: { propertyId: number; ownerId: number; amount: number } | null; // rent to be paid
  pendingTax: { spaceId: number; amount: number } | null; // tax to be paid
  isAnimating: boolean; // true when player is moving
  animatingPlayer: number | null; // which player is currently animating
  gameEnded: boolean; // true when game is over
  winner: number | null; // ID of winning player
}

export const players: Player[] = [
  {
    id: 1,
    name: "Andres",
    position: 0, // GO space
    color: "#ff4444",
    token: "🚗",
    money: 1500000,
    isEliminated: false
  },
  {
    id: 2,
    name: "El Brayan",
    position: 0, // GO space
    color: "#4444ff",
    token: "🎩",
    money: 1500000,
    isEliminated: false
  },
  {
    id: 3,
    name: "Petro",
    position: 0, // GO space
    color: "#44ff44",
    token: "🐀",
    money: 1500000,
    isEliminated: false
  },
  {
    id: 4,
    name: "Uribe",
    position: 0, // GO space
    color: "#ff8800",
    token: "⛵",
    money: 1500000,
    isEliminated: false
  }
];

export const initialGameState: GameState = {
  currentPlayer: 1,
  lastRoll: null,
  gameLog: [],
  ownedProperties: [],
  pendingPurchase: null,
  pendingRent: null,
  pendingTax: null,
  isAnimating: false,
  animatingPlayer: null,
  gameEnded: false,
  winner: null
};