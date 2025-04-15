const { createServer } = require("http");
const { Server } = require("socket.io");
const PORT = 3000;
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["*"]
    }
});
let totalPlayers = 0;
let players = {};

function fireTotalPlayers() {
    io.emit('total_players_count_change', totalPlayers);
}

function FireonDisConnect(socket) {
    totalPlayers--;
    fireTotalPlayers();
}

function FireOnConnected(socket) {
    totalPlayers++;
    fireTotalPlayers();
}

io.on("connection", (socket) => {
    players[socket.id] = socket
    FireOnConnected(socket)

    socket.on('disconnect', () => FireonDisConnect(socket));

});

httpServer.listen(PORT, function () {
    console.log("Server running at port " + PORT);
});
