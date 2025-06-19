import { useMemo } from 'react';
import { game } from '../models/game';

export const useCardDelays = () => {
  const delays = useMemo(() => {
    const totalPlayers = game.table?.players.length || 1;
    const cardDelay = 0.8; // seconds between each card
    
    const calculatePlayerDelay = (playerIndex: number, cardIndex: number) => {
      // Check if this is initial dealing (only first 2 cards get delays)
      if (cardIndex >= 2) {
        return 0; // No delay for cards after the initial 2
      }
      
      if (cardIndex === 0) {
        // First card: Player's position in the dealing order
        return playerIndex * cardDelay;
      } else {
        // Second card: After all players got first card + dealer's first card + player's position
        return (totalPlayers + 1 + playerIndex) * cardDelay;
      }
    };

    const calculateDealerDelay = (cardIndex: number) => {
      if (cardIndex === 0) {
        // Dealer's first card: After all players got their first card
        return totalPlayers * cardDelay;
      } else if (cardIndex === 1) {
        // Dealer's second card (hole card): After all players got both cards + dealer's first card
        return (totalPlayers * 2 + 1) * cardDelay;
      } else {
        // Additional dealer cards (when dealer hits): Staggered delays starting from cardDelay
        return (cardIndex - 1) * cardDelay;
      }
    };

    const calculateAllCardsDealtTime = () => {
      // Total time: all players get 2 cards + dealer gets 2 cards
      return (totalPlayers * 2 + 2) * cardDelay;
    };

    return {
      calculatePlayerDelay,
      calculateDealerDelay,
      calculateAllCardsDealtTime,
      cardDelay,
    };
  }, [game.table?.players.length]);

  return delays;
};