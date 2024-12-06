import { observer } from 'mobx-react-lite';
import React from 'react';

import { CardsTotal, CardsWrapper, SpotStyled } from './Spot.styled';
import { CardComponent } from '../Card/CardComponent';
import { game } from '../../../models/game';
import { CardholdersIds, GameStatus } from '../../../types.ds';

export const DealerSpotComponent: React.FC = observer(() => {
  const table = game.table;
  const hand = game.table?.hand;
  const isDealing = table?.state === GameStatus.dealing;

  return (
    <SpotStyled className="dealer hidden">
      <CardsWrapper id={CardholdersIds.Dealer}>
        {hand?.map((card, index) => (
          <CardComponent
            cardholderId={CardholdersIds.Dealer}
            hidden={index === 1 && isDealing}
            key={`dealerCard-${card.rank}-${card.suit}`}
            suit={card.suit}
            rank={card.rank}
            id={index.toString()}
            isNew={true}
          />
        ))}
        {table && table?.value > 0 && (
          <CardsTotal>{isDealing ? hand && hand[0].value : table.value}</CardsTotal>
        )}
      </CardsWrapper>
    </SpotStyled>
  );
});
