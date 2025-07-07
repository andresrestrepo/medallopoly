<script lang="ts">
  import Board from './Board.svelte';
  import { players, initialGameState } from './gameData';
  import { rollDice, movePlayer, getDiceTotal, isDouble, isPropertyBuyable, getPropertyOwner, calculateRent } from './gameLogic';
  import { boardSpaces } from './boardData';
  import type { Player, GameState } from './gameData';

  let gameState: GameState = { ...initialGameState };
  let gamePlayers: Player[] = [...players];

  function getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  function addLogEntry(message: string): void {
    const timestamp = getCurrentTime();
    gameState = {
      ...gameState,
      gameLog: [
        ...gameState.gameLog,
        `[${timestamp}] ${message}`
      ]
    };
  }

  async function animatePlayerMovement(playerId: number, fromPosition: number, steps: number) {
    gameState = {
      ...gameState,
      isAnimating: true,
      animatingPlayer: playerId
    };
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    for (let i = 1; i <= steps; i++) {
      const newPosition = (fromPosition + i) % 40;
      
      // Update player position for this step
      gamePlayers = gamePlayers.map(p => {
        if (p.id === playerId) {
          const passedGo = fromPosition + i >= 40;
          return {
            ...p,
            position: newPosition,
            money: passedGo && i === steps ? p.money + 200000 : p.money // Add GO money only on final step
          };
        }
        return p;
      });
      
      // Wait before next step
      await delay(500); // 500ms between each step
    }
    
    gameState = {
      ...gameState,
      isAnimating: false,
      animatingPlayer: null
    };
  }

  async function handleRollDice() {
    if (gameState.isAnimating) return; // Prevent rolling while animating
    
    const dice = rollDice();
    const currentPlayer = gamePlayers.find(p => p.id === gameState.currentPlayer);
    
    if (!currentPlayer) return;
    
    const steps = getDiceTotal(dice);
    const originalPosition = currentPlayer.position;
    
    // Update game state with dice roll
    gameState = {
      ...gameState,
      lastRoll: dice
    };
    
    // Start animation
    await animatePlayerMovement(currentPlayer.id, originalPosition, steps);
    
    // Get updated player data after animation
    const updatedPlayer = gamePlayers.find(p => p.id === currentPlayer.id);
    if (!updatedPlayer) return;
    
    // Check if player can buy the property they landed on
    const landedSpace = boardSpaces[updatedPlayer.position];
    const canBuyProperty = isPropertyBuyable(updatedPlayer.position, gameState.ownedProperties, boardSpaces);
    
    // Check if player landed on someone else's property and needs to pay rent
    const propertyOwner = getPropertyOwner(updatedPlayer.position, gameState.ownedProperties);
    const needsToPayRent = propertyOwner && propertyOwner !== currentPlayer.id;
    const rentAmount = needsToPayRent ? calculateRent(updatedPlayer.position, gameState.ownedProperties, boardSpaces) : 0;
    
    // Check if player landed on a tax space
    const needsToPayTax = landedSpace.type === 'tax' && landedSpace.taxAmount;
    const taxAmount = needsToPayTax ? landedSpace.taxAmount! : 0;
    
    // Check if player landed on "Go to Jail" space
    const goToJail = landedSpace.name === 'Vaya a Bellavista';
    if (goToJail) {
      // Move player directly to jail (space id 10)
      gamePlayers = gamePlayers.map(p => 
        p.id === currentPlayer.id ? { ...p, position: 10 } : p
      );
      addLogEntry(`🚔 ${currentPlayer.name} was sent to jail!`);
      
      // Switch to next player (no other actions needed)
      if (!isDouble(dice)) {
        gameState = {
          ...gameState,
          currentPlayer: getNextActivePlayer(gameState.currentPlayer)
        };
      }
      return;
    }
    
    // Update game state with final results
    gameState = {
      ...gameState,
      pendingPurchase: canBuyProperty ? updatedPlayer.position : null,
      pendingRent: needsToPayRent ? { propertyId: updatedPlayer.position, ownerId: propertyOwner, amount: rentAmount } : null,
      pendingTax: needsToPayTax ? { spaceId: updatedPlayer.position, amount: taxAmount } : null
    };
    
    // Add timestamped log entry
    addLogEntry(`${currentPlayer.name} rolled ${dice[0]} + ${dice[1]} = ${steps} and moved to ${landedSpace.name}${updatedPlayer.position === 0 || (originalPosition + steps >= 40) ? ' (passed INICIO +$200,000)' : ''}${canBuyProperty ? ' - Can buy property!' : ''}${needsToPayRent ? ` - Must pay $${rentAmount} rent!` : ''}${needsToPayTax ? ` - Must pay $${taxAmount} tax!` : ''}`);
    
    // Switch to next player (unless doubles or pending actions)
    if (!isDouble(dice) && !canBuyProperty && !needsToPayRent && !needsToPayTax && !gameState.gameEnded) {
      gameState = {
        ...gameState,
        currentPlayer: getNextActivePlayer(gameState.currentPlayer)
      };
    }
  }

  function handleBuyProperty() {
    if (!gameState.pendingPurchase) return;
    
    const currentPlayer = gamePlayers.find(p => p.id === gameState.currentPlayer);
    const property = boardSpaces[gameState.pendingPurchase];
    
    if (!currentPlayer || !property.price || currentPlayer.money < property.price) return;
    
    // Update player money
    gamePlayers = gamePlayers.map(p => 
      p.id === currentPlayer.id ? { ...p, money: p.money - property.price! } : p
    );
    
    // Add property to owned properties
    gameState = {
      ...gameState,
      ownedProperties: [...gameState.ownedProperties, { propertyId: gameState.pendingPurchase, ownerId: currentPlayer.id }],
      pendingPurchase: null
    };
    
    // Add timestamped log entry
    addLogEntry(`${currentPlayer.name} bought ${property.name} for $${property.price}`);
    
    // Switch to next player if not doubles
    if (!gameState.lastRoll || !isDouble(gameState.lastRoll)) {
      gameState = {
        ...gameState,
        currentPlayer: getNextActivePlayer(gameState.currentPlayer)
      };
    }
  }
  
  function handleSkipPurchase() {
    if (!gameState.pendingPurchase) return;
    
    const property = boardSpaces[gameState.pendingPurchase];
    
    gameState = {
      ...gameState,
      pendingPurchase: null
    };
    
    // Add timestamped log entry
    addLogEntry(`${currentPlayerData?.name} chose not to buy ${property.name}`);
    
    // Switch to next player if not doubles
    if (!gameState.lastRoll || !isDouble(gameState.lastRoll)) {
      gameState = {
        ...gameState,
        currentPlayer: getNextActivePlayer(gameState.currentPlayer)
      };
    }
  }
  
  function eliminatePlayer(playerId: number) {
    // Mark player as eliminated
    gamePlayers = gamePlayers.map(p => 
      p.id === playerId ? { ...p, isEliminated: true, money: 0 } : p
    );
    
    // Transfer properties back to bank (remove ownership)
    gameState = {
      ...gameState,
      ownedProperties: gameState.ownedProperties.filter(prop => prop.ownerId !== playerId)
    };
    
    // Check if game is over
    const activePlayers = gamePlayers.filter(p => !p.isEliminated);
    if (activePlayers.length === 1) {
      gameState = {
        ...gameState,
        gameEnded: true,
        winner: activePlayers[0].id
      };
      addLogEntry(`🏆 ${activePlayers[0].name} wins the game!`);
    }
  }
  
  function getNextActivePlayer(currentPlayerId: number): number {
    const activePlayers = gamePlayers.filter(p => !p.isEliminated);
    
    // Find the next player in order starting from current player ID
    let nextPlayerId = currentPlayerId;
    do {
      nextPlayerId = nextPlayerId >= 4 ? 1 : nextPlayerId + 1;
    } while (gamePlayers.find(p => p.id === nextPlayerId)?.isEliminated && nextPlayerId !== currentPlayerId);
    
    return nextPlayerId;
  }

  function handlePayRent() {
    if (!gameState.pendingRent) return;
    
    const currentPlayer = gamePlayers.find(p => p.id === gameState.currentPlayer);
    const owner = gamePlayers.find(p => p.id === gameState.pendingRent?.ownerId);
    const property = boardSpaces[gameState.pendingRent.propertyId];
    const rentAmount = gameState.pendingRent.amount;
    
    if (!currentPlayer || !owner) return;
    
    // Check if player can afford the rent
    if (currentPlayer.money < rentAmount) {
      // Player cannot afford rent - eliminate them
      addLogEntry(`💀 ${currentPlayer.name} cannot afford $${rentAmount} rent and is eliminated!`);
      eliminatePlayer(currentPlayer.id);
      
      gameState = {
        ...gameState,
        pendingRent: null
      };
      
      // Switch to next active player if game isn't over
      if (!gameState.gameEnded) {
        gameState = {
          ...gameState,
          currentPlayer: getNextActivePlayer(gameState.currentPlayer)
        };
      }
      return;
    }
    
    // Player can afford rent - process payment
    gamePlayers = gamePlayers.map(p => {
      if (p.id === currentPlayer.id) {
        return { ...p, money: p.money - rentAmount };
      } else if (p.id === owner.id) {
        return { ...p, money: p.money + rentAmount };
      }
      return p;
    });
    
    gameState = {
      ...gameState,
      pendingRent: null
    };
    
    // Add timestamped log entry
    addLogEntry(`${currentPlayer.name} paid $${rentAmount} rent to ${owner.name} for ${property.name}`);
    
    // Switch to next active player if not doubles
    if (!gameState.lastRoll || !isDouble(gameState.lastRoll)) {
      gameState = {
        ...gameState,
        currentPlayer: getNextActivePlayer(gameState.currentPlayer)
      };
    }
  }

  function handlePayTax() {
    if (!gameState.pendingTax) return;
    
    const currentPlayer = gamePlayers.find(p => p.id === gameState.currentPlayer);
    const taxSpace = boardSpaces[gameState.pendingTax.spaceId];
    const taxAmount = gameState.pendingTax.amount;
    
    if (!currentPlayer) return;
    
    // Check if player can afford the tax
    if (currentPlayer.money < taxAmount) {
      // Player cannot afford tax - eliminate them
      addLogEntry(`💀 ${currentPlayer.name} cannot afford $${taxAmount} tax and is eliminated!`);
      eliminatePlayer(currentPlayer.id);
      
      gameState = {
        ...gameState,
        pendingTax: null
      };
      
      // Switch to next active player if game isn't over
      if (!gameState.gameEnded) {
        gameState = {
          ...gameState,
          currentPlayer: getNextActivePlayer(gameState.currentPlayer)
        };
      }
      return;
    }
    
    // Player can afford tax - process payment
    gamePlayers = gamePlayers.map(p => 
      p.id === currentPlayer.id ? { ...p, money: p.money - taxAmount } : p
    );
    
    gameState = {
      ...gameState,
      pendingTax: null
    };
    
    // Add timestamped log entry
    addLogEntry(`${currentPlayer.name} paid $${taxAmount} tax to ${taxSpace.name}`);
    
    // Switch to next active player if not doubles
    if (!gameState.lastRoll || !isDouble(gameState.lastRoll)) {
      gameState = {
        ...gameState,
        currentPlayer: getNextActivePlayer(gameState.currentPlayer)
      };
    }
  }

  $: currentPlayerData = gamePlayers.find(p => p.id === gameState.currentPlayer);
  $: pendingProperty = gameState.pendingPurchase ? boardSpaces[gameState.pendingPurchase] : null;
