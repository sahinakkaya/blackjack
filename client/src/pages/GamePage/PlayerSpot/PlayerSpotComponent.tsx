import { observer } from 'mobx-react-lite';
import React, { useCallback, MouseEvent, useMemo } from 'react';

import { Bet } from '../BetPanel/Bet';
import { getChips } from '../../../utils/convertToChips';
import { getBetColor } from '../../../utils/getBetColor';
import {
  PlayersWrapper,
  SpotStyled,
  ChipsWrapper,
  OnePlayerWrapper,
  SpotWrapper,
  Name,
} from './Spot.styled';
import { GameStatus, HandStatus, IHand, PlayerGameState, SocketEmit, SoundType, TBet, ActionType } from '../../../types.ds';
import { HandComponent } from './HandComponent';
import { game } from '../../../models/game';
import { useTranslation } from 'react-i18next';
import { Timer } from '../GameActions/Timer';
import { useCardDelays } from '../../../hooks/useCardDelays';

type PlayerProps = {
  id: number;
};

export const PlayerSpotComponent: React.FC<PlayerProps> = observer(({ id }) => {
  const gameTable = game.table ?? null;
  const player = gameTable?.players[id] ?? null;

  const currentPlayer = gameTable?.current_player
  const isCurrentPlayer = currentPlayer?.id === game.clientId;
  const gamePlayerIsActive = game.table?.state === GameStatus.accepting_bets ? player?.id === game.clientId : false;
  const isActive = game.table?.state == GameStatus.dealing ? currentPlayer?.id === player?.id : gamePlayerIsActive;
  const { t } = useTranslation();
  const { calculateAllCardsDealtTime } = useCardDelays();

  // Check if this is initial dealing (all players have exactly 2 cards) vs player actions
  const isInitialDealing = useMemo(() => {
    if (!game.table?.players) {
      return true;
    }

    // If any player has more than 2 cards, we're past initial dealing
    return game.table.players.every(player =>
      player.hands.every(hand => {
        const isTwoCardBlackjack = hand.cards.length === 2 && hand.value === 21;
        return hand.cards.length <= 1 &&
          (hand.state !== HandStatus.played || isTwoCardBlackjack) &&
          hand.is_main !== false; // exclude split hands
      })
    );
  }, [game.table?.players]);

  // Timer logic - show timer for the current player during dealing phase
  // But only after all cards are dealt
  const shouldShowTimer = game.table?.state === GameStatus.dealing &&
    currentPlayer?.id === player?.id &&
    currentPlayer?.current_hand?.can_hit;

  // Create a unique key that changes when the hand changes (for timer reset)
  // Include cards length so timer resets when player hits (gets new card)
  const timerKey = `${currentPlayer?.id}-${currentPlayer?.current_hand?.id}-` +
    `${currentPlayer?.current_hand?.cards?.length}-${game.table?.state}`;

  const handleTimerTimeout = useCallback(() => {
    // Auto-stand when timer expires - only if this player is the current player and it's the client's player
    if (isCurrentPlayer && currentPlayer?.current_hand?.can_hit) {
      console.log('Timer expired for player, auto-standing');
      game.emit[SocketEmit.Action](currentPlayer.current_hand.is_main ? 0 : 1, ActionType.Stand);
    }
  }, [isCurrentPlayer, currentPlayer]);

  const handleRemoveBet = useCallback(
    (bet: TBet) => (e: MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      game.updateBet(bet, 'remove')
      console.log('remove bet', bet)
    },
    []
  );

  const spotClass = useMemo(() => {
    const className: string[] = [];
    if (game.table?.state == GameStatus.dealing) {
      if (currentPlayer?.id === player?.id) {
        return 'active'
      }
    }
    else if (gamePlayerIsActive) {
      if (player?.state === 'betting') {
        return 'empty'
      }
      return 'active'
    } else {
      return ''
    }

    return className.join(' ');
  }, [gameTable?.state, currentPlayer?.id, player?.id]);

  const handClass = (hand: IHand) => {
    const className = [];
    if (game.table?.state === GameStatus.dealing) {
      return ''
    }
    if (hand.result === HandStatus.won) {
      className.push('win');
    }
    if (hand.result === HandStatus.lost) {
      className.push('loose');
    }
    return className.join(' ');
  };
  if (!player) {
    return
  }

  return (
    <SpotWrapper className="spot">
      <Name>{player?.name}</Name>
      <SpotStyled
        className={spotClass}
      >
        {/*   soundType={SoundType.Chip} */}
        <PlayersWrapper>
          {game.table?.state === GameStatus.accepting_bets && isActive && player.state !== PlayerGameState.Playing && (
            <ChipsWrapper>
              {
                getChips(game.currentBetValue)?.map((bet, index) => (
                  <Bet
                    key={`bet${index}-${bet}`}
                    value={bet}
                    onBetSet={handleRemoveBet(bet)}
                    color={getBetColor(bet)}
                    size={5.5}
                    active={false}
                  />
                ))
              }
            </ChipsWrapper>
          )
          }
          {player &&
            player.hands.map((hand, idx) => (

              <OnePlayerWrapper
                key={`${idx}-player`}
                className={handClass(hand)}
              >
                <HandComponent hand={hand} spotId={`spot-${id}`} active={isActive && isCurrentPlayer} playerIndex={id} />
              </OnePlayerWrapper>
            ))}
        </PlayersWrapper>
      </SpotStyled>
      {shouldShowTimer && (
        <Timer
          key={timerKey}
          duration={4}
          onTimeout={handleTimerTimeout}
          isActive={true}
          delay={isInitialDealing ? calculateAllCardsDealtTime() : 0}
        />
      )}
      {t(player.state === PlayerGameState.Playing && game?.table?.state === GameStatus.accepting_bets ?
        'game:player.state.ready' : `game:player.state.${player.state}`)}
    </SpotWrapper>
  );
});
