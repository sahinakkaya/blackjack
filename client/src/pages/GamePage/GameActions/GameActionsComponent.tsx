import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { ButtonsWrapper } from '../../../components/ModalsManager/ModalsManager.styled';
import { ActionType, SocketEmit, SocketOn, SoundType } from '../../../types.ds';
import { StyledBtn } from '../../../components/App/App.styled';
import { socket } from '../../../server/socket';
import { game } from '../../../models/game';
import { StyledBtnWithSound } from '../../../sounds/StyledBtnWithSound';

export const GameActionsComponent: React.FC = observer(() => {
  const { table } = game;

  const currentPlayer = game.table?.current_player;
  const isCurrentPlayer = currentPlayer?.id === game.clientId;
  // if (!currentTurn && game.table?.state === 'dealing') {
  //   console.log('Game ended because everyone made blackjack');
  //   game.emit[SocketEmit.EndGame]()
  //   return null;
  // }

  const currentHand = currentPlayer?.current_hand

  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false);

  const handleAction = (actionType: ActionType) => () => {
    console.log(currentPlayer, actionType)
    game.emit[SocketEmit.Action](currentPlayer?.current_hand?.is_main ? 0 : 1, actionType);
    // setButtonsDisabled(true);
  };

  useEffect(() => {
    if (!isCurrentPlayer) {
      setButtonsDisabled(true);
    } else {
      setButtonsDisabled(false);
    }
  }, [isCurrentPlayer]);

  useEffect(() => {
    socket.on(SocketOn.ActionMade, (data) => {
      game.table = JSON.parse(data);
      console.log('ActionMade', data);
      // setButtonsDisabled(false);
    });
  }, []);

  console.log('game state is', game.table?.state)
  console.log('current hand is', currentHand)

  const actionsButtons = (
    <ButtonsWrapper>
      {currentHand?.can_hit && (
        <StyledBtn
          soundType={SoundType.Click}
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.Hit)}
        >
          Hit
        </StyledBtn>
      )}
      {currentHand?.can_hit && (
        <StyledBtnWithSound
          soundType={SoundType.Click}
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.Stand)}
        >
          Stand
        </StyledBtnWithSound>
      )}

      {currentHand?.can_split && (
        <StyledBtn
          soundType={SoundType.Click}
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.Split)}
        >
          Split
        </StyledBtn>
      )}
      {currentHand?.can_double_down && (
        <StyledBtn
          soundType={SoundType.Click}
          disabled={buttonsDisabled}
          onClick={handleAction(ActionType.Double)}
        >
          Double
        </StyledBtn>
      )}
    </ButtonsWrapper>
  );

  return (
    <>
      {actionsButtons}
    </>
  );
});
