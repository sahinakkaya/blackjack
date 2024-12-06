from enum import StrEnum
from pydantic import BaseModel


class PlayerStatus(StrEnum):
    betting = "betting"
    playing = "playing"
    waiting = "waiting"


class GameStatus(StrEnum):
    waiting_for_players = "waiting_for_players"
    accepting_bets = "accepting_bets"
    paying_players = "paying_players"
    dealing = "dealing"
    playing = "playing"
    played = "played"
    end = "end"

class GameAction(StrEnum):
    START_GAME = "start_game"
    START_ROUND = "start_round"
    ACCEPT_BET = "accept_bet"
    ADD_PLAYER = "add_player"
    PLAY_TURN = "play_turn"
    REMOVE_PLAYER = "remove_player"
    PAYOUT = "payout"
    END = "end"


class HandStatus(StrEnum):
    playing = "playing"
    played = "played"
    bust = "bust"
    won = "won"
    draw = "draw"
    lost = "lost"


class GameState(BaseModel):
    deck: list
    players: dict
    dealer_hand: list
    status: GameStatus


class PlayerAction(StrEnum):
    JOIN = "join"
    BET = "bet"
    PLAY = "play"
    GET_READY = "get_ready"

    def action(self):
        return f"player_{self}"


class HandAction(StrEnum):
    HIT = "hit"
    STAND = "stand"
    SPLIT = "split"
    DOUBLE_DOWN = "double_down"


class DealerAction(StrEnum):
    START_ROUND = "start_round"
    PLAY = "play"
    PAYOUT = "payout"


class Card(BaseModel):
    suit: str
    rank: str
    value: int
