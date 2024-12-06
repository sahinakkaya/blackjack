import { observer } from 'mobx-react-lite';
import React from 'react';

import { ModalTypes, SoundType } from '../../types.ds';
import { Overflow } from './ModalsManager.styled';
import { EnterForm } from './Modals/EnterForm';
import { game } from '../../models/game';

const MODAL_COMPONENTS = {
  [ModalTypes.CreateOrJoin]: EnterForm,
  [ModalTypes.Balance]: null,
  [ModalTypes.GameEnd]: null,
  [ModalTypes.Chat]: null,
  [ModalTypes.Sounds]: null,
};

export const ModalsManager: React.FC = observer(() => {
  const ModalComponent = MODAL_COMPONENTS[game.modal.type];
  const handleHide = () => {
    if (
      ModalComponent === MODAL_COMPONENTS.Balance ||
      ModalComponent === MODAL_COMPONENTS.Chat ||
      ModalComponent === MODAL_COMPONENTS.Sounds
    ) {
      // game.playSound(SoundType.Click);
      game.modalUpdate(true);
    }
  };
  return ModalComponent ? (
    <Overflow className={game.modal.hide ? '' : 'active'} onClick={handleHide}>
      <ModalComponent />
    </Overflow>
  ) : null;
});
