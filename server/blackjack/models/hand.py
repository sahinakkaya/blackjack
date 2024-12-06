import logging
from blackjack.enums import Card, HandAction, HandStatus
from blackjack.models.game import Game
from blackjack.models.player import Player
from blackjack.utils import card_to_visual_lines
from transitions import Machine

from blackjack.utils import calculate_hand_value
from itertools import count

logger = logging.getLogger(__name__)


# states = [State(name=state, final=state != HandStatus.playing) for state in HandStatus]


class Hand:
    hand_id = count(0)
    def __init__(
        self,
        dealer: Game,
        player: Player,
        bet: int,
        cards: list[Card] | None = None,
        can_split: bool = True,
    ):
        self.id = next(self.hand_id)
        self.dealer = dealer
        self.player = player
        self.bet = bet

        self.player.balance -= bet
        if cards is None:
            self.cards = []
        else:
            self.cards = cards
        self.can_split_ = can_split
        self.can_double_down_ = True
        self.machine = Machine(
            model=self,
            states=list(HandStatus),
            initial=HandStatus.playing,
        )
        self.machine.add_transition(
            HandAction.HIT, HandStatus.playing, HandStatus.playing, after="hit_card"
        )
        self.machine.add_transition(
            HandAction.STAND, HandStatus.playing, HandStatus.played
        )
        self.machine.add_transition(
            HandAction.DOUBLE_DOWN,
            HandStatus.playing,
            HandStatus.played,
            after=["hit_card", "double"],
            conditions=["can_double_down"],
        )
        self.machine.add_transition(
            HandAction.SPLIT,
            HandStatus.playing,
            HandStatus.playing,
            after="split_hand",
            conditions=["can_split"],
        )

        self.machine.add_transition("play_round", "*", HandStatus.played)

        if self.value == 21:
            self.play_round()

    @property
    def is_bust(self):
        return self.value > 21

    def is_won(self):
        return (
            self.value > self.dealer.value
            or self.dealer.is_bust
            or (self.is_blackjack and not self.dealer.is_blackjack)
        ) and not self.is_bust

    def is_draw(self):
        return (self.is_blackjack and self.dealer.is_blackjack) or (
            self.value == self.dealer.value
            and not self.dealer.is_blackjack
            and not self.is_bust
        )

    @property
    def is_blackjack(self):
        return len(self.cards) == 2 and self.value == 21

    @property
    def actions(self):
        actions = ["hit"]
        if self.can_double_down:
            actions.append("double")
        if self.can_split:
            actions.append("split")
        return actions

    @property
    def is_main(self):
        return self == self.player.main_hand

    def __repr__(self):
        """
        Prints multiple cards side by side.

        :param cards: A list of card dictionaries, each with 'rank' and 'suit'.
        """
        card_lines = [card_to_visual_lines(card.model_dump()) for card in self.cards]

        # Combine lines for side-by-side display
        result = []
        for lines in zip(*card_lines):
            result.append(" ".join(lines))

        return f"{self.value}\n{self.state}\n" + "\n".join(result)


    @property
    def value(self):
        return calculate_hand_value(self.cards)

    @property
    def alternate_value(self):
        return calculate_hand_value(self.cards, alternate=True)

    def double(self):
        self.player.balance -= self.bet
        self.bet *= 2

    def split_hand(self):
        self.can_split_ = False
        self.player.hands.append(
            Hand(
                dealer=self.dealer,
                player=self.player,
                bet=self.bet,
                cards=[self.cards.pop()],
                can_split=False,
            )
        )

    def take_two_cards(self):
        # self.cards.append(Card(rank="9", suit="Spades", value=9))
        # self.cards.append(Card(rank="Ace", suit="Spades", value=11))

        self.cards.append(self.dealer.deal_card())
        self.cards.append(self.dealer.deal_card())

        if self.value == 21:
            self.play_round()

    def hit_card(self):
        logger.info("hitting card")
        self.cards.append(self.dealer.deal_card())
        self.can_double_down_ = False
        if self.value >= 21:
            self.play_round()
        logger.info(self)

    @property
    def can_double_down(self):
        return self.can_double_down_ and self.player.balance >= self.bet

    def as_dict(self):
        return {
            "id": self.id,
            "value": self.value,
            "state": self.state,
            "result": self.state
            if self.state == HandStatus.playing
            else "won"
            if self.is_won()
            else "draw"
            if self.is_draw()
            else "lost",
            "cards": [card.model_dump() for card in self.cards],
            "can_split": self.can_split,
            "alternate_value": self.alternate_value,
            "can_double_down": self.can_double_down,
            "can_hit": self.state == HandStatus.playing,
            "is_current_hand": self.is_current_hand,
            "is_main": self.is_main,
            "bet": self.bet,
        }

    @property
    def is_current_hand(self):
        return self.player.current_hand == self


    @property
    def can_split(self):
        return (
            len(self.cards) == 2
            and self.cards[0].value == self.cards[1].value
            and self.can_split_
            and self.player.balance >= self.bet
        )
