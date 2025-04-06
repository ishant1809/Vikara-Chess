class Piece:
    def __init__(self, name, color):
        self.name = name
        self.color = color
        self.has_moved = False

    def get_image_name(self):
        return f"{self.color[0]}_{self.name}.png"


    def get_moves(self, board, x, y):
        # Add movement logic for each piece type
        # Return a list of legal moves [(new_x, new_y), ...]
        moves = []
        # Sample for rook (can extend to others)
        if self.name == 'rook':
            directions = [(1,0), (-1,0), (0,1), (0,-1)]
            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                while 0 <= nx < 8 and 0 <= ny < 8:
                    if board[ny][nx] is None:
                        moves.append((nx, ny))
                    elif board[ny][nx].color != self.color:
                        moves.append((nx, ny))
                        break
                    else:
                        break
                    nx += dx
                    ny += dy
        # Implement other pieces
        return moves
