from fastapi import FastAPI
from blackjack.route import router
from fastapi.middleware.cors import CORSMiddleware
from blackjack.websockets import router as ws_router


app = FastAPI()
origins = [
    "http://localhost",
    "http://localhost:3000",  # React development server
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


app.include_router(router, prefix="/new_api", tags=["new_api"])
app.include_router(ws_router, tags=["ws"])


# Card deck


games = {}


# @app.post("/start_game/{game_id}")
# async def start_game(
#     game_id: int = 1, player1_money: int = 1000, player2_money: int = 1000
# ):
#     deck = create_deck()
#     player1 = Player(id=1, hand=[], money=player1_money, status=Status.betting)
#     player2 = Player(id=2, hand=[], money=player2_money, status=Status.betting)
#     dealer_hand = [deck.pop(), deck.pop()]
#     games[game_id] = GameState(
#         deck=deck,
#         players={1: player1, 2: player2},
#         dealer_hand=dealer_hand,
#         status=Status.betting,
#     )
#     return games[game_id]
#
#
# @app.post("/place_bet/{game_id}/{player_id}")
# async def place_bet(game_id: int = 1, player_id: int = 1, bet: int = 10):
#     game = games[game_id]
#     player = game.players[player_id]
#     if game.status != Status.betting:
#         return {"error": "Game has already started"}
#     elif player.status == Status.playing:
#         return {"error": "player already placed a bet"}
#     if player.money >= bet:
#         player.bet = bet
#         player.money -= bet
#         player.hand = [game.deck.pop(), game.deck.pop()]
#         player.status = Status.playing
#         game.status = calculate_game_status(game)
#         return {
#             "player_hand": player.hand,
#             "player_money": player.money,
#             "bet": player.bet,
#         }
#     else:
#         return {"error": "Insufficient funds"}
#
#
# @app.post("/pass/{game_id}/{player_id}")
# async def pass_(game_id: int = 1, player_id: int = 1):
#     game = games[game_id]
#     player = game.players[player_id]
#     if player.status == Status.playing:
#         return {"error": "player placed a bet, cannot pass"}
#     player.status = Status.playing
#     game.status = calculate_game_status(game)
#     return {"player_status": player.status, "game_status": game.status}
#
#
# @app.post("/hit/{game_id}/{player_id}")
# async def hit(game_id: int = 1, player_id: int = 1):
#     game = games[game_id]
#     player = game.players[player_id]
#     if game.status != Status.playing:
#         return {"error": "wait for the round to start"}
#     player.hand.append(game.deck.pop())
#     player_value = calculate_hand_value(player.hand)
#     if player_value > 21:
#         player.bet = 0
#         player.status = Status.played
#         game.status = calculate_game_status(game)
#         return {"player_hand": player.hand, "player_value": player_value, "bust": True}
#     return {"player_hand": player.hand, "player_value": player_value}
#
#
# @app.post("/stand/{game_id}/{player_id}")
# async def stand(game_id: int = 1, player_id: int = 1):
#     game = games[game_id]
#     player = game.players[player_id]
#     if game.status != Status.playing:
#         return {"error": "wait for the round to start"}
#     player.status = Status.played
#     game.status = calculate_game_status(game)
#     return {
#         "player_hand": player.hand,
#         "player_value": calculate_hand_value(player.hand),
#     }
#
#
# @app.post("/double/{game_id}/{player_id}")
# async def double(game_id: int = 1, player_id: int = 1):
#     game = games[game_id]
#     player = game.players[player_id]
#     if game.status != Status.playing:
#         return {"error": "wait for the round to start"}
#     if player.money >= player.bet:
#         player.money -= player.bet
#         player.bet *= 2
#         player.hand.append(game.deck.pop())
#         player_value = calculate_hand_value(player.hand)
#         player.status = Status.played
#         game.status = calculate_game_status(game)
#         if player_value > 21:
#             return {
#                 "player_hand": player.hand,
#                 "player_value": player_value,
#                 "bust": True,
#             }
#         return {
#             "player_hand": player.hand,
#             "player_value": player_value,
#             "bet": player.bet,
#         }
#     else:
#         return {"error": "Insufficient funds"}
#
#
# # @app.post("/split/{game_id}/{player_id}")
# # async def split(game_id: int, player_id: int):
# #     game = games[game_id]
# #     player = game.players[player_id]
# #     if game.status != Status.playing:
# #         return {"error": "wait for the next round to start"}
# #     if len(player.hand) == 2 and player.hand[0]['rank'] == player.hand[1]['rank'] and player.money >= player.bet:
# #         player.money -= player.bet
# #         new_hand = [player.hand.pop()]
# #         player.hand.append(game.deck.pop())
# #         new_hand.append(game.deck.pop())
# #         player.hand = [player.hand, new_hand]
# #         return {"player_hand": player.hand, "new_hand": new_hand, "player_money": player.money}
# #     else:
# #         return {"error": "Cannot split"}
#
#
# @app.post("/dealer_play/{game_id}")
# async def dealer_play(game_id: int):
#     game = games[game_id]
#     if game.status != Status.played:
#         return {"error": "round has not ended yet"}
#     dealer_hand = game.dealer_hand
#
#     game.status = calculate_game_status(game)
#     while calculate_hand_value(dealer_hand) < 17:
#         dealer_hand.append(game.deck.pop())
#     dealer_value = calculate_hand_value(dealer_hand)
#     results = {}
#     for player_id, player in game.players.items():
#         player_value = calculate_hand_value(player.hand)
#         if player_value > 21:
#             results[player_id] = {
#                 "result": "lose",
#                 "player_value": player_value,
#                 "dealer_value": dealer_value,
#             }
#         elif dealer_value > 21 or player_value > dealer_value:
#             player.money += player.bet * 2
#             results[player_id] = {
#                 "result": "win",
#                 "player_value": player_value,
#                 "dealer_value": dealer_value,
#             }
#         elif player_value == dealer_value:
#             player.money += player.bet
#             results[player_id] = {
#                 "result": "push",
#                 "player_value": player_value,
#                 "dealer_value": dealer_value,
#             }
#         else:
#             results[player_id] = {
#                 "result": "lose",
#                 "player_value": player_value,
#                 "dealer_value": dealer_value,
#             }
#         player.bet = 0
#
#     for player in game.players.values():
#         player.status = Status.betting
#         player.hand = []
#         player.bet = 0
#     return {
#         "dealer_hand": dealer_hand,
#         "dealer_value": dealer_value,
#         "results": results,
#     }
#
#
# @app.get("/game_status/{game_id}")
# async def game_status(game_id: int):
#     game = games.get(game_id)
#     if game:
#         dealer_hand = game.dealer_hand
#         if game.status == Status.playing:
#             dealer_hand = [dealer_hand[0]] + [{}]
#         return {
#             "dealer_hand": dealer_hand,
#             "players": game.players,
#             "status": game.status,
#         }
#     else:
#         return {"error": "Game not found"}
#
#
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
