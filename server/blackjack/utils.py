def calculate_hand_value(hand, alternate=False):
    value = sum(card.value for card in hand)
    num_aces = sum(1 for card in hand if card.rank == "Ace")
    while value > 21 and num_aces:
        value -= 10
        num_aces -= 1

    if alternate:
        return None if not num_aces or value == 21 else value - 10
    return value


def card_to_visual_lines(card):
    """
    Converts a card dictionary to a list of strings representing the card.

    :param card: A dictionary with keys 'rank' and 'suit'.
    :return: A list of strings representing the card.
    """
    suit_symbols = {"Hearts": "♥", "Diamonds": "♦", "Clubs": "♣", "Spades": "♠"}

    rank_symbols = {"Ace": "A", "King": "K", "Queen": "Q", "Jack": "J"}

    rank = rank_symbols.get(card.get("rank", "?"), card.get("rank", "?"))
    suit = card.get("suit", "?")
    suit_symbol = suit_symbols.get(suit, "?")

    rank_display = rank if len(rank) > 1 else f"{rank} "

    return [
        "┌───────┐",
        f"│ {rank_display}    │",
        "│       │",
        f"│   {suit_symbol}   │",
        "│       │",
        f"│    {rank_display} │",
        "└───────┘",
    ]


def print_cards_side_by_side(cards, is_current=False):
    """
    Prints multiple cards side by side.

    :param cards: A list of card dictionaries, each with 'rank' and 'suit'.
    """
    card_lines = [card_to_visual_lines(card) for card in cards]

    # Combine lines for side-by-side display

    num_stars = 10 * len(cards) + 3
    if is_current:
        print("*" * num_stars)
    for lines in zip(*card_lines):
        if is_current:
            print("*", end=" ")
        print(" ".join(lines), end=" " if is_current else "\n")
        if is_current:
            print("*")
    if is_current:
        print("*" * num_stars)


if __name__ == "__main__":
    hand = [
        {"rank": "Ace", "suit": "Hearts"},
        {"rank": "10", "suit": "Spades"},
        {"rank": "King", "suit": "Diamonds"},
    ]

    print_cards_side_by_side(hand)
