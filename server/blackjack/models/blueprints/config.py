
from blackjack.enums import DealerAction, DealerStatus, GameAction, GameStatus, HandAction, HandStatus, PlayerAction, PlayerStatus

simple_config = {
    "states": ["A", "B"],
    "transitions": [
        ["go", "A", "B", "foo"],
    ],
    "initial": "A",
    "before_state_change": "call_this",
    "model_override": True,
}


game_config = {
    "states": list(GameStatus),
    "initial": GameStatus.waiting,
    "transitions": [
        {
            "trigger": GameAction.START,
            "source": GameStatus.waiting,
            "dest": GameStatus.playing,
        },
        {
            "trigger": GameAction.ADD_PLAYER,
            "source": "*",
            "dest": "=",
            "after": "add_player_to_game",
        },
        {
            "trigger": GameAction.ACCEPT_BET,
            "source": GameStatus.playing,
            "dest": GameStatus.playing,
            "after": "take_bet",
        },
        {
            "trigger": GameAction.PLAY_TURN,
            "source": GameStatus.playing,
            "dest": GameStatus.playing,
            "after": "play",
        },
        {
            "trigger": GameAction.REMOVE_PLAYER,
            "source": "*",
            "dest": "=",
            "after": "remove_player_from_game",
        },
        {
            "trigger": GameAction.END,
            "source": GameStatus.playing,
            "dest": GameStatus.end,
            "after": "end_round",
        },
        {
            "trigger": GameAction.PAYOUT,
            "source": GameStatus.end,
            "dest": GameStatus.waiting,
            "after": "payout_players",
        },
    ],
}

class Dealer:
    def __init__(self, game, num_of_decks: int):
        self.game = game
        self.num_of_decks = num_of_decks
        self.deck = self.create_deck()
        self.hand = []

        self.machine = Machine(
            model=self, states=list(DealerStatus), initial=DealerStatus.accepting_bets
        )

        self.machine.add_transition(
            DealerAction.START_ROUND,
            DealerStatus.accepting_bets,
            DealerStatus.dealing,
            after="deal_cards",
        )
        self.machine.add_transition(
            DealerAction.PLAY,
            DealerStatus.dealing,
            DealerStatus.playing,
            after="play_round",
        )

        self.machine.add_transition(
            DealerAction.PAYOUT,
            [DealerStatus.played, DealerStatus.bust],
            DealerStatus.accepting_bets,
            after="payout_players")

dealer_config = {
    "states": list(DealerStatus),
    "initial": DealerStatus.accepting_bets,
    "transitions": [
        {
            "trigger": DealerAction.START_ROUND,
            "source": DealerStatus.accepting_bets,
            "dest": DealerStatus.dealing,
            "after": "deal_cards",
        },
        {
            "trigger": DealerAction.PLAY,
            "source": DealerStatus.dealing,
            "dest": DealerStatus.playing,
            "after": "play_round",
        },
        {
            "trigger": DealerAction.PAYOUT,
            "source": [DealerStatus.played, DealerStatus.bust],
            "dest": DealerStatus.accepting_bets,
            "after": "payout_players",
        },
    ],
}


hand_config = {
    "states": list(HandStatus),
    "initial": HandStatus.playing,
    "transitions": [
        {
            "trigger": HandAction.HIT,
            "source": HandStatus.playing,
            "dest": HandStatus.playing,
            "after": "hit_card",
        },
        {
            "trigger": HandAction.STAND,
            "source": HandStatus.playing,
            "dest": HandStatus.played,
        },
        {
            "trigger": HandAction.DOUBLE_DOWN,
            "source": HandStatus.playing,
            "dest": HandStatus.played,
            "after": ["hit_card", "double"],
            "conditions": ["can_double_down"],
        },
        {
            "trigger": HandAction.SPLIT,
            "source": HandStatus.playing,
            "dest": HandStatus.playing,
            "after": "split_hand",
            "conditions": ["can_split"],
        },
        {
            "trigger": "play_round",
            "source": "*",
            "dest": HandStatus.played,
        },
        {
            "trigger": "bust",
            "source": [HandStatus.playing, HandStatus.played],
            "dest": HandStatus.bust,
        },
    ],
}


player_config = {
    "states": list(PlayerStatus),
    "initial": PlayerStatus.waiting,
    "send_event": True,
    "after_state_change": "update_state",
    "transitions": [
        {
            "trigger": PlayerAction.BET,
            "source": PlayerStatus.betting,
            "dest": PlayerStatus.playing,
            "conditions": ["can_bet"],
            "after": "place_bet",
        },
        {
            "trigger": PlayerAction.PLAY,
            "source": PlayerStatus.playing,
            "dest": PlayerStatus.playing,
            "conditions": ["can_play"],
            "after": "play_hand",
        },
        {
            "trigger": PlayerAction.GET_READY,
            "source": PlayerStatus.waiting,
            "dest": PlayerStatus.betting,
        },
    ],

}



