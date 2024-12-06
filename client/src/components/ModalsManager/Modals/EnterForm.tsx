/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import {
  CheckboxInputWrapper,
  CheckboxLabel,
  InputWrapper,
  ChecboxInput,
  ErrorMsg,
  Input,
  Label,
  Form,
} from '../ModalsManager.styled';
import { SocketEmit, SocketOn } from '../../../types.ds';
import { StyledBtn } from '../../App/App.styled';
import { socket } from '../../../server/socket';
import { game } from '../../../models/game'
import { useTranslation } from 'react-i18next';

interface FormValues {
  name: string;
  balance: number;
  joinExistingTable: boolean;
  tableId?: string;
}

export const EnterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<FormValues>();
  const [disabled, setDisabled] = useState<boolean>(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onJoinTable = useCallback(
    (name: string, balance: number, id?: string) => {
      id
        ? game.emit[SocketEmit.JoinTable](id, name, balance)
        : game.emit[SocketEmit.CreateTable](name, balance);
    },
    []
  );

  const onSubmit = useCallback(
    (data: FormValues) => {
      setDisabled(true);
      const { name, balance, joinExistingTable, tableId } = data;
      if (joinExistingTable && !tableId) {
        return;
      }
      onJoinTable(name, balance, joinExistingTable ? tableId : undefined);
    },
    [onJoinTable]
  );

  useEffect(() => {
    const handleTableCreated = (
      state: string,
    ) => {
      game.onTableCreated(
        JSON.parse(state),
      );
      if (game.table) {
        navigate(`/table?id=${game.table.id}`);
      }
      game.modalUpdate(true);

      const soundSettings = game.music?.getLoacaleSettings();
      if (soundSettings) {
        const { musicVolume, soundsVolume } = soundSettings;
        game.music?.setMusicVolume(musicVolume);
        game.music?.setSoundVolume(soundsVolume);
      } else {
        game.music?.setMusicVolume(0.1);
      }

      // game.music?.bg?.play();
    };

    const handleError = () => {
      setDisabled(false);
      setError('tableId', { message: t("form:errors.invalid_room_id") });
      const tableIdInput = document.querySelector<HTMLInputElement>(
        'input[name="tableId"]'
      );
      if (tableIdInput) {
        tableIdInput.value = '';
      }
    };

    socket.on(SocketOn.TableCreated, handleTableCreated);
    socket.on(SocketOn.Error, handleError);

    return () => {
      socket.off(SocketOn.TableCreated, handleTableCreated);
      socket.off(SocketOn.Error, handleError);
    };
  }, [navigate, setError]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <Form onSubmit={handleSubmit(onSubmit)}>
      <InputWrapper>
        {errors.name && <ErrorMsg>{errors.name.message}</ErrorMsg>}
        <Input
          autoComplete="off"
          className={`${watch('name') ? 'filled' : ''}`}
          type="text"
          {...register('name', {
            required: t('form:errors.nameRequired'),
            minLength: {
              value: 3,
              message: t('form:errors.minLength', { count: 3 }),
            },
            maxLength: {
              value: 25,
              message: t('form:errors.maxLength', { count: 25 }),
            },
          })}
        />
        <Label>{t("form:labels.name")}</Label>
      </InputWrapper>
      <InputWrapper>
        {errors.balance && <ErrorMsg>{errors.balance.message}</ErrorMsg>}
        <Input
          autoComplete="off"
          className={`${watch('balance') ? 'filled' : ''}`}
          type="number"
          step={0.01}
          onKeyPress={(event) => {
            if (event.key === '+' || event.key === '-') {
              event.preventDefault();
            }
          }}
          {...register('balance', {
            required: t('form:errors.balanceRequired'),
            min: {
              value: 2,
              message: t('form:errors.minBalance', { value: 2 }),
            },
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: t('form:errors.invalidBalance'),
            },
          })}
        />
        <Label>{t("form:labels.balance")}</Label>
      </InputWrapper>
      <CheckboxInputWrapper>
        <ChecboxInput
          id="checkbox"
          type="checkbox"
          className="checkbox-input"
          {...register('joinExistingTable')}
        />
        <label className="fake-check" htmlFor="checkbox"></label>

        <CheckboxLabel>{t("form:labels.join_existing")}</CheckboxLabel>
      </CheckboxInputWrapper>
      {watch('joinExistingTable') && (
        <InputWrapper>
          {errors.tableId && <ErrorMsg>{errors.tableId.message}</ErrorMsg>}
          <Input
            autoComplete="off"
            className={`${watch('tableId') ? 'filled' : ''}`}
            type="text"
            {...register('tableId', {
              required: t('form:errors.roomIdRequired'),
            })}
          />
          <Label>{t("form:labels.room_id")}</Label>
        </InputWrapper>
      )}
      <StyledBtn
        type="submit"
        className="button buttonBlue"
        disabled={disabled}
      >
        {watch('joinExistingTable') ? t('form:buttons.join_room') : t('form:buttons.create_room')}
      </StyledBtn>
    </Form>
  );
};
