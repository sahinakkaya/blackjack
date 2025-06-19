import React, { useCallback, MouseEvent, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import {
  PlayerComponentWrapper,
  CardsWrapper,
  ChipsWrapper,
  CardsTotal,
} from './Spot.styled';
import { getBetColor } from '../../../utils/getBetColor';
import { CardComponent } from '../Card/CardComponent';
import { Color } from '../../../constants/constants';
import { IHand, SocketEmit } from '../../../types.ds';
import { game } from '../../../models/game';
import { Bet } from '../BetPanel/Bet';
import { getChips } from '../../../utils/convertToChips';
import { useCardDelays } from '../../../hooks/useCardDelays';
import { useProgressiveTotal } from '../../../hooks/useProgressiveTotal';

type PlayerComponentProps = {
  hand: IHand;
  spotId: string;
  active: boolean;
  playerIndex?: number;
};
export const HandComponent: React.FC<PlayerComponentProps> = observer(
  ({ hand, spotId, active, playerIndex = 0 }) => {

    const cardRef = useRef<HTMLDivElement>(null);
    const activeClassName = active && hand.is_current_hand ? 'active' : '';
    const { calculatePlayerDelay } = useCardDelays();
    const { getVisibleTotal } = useProgressiveTotal(hand.cards, true, playerIndex, game.table?.state);

    const handleRemoveBet = useCallback(
      (index: number) => (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        console.log('remove bet', index)
      },
      []
    );
    console.log('currentBetValue', game.currentBetValue)

    return (
      <PlayerComponentWrapper className={activeClassName}>
        <ChipsWrapper>
          {(
            getChips(hand.bet)?.map((bet, index) => (
              <Bet
                key={`${spotId}-bet${index}-${bet}`}
                value={bet}
                onBetSet={handleRemoveBet(index)}
                color={getBetColor(bet)}
                size={5.5}
                active={false}
              />
            ))
          )}

        </ChipsWrapper>
        <CardsWrapper ref={cardRef} id={`${spotId}Cardholder`}>
          {hand?.cards.map((card, index) => (
            <CardComponent
              cardholderId={`${spotId}Cardholder`}
              key={`${index}-Card`}
              suit={card.suit}
              rank={card.rank}
              id={spotId}
              isNew={true}
              animationDelay={calculatePlayerDelay(playerIndex, index)}
            />
          ))}
          {getVisibleTotal().value > 0 && (
            <CardsTotal
              className={
                getVisibleTotal().value > 21
                  ? 'bust'
                  : getVisibleTotal().value == 21 && hand.cards.length == 2
                    ? 'bj'
                    : ''
              }
            >
              {(game.table?.state !== 'dealing' && game.table?.state !== 'accepting_bets') || !getVisibleTotal().alternate_value ? 
                getVisibleTotal().value :
                `${getVisibleTotal().alternate_value}/${getVisibleTotal().value}`}
            </CardsTotal>
          )}
        </CardsWrapper>
      </PlayerComponentWrapper>
    );
  }
);
