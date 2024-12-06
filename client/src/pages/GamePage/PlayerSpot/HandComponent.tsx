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

type PlayerComponentProps = {
  hand: IHand;
  spotId: string;
  active: boolean;
};
export const HandComponent: React.FC<PlayerComponentProps> = observer(
  ({ hand, spotId, active }) => {

    const cardRef = useRef<HTMLDivElement>(null);
    const activeClassName = active && hand.is_current_hand ? 'active' : '';

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
            />
          ))}
          {hand.value > 0 && (
            <CardsTotal
              className={
                hand.value > 21
                  ? 'bust'
                  : hand.value == 21 && hand.cards.length == 2
                    ? 'bj'
                    : ''
              }
            >
              {hand.alternate_value ? `${hand.alternate_value}/${hand.value}` : hand.value}
            </CardsTotal>
          )}
        </CardsWrapper>
      </PlayerComponentWrapper>
    );
  }
);
