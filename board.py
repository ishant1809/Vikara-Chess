from piece import Piece

class Board:
    def __init__(self):
        self.grid = [[None]*8 for _ in range(8)]
        self.current_turn = 'white'
        self.init_board()

    def init_board(self):
        # Initialize pawns
        for i in range(8):
            self.grid[1][i] = Piece('pawn', 'black')
            self.grid[6][i] = Piece('pawn', 'white')
        
        # Add other pieces
        order = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
        for i, name in enumerate(order):
            self.grid[0][i] = Piece(name, 'black')
            self.grid[7][i] = Piece(name, 'white')

    def move_piece(self, start, end):
        x1, y1 = start
        x2, y2 = end
        piece = self.grid[y1][x1]
        target = self.grid[y2][x2]

        if target and target.color != piece.color:
            # VIKARA transformation rule
            piece.name = target.name
        
        self.grid[y2][x2] = piece
        self.grid[y1][x1] = None
        piece.has_moved = True
        self.current_turn = 'black' if self.current_turn == 'white' else 'white'
