import { observer } from 'mobx-react-lite';
import React from 'react';

import { CardsTotal, CardsWrapper, SpotStyled } from './Spot.styled';
import { CardComponent } from '../Card/CardComponent';
import { game } from '../../../models/game';
import { CardholdersIds, GameStatus } from '../../../types.ds';
import { useCardDelays } from '../../../hooks/useCardDelays';
import { useProgressiveTotal } from '../../../hooks/useProgressiveTotal';

export const DealerSpotComponent: React.FC = observer(() => {
  const table = game.table;
  const hand = game.table?.hand;
  const isDealing = table?.state === GameStatus.dealing;
  const { calculateDealerDelay } = useCardDelays();
  const { getVisibleTotal } = useProgressiveTotal(hand, false, undefined, table?.state);

  return (
    <SpotStyled className="dealer hidden">
      <CardsWrapper id={CardholdersIds.Dealer}>
        {hand?.map((card, index) => {
          // Hide hole card (second card) only during dealing phase
          const isHoleCard = index === 1 && isDealing;
          // Determine animation delay:
          // - During dealing: use delay for all cards
          // - After dealing: no delay for hole card reveal (index 1), but delay for additional cards (index >= 2)
          const getAnimationDelay = () => {
            if (isDealing) {
              return calculateDealerDelay(index);
            } else if (index === 1) {
              return 0; // Hole card reveals immediately
            } else if (index >= 2) {
              return calculateDealerDelay(index); // Additional cards use delay
            }
            return 0;
          };
          
          return (
            <CardComponent
              cardholderId={CardholdersIds.Dealer}
              hidden={isHoleCard}
              key={`dealerCard-${card.rank}-${card.suit}`}
              suit={card.suit}
              rank={card.rank}
              id={index.toString()}
              isNew={true}
              animationDelay={getAnimationDelay()}
            />
          );
        })}
        {getVisibleTotal().value > 0 && (
          <CardsTotal>
            {(table?.state !== 'dealing' && table?.state !== 'accepting_bets') || !getVisibleTotal().alternate_value ? 
              getVisibleTotal().value :
              `${getVisibleTotal().alternate_value}/${getVisibleTotal().value}`}
          </CardsTotal>
        )}
      </CardsWrapper>
    </SpotStyled>
  );
});
