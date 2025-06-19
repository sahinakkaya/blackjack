import { ActionType, IPlayer } from '../types.ds';
// import { EndGameActions } from '../types.ds';
// import { Socket } from 'socket.io-client';
import { makeObservable, observable, action } from 'mobx';
import { SocketEmit } from '../types.ds';
import { SocketOn } from '../types.ds';
import { ITable, IModal, ModalTypes } from '../types.ds';
import { SoundType, TBet } from '../types.ds';
import { socket } from '../server/socket';
import { Music } from './music';
import { toast } from 'react-toastify';
import i18next from 'i18next';


export class Game {
  @observable public currentBetValue = 0;
  @observable public modal: IModal = {
    type: ModalTypes.CreateOrJoin,
    hide: false,
  };
  @observable public music: Music | null = null;
  @observable public table: ITable | null = null;
  public clientId: string = '';
  public emit = {
    [SocketEmit.JoinTable]: (
      tableId: string,
      name: string,
      balance: number
    ): void => {
      socket.emit(SocketEmit.JoinTable, tableId, name, balance);
    },
    [SocketEmit.CreateTable]: (name: string, balance: number): void => {
      console.log('emitting create table');
      socket.emit(SocketEmit.CreateTable, name, balance);
    },
    [SocketEmit.SetBet]: (): void => {
      socket.emit(
        SocketEmit.SetBet,
        this.table?.id,
        this.currentBetValue ?? 0
      );
    },
    [SocketEmit.Action]: (handIdx: number, action: ActionType): void => {
      socket.emit(SocketEmit.Action, this.table?.id, handIdx, action);
      if (action === ActionType.Hit || action === ActionType.Double) {
        this.playSound(SoundType.Flip);
      }
    },
    [SocketEmit.RestartGame]: (): void => {
      socket.emit(SocketEmit.RestartGame, this.table?.id);
    },
    [SocketEmit.EndGame]: (): void => {
      socket.emit(SocketEmit.EndGame, this.table?.id);
    }
  };

  private previousPlayerCount: number = 0;

  public constructor() {

    makeObservable(this);
    this.table = null;
    // const hand = game.hand
    // this.table = {
    //
    //   id: game.id,
    //   state: game.state,
    //   value: game.value,
    //   current_player: game.current_player,
    //   hand: [],
    //   deck: game.deck,
    //   players: game.players
    // };
    this.clientId = localStorage.getItem('clientId') ?? '';

    socket.on(SocketOn.Connect, () => {
      console.log('sending get client id', this.clientId)
      socket.emit(SocketEmit.GetClientId, this.clientId);
    });
    socket.on(SocketOn.ClientIdSet, (id) => {
      this.updateClientId(JSON.parse(id));
      console.log('client id set', this.clientId);
      localStorage.setItem('clientId', this.clientId);
    });
    // socket.on(SocketOn.Error, (message) => toast.error(message, toastSettings));
    socket.on(SocketOn.TableJoined, (table) => {
      this.updateTable(JSON.parse(table));
      this.modalUpdate(true);
      this.playSound(SoundType.PlayerConnected);
    });
    socket.on(SocketOn.BetUpdate, (table) => {
      console.log('bet update')
      console.log(JSON.parse(table))
      this.updateTable(JSON.parse(table));
    });

    socket.on(SocketOn.GameRestarted, (table) => {
      console.log('game restarted');
      this.updateTable(JSON.parse(table));
      this.resetBet()
    })
    socket.on(SocketOn.GameEnded, (table) => {
      console.log('game ended');
      this.updateTable(JSON.parse(table));
    })
  }

  @action.bound public updateBet(value: TBet, type: 'add' | 'remove'): void {

    if (type === 'add') {
      console.log('increasing bet');
      this.currentBetValue += value;
    } else {
      console.log('decreasing bet');
      this.currentBetValue -= value;
    }
    console.log(this.currentBetValue);
  }

  @action.bound public resetBet(): void {
    this.currentBetValue = 0;
  }


  public onTableCreated(
    game: ITable,
  ): void {
    console.log('table created');
    console.log(game);
    this.table = game;
    this.music = new Music();
  }

  @action.bound public updateClientId(id: string): void {
    this.clientId = id;
  }



  @action.bound public modalUpdate(
    hide: boolean,
    type = this.modal.type
  ): void {
    this.modal.type = type;
    this.modal.hide = hide;
  }

  public getClientPlayer(): IPlayer | undefined {
    return this.table?.players.find((player) => player.id === this.clientId);
  }


  public playSound(soundType: SoundType): void {
    const audio =
      this.music?.sounds[soundType] ?? this.music?.notifications[soundType];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      audio.play();
    }
  }

  @action.bound private updateTable(table: ITable): void {
    // Check for new players joining
    if (this.table && table.players.length > this.previousPlayerCount) {
      // Find newly joined players
      const currentPlayerIds = this.table.players.map(p => p.id);
      const newPlayers = table.players.filter(p => !currentPlayerIds.includes(p.id));
      
      // Show notification for each new player (excluding the current client)
      newPlayers.forEach(player => {
        if (player.id !== this.clientId) {
          toast.success(i18next.t('notifications.player_joined', { playerName: player.name }));
        }
      });
    }
    
    this.previousPlayerCount = table.players.length;
    this.table = table;
  }
}

export const game = new Game();
