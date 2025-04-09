import pygame
import os

# Initialize Pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 640, 640
SQUARE_SIZE = WIDTH // 8
WIN = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Vikara Chess")

# Load piece images
PIECE_IMAGES = {}
def load_images():
    pieces = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king']
    colors = ['w', 'b']
    for color in colors:
        for piece in pieces:
            filename = f"{color}_{piece}.png"
            path = os.path.join('assets', filename)
            if os.path.exists(path):
                img = pygame.image.load(path)
                img = pygame.transform.scale(img, (SQUARE_SIZE, SQUARE_SIZE))
                PIECE_IMAGES[f"{color}_{piece}"] = img
            else:
                print(f"Missing image: {filename}")

# Dummy starting board setup (only pawns and kings for demo)
def get_starting_board():
    board = [[None for _ in range(8)] for _ in range(8)]

    # Black pieces
    board[0] = [
        {'color': 'b', 'name': 'rook'},
        {'color': 'b', 'name': 'knight'},
        {'color': 'b', 'name': 'bishop'},
        {'color': 'b', 'name': 'queen'},
        {'color': 'b', 'name': 'king'},
        {'color': 'b', 'name': 'bishop'},
        {'color': 'b', 'name': 'knight'},
        {'color': 'b', 'name': 'rook'}
    ]
    for i in range(8):
        board[1][i] = {'color': 'b', 'name': 'pawn'}

    # White pieces
    board[7] = [
        {'color': 'w', 'name': 'rook'},
        {'color': 'w', 'name': 'knight'},
        {'color': 'w', 'name': 'bishop'},
        {'color': 'w', 'name': 'queen'},
        {'color': 'w', 'name': 'king'},
        {'color': 'w', 'name': 'bishop'},
        {'color': 'w', 'name': 'knight'},
        {'color': 'w', 'name': 'rook'}
    ]
    for i in range(8):
        board[6][i] = {'color': 'w', 'name': 'pawn'}

    return board


# Convert pixel to board coordinates
def coords_to_pos(mx, my):
    return mx // SQUARE_SIZE, my // SQUARE_SIZE

# Draw board and pieces
def draw_board(win, board, dragging_piece=None, drag_pos=None, skip_pos=None):
    colors = [(240, 217, 181), (181, 136, 99)]  # light and dark squares
    for y in range(8):
        for x in range(8):
            pygame.draw.rect(win, colors[(x + y) % 2], (x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE))

            if (x, y) == skip_pos:
                continue

            piece = board[y][x]
            if piece:
                key = f"{piece['color'][0]}_{piece['name']}"
                img = PIECE_IMAGES.get(key)
                if img:
                    win.blit(img, (x * SQUARE_SIZE, y * SQUARE_SIZE))

    # Draw dragging piece on top
    if dragging_piece and drag_pos:
        mx, my = drag_pos
        key = f"{dragging_piece['color'][0]}_{dragging_piece['name']}"
        img = PIECE_IMAGES.get(key)
        if img:
            win.blit(img, (mx - SQUARE_SIZE // 2, my - SQUARE_SIZE // 2))

# Main loop
def main():
    load_images()
    board = get_starting_board()
    dragging = False
    selected_pos = None
    dragging_piece = None
    turn = 'w'  # White starts

    run = True
    clock = pygame.time.Clock()

    while run:
        clock.tick(60)
        WIN.fill((0, 0, 0))
        draw_board(WIN, board, dragging_piece, pygame.mouse.get_pos() if dragging else None, selected_pos)
        pygame.display.update()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False

            elif event.type == pygame.MOUSEBUTTONDOWN:
                mx, my = pygame.mouse.get_pos()
                x, y = coords_to_pos(mx, my)

                if 0 <= x < 8 and 0 <= y < 8:
                    piece = board[y][x]
                    if piece and piece['color'] == turn:
                        dragging = True
                        selected_pos = (x, y)
                        dragging_piece = piece
                        board[y][x] = None

            elif event.type == pygame.MOUSEBUTTONUP and dragging:
                mx, my = pygame.mouse.get_pos()
                tx, ty = coords_to_pos(mx, my)

                sx, sy = selected_pos
                if 0 <= tx < 8 and 0 <= ty < 8:
                    board[ty][tx] = dragging_piece
                    turn = 'b' if turn == 'w' else 'w'  # Switch turn
                else:
                    board[sy][sx] = dragging_piece  # Invalid drop, revert

                dragging = False
                dragging_piece = None
                selected_pos = None

    pygame.quit()


if __name__ == "__main__":
    main()
