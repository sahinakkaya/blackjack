from pydantic import BaseModel


class PlayerCreate(BaseModel):
    id: str
    name: str
    balance: int

class Player(PlayerCreate):
    state: str
    hands: list
    balance: int


class Game(BaseModel):
    id: str
    players: dict
    dealer: dict
    state: str