</script>

<div class="game-container">
  <div class="game-info">
    <h2 class="title">Medallopoly - The Game</h2>
    <h4 class="subtitle">Medellín gentrification so intense, even the pigeons in Parque Botero need three roommates to afford a nest.</h4>
    
    <div class="current-turn">
      {#if gameState.gameEnded}
        <h3 class="game-ended">🏆 Game Over!</h3>
        <div class="winner">
          {gamePlayers.find(p => p.id === gameState.winner)?.name} {gamePlayers.find(p => p.id === gameState.winner)?.token} Wins!
        </div>
      {:else}
        <h3>Current Turn: {currentPlayerData?.name} {currentPlayerData?.token}</h3>
        {#if !gameState.pendingPurchase && !gameState.pendingRent && !gameState.pendingTax}
          <button on:click={handleRollDice} class="roll-dice-btn" disabled={gameState.isAnimating}>
            {#if gameState.isAnimating}
              🎯 Moving...
            {:else}
              🎲 Roll Dice
            {/if}
          </button>
        {/if}
      {/if}
    </div>
    
    {#if gameState.pendingPurchase && pendingProperty}
      <div class="property-purchase">
        <h4>🏠 Property Available!</h4>
        <div class="property-details">
          <div class="property-name">{pendingProperty.name}</div>
          <div class="property-price">Price: ${pendingProperty.price}</div>
          <div class="player-money">Your money: ${currentPlayerData?.money}</div>
        </div>
        <div class="purchase-buttons">
          {#if currentPlayerData && currentPlayerData.money >= (pendingProperty.price || 0)}
            <button on:click={handleBuyProperty} class="buy-btn">
              💰 Buy Property
            </button>
          {:else}
            <div class="insufficient-funds">Insufficient funds!</div>
          {/if}
          <button on:click={handleSkipPurchase} class="skip-btn">
            ❌ Skip
          </button>
        </div>
      </div>
    {/if}
    
    {#if gameState.pendingRent}
      <div class="rent-payment">
        <h4>💸 Rent Due!</h4>
        <div class="rent-details">
          <div class="property-name">{boardSpaces[gameState.pendingRent.propertyId].name}</div>
          <div class="rent-amount">Rent: ${gameState.pendingRent.amount}</div>
          <div class="owner-info">Owner: {gamePlayers.find(p => p.id === gameState.pendingRent?.ownerId)?.name} {gamePlayers.find(p => p.id === gameState.pendingRent?.ownerId)?.token}</div>
          <div class="player-money">Your money: ${currentPlayerData?.money}</div>
        </div>
        <div class="rent-button">
          <button on:click={handlePayRent} class="pay-rent-btn">
            💰 Pay Rent ${gameState.pendingRent.amount}
          </button>
        </div>
      </div>
    {/if}
    
    {#if gameState.pendingTax}
      <div class="tax-payment">
        <h4>🏛️ Tax Due!</h4>
        <div class="tax-details">
          <div class="tax-name">{boardSpaces[gameState.pendingTax.spaceId].name}</div>
          <div class="tax-amount">Tax: ${gameState.pendingTax.amount}</div>
          <div class="player-money">Your money: ${currentPlayerData?.money}</div>
        </div>
        <div class="tax-button">
          <button on:click={handlePayTax} class="pay-tax-btn">
            💸 Pay Tax ${gameState.pendingTax.amount}
          </button>
        </div>
      </div>
    {/if}
    
    {#if gameState.lastRoll}
      <div class="last-roll">
        <h4>Last Roll:</h4>
        <div class="dice-display">
          <div class="die">{gameState.lastRoll[0]}</div>
          <div class="die">{gameState.lastRoll[1]}</div>
          <div class="total">Total: {getDiceTotal(gameState.lastRoll)}</div>
        </div>
      </div>
    {/if}
    
    <div class="players-info">
      <h4>Players:</h4>
      {#each gamePlayers as player}
        <div class="player-info" class:active={player.id === gameState.currentPlayer} class:eliminated={player.isEliminated}>
          <span class="player-token">{player.token}</span>
          <span class="player-name">{player.name}</span>
          <span class="player-money">${player.money}</span>
          <span class="player-position">
            {#if player.isEliminated}
              💀 Eliminated
            {:else}
              @ {boardSpaces[player.position].name}
            {/if}
          </span>
        </div>
      {/each}
    </div>
    
    <div class="game-log">
      <h4>Game Log:</h4>
      <div class="log-entries">
        {#each gameState.gameLog.slice(-5).reverse() as entry}
          <div class="log-entry">
            {#if entry.startsWith('[')}
              <span class="timestamp">{entry.match(/\[([^\]]+)\]/)?.[0] || ''}</span>
              <span class="message">{entry.replace(/^\[[^\]]+\]\s*/, '')}</span>
            {:else}
              {entry}
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
  
  <Board players={gamePlayers} ownedProperties={gameState.ownedProperties} />
</div>

<style>
  .title{
    font-family: monospace;
  }

  .subtitle{
    font-weight: 300;
    font-family: monospace;
  }

  .game-container {
    display: flex;
    gap: 20px;
    max-width: 1300px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .game-info {
    width: 400px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    height: fit-content;
  }
  
  .current-turn {
    background: #f0f8ff;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .roll-dice-btn {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 1.1rem;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 10px;
    transition: background 0.3s;
  }
  
  .roll-dice-btn:hover:not(:disabled) {
    background: #45a049;
  }
  
  .roll-dice-btn:disabled {
    background: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  .property-purchase {
    background: #e8f5e8;
    border: 2px solid #4CAF50;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .property-purchase h4 {
    margin: 0 0 10px 0;
    color: #2e7d32;
    text-align: center;
  }
  
  .property-details {
    background: white;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 15px;
  }
  
  .property-name {
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 5px;
  }
  
  .property-price {
    color: #d32f2f;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .player-money {
    color: #2e7d32;
    font-size: 0.9rem;
  }
  
  .purchase-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  
  .buy-btn {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s;
  }
  
  .buy-btn:hover {
    background: #45a049;
  }
  
  .skip-btn {
    background: #1b1818;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s;
  }
  
  .skip-btn:hover {
    background: #f4594e;
  }
  
  .insufficient-funds {
    color: #d32f2f;
    font-weight: bold;
    padding: 10px;
    text-align: center;
  }
  
  .rent-payment {
    background: #ffebee;
    border: 2px solid #f44336;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .rent-payment h4 {
    margin: 0 0 10px 0;
    color: #d32f2f;
    text-align: center;
  }
  
  .rent-details {
    background: white;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 15px;
  }
  
  .rent-amount {
    color: #d32f2f;
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 5px;
  }
  
  .owner-info {
    color: #666;
    margin-bottom: 5px;
  }
  
  .rent-button {
    display: flex;
    justify-content: center;
  }
  
  .pay-rent-btn {
    background: #f44336;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s;
  }
  
  .pay-rent-btn:hover {
    background: #da190b;
  }
  
  .tax-payment {
    background: #fff3e0;
    border: 2px solid #ff9800;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .tax-payment h4 {
    margin: 0 0 10px 0;
    color: #f57c00;
    text-align: center;
  }
  
  .tax-details {
    background: white;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 15px;
  }
  
  .tax-name {
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 5px;
  }
  
  .tax-amount {
    color: #f57c00;
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 5px;
  }
  
  .tax-button {
    display: flex;
    justify-content: center;
  }
  
  .pay-tax-btn {
    background: #ff9800;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.3s;
  }
  
  .pay-tax-btn:hover {
    background: #f57c00;
  }
  
  .last-roll {
    background: #fff3cd;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .dice-display {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }
  
  .die {
    width: 40px;
    height: 40px;
    background: white;
    border: 2px solid #333;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .total {
    font-weight: bold;
    color: #333;
  }
  
  .players-info {
    margin-bottom: 20px;
  }
  
  .player-info {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 5px;
  }
  
  .player-info.active {
    background: #e3f2fd;
    border: 2px solid #2196f3;
  }
  
  .player-info.eliminated {
    background: #ffebee;
    opacity: 0.6;
    text-decoration: line-through;
  }
  
  .player-info.eliminated .player-token {
    filter: grayscale(100%);
  }
  
  .player-token {
    font-size: 1.2rem;
  }
  
  .player-name {
    font-weight: bold;
    min-width: 80px;
  }
  
  .player-money {
    color: #2e7d32;
    font-weight: bold;
    min-width: 80px;
  }
  
  .player-position {
    color: #666;
    font-size: 0.9rem;
  }
  
  .game-log {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .log-entries {
    max-height: 150px;
    overflow-y: auto;
  }
  
  .log-entry {
    padding: 5px 0;
    border-bottom: 1px solid #eee;
    font-size: 0.9rem;
  }
  
  .log-entry:last-child {
    border-bottom: none;
  }
  
  .timestamp {
    font-weight: bold;
    color: #2e7d32;
    margin-right: 8px;
  }
  
  .message {
    color: #333;
  }
  
  .game-ended {
    color: #ff6d00;
    text-align: center;
    margin: 0;
  }
  
  .winner {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    color: #333;
    font-size: 1.2rem;
    font-weight: bold;
    text-align: center;
    padding: 15px;
    border-radius: 8px;
    margin-top: 10px;
    border: 2px solid #ffd700;
    box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
  }
  
  @media (max-width: 1000px) {
    .game-container {
      flex-direction: column;
    }
    
    .game-info {
      min-width: unset;
    }
  }
</style>