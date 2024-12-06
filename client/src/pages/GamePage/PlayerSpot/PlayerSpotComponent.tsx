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
import { GameStatus, HandStatus, IHand, PlayerGameState, SocketEmit, SoundType, TBet } from '../../../types.ds';
import { HandComponent } from './HandComponent';
import { game } from '../../../models/game';
import { useTranslation } from 'react-i18next';

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
  const handleSetNewBet = () => {
    if (
      gameTable &&
      gameTable?.state == GameStatus.accepting_bets
    ) {
      game.emit[SocketEmit.SetBet]();
    }
  };

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
        onClick={handleSetNewBet}
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
                <HandComponent hand={hand} spotId={`spot-${id}`} active={isActive && isCurrentPlayer} />
              </OnePlayerWrapper>
            ))}
        </PlayersWrapper>
      </SpotStyled>
      {t(player.state === PlayerGameState.Playing && game?.table?.state === GameStatus.accepting_bets ?
        'game:player.state.ready' : `game:player.state.${player.state}`)}
    </SpotWrapper>
  );
});
