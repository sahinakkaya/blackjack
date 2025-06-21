import { useEffect, useState } from 'react';
import { GameStatus } from '../types.ds';
import { useCardDelays } from './useCardDelays';

export const useProgressiveTotal = (
  cards: any[] | undefined,
  isPlayer: boolean,
  playerIndex?: number,
  gameState?: GameStatus,
  skipDelay?: boolean
) => {
  const [visibleCardCount, setVisibleCardCount] = useState(0);
  const { calculatePlayerDelay, calculateDealerDelay } = useCardDelays();
  const isDealing = gameState === GameStatus.dealing;

  // Reset and schedule card reveals
  useEffect(() => {
    if (!cards) {
      setVisibleCardCount(0);
      return;
    }

    if (isDealing) {
      // During dealing, show cards as they are dealt
      if (isPlayer) {
        // For players, schedule initial 2 cards with delays, show additional cards immediately
        cards.forEach((_, index) => {
          if (index < 2 && !skipDelay) { 
            // First 2 cards during initial dealing - use delays (unless skipDelay is true)
            const delay = calculatePlayerDelay(playerIndex || 0, index) * 1000;
            setTimeout(() => {
              setVisibleCardCount(prev => Math.max(prev, index + 1));
            }, delay);
          } else {
            // Additional cards (hits/doubles) OR skipDelay is true - show immediately
            setVisibleCardCount(prev => Math.max(prev, index + 1));
          }
        });
      } else {
        // For dealer, show first card immediately, hide second card
        setVisibleCardCount(1);
      }
    } else {
      // After dealing ends
      if (isPlayer) {
        // For players, show all cards immediately after dealing
        setVisibleCardCount(cards.length);
      } else {
        // For dealer, reveal hole card immediately, then schedule additional cards
        setVisibleCardCount(2); // First two cards visible
        
        if (cards.length > 2) {
          cards.slice(2).forEach((_, index) => {
            const cardIndex = index + 2;
            const delay = calculateDealerDelay(cardIndex) * 1000;
            
            setTimeout(() => {
              setVisibleCardCount(prev => Math.max(prev, cardIndex + 1));
            }, delay);
          });
        }
      }
    }
  }, [isDealing, cards?.length, isPlayer, playerIndex, skipDelay]);

  // Calculate total based on visible cards using the same logic as Python backend
  const calculateHandValue = (hand: any[], alternate = false) => {
    let value = hand.reduce((sum, card) => sum + card.value, 0);
    let numAces = hand.filter(card => card.rank === 'Ace').length;
    
    while (value > 21 && numAces) {
      value -= 10;
      numAces -= 1;
    }
    
    if (alternate) {
      return (!numAces || value === 21) ? null : value - 10;
    }
    return value;
  };

  const getVisibleTotal = () => {
    if (!cards || cards.length === 0) {
      return { value: 0, alternate_value: null };
    }
    
    const visibleCards = cards.slice(0, visibleCardCount);
    const mainValue = calculateHandValue(visibleCards);
    const alternateValue = calculateHandValue(visibleCards, true);
    
    return { 
      value: mainValue, 
      alternate_value: alternateValue 
    };
  };

  return {
    visibleCardCount,
    getVisibleTotal,
  };
};