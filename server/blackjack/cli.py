from pprint import pprint
import requests

from blackjack.utils import print_cards_side_by_side


game_endpoint = "http://localhost:8000/new_api"

# first_player_name = input("Enter first player name: ")
# second_player_name = input("Enter second player name: ")
# first_player_money = int(input(f"Enter {first_player_name}'s money: "))
# second_player_money = int(input(f"Enter {second_player_name}'s money: "))

first_player_name = "Alice"
second_player_name = "Bob"
first_player_money = 1000
second_player_money = 1000

game_id = 1

response = requests.post(
    f"{game_endpoint}/game?num_of_decks=1",
)
requests.post(
    f"{game_endpoint}/game/{game_id}/player", json={"name": first_player_name, "balance": first_player_money}
)
requests.post(
    f"{game_endpoint}/game/{game_id}/player", json={"name": second_player_name, "balance": second_player_money}
)





def place_bet(player_name, player_id):
    bet = input(f"{player_name} enter your bet (press enter to skip this round): ")
    while bet.isdigit():
        response = requests.post(
            f"{game_endpoint}/game/{game_id}/player/{player_id}/bet?bet_amount={bet}",
        )
        if response.json().get("error"):
            print(response.json()["error"])
        elif response.status_code == 200:
            break
        bet = input(f"{player_name} enter your bet (press enter to skip this round): ")
    return bet


def play_round(player, hand_idx, actions):
    print('possible actions:', actions)
    possible_actions = ", ".join([f"[{action[0]}]{action[1:]}" for action in actions])
    single_letter_actions = [action[0] for action in actions]
    single_letter_actions.append("")
    action = input(f"{player['name']} enter your action ({possible_actions}): ")
    while action not in single_letter_actions:
        action = input(f"{player['name']} enter your action ({possible_actions}): ")
    action = {
        "h": "hit",
        "s": "split",
        "": "stand",
        "d": "double_down",
    }[action]
    response = requests.post(
        f"{game_endpoint}/game/{game_id}/player/{player['id']}/play?hand_idx={hand_idx}&action={action}", 
    )
    game_status = requests.get(f"{game_endpoint}/game/{game_id}").json()
    return game_status


while True:
    game_status = requests.get(f"{game_endpoint}/game/{game_id}").json()
    while any(player["state"] == "betting" for player in game_status["players"].values()):
        player = next(player for player in game_status["players"].values() if player["state"] == "betting")
        place_bet(player["name"], player["id"])
        game_status = requests.get(f"{game_endpoint}/game/{game_id}").json()

    while any(player["state"] == "playing" for player in game_status["players"].values()):
        player = next(player for player in game_status["players"].values() if player["state"] == "playing")
        pprint(game_status)
        print(f"Dealer's hand: {game_status["dealer"]["value"]}")
        print_cards_side_by_side(game_status["dealer"]["hand"])
        while any(hand["state"] == "playing" for hand in player["hands"]):
            hand = player["hands"][0]
            other_hand = player["hands"][1] if len(player["hands"]) > 1 else None
            print(f"{first_player_name}'s hand: {hand['value']}")
            first_hand = True
            print_cards_side_by_side(hand["cards"], is_current=hand["state"] == "playing")
            if other_hand:
                if hand["state"] != "playing" and other_hand["state"] == "playing":
                    first_hand = False
                print(f"{first_player_name}'s other hand: {other_hand['value']}")
                print_cards_side_by_side(other_hand["cards"], is_current=hand["state"] != "playing" and other_hand["state"] == "playing")

            actions = []
            if first_hand:
                actions = ["hit"]
                if hand["can_double_down"]:
                    actions.append("double")
                if hand["can_split"]:
                    actions.append("split")
            elif other_hand:
                actions = ["hit"]
                if other_hand["can_double_down"]:
                    actions.append("double")
                if other_hand["can_split"]:
                    actions.append("split")
            game_status = play_round(player, 0 if first_hand else 1, actions)
            pprint(game_status)
            player = game_status["players"][str(player["id"])]
        game_status = requests.get(f"{game_endpoint}/game/{game_id}").json()
    input("Press enter to start next round: ")
    requests.post(f"{game_endpoint}/game/{game_id}/next_round")
