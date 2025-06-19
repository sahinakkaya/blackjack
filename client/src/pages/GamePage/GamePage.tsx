import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { HandySvg } from 'handy-svg';

import {
  BalanceStyled,
  OptionsPanel,
  GameWrapper,
  Wrapper,
} from './GamePage.styled';
import { StyledBtn, toastSettings } from '../../components/App/App.styled';
import { GameActionsComponent } from './GameActions/GameActionsComponent';
import { DealerSpotComponent } from './PlayerSpot/DealerSpotComponent';
import { PlayerSpotComponent } from './PlayerSpot/PlayerSpotComponent';
import { GameStatus, ModalTypes, SocketEmit, SoundType } from '../../types.ds';
import { SvgBtnWithSound } from '../../sounds/StyledBtnWithSound';
import soundSettingsIcon from '../../assets/settings.svg';
import { SpotsZone } from './PlayerSpot/Spot.styled';
import moneyIcon from '../../assets/money.svg';
import { BetPanel } from './BetPanel/BetPanel';
import { GameText } from './GameText/GameText';
import chatIcon from '../../assets/chat.svg';
import copyIcon from '../../assets/copy.svg';
import { Game, game } from '../../models/game';
import { Deck } from './Deck/Deck';
import { useTranslation } from 'react-i18next';

export const GamePage: React.FC = observer(() => {
  const navigate = useNavigate();
  const { t  } = useTranslation();

  useEffect(() => {
    if (!game.table) {
      navigate('/');
      game.modalUpdate(false, ModalTypes.CreateOrJoin);
    }
  }, [navigate]);

  if (!game.table) {
    return null;
  }

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(game.table?.id ?? '')
      .then(() => {
        toast(t('copy:room_id_success'), toastSettings);
      })
      .catch(() => {
        toast.error(t('copy:room_id_failed'), toastSettings);
      });
  };
  const handleModalOpen = (type: ModalTypes) => () => {
    game.modalUpdate(false, type);
  };

  const spotsZone = (
    <SpotsZone $playerCount={game.table?.players.length || 5}>
      {
        Array.from({ length: game.table?.players.length || 5 }).map((_, index) => (
          <PlayerSpotComponent key={index} id={index} />
        ))
      }
    </SpotsZone >

  );

  const gameActionsComponent = (game.table?.state === GameStatus.dealing || game.table?.state === GameStatus.accepting_bets) && (
    <GameActionsComponent />
  );

  const handlePlayBtn = () => {
    game.emit[SocketEmit.RestartGame]();
  };

  const playButtonOrGameStatus =
    game.table?.state === GameStatus.end ? (
      <StyledBtn onClick={handlePlayBtn}>Restart</StyledBtn>
    ) : (
      <div>{t(`game:state.${game.table.state}`)}</div>
    );

  const copyTableIdBtn = (
    <SvgBtnWithSound soundType={SoundType.Click} onClick={handleCopyClick}>
      <HandySvg
        src={copyIcon}
        width={0.017 * Math.min(window.innerWidth, window.innerHeight)}
        height={0.017 * Math.min(window.innerWidth, window.innerHeight)}
      />
    </SvgBtnWithSound>
  );

  return (
    <Wrapper>
      <BalanceStyled>
        <div>{game.table?.state === GameStatus.accepting_bets ?
          (game.getClientPlayer()?.balance ?? 0) - game.currentBetValue :
          game.getClientPlayer()?.balance}</div>
      </BalanceStyled>
      <OptionsPanel>
        {copyTableIdBtn}
      </OptionsPanel>
      <GameWrapper>
        <DealerSpotComponent />
        <GameText />

        {spotsZone}
        <Deck />
      </GameWrapper>

      <div className="buttons">
        <BetPanel />
        {playButtonOrGameStatus}
        {gameActionsComponent}
      </div>
    </Wrapper>
  );
});
