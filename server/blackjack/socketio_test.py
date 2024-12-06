import socketio
import json
import uuid

from blackjack.models.game import Game
from blackjack.schemas import PlayerCreate
from blackjack.config import settings

# create a Socket.IO server

origins = settings.allow_origins


# sio = socketio.AsyncServer(async_mode='asgi')
#
# app = socketio.ASGIApp(sio, origins=origins)


sio = socketio.AsyncServer(cors_allowed_origins=origins, async_mode="asgi")
app = socketio.ASGIApp(sio)

games = {}
clients = {}


@sio.event
async def connect(sid, environ):
    client_id = str(uuid.uuid4())
    print('env', environ)

    print(f"connect {sid}")

@sio.on("get_client_id")
async def get_client_id(sid, client_id):
    if not client_id:
        client_id = str(uuid.uuid4())
    clients[sid] = client_id
    await sio.emit("clientIdSet", json.dumps(client_id), sid)


@sio.on("create_table")
async def create_table(sid, player_name, balance):
    room_id = str(uuid.uuid4())
    # room_id = "a"
    await sio.enter_room(sid, room_id)
    game = Game(room_id, num_of_decks=1)
    client_id = clients[sid]
    game.add_player(PlayerCreate(id=client_id, name=player_name, balance=balance))
    games[room_id] = game
    # game.accept_bet(sid, 10)

    from pprint import pprint

    pprint(game.as_dict())
    await sio.emit(
        "tableCreated",
        data=json.dumps(game.as_dict()),
        to=sid,
    )

@sio.on("join_table")
async def join_table(sid, room_id, player_name, balance):
    game = games[room_id]
    await sio.enter_room(sid, room_id)
    client_id = clients[sid]
    game.add_player(PlayerCreate(id=client_id, name=player_name, balance=balance))
    # game.accept_bet(sid, 10)
    await sio.emit(
        "tableJoined",
        data=json.dumps(game.as_dict()),
        room=room_id,
    )
    await sio.emit(
        "tableCreated",
        data=json.dumps(game.as_dict()),
        room=room_id,
    )


@sio.on("set_bet")
async def set_bet(sid, room_id, bet):
    game = games[room_id]
    client_id = clients[sid]
    game.accept_bet(client_id, bet)
    print('bet set', bet)
    await sio.emit(
        "betUpdate",
        data=json.dumps(game.as_dict()),
        room=room_id,
    )

@sio.on("action")
async def make_action(sid, room_id, hand_idx, action):
    game = games[room_id]
    client_id = clients[sid]
    game.play(client_id, hand_idx, action)
    await sio.emit(
        "actionMade",
        data=json.dumps(game.as_dict()),
        room=room_id,
    )

@sio.on("restart_game")
async def restart_game(sid, room_id):
    game = games[room_id]
    game.payout()
    await sio.emit(
        "gameRestarted",
        data=json.dumps(game.as_dict()),
        room=room_id,
    )

@sio.on("end_game")
async def end_game(sid, room_id):
    game = games[room_id]
    game.end()
    await sio.emit(
        "gameEnded",
        data=json.dumps(game.as_dict()),
        room=room_id,
    )
