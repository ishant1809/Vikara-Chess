import pygame
import os
from board import Board
from utils import pos_to_coords, coords_to_pos

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

WIDTH, HEIGHT = 640, 640
WIN = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Vikara Chess")

board = Board()

def draw_board(win, board_obj, selected=None, drag_piece=None, drag_pos=None):
    colors = [(240, 217, 181), (181, 136, 99)]
    for y in range(8):
        for x in range(8):
            color = colors[(x + y) % 2]
            pygame.draw.rect(win, color, (x*80, y*80, 80, 80))
            piece = board_obj.grid[y][x]
            if piece and (not selected or (x, y) != selected):
                img_key = f"{piece.color[0]}_{piece.name}"
                img = PIECE_IMAGES.get(img_key)
                if img:
                    win.blit(img, (x*80, y*80))

    # Draw dragged piece on top
    if drag_piece and drag_pos:
        mx, my = drag_pos
        img_key = f"{drag_piece.color[0]}_{drag_piece.name}"
        img = PIECE_IMAGES.get(img_key)
        if img:
            win.blit(img, (mx - 40, my - 40))  # Center under mouse

def main():
    load_images()
    selected = None
    dragging = False
    drag_piece = None
    drag_pos = None

    run = True
    while run:
        draw_board(WIN, board, selected, drag_piece, drag_pos)
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
                        selected = (x, y)
                        dragging = True
                        drag_piece = piece
                        drag_pos = (mx, my)

            elif event.type == pygame.MOUSEMOTION and dragging:
                drag_pos = pygame.mouse.get_pos()

            elif event.type == pygame.MOUSEBUTTONUP and dragging:
                dragging = False
                mx, my = pygame.mouse.get_pos()
                tx, ty = coords_to_pos(mx, my)

                if selected and 0 <= tx < 8 and 0 <= ty < 8:
                    sx, sy = selected
                    current_piece = board.grid[sy][sx]

                    if current_piece and (tx, ty) in current_piece.get_moves(board.grid, sx, sy):
                        captured_piece = board.grid[ty][tx]
                        board.move_piece((sx, sy), (tx, ty))

                        if captured_piece:
                            board.grid[ty][tx].name = captured_piece.name

                        board.current_turn = 'black' if board.current_turn == 'white' else 'white'

                # Reset selection and drag
                selected = None
                drag_piece = None
                drag_pos = None

    pygame.quit()

if __name__ == "__main__":
    main()
