import { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ButtonsWrapper } from '../../../components/ModalsManager/ModalsManager.styled';
import { ActionType, SocketEmit, SocketOn, SoundType, GameStatus } from '../../../types.ds';
import { StyledBtn } from '../../../components/App/App.styled';
import { socket } from '../../../server/socket';
import { game } from '../../../models/game';
import { StyledBtnWithSound } from '../../../sounds/StyledBtnWithSound';
import { Timer } from './Timer';

export const GameActionsComponent: React.FC = observer(() => {
  const { table } = game;
  const { t } = useTranslation();

  const currentPlayer = game.table?.current_player;
  const isCurrentPlayer = currentPlayer?.id === game.clientId;
  const isDealingPhase = game.table?.state === GameStatus.dealing;
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

  const handleSetBet = () => {
    if (game.currentBetValue > 0) {
      game.emit[SocketEmit.SetBet]();
    }
  };

  const handleTimerTimeout = useCallback(() => {
    // Auto-stand when timer expires
    if (isCurrentPlayer && currentPlayer?.current_hand?.can_hit) {
      console.log('Timer expired, auto-standing');
      game.emit[SocketEmit.Action](currentPlayer.current_hand.is_main ? 0 : 1, ActionType.Stand);
    }
  }, [isCurrentPlayer, currentPlayer]);

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

  const clientPlayer = game.getClientPlayer();
  const isBettingPhase = game.table?.state === GameStatus.accepting_bets;
  const hasPendingBet = game.currentBetValue > 0;
  const hasPlacedBet = clientPlayer?.hands?.some(hand => hand.bet > 0) || false;
  const canSetBet = isBettingPhase && clientPlayer && hasPendingBet && !hasPlacedBet;
  console.log(isBettingPhase)

  const bettingButtons = (
    <ButtonsWrapper>
      {canSetBet && (
        <StyledBtnWithSound
          soundType={SoundType.Click}
          disabled={false}
          onClick={handleSetBet}
        >
          {t('actions.set_bet')}
        </StyledBtnWithSound>
      )}
    </ButtonsWrapper>
  );

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
      {isDealingPhase && isCurrentPlayer && currentHand?.can_hit && (
        <Timer 
          duration={4} 
          onTimeout={handleTimerTimeout}
          isActive={true}
        />
      )}
      {isBettingPhase ? bettingButtons : actionsButtons}
    </>
  );
});
