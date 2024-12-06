import os
from blackjack.models.game import Game
from blackjack.models.player import Player
from blackjack.schemas import PlayerCreate
from blackjack.utils import print_cards_side_by_side
from blackjack.utils import calculate_hand_value

game = Game("1", num_of_decks=1)

game.add_player(PlayerCreate(id="1", name="Alice", balance=1000))
game.add_player(PlayerCreate(id="2", name="Bob", balance=1000))


# game.start_game()


def format_player(player: Player):
    return f"{player.name} ({player.balance})"


def print_hand(hand, show_result=True):
    if not hand:
        return
    print(hand.value, end=" ")
    if show_result:
        print(
            "(busted)"
            if hand.is_bust
            else "(won)"
            if hand.is_won()
            else "(draw)"
            if hand.is_draw()
            else "(lost)",
        )
    else:
        print()
    print_cards_side_by_side(
        [c.model_dump() for c in hand.cards],
    )


while True:
    os.system("clear")
    while game.is_accepting_bets():
        current_player = game.current_player
        bet = input(
            f"{format_player(current_player)} enter your bet (press enter to skip this round): "
        )
        bet = "10"
        while not bet.isdigit():
            bet = input(
                f"That didn't work. {format_player(current_player)} enter your bet (press enter to skip this round): "
            )
        game.accept_bet(current_player.id, int(bet))

    while game.is_dealing():
        current_player = game.current_player
        while current_player and current_player.is_playing():
            os.system("clear")
            # print(game.as_dict())
            print(f"Dealer's hand: {game.hand[0].value}")
            print_cards_side_by_side([game.hand[0].model_dump(), {}])
            current_hand = current_player.current_hand

            for player in game.players.values():
                if not player.hands:
                    continue
                main_hand = player.main_hand
                split_hand = player.split_hand
                print(f"{player.name}'s hand: {main_hand.value}")
                print_cards_side_by_side(
                    [c.model_dump() for c in main_hand.cards],
                    is_current=main_hand.is_playing()
                    and player.id == current_player.id,
                )
                if split_hand:
                    print(f"{player.name}'s other hand: {split_hand.value}")
                    print_cards_side_by_side(
                        [c.model_dump() for c in split_hand.cards],
                        is_current=not main_hand.is_playing()
                        and player.id == current_player.id
                        and split_hand.is_playing(),
                    )

            actions = current_hand.actions
            possible_actions = ", ".join(
                [f"[{action[0]}]{action[1:]}" for action in actions]
            )
            single_letter_actions = [action[0] for action in actions]
            single_letter_actions.append("")
            action = input(
                f"{current_player.name} enter your action ({possible_actions}): "
            )
            while action not in single_letter_actions:
                action = input(
                    f"{current_player.name} enter your action ({possible_actions}): "
                )

            action = {
                "h": "hit",
                "s": "split",
                "": "stand",
                "d": "double_down",
            }[action]
            game.play_turn(current_player.id, 0 if current_hand.is_main else 1, action)
            current_player = game.current_player

        if not game.is_end():
            game.end()
        print("ending roudn")

        i = 2
        while i < len(game.hand):
            os.system("clear")
            print(
                f"Dealer's hand: {calculate_hand_value(game.hand[:i])}",
            )
            print_cards_side_by_side([c.model_dump() for c in game.hand[:i]])
            for player in game.players.values():
                if not player.hands:
                    continue
                print(format_player(player))
                print_hand(player.main_hand, show_result=False)
                print_hand(player.split_hand, show_result=False)
            input()
            i += 1

        os.system("clear")
        print(
            f"Dealer's hand: {game.value}",
            "(busted)" if game.is_bust else "",
        )
        print_cards_side_by_side([c.model_dump() for c in game.hand])
        for player in game.players.values():
            if not player.hands:
                continue
            print(format_player(player))
            print_hand(player.main_hand)
            print_hand(player.split_hand)
        game.payout()
        for player in game.players.values():
            print(format_player(player))
        input("press enter to continue")
        os.system("clear")


player = game.players[player_id]
