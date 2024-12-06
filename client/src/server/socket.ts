import { ActionType } from '../types.ds';
// import { EndGameActions } from '../types.ds';
import { Socket } from 'socket.io-client';
import { SocketEmit } from '../types.ds';
import { SocketOn } from '../types.ds';

import { io } from 'socket.io-client';

const socketWithoutTypes: Socket = io( process.env.REACT_APP_SOCKET_URL ?? 'http://localhost:8000');

interface SocketEventsOn {
  [SocketOn.Connect]: () => void;
  [SocketOn.TableCreated]: (
    state: string,
  ) => void;
  [SocketOn.TableJoined]: (table: string) => void;
  [SocketOn.DisconnectPlayer]: (table: string) => void;
  [SocketOn.BetUpdate]: (table: string) => void;
  [SocketOn.Dealt]: (table: string) => void;
  [SocketOn.ActionMade]: (
    table: string,
    actionType: ActionType | undefined
  ) => void;
  [SocketOn.DealerMadeAction]: (
    table: string,
    actionType: ActionType | undefined
  ) => void;
  [SocketOn.WinnersCounted]: (table: string) => void;
  [SocketOn.GameEnded]: (table: string) => void;
  [SocketOn.GameRestarted]: (table: string) => void;
  [SocketOn.Error]: (message: string) => void;
  [SocketOn.Message]: (message: string, type?: 'chat') => void;
  [SocketOn.BalanceToppedUp]: (player: string) => void;
  [SocketOn.ChatServerMessage]: (message: string) => void;
  [SocketOn.ClientIdSet]: (clientId: string) => void;
}

type SocketEventNamesOn = keyof SocketEventsOn;

interface SocketEventsEmit {
  [SocketEmit.GetClientId]: (
    clientId?: string | undefined
  ) => void;
  [SocketEmit.JoinTable]: (
    table: string,
    name: string,
    balance: number,
    id?: string | undefined
  ) => void;
  [SocketEmit.CreateTable]: (name: string, balance: number) => void;
  [SocketEmit.Action]: (
    tableId: string | undefined,
    handIdx: number,
    actionType: ActionType,
  ) => void;
  [SocketEmit.Deal]: (tableId: string | undefined) => void;
  [SocketEmit.RestartGame]: (tableId: string | undefined) => void;
  [SocketEmit.EndGame]: (
    tableId: string | undefined,
  ) => void;
  [SocketEmit.RemoveBet]: (
    tableId: string | undefined,
    playerId: string | undefined,
    betIndex: number
  ) => void;
  [SocketEmit.SetBet]: (
    tableId: string | undefined,
    bet: number
  ) => void;
  [SocketEmit.TopupBalance]: (
    balance: number,
    tableId: string,
    playerId: string
  ) => void;
  [SocketEmit.ChatSendMessage]: (table: string, message: string) => void;
}

type SocketEventNamesEmit = keyof SocketEventsEmit;

interface SocketWithTypedEvents<T extends keyof SocketEventsEmit> {
  on<E extends SocketEventNamesOn>(
    event: E,
    listener: SocketEventsOn[E]
  ): Socket;
  emit<E extends T>(event: E, ...args: Parameters<SocketEventsEmit[E]>): Socket;
  off: Socket['off'];
}

export const socket: SocketWithTypedEvents<SocketEventNamesEmit> =
  socketWithoutTypes;
