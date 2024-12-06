
from blackjack.models.blueprints.config import game_config, dealer_config, hand_config, player_config
from transitions.experimental.utils import generate_base_model
import os

# write to current_dir/game.py

with open(os.path.dirname(__file__) + "/game.py", "w") as f:
    f.write(generate_base_model(game_config))

with open(os.path.dirname(__file__) + "/dealer.py", "w") as f:
    f.write(generate_base_model(dealer_config))

with open(os.path.dirname(__file__) + "/hand.py", "w") as f:
    f.write(generate_base_model(hand_config))

with open(os.path.dirname(__file__) + "/player.py", "w") as f:
    f.write(generate_base_model(player_config))
