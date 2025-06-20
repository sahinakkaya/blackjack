import { useMemo, useEffect, useState } from 'react';
import { GameStatus, HandStatus } from '../types.ds';
import { game } from '../models/game';

export const useInitialDealingState = () => {
  const [dealingStartTime, setDealingStartTime] = useState<number | null>(null);

  // Track when dealing phase starts
  useEffect(() => {
    if (game.table?.state === GameStatus.dealing && dealingStartTime === null) {
      // Dealing just started
      setDealingStartTime(Date.now());
    } else if (game.table?.state !== GameStatus.dealing) {
      // Not in dealing phase, reset
      setDealingStartTime(null);
    }
  }, [game.table?.state]);

  // Calculate total time for all cards to be dealt
  const calculateAllCardsDealtTime = () => {
    const totalPlayers = game.table?.players.length || 1;
    const cardDelay = 0.8; // seconds between each card
    // Total time: all players get 2 cards + dealer gets 2 cards
    return (totalPlayers * 2 + 2) * cardDelay;
  };

  // Check if we're still in the initial dealing animation period (timing-based)
  const isInitialDealing = useMemo(() => {
    if (!game.table?.players || game.table.state !== GameStatus.dealing || dealingStartTime === null) {
      return false;
    }

    const timeSinceDealingStarted = Date.now() - dealingStartTime;
    const totalDealingTime = calculateAllCardsDealtTime() * 1000; // Convert to milliseconds
    
    // We're in initial dealing if less time has passed than the total dealing animation time
    return timeSinceDealingStarted < totalDealingTime;
  }, [game.table?.players, game.table?.state, dealingStartTime]);

  // Should components wait for initial dealing to complete?
  const shouldWaitForInitialDealing = useMemo(() => {
    return game.table?.state === GameStatus.dealing && isInitialDealing;
  }, [game.table?.state, isInitialDealing]);

  return {
    isInitialDealing,
    shouldWaitForInitialDealing,
    calculateAllCardsDealtTime,
    dealingDelayTime: calculateAllCardsDealtTime(),
  };
};