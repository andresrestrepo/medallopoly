import type { Player } from './gameData';

export function rollDice(): [number, number] {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  return [dice1, dice2];
}

export function movePlayer(player: Player, steps: number): Player {
  const newPosition = (player.position + steps) % 40;
  const passedGo = player.position + steps >= 40;
  
  return {
    ...player,
    position: newPosition,
    money: passedGo ? player.money + 200000 : player.money
  };
}

export function getDiceTotal(dice: [number, number]): number {
  return dice[0] + dice[1];
}

export function isDouble(dice: [number, number]): boolean {
  return dice[0] === dice[1];
}

export function isPropertyBuyable(propertyId: number, ownedProperties: any[], boardSpaces: any[]): boolean {
  const space = boardSpaces.find(s => s.id === propertyId);
  if (!space || !space.price) return false;
  
  const isOwned = ownedProperties.some(p => p.propertyId === propertyId);
  return !isOwned && (space.type === 'property' || space.type === 'railroad' || space.type === 'utility');
}

export function getPropertyOwner(propertyId: number, ownedProperties: any[]): number | null {
  const ownership = ownedProperties.find(p => p.propertyId === propertyId);
  return ownership ? ownership.ownerId : null;
}

export function calculateRent(propertyId: number, ownedProperties: any[], boardSpaces: any[]): number {
  const space = boardSpaces.find(s => s.id === propertyId);
  if (!space || !space.rent) return 0;

  // For basic properties, return base rent (rent[0])
  // TODO: Later can add houses/hotels logic
  if (space.type === 'property') {
    return space.rent[0];
  }
  
  // For railroads, rent depends on how many railroads the owner has
  if (space.type === 'railroad') {
    const owner = getPropertyOwner(propertyId, ownedProperties);
    if (!owner) return 0;
    
    const railroadsOwned = ownedProperties.filter(p => {
      const propSpace = boardSpaces.find(s => s.id === p.propertyId);
      return propSpace?.type === 'railroad' && p.ownerId === owner;
    }).length;
    
    const railroadRents = [25000, 50000, 100000, 200000];
    return railroadRents[railroadsOwned - 1] || 0;
  }
  
  // For utilities, rent is 4x or 10x dice roll (simplified to base amount)
  if (space.type === 'utility') {
    const owner = getPropertyOwner(propertyId, ownedProperties);
    if (!owner) return 0;
    
    const utilitiesOwned = ownedProperties.filter(p => {
      const propSpace = boardSpaces.find(s => s.id === p.propertyId);
      return propSpace?.type === 'utility' && p.ownerId === owner;
    }).length;
    
    // Simplified: return fixed amount instead of dice multiplier
    return utilitiesOwned === 1 ? 4000 : 10000;
  }
  
  return 0;
}