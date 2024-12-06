import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { betValuesOptions } from '../../../constants/constants';
import { BetPanelStyled } from './BetPanel.styled';
import { game } from '../../../models/game';
import { TBet, GameStatus } from '../../../types.ds';
import { Bet } from './Bet';

export const BetPanel: React.FC = observer(() => {
  const betSize = 7;
  const { table } = game;

  const handleBet = useCallback(
    (value: TBet) => () => {
      game.updateBet(value, 'add');
    },
    []
  );

  if (table?.state !== GameStatus.accepting_bets) {
    return null;
  }

  return (
    <BetPanelStyled size={betSize}>
      {betValuesOptions.filter(bet => bet.value + game.currentBetValue < (game.getClientPlayer()?.balance ?? 0)).map((bet) => (
        <Bet
          key={`bet-${bet.value}`}
          value={bet.value}
          onBetSet={handleBet(bet.value)}
          color={bet.color}
          size={betSize}
          active={false}
        />
      ))}
    </BetPanelStyled>
  );
});
