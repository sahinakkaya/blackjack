from fastapi import APIRouter, Depends, HTTPException

from blackjack import schemas
from blackjack.enums import HandAction
from blackjack.models.game import Game
from blackjack.models.player import Player

router = APIRouter()

games = {}


def reload_game():
    game_id = "1"
    game = Game(game_id, num_of_decks=1)
    games[game_id] = game
    player_id = game.add_player(schemas.PlayerCreate(name="Alice", balance=1000))
    game.accept_bet(player_id, 10)


def valid_game_id(game_id):
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


def valid_player_id(game_id, player_id):
    game = valid_game_id(game_id)
    player = game.players.get(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.get("/reload", response_model=schemas.Game)
async def reload():
    reload_game()
    return games["1"].as_dict()


@router.post("/game")
async def create_game(num_of_decks: int = 1):
    game_id = "1"
    game = Game(game_id, num_of_decks=num_of_decks)
    games[game_id] = game
    return {"game_id": game_id}


@router.get("/game/{game_id}", response_model=schemas.Game)
async def get_game(game: Game = Depends(valid_game_id)):
    return game.as_dict()


@router.post("/game/{game_id}/player")
async def join_game(
    player: schemas.PlayerCreate,
    game: Game = Depends(valid_game_id),
):
    game.add_player(player)
    return {"player_id": list(game.players.keys())[-1]}


@router.get("/game/{game_id}/player/{player_id:int}", response_model=schemas.Player)
async def get_player(
    player: Player = Depends(valid_player_id),
):
    return player.as_dict()



@router.post("/game/{game_id}/player/{player_id:int}/bet", response_model=schemas.Player)
async def bet(
    bet_amount: int,
    game: Game = Depends(valid_game_id),
    player: Player = Depends(valid_player_id),
):
    game.accept_bet(player.id, bet_amount)
    return player.as_dict()

@router.post("/game/{game_id}/player/{player_id:int}/play", response_model=schemas.Player)
async def play(
    hand_idx: int,
    action: HandAction,
    game: Game = Depends(valid_game_id),
    player: Player = Depends(valid_player_id),
):
    game.play(player.id, hand_idx, action)
    return player.as_dict()

@router.post("/game/{game_id}/next_round", response_model=schemas.Game)
async def next_round(
    game: Game = Depends(valid_game_id),
):
    game.payout()
    return game.as_dict()
