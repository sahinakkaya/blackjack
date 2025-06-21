# Blackjack Game

This repository contains the complete implementation of my multiplayer [Blackjack game](https://blackjack.sahinakkaya.dev), combining a Python-based backend with a React-based frontend. The whole thing was implemented in a week, so the codebase still contains unnecessary comments, test code etc. but it is functional as is. Below is an overview of the backend and frontend parts.


---

## Backend

The backend models the game state using a finite state machine powered by [pytransitions](https://github.com/pytransitions/transitions). It handles communication with clients via WebSockets implemented with [python-socketio](https://github.com/miguelgrinberg/python-socketio).

### Features
- **Infinite number of players support**: Since I modelled the game as finite state machine, it is not hard to keep track of the state of the game. So it can be played as many players as needed.
- **A simple cli**: A simple cli to interact with the game from command line. I wrote it to quickly test my game while developing it. You can run it with `python blackjack/cli.py`.
- **An HTTP API**: My initial thought was to create an api to interact with the game from clients but I ended up using [websockets](https://en.wikipedia.org/wiki/WebSocket) as they are more useful when there is real time data. But the api is still available. I will probably delete this part completely in the future.
- **Connections through websockets**: Clients can connect to backend via websockets and get real time data to update their state.

---

## Frontend

The frontend part is fork of [polivodichka/blackjack](https://github.com/polivodichka/blackjack). I do not enjoy writing frontend code (and also I am not very good at it) so I decided to modify an existing code to have a functional UI as quick as possible. Since it is some one else's code hacked to work with my game, you may see hacky solutions, console.log's, ugly code blocks etc. I will improve it in the future once I implement all the features I want.


### Features
- Creating a new room for a game or joining an existing one by ID.
- Entering the game with a specified name and balance.
- Game interface allowing unlimited amount of players to play at the same time. (though, I only tested it up to 3 players)
- The ability to add and remove chips.
- Displaying game and player's status
- Localization support


---


### Future Plans
- [x] Add a timer for player actions.
- [ ] Allow users to skip round (i.e. they don't set bet and round still starts for other players)
- [ ] Add notifications for events like "Player joined," "Insufficient funds," and "Invalid game."
- [ ] Allow players to top up their balance.
- [ ] Implement chat functionality for players.
- [ ] Implement sound settings.
- [ ] Maintain game state when the page is refreshed.
