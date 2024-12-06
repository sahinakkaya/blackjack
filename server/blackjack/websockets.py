import uuid
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from blackjack.models.game import Game
from blackjack.schemas import PlayerCreate

router = APIRouter()

games = {}


class ConnectionManager:
    def __init__(self):
        # Room ID maps to a dictionary of {client_id: WebSocket}
        self.rooms: dict[str, dict[str, dict]] = {}

    async def connect(
        self,
        websocket: WebSocket,
        room_id: str,
        player_name: str,
        client_id: str | None = None,
    ) -> str:
        # await websocket.accept()
        # Use existing client ID or generate a new one
        if not client_id:
            client_id = str(uuid.uuid4())

        # Add the client to the room
        if room_id not in self.rooms:
            game = Game(room_id, 1)
            game.add_player(PlayerCreate(id=client_id, name=player_name, balance=1000))
            self.rooms[room_id] = {}
        else:
            game = self.rooms[room_id][list(self.rooms[room_id].keys())[0]]["game"]
            if client_id not in game.players:
                game.add_player(PlayerCreate(id=client_id, name=player_name, balance=1000))
                # game.accept_bet(client_id, 100)
        self.rooms[room_id][client_id] = {
            "websocket": websocket,
            "player_name": player_name,
            "game": game,
        }
        return client_id

    def disconnect(self, client_id: str, room_id: str):
        if room_id in self.rooms and client_id in self.rooms[room_id]:
            del self.rooms[room_id][client_id]
            # Remove the room if empty
            if not self.rooms[room_id]:
                del self.rooms[room_id]

    async def send_message_to_client(self, room_id: str, client_id: str, message: str):
        if room_id in self.rooms and client_id in self.rooms[room_id]:
            client = self.rooms[room_id][client_id]
            await client["websocket"].send_text(message)

    async def broadcast(self, room_id: str, message: str):
        if room_id in self.rooms:
            for client in self.rooms[room_id].values():
                await client["websocket"].send_text(message)


manager = ConnectionManager()


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()  # Accept connection immediately
    # Receive the initial join message from the client
    initial_data = await websocket.receive_text()
    join_data = json.loads(initial_data)

    player_name = join_data.get("player_name", "Unknown Player")
    client_id = join_data.get("client_id")
    # Connect the player and get their client ID
    client_id = await manager.connect(websocket, room_id, player_name, client_id)
    try:
        # Send client ID to the client
        await websocket.send_text(
            json.dumps({"type": "client_id", "client_id": client_id})
        )

        # send game state to the client
        game = manager.rooms[room_id][client_id]["game"]
        await websocket.send_text(
            json.dumps(
                {
                    "type": "game_state",
                    "game": game.as_dict(),
                }
            )
        )

        # await manager.broadcast(
        #     room_id,
        #     json.dumps(
        #         {
        #             "type": "game_message",
        #             "content": f"{player_name} (ID: {client_id}) joined the room.",
        #         }
        #     ),
        # )

        while True:
            message = await websocket.receive_text()
            # Parse and handle the message (assuming it's JSON)
            data = json.loads(message)
            type_ = data.get("type")
            action = data.get("action")
            # if action == "hit":
            #     await manager.broadcast(
            #         room_id,
            #         json.dumps(
            #             {"type": "game_message", "content": f"{player_name} hits!"}
            #         ),
            #     )
            # elif action == "stand":
            #     await manager.broadcast(
            #         room_id,
            #         json.dumps(
            #             {"type": "game_message", "content": f"{player_name} stands."}
            #         ),
            #     )
            if type_ == "play":
                hand_idx = data.get("hand_idx")
                action = data.get("action")
                player = game.players[client_id]

                # Call the game logic to play the hand
                game.play(player.id, hand_idx, action)

                # Send updated game state to all players
                # await websocket.send_text(
                #     json.dumps(
                #         {
                #             "type": "game_state",
                #             "game": game.as_dict(),
                #         }
                #     )
                # )

                await manager.broadcast(
                    room_id,
                    json.dumps(
                        {
                            "type": "game_state",
                            "game": game.as_dict(),
                        }
                    )
                )

                # Notify others about the action
                await manager.broadcast(
                    room_id,
                    json.dumps(
                        {
                            "type": "game_message",
                            "content": f"{player_name} played a hand.",
                        }
                    ),
                )
            elif type_ == "place_bet":
                bet_amount = int(data.get("bet_amount"))
                player = game.players[client_id]

                # Call the game logic to accept the bet
                game.accept_bet(player.id, bet_amount)

                # Send updated game state to all players

                await manager.broadcast(
                    room_id,
                    json.dumps(
                        {
                            "type": "game_state",
                            "game": game.as_dict(),
                        }
                    )
                )
                # await websocket.send_text(
                #     json.dumps(
                #         {
                #             "type": "game_state",
                #             "game": game.as_dict(),
                #         }
                #     )
                # )

                # Notify others about the bet
                # await manager.broadcast(
                #     room_id,
                #     json.dumps(
                #         {
                #             "type": "game_message",
                #             "content": f"{player_name} placed a bet of ${bet_amount}.",
                #         }
                #     ),
                # )
            elif type_ == "payout":
                game.payout()

                await manager.broadcast(
                    room_id,
                    json.dumps(
                        {
                            "type": "game_state",
                            "game": game.as_dict(),
                        }
                    )
                )
                # await websocket.send_text(
                #     json.dumps(
                #         {
                #             "type": "game_state",
                #             "game": game.as_dict(),
                #         }
                #     )
                # )
    except WebSocketDisconnect:
        game = manager.rooms[room_id][client_id]["game"]
        manager.disconnect(client_id, room_id)
        await manager.broadcast(
            room_id,
            json.dumps(
                {
                    "type": "game_state",
                    "game": game.as_dict(),
                }
            )
        )
        # await manager.broadcast(room_id, f"Player {client_id} left the room.")


#
# @app.websocket("/ws/{game_id}/{player_id}")
# async def websocket_endpoint(websocket: WebSocket, game_id: int, player_id: int):
#     await manager.connect(websocket)
#     try:
#         while True:
#             data = await websocket.receive_text()
#             await manager.broadcast(
#                 f"Player #{player_id} in game #{game_id} says: {data}"
#             )
#     except WebSocketDisconnect:
#         manager.disconnect(websocket)
#         await manager.broadcast(f"Player #{player_id} left game #{game_id}")
