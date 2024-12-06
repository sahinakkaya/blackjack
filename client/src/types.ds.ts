export enum SuitCard {
  Hearts = '♥︎',
  Diamonds = '♦',
  Spades = '♠︎',
  Clubs = '♣',
}

export type Suit = keyof typeof SuitCard;

export enum Rank {
  Ace = 'Ace',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'Jack',
  Queen = 'Queen',
  King = 'King',
}

export enum PlayerGameState {
  Betting = 'betting',
  Playing = 'playing',
  Waiting = 'waiting',
}

export enum PlayerType {
  Parent = 'Parent',
  Player = 'Player',
  Subplayer = 'Subplayer',
}


export enum HandStatus {
  playing = 'playing',
  played = 'played',
  bust = 'bust',
  won = 'won',
  draw = 'draw',
  lost = 'lost',
}

export interface ICard {
  rank: Rank;
  suit: Suit;
  value: number;
}

export interface IDealer {
  id: string;
  spotId: string;
  hand: ICard[];
  roundIsEnded: boolean;
}

export interface IHand {
  id: number;
  value: number;
  alternate_value: number | null;
  state: HandStatus;
  result: HandStatus;
  cards: ICard[];
  can_split: boolean;
  can_double_down: boolean;
  can_hit: boolean;
  is_current_hand: boolean;
  bet: number;
  is_main: boolean;
}

export interface IPlayer {
  id: string;
  spotId: string;
  hands: IHand[];
  balance: number;
  is_current_turn: boolean;
  current_hand: IHand | null;
  state: PlayerGameState;
  name: string;
}

export interface ITable {
  id: string;
  state: GameStatus;
  value: number;
  current_player: IPlayer | null;
  hand: ICard[];
  deck: string;
  players: IPlayer[];
}

export enum GameStatus {
  waiting_for_players = 'waiting_for_players',
  accepting_bets = 'accepting_bets',
  paying_players = 'paying_players',
  dealing = 'dealing',
  playing = 'playing',
  played = 'played',
  end = 'end',
}

export enum ActionType {
  Hit = 'hit',
  Stand = 'stand',
  Double = 'double_down',
  Split = 'split',
}

// export enum EndGameActions {
//   Rebet = 'Rebet',
//   NewBet = 'NewBet',
// }

export enum SocketOn {
  Connect = 'connect',
  TableCreated = 'tableCreated',
  TableJoined = 'tableJoined',
  ClientIdSet = 'clientIdSet',
  ActionMade = 'actionMade',
  DisconnectPlayer = 'disconnectPlayer',
  BetUpdate = 'betUpdate',
  Dealt = 'dealt',
  DealerMadeAction = 'dealerMadeAction',
  WinnersCounted = 'winnersCounted',
  GameEnded = 'gameEnded',
  Error = 'error',
  Message = 'message',
  BalanceToppedUp = 'balanceToppedUp',
  ChatServerMessage = 'chatServerMessage',
  GameRestarted = 'gameRestarted',
}

export enum SocketEmit {
  GetClientId = 'get_client_id',
  JoinTable = 'join_table',
  CreateTable = 'create_table',
  Action = 'action',
  Deal = 'deal',
  EndGame = 'end_game',
  RemoveBet = 'remove_bet',
  SetBet = 'set_bet',
  TopupBalance = 'topup_balance',
  ChatSendMessage = 'chat_send_message',
  RestartGame = 'restart_game',
}

export type TBet = 2 | 5 | 10 | 20 | 40 | 60 | 100;

export enum ModalTypes {
  CreateOrJoin = 'CreateOrJoin',
  Balance = 'Balance',
  GameEnd = 'GameEnd',
  Chat = 'Chat',
  Sounds = 'Sounds',
}

export interface IModal {
  type: ModalTypes;
  hide: boolean;
}

export interface IMessage {
  id: string;
  text: string[];
  playerId: string;
  playerName: string;
  time: string;
}

export interface IChat {
  messages: IMessage[];
}

export enum SoundType {
  Click = 'click',
  Chip = 'chip',
  Flip = 'flip',
  Balance = 'balance',
  Background = 'background',
  PlayerConnected = 'player-connsected',
  PlayerDisconnected = 'player-disconnsected',
  Message = 'message',
}

export enum CardholdersIds {
  Spot0 = 'spot-0Cardholder',
  Spot1 = 'spot-1Cardholder',
  Spot2 = 'spot-2Cardholder',
  Spot3 = 'spot-3Cardholder',
  Spot4 = 'spot-4Cardholder',
  Dealer = 'dealerCardholder',
}
