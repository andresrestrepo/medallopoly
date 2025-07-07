<script lang="ts">
  import { boardSpaces } from "./boardData";
  import type { Player, PropertyOwnership } from "./gameData";

  export let players: Player[];
  export let ownedProperties: PropertyOwnership[];

  const bottomSpaces = boardSpaces.filter(
    (space) => space.position === "bottom"
  );
  const leftSpaces = boardSpaces.filter((space) => space.position === "left");
  const topSpaces = boardSpaces.filter((space) => space.position === "top");
  const rightSpaces = boardSpaces.filter((space) => space.position === "right");

  $: getPlayersAtPosition = (spaceId: number) => {
    return players.filter((player) => player.position === spaceId && !player.isEliminated);
  };

  $: getPropertyOwner = (spaceId: number) => {
    const ownership = ownedProperties.find((p) => p.propertyId === spaceId);
    if (!ownership) return null;
    return players.find((p) => p.id === ownership.ownerId);
  };
</script>

<div class="board">
  <!-- Top row -->
  <div class="top-row">
    {#each topSpaces.reverse() as space}
      <div class="space space-{space.type}" data-color={space.color}>
        <div class="space-name">{space.name}</div>
        {#if space.price}
          <div class="space-price">${space.price}</div>
        {:else if space.taxAmount}
          <div class="space-price">${space.taxAmount}</div>
        {/if}
        {#if space.color}
          <div class="color-bar" style="background-color: {space.color}"></div>
        {/if}
        {#if getPropertyOwner(space.id)}
          <div
            class="property-owner"
            style="border-color: {getPropertyOwner(space.id)?.color}"
          >
            {getPropertyOwner(space.id)?.token}
          </div>
        {/if}
        <div class="players">
          {#each getPlayersAtPosition(space.id) as player}
            <div class="player-token" style="color: {player.color}">
              {player.token}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Middle section -->
  <div class="middle-section">
    <!-- Left column -->
    <div class="left-column">
      {#each leftSpaces as space}
        <div class="space space-{space.type}" data-color={space.color}>
          <div class="space-name">{space.name}</div>
          {#if space.price}
            <div class="space-price">${space.price}</div>
          {:else if space.taxAmount}
            <div class="space-price">${space.taxAmount}</div>
          {/if}
          {#if space.color}
            <div
              class="color-bar"
              style="background-color: {space.color}"
            ></div>
          {/if}
          {#if getPropertyOwner(space.id)}
            <div
              class="property-owner"
              style="border-color: {getPropertyOwner(space.id)?.color}"
            >
              {getPropertyOwner(space.id)?.token}
            </div>
          {/if}
          <div class="players">
            {#each getPlayersAtPosition(space.id) as player}
              <div class="player-token" style="color: {player.color}">
                {player.token}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- Center logo area -->
    <div class="center">
      <div class="logo">
        <h1>MEDALLOPOLY</h1>
        <div class="logo-decoration">
          <div class="chance-card">?</div>
          <div class="community-chest-card">💰</div>
        </div>
      </div>
    </div>

    <!-- Right column -->
    <div class="right-column">
      {#each rightSpaces.reverse() as space}
        <div class="space space-{space.type}" data-color={space.color}>
          <div class="space-name">{space.name}</div>
          {#if space.price}
            <div class="space-price">${space.price}</div>
          {:else if space.taxAmount}
            <div class="space-price">${space.taxAmount}</div>
          {/if}
          {#if space.color}
            <div
              class="color-bar"
              style="background-color: {space.color}"
            ></div>
          {/if}
          {#if getPropertyOwner(space.id)}
            <div
              class="property-owner"
              style="border-color: {getPropertyOwner(space.id)?.color}"
            >
              {getPropertyOwner(space.id)?.token}
            </div>
          {/if}
          <div class="players">
            {#each getPlayersAtPosition(space.id) as player}
              <div class="player-token" style="color: {player.color}">
                {player.token}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Bottom row -->
  <div class="bottom-row">
    {#each bottomSpaces as space}
      <div class="space space-{space.type}" data-color={space.color}>
        <div class="space-name">{space.name}</div>
        {#if space.id === 0}
          <div class="go-arrow">→</div>
        {/if}
        {#if space.price}
          <div class="space-price">${space.price}</div>
        {:else if space.taxAmount}
          <div class="space-price">${space.taxAmount}</div>
        {/if}
        {#if space.color}
          <div class="color-bar" style="background-color: {space.color}"></div>
        {/if}
        {#if getPropertyOwner(space.id)}
          <div
            class="property-owner"
            style="border-color: {getPropertyOwner(space.id)?.color}"
          >
            {getPropertyOwner(space.id)?.token}
          </div>
        {/if}
        <div class="players">
          {#each getPlayersAtPosition(space.id) as player}
            <div class="player-token" style="color: {player.color}">
              {player.token}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .board {
    width: 800px;
    height: 815px;
    background-color: #198f1d;
    border: 4px solid #3e443f;
    display: flex;
    flex-direction: column;
    font-family: sans-serif;
    border-radius: 5px;
  }

  .top-row,
  .bottom-row {
    display: flex;
    height: 100px;
  }

  .middle-section {
    display: flex;
    flex: 1;
  }

  .left-column,
  .right-column {
    display: flex;
    flex-direction: column;
    width: 100px;
  }

  .center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 2px solid #2e7d32;
    margin: 2px;
  }

  .logo {
    text-align: center;
    color: #2e7d32;
  }

  .logo h1 {
    font-size: 3rem;
    font-weight: bold;
    margin: 0;
    font-family: "Arial Black", sans-serif;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .logo-decoration {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }

  .chance-card,
  .community-chest-card {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .chance-card {
    background-color: #ff9800;
    color: white;
  }

  .community-chest-card {
    background-color: #2196f3;
    color: white;
  }

  .space {
    border: 1px solid #2e7d32;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 4px;
    box-sizing: border-box;
  }

  .top-row .space,
  .bottom-row .space {
    flex: 1;
    height: 100px;
  }

  .left-column .space,
  .right-column .space {
    flex: 1;
    width: 100px;
  }

  .space-name {
    font-size: 0.7rem;
    font-weight: bold;
    text-align: center;
    line-height: 1.9;
    margin-bottom: 2px;
    margin-top: 6px;
  }

  .space-price {
    font-size: 0.6rem;
  }

  .color-bar {
    position: absolute;
    height: 10px;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 5;
  }

  .space-corner {
    background-color: #f5f5f5;
    font-weight: bold;
  }

  .space-corner .space-name {
    font-size: 0.8rem;
  }

  .go-arrow {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2e7d32;
    text-align: center;
    margin: 2px 0;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }

  .space-railroad {
    background-color: #424242;
    color: white;
  }

  .space-utility {
    background-color: #fff3e0;
  }

  .space-chance {
    background-color: #ff9800;
    color: white;
  }

  .space-community-chest {
    background-color: #2196f3;
    color: white;
  }

  .space-tax {
    background-color: #ffebee;
  }

  .space-jail {
    background-color: #ffccbc;
  }

  .property-owner {
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid;
    border-radius: 3px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    font-weight: bold;
    z-index: 10;
  }

  /* Property owner positioning for different sides */
  .top-row .property-owner,
  .bottom-row .property-owner {
    top: 12px;
    left: 2px;
  }

  .left-column .property-owner,
  .right-column .property-owner {
    top: 12px;
    left: 2px;
  }

  .players {
    position: absolute;
    bottom: 2px;
    right: 2px;
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    max-width: 40px;
  }

  .player-token {
    font-size: 1.2rem;
    background-color: white;
    border: 1px dotted black;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease-in-out;
    animation: playerMove 0.3s ease-in-out;
  }

  @keyframes playerMove {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 900px) {
    .board {
      width: 600px;
      height: 690px;
    }

    .logo h1 {
      font-size: 2rem;
    }

    .space-name {
      font-size: 0.6rem;
    }

    .space-price {
      font-size: 0.5rem;
    }
  }
</style>
