const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { Chess } = require("chess.js");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Redis scaling support
/**
 * Redis Adapter Setup
 * This is crucial for horizontal scaling. By using Redis, we can run multiple 
 * instances of this server behind a load balancer. Socket.io events will 
 * be synchronized across all instances via Redis Pub/Sub.
 */
if (process.env.REDIS_URL) {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log("Scaling: Redis adapter connected");
    });
}

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "./")));
app.get("/health", (req, res) => res.status(200).send("OK"));

let totalPlayers = 0;
let players = {};
let games = {}; // roomId -> { chess, white, black, time }
let waiting = { 10: [], 15: [], 20: [] };
let socketToRoom = {};

function fireTotalPlayers() {
    io.emit('total_players_count_change', totalPlayers);
}

function removeFromWaiting(socketId) {
    [10, 15, 20].forEach(time => {
        waiting[time] = waiting[time].filter(id => id !== socketId);
    });
}

/**
 * Custom 'Become what you capture' Logic
 * Instead of standard chess, when a piece is captured, the capturing piece 
 * transforms into the captured piece type. This must be handled on the 
 * server to prevent client-side manipulation.
 */
function applyTransformation(chess, move) {
    if (!move.captured || move.piece === 'k') return;

    const fenParts = chess.fen().split(' ');
    const boardArr = fenParts[0].split('/');
    const target = move.to;
    const targetRank = 8 - parseInt(target[1]);
    const targetFile = target.charCodeAt(0) - 'a'.charCodeAt(0);

    // Keep the capturing player's color but change the piece type
    const transformedPiece = (move.color === 'w' ? move.captured.toUpperCase() : move.captured.toLowerCase());

    // FEN modification: expand compressed numbers, swap piece, re-compress
    let expanded = boardArr[targetRank].replace(/\d/g, d => '1'.repeat(d));
    expanded = expanded.substring(0, targetFile) + transformedPiece + expanded.substring(targetFile + 1);
    
    boardArr[targetRank] = expanded.replace(/1{1,8}/g, match => match.length);
    fenParts[0] = boardArr.join('/');
    
    // Repopulate current board state
    const finalFen = fenParts.join(' ');
    chess.load(finalFen);
}

function setupMatch(id1, id2, time) {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const s1 = players[id1];
    const s2 = players[id2];

    if (!s1 || !s2) return;

    s1.join(roomId);
    s2.join(roomId);
    socketToRoom[id1] = roomId;
    socketToRoom[id2] = roomId;

    const chess = new Chess();
    games[roomId] = {
        chess: chess,
        white: id1,
        black: id2,
        time: time
    };

    s1.emit("match_made", "w", time);
    s2.emit("match_made", "b", time);

    console.log(`Match started: ${roomId} (${time} min)`);
}

io.on("connection", (socket) => {
    players[socket.id] = socket;
    totalPlayers++;
    fireTotalPlayers();

    socket.on("want_to_play", (time) => {
        removeFromWaiting(socket.id);
        if (waiting[time] && waiting[time].length > 0) {
            const opponentId = waiting[time].shift();
            setupMatch(opponentId, socket.id, time);
        } else {
            if (waiting[time]) waiting[time].push(socket.id);
        }
    });

    socket.on("make_move", (moveData) => {
        /**
         * Authoritative Move Validation
         * We don't trust the FEN sent by the client. We only accept the 'from' 
         * and 'to' coordinates, validate them against the server-side chess instance, 
         * apply custom logic, and then broadcast the new state.
         */
        const chess = game.chess;
        const color = socket.id === game.white ? 'w' : 'b';

        if (chess.turn() !== color) return;

        try {
            const move = chess.move({
                from: moveData.from,
                to: moveData.to,
                promotion: moveData.promotion || 'q'
            });

            if (move) {
                // Apply our custom chess mutation
                applyTransformation(chess, move);
                
                // Sync everyone in the room
                io.to(roomId).emit("move_made", {
                    fen: chess.fen(),
                    turn: chess.turn(),
                    lastMove: move,
                    isGameOver: chess.isGameOver(),
                    winner: chess.isCheckmate() ? (color === 'w' ? 'white' : 'black') : (chess.isDraw() ? 'draw' : null)
                });
            }
        } catch (e) {
            // Silently catch invalid moves to avoid crashing the server on bad client input
            console.error("Invalid move attempt:", e.message);
        }
    });

    socket.on("game_over", (winner) => {
        const roomId = socketToRoom[socket.id];
        if (roomId) {
            io.to(roomId).emit("game_over_from_server", winner);
            delete games[roomId];
        }
    });

    socket.on('disconnect', () => {
        removeFromWaiting(socket.id);
        const roomId = socketToRoom[socket.id];
        if (roomId) {
            socket.to(roomId).emit("opponent_disconnected");
            delete socketToRoom[socket.id];
            delete games[roomId];
        }
        delete players[socket.id];
        totalPlayers--;
        fireTotalPlayers();
    });
});

httpServer.listen(PORT, () => {
    console.log(`Vikara Chess server running on port ${PORT}`);
});