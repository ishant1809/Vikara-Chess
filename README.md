# Vikara Chess 

## Overview
Derived from the Sanskrit word **विकार (Vikāra)**, meaning **change** or **transformation**.
**Vikara Chess** is a chess variant that introduces the **Vikara Rule**, transforming captured pieces into the same type but with the color of the player who captured it. While the game largely follows the rules of traditional chess, the Vikara Rule adds a new layer of strategy.

## Key Features

- **Vikara Rule**: When a piece is captured, it transforms into the same type of piece, but the color is preserved.
  
- **No Transformation of King**: Unlike other pieces, the King does not follow the Vikara Rule. The King remains unchanged regardless of capture.
  
- **Disadvantageous Captures**: If a piece captures another that is lower in hierarchy (e.g., a knight capturing a pawn or a queen capturing a rook), the player who makes this capture will face a strategic disadvantage. This forces players to rethink their approach and avoid unnecessary exchanges that could hurt their position.
  
- **Standard Chess Rules**: All the standard rules of chess apply except for the Vikara Rule and the new calculation for piece captures, ensuring the game still feels familiar and strategic to chess enthusiasts.
  
- **New Way of Calculating Moves**: The introduction of the Vikara Rule and the disadvantageous captures means the way moves are calculated is entirely new. Players must factor in the possible consequences of capturing pieces lower in hierarchy and plan their moves accordingly.

- **Real-Time Multiplayer**: Play against another player in real-time, with moves synchronized across both players' screens.

- **Game Over Conditions**: The game can end with checkmate or when a player's time runs out.

## FEN (Forsyth-Edwards Notation)

Vikara Chess uses FEN to represent the board state, with the transformation of captured pieces reflected in the notation.

## Technologies Used

- **Node.js**: For backend server and handling real-time communication.
- **Express.js**: Framework used for handling HTTP requests.
- **Socket.io**: Real-time bi-directional communication between the client and server.
- **chessboard.js**: Library for displaying and interacting with the chessboard UI.
- **HTML/CSS/JavaScript**: Used for the frontend interface and functionality.
- **FEN (Forsyth-Edwards Notation)**: Used to represent the game state and synchronize moves across players.

## File Structure

The project contains the following structure:

```
vikara-chess/
├── img/                 # Contains images for chess pieces and background
│   ├── white-king.png
│   ├── white-queen.png
│   ├── black-pawn.png
│   └── ...              # Other chess pieces and background images
├── lib/                 # Core game logic files
│   ├── chess.js         # Handles the game logic and Vikara Rule implementation
│   └── chessboard.js    # UI component for rendering the chessboard
├── node_modules/        # npm dependencies
├── index.html           # Main HTML file for the game's frontend
├── package-lock.json    # npm lock file to manage dependencies
├── package.json         # npm configuration file
├── script.js            # JavaScript for frontend game logic
├── socket.js            # Socket.io server-client communication setup
└── style.css            # CSS for styling the game interface
```

## Installation

To run this project locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/ishant1809/Vikara-Chess.git
   ```

2. Navigate to the project directory:

   ```bash
   cd Vikara-Chess
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open the game in your browser:

   Go to `http://localhost:3000` in your browser.

## How to Play

1. **Setup**: Upon opening the game, you will see a chessboard with all pieces in their starting positions.
  
2. **Gameplay**:
   - Players take turns to move pieces according to standard chess rules.
   - When you capture an opponent's piece, it is transformed into the same type of piece with your color.
   - **Disadvantageous Captures**: If a piece captures another that is lower in hierarchy (e.g., a knight capturing a pawn), the player who makes this capture will face a strategic disadvantage. Players must avoid these types of captures, as it will negatively affect their position.
   - The game ends with either checkmate or when a player's time runs out.
  
3. **Timers**: You can choose your preferred time for the game (10, 15, or 20 minutes) for an added challenge.

4. **Winning**: The game is won either through checkmate or when your opponent's time runs out.

## Contributing

To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-name`).
6. Create a new Pull Request.


## Acknowledgements

- **chessboard.js** for the chessboard UI.
- **Socket.io** for real-time multiplayer functionality.
