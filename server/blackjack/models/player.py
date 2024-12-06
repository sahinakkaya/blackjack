import logging
from transitions import Machine

from blackjack.enums import GameStatus, PlayerAction, PlayerStatus

logger = logging.getLogger(__name__)


class Player:
    def __init__(self, id, name, balance, dealer):
        self.id = id
        self.name = name
        self.balance = balance
        self.dealer = dealer
        self.hands = []
        self.machine = Machine(
            model=self,
            states=list(PlayerStatus),
            initial=PlayerStatus.waiting,
            send_event=True,
            after_state_change="update_state",
        )
        self.machine.add_transition(
            PlayerAction.BET,
            PlayerStatus.betting,
            PlayerStatus.playing,
            conditions=["can_bet"],
            after="place_bet",
        )
        self.machine.add_transition(
            PlayerAction.PLAY,
            PlayerStatus.playing,
            PlayerStatus.playing,
            conditions=["can_play"],
            after="play_hand",
        )

        self.machine.add_transition(
            PlayerAction.GET_READY, PlayerStatus.waiting, PlayerStatus.betting, conditions=["not_ghost"] # TODO: remve this condition
        )

    def not_ghost(self, _):
        return self.name != "Ghost"
    @property
    def current_hand(self):
        return next((hand for hand in self.hands if hand.is_playing()), None)

    @property
    def current_hand_index(self):
        return self.hands.index(self.current_hand) if self.current_hand else None

    @property
    def is_bust(self):
        return all(hand.is_bust for hand in self.hands)

    @property
    def main_hand(self):
        return self.hands[0] if self.hands else None

    @property
    def split_hand(self):
        return self.hands[1] if len(self.hands) > 1 else None

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "state": self.state,
            "current_hand": self.current_hand.as_dict() if self.current_hand else None,
            "is_current_turn": self.dealer.current_player == self,
            "hands": [hand.as_dict() for hand in self.hands],
            "balance": self.balance,
        }

    def update_state(self, _):
        old_state = self.state
        if self.hands and not self.can_play():
            self.machine.set_state(PlayerStatus.waiting)
        if old_state != self.state:
            logger.info(f"Updating player state: {old_state} -> {self.state}")

    def take_two_cards(self):
        self.main_hand.take_two_cards()
        self.update_state(None)

    def play_hand(self, event):
        logger.info("Playing hand")
        idx = event.args[0]
        action = event.args[1]
        hand = self.hands[idx]
        try:
            getattr(hand, action)()
        except Exception as e:
            raise e

    def can_bet(self, event):
        bet = event.args[0]
        if bet > self.balance:
            raise ValueError("player.insufficient_funds")
        elif bet <= 0:
            raise ValueError("player.invalid_bet")
        elif self.dealer.state != GameStatus.accepting_bets:
            raise ValueError("dealer.not_accepting_bets")
        return True

    def can_play(self, _=None):
        return any(hand.state == "playing" for hand in self.hands)

    def place_bet(self, event):
        bet = event.args[0]
        from blackjack.models.hand import Hand

        # cards = [Card(suit="Hearts", rank="Ace", value=11), Card(suit="Hearts", rank="King", value=10)]
        # cards = [
        #     Card(suit="Hearts", rank="Ace", value=11),
        #     Card(suit="Hearts", rank="Ace", value=11),
        # ]
        hand = Hand(self.dealer, self, bet)
        self.hands.append(hand)
        logger.info(self.hands)
