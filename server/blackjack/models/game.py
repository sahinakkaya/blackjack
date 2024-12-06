import random
import logging

from transitions import Machine

from blackjack.enums import (
    Card,
    GameAction,
    HandAction,
    GameStatus,
)
from blackjack.models.player import Player
from blackjack.schemas import PlayerCreate
from blackjack.utils import calculate_hand_value

logger = logging.getLogger(__name__)

suits = ["Hearts", "Diamonds", "Clubs", "Spades"]
ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"]
values = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "Jack": 10,
    "Queen": 10,
    "King": 10,
    "Ace": 11,
}


class Game:
    def __init__(self, id, num_of_decks: int):
        self.id = id
        self.num_of_decks = num_of_decks
        self.deck = self.create_deck()
        self.players = {}
        # self.players[1] = Player(id=1, balance=1000, name="Ghost", dealer=self)
        # self.players[2] = Player(id=2, balance=1000, name="Ghost", dealer=self)
        # self.players[3] = Player(id=3, balance=1000, name="Ghost", dealer=self)
        # self.players[4] = Player(id=4, balance=1000, name="Ghost", dealer=self)
        self.hand = []

        self.machine = Machine(
            model=self, states=list(GameStatus), initial=GameStatus.waiting_for_players
        )

        self.machine.add_transition(
            GameAction.START_GAME,
            [GameStatus.waiting_for_players, GameStatus.paying_players],
            GameStatus.accepting_bets,
            after=["make_players_ready"],
        )
        self.machine.add_transition(
            GameAction.ACCEPT_BET,
            GameStatus.accepting_bets,
            GameStatus.accepting_bets,
            after="take_bet",
        )
        self.machine.add_transition(
            GameAction.START_ROUND,
            GameStatus.accepting_bets,
            GameStatus.dealing,
            after=["deal_cards"],
        )
        self.machine.add_transition(
            GameAction.PLAY_TURN, GameStatus.dealing, GameStatus.dealing, after="play"
        )

        self.machine.add_transition(
            GameAction.END, GameStatus.dealing, GameStatus.end, after="end_round"
        )
        self.machine.add_transition(
            GameAction.PAYOUT,
            GameStatus.end,
            GameStatus.paying_players,
            after="payout_players",
        )
        self.machine.add_transition(
            GameAction.ADD_PLAYER, "*", "=", after="add_player_to_game"
        )
        self.machine.add_transition(
            GameAction.REMOVE_PLAYER, "*", "=", after="remove_player_from_game"
        )

    @property
    def current_player(self):
        if self.is_dealing():
            return next(
                (player for player in self.players.values() if player.is_playing()),
                None,
            )
        elif self.is_accepting_bets():
            return next(
                (player for player in self.players.values() if player.is_betting()),
                None,
            )

    def deal_cards(self):
        for player in self.players.values():
            if player.is_playing():
                player.take_two_cards()
        self.hand = [self.deal_card(), self.deal_card()]

        if not self.current_player:
            self.end()

    def make_players_ready(self):
        logger.info("Starting game")
        for player in self.players.values():
            logger.info(f"Player {player.id} is getting ready {player.state}")
            player.get_ready()
            logger.info(f"Player {player.id} is ready {player.state}")

    def create_deck(self):
        deck = [
            Card(**{"suit": suit, "rank": rank, "value": values[rank]})
            for suit in suits
            for rank in ranks
        ] * self.num_of_decks
        random.shuffle(deck)
        # a = [
        #     Card(rank="Ace", suit="Spades", value=11),
        #     Card(rank="10", suit="Spades", value=10),
        #     Card(rank="2", suit="Spades", value=2),
        #     Card(rank="5", suit="Spades", value=5),
        #     Card(rank="6", suit="Spades", value=6),
        # ]
        # a.reverse()
        # return a
        return deck

    def deal_card(self):
        if self.state != GameStatus.dealing:
            raise Exception("Dealer is not dealing")

        if len(self.deck) < 10:
            # TODO: check if game is in progress
            self.deck = self.create_deck()
        return self.deck.pop()

    def take_bet(self, player_id: int, bet: int):
        if player_id not in self.players:
            raise ValueError("Player not found")
        player = self.players[player_id]
        player.bet(bet)
        if all(
            player.is_playing()
            for player in self.players.values()
            if not player.is_waiting()
        ):
            self.start_round()

    def play(self, player_id: int, hand_idx: int, action: HandAction):
        if player_id not in self.players:
            raise ValueError("Player not found")
        player = self.players[player_id]
        player.play(hand_idx, action)
        if all(player.is_waiting() for player in self.players.values()):
            self.end()

    @property
    def is_blackjack(self):
        return len(self.hand) == 2 and self.value == 21

    @property
    def value(self):
        return calculate_hand_value(self.hand)

    @property
    def is_bust(self):
        return self.value > 21

    def end_round(self):
        if any(not player.is_bust for player in self.players.values()):
            while self.value < 17:
                self.hand.append(self.deck.pop())

    def payout_players(self):
        for player_id in self.players:
            player = self.players[player_id]
            for hand in player.hands:
                if hand.is_won():
                    if hand.is_blackjack:
                        player.balance += hand.bet * 2.5
                    else:
                        player.balance += hand.bet * 2
                elif hand.is_draw():
                    player.balance += hand.bet
            player.hands.clear()
        self.hand.clear()

        if self.players:
            logger.info("starting game")
            self.start_game()

    def as_dict(self):
        return {
            "id": self.id,
            "state": self.state,
            "value": self.value,
            "current_player": self.current_player.as_dict() if self.current_player else None,
            "hand": [card.model_dump() for card in self.hand],
            "deck": f"{len(self.deck)} cards left",
            "players": [player.as_dict() for player in self.players.values()],
        }

    def add_player_to_game(self, player: PlayerCreate):
        self.players[player.id] = Player(
            id=player.id, balance=player.balance, name=player.name, dealer=self
        )
        if self.is_waiting_for_players():
            self.start_game()
        elif self.is_accepting_bets():
            self.players[player.id].get_ready()
        return player.id

    def remove_player_from_game(self, event):
        player_id = event.args[0]
        if player_id in self.players:
            del self.players[player_id]
            if not self.players:
                self.end()
        else:
            raise ValueError("Player not found")
        return player_id
