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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
