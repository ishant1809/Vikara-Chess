import pygame
import os
from board import Board
from utils import coords_to_pos

pygame.init()

# Load piece images
PIECE_IMAGES = {}

def load_images():
    pieces = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king']
    colors = ['w', 'b']
    for color in colors:
        for piece in pieces:
            filename = f"{color}_{piece}.png"
            path = os.path.join('assets', filename)
            image = pygame.image.load(path)
            image = pygame.transform.scale(image, (80, 80))
            PIECE_IMAGES[f"{color}_{piece}"] = image

# Constants
WIDTH, HEIGHT = 640, 640
WIN = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Vikara Chess")

board = Board()

def draw_board(win, board_obj, dragging_piece=None, drag_pos=None, skip_pos=None):
    colors = [(240, 217, 181), (181, 136, 99)]
    for y in range(8):
        for x in range(8):
            pygame.draw.rect(win, colors[(x + y) % 2], (x * 80, y * 80, 80, 80))

            if (x, y) == skip_pos:
                continue

            piece = board_obj.grid[y][x]
            if piece:
                img_key = f"{piece.color[0]}_{piece.name}"
                img = PIECE_IMAGES.get(img_key)
                if img:
                    win.blit(img, (x * 80, y * 80))

    if dragging_piece and drag_pos:
        mx, my = drag_pos
        img_key = f"{dragging_piece.color[0]}_{dragging_piece.name}"
        img = PIECE_IMAGES.get(img_key)
        if img:
            win.blit(img, (mx - 40, my - 40))  # center image on cursor

def main():
    load_images()
    run = True
    dragging = False
    selected_pos = None
    dragging_piece = None

    while run:
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
                    piece = board.grid[y][x]
                    if piece and piece.color == board.current_turn:
                        selected_pos = (x, y)
                        dragging = True
                        dragging_piece = piece
                        board.grid[y][x] = None  # temporarily remove piece from board while dragging

            elif event.type == pygame.MOUSEBUTTONUP and dragging:
                mx, my = pygame.mouse.get_pos()
                tx, ty = coords_to_pos(mx, my)

                sx, sy = selected_pos
                current_piece = dragging_piece

                if 0 <= tx < 8 and 0 <= ty < 8 and current_piece:
                    legal_moves = current_piece.get_moves(board.grid, sx, sy)
                    if (tx, ty) in legal_moves:
                        captured_piece = board.grid[ty][tx]
                        board.move_piece((sx, sy), (tx, ty))

                        if captured_piece:
                            board.grid[ty][tx].name = captured_piece.name  # Vikara rule

                        board.current_turn = 'black' if board.current_turn == 'white' else 'white'
                    else:
                        board.grid[sy][sx] = current_piece  # invalid move, revert
                else:
                    board.grid[sy][sx] = current_piece  # out of bounds, revert

                dragging = False
                selected_pos = None
                dragging_piece = None

    pygame.quit()

if __name__ == "__main__":
    main()
