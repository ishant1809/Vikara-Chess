/**
 * Vikara Chess Client
 * Refactored for better performance, UI feedback, and stability.
 */

class VikaraChess {
    constructor() {
        this.board = null;
        this.game = new Chess();
        this.c_player = null; // 'w' or 'b'
        this.currentMatchTime = null;
        this.timerInstance = null;
        this.socket = io(); // Connects to the same host that served the page

        this.$status = $('#status');
        this.$pgn = $('#pgn');
        this.$timer = $('#timerDisplay');
        this.$waiting = $('#waiting_text_p');
        this.$main = $('#main-element');
        this.$yaps = $('#yaps');

        this.init();
    }

    init() {
        const config = {
            draggable: true,
            position: 'start',
            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onSnapEnd: this.onSnapEnd.bind(this),
            onMouseoverSquare: this.onMouseoverSquare.bind(this),
            onMouseoutSquare: this.onMouseoutSquare.bind(this)
        };

        this.board = Chessboard('myBoard', config);
        this.setupSocketListeners();
        this.setupUIListeners();
        this.updateStatus();
    }

    setupUIListeners() {
        $('.timer-button').on('click', (e) => {
            const time = $(e.target).data('time');
            this.socket.emit('want_to_play', time);
            this.$main.addClass('display-none');
            this.$waiting.removeClass('display-none');
        });
    }

    setupSocketListeners() {
        this.socket.on("total_players_count_change", (count) => {
            $("#total_players").text("Players Online: " + count);
        });

        this.socket.on("match_made", (color, time) => {
            this.c_player = color;
            this.currentMatchTime = time;

            this.$main.removeClass('display-none');
            this.$waiting.addClass('display-none');
            this.$yaps.removeClass('display-none').text(`Playing as ${color === 'b' ? 'BLACK' : 'WHITE'}`);
            
            this.game.reset();
            this.board.start();
            this.board.orientation(color === 'b' ? 'black' : 'white');

            this.resetTimer();
            if (this.game.turn() === this.c_player) {
                this.startTimerLogic();
            } else {
                this.$timer.text(`${this.currentMatchTime}:00`);
            }
        });

        this.socket.on('move_made', (data) => {
            const { fen, turn, lastMove, isGameOver, winner } = data;
            
            this.game.load(fen);
            this.board.position(fen);
            this.updateStatus();
            
            if (lastMove) {
                this.highlightLastMove(lastMove.from, lastMove.to);
            }

            if (this.game.turn() === this.c_player) {
                if (this.timerInstance) this.timerInstance.resume();
                else this.startTimerLogic();
            } else {
                if (this.timerInstance) this.timerInstance.pause();
            }

            if (isGameOver && winner) {
                this.showGameOver(winner);
            }
        });

        this.socket.on("game_over_from_server", (winner) => {
            this.showGameOver(winner);
        });

        this.socket.on("opponent_disconnected", () => {
            alert("Opponent disconnected. You win!");
            window.location.reload();
        });
    }

    // --- Timer Logic ---
    startTimerLogic() {
        if (!this.currentMatchTime) return;
        const seconds = Number(this.currentMatchTime) * 60;
        this.timerInstance = this.createTimer(seconds, (timeStr) => {
            this.$timer.text(timeStr);
        }, () => {
            alert("Time over!");
            this.socket.emit("game_over", this.c_player === 'w' ? 'black' : 'white');
        });
    }

    createTimer(seconds, onTick, onComplete) {
        let ms = seconds * 1000;
        let startTime;
        let interval;
        const obj = {};

        obj.step = () => {
            const now = Math.max(0, ms - (new Date().getTime() - startTime));
            const m = Math.floor(now / 60000);
            const s = Math.floor(now / 1000) % 60;
            onTick(`${m}:${s < 10 ? "0" : ""}${s}`);

            if (now === 0) {
                clearInterval(interval);
                onComplete();
            }
            return now;
        };

        obj.resume = () => {
            startTime = new Date().getTime();
            interval = setInterval(obj.step, 250);
        };

        obj.pause = () => {
            ms = obj.step();
            clearInterval(interval);
        };

        obj.resume();
        return obj;
    }

    resetTimer() {
        if (this.timerInstance) {
            if (this.timerInstance.interval) clearInterval(this.timerInstance.interval);
            this.timerInstance = null;
        }
    }

    // --- Chess Logic ---
    onDragStart(source, piece, position, orientation) {
        if (this.game.game_over()) return false;
        if (this.game.turn() !== this.c_player) return false;
        if ((this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }
    }

    onDrop(source, target) {
        this.removeGreySquares();

        // Perform local move validation using the library
        const move = this.game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        // If move is illegal locally, snap back immediately
        if (move === null) return 'snapback';

        /**
         * Authoritative Sync Strategy:
         * We undo the local move immediately to wait for the server's confirmation.
         * This ensures that if the server logic (like 'Become what you capture') 
         * changes the piece or the state, we don't end up with a desynced UI.
         */
        this.game.undo();

        // Emit only the intent (move coordinates) to the server
        this.socket.emit('make_move', { from: source, to: target, promotion: 'q' });
        
        // Pause timer locally until it's the opponent's turn (confirmed by server)
        if (this.timerInstance) this.timerInstance.pause();
    }



    onSnapEnd() {
        this.board.position(this.game.fen());
    }

    updateStatus() {
        let status = '';
        let moveColor = (this.game.turn() === 'b') ? 'Black' : 'White';

        if (this.game.in_checkmate()) {
            status = `Game over, ${moveColor} checkmated.`;
        } else if (this.game.in_draw()) {
            status = 'Game over, draw.';
        } else {
            status = `${moveColor} to move`;
            if (this.game.in_check()) status += ' (Check!)';
        }

        this.$status.text(status);
        this.$pgn.text(this.game.pgn());
    }

    showGameOver(winner) {
        const message = winner.toUpperCase() + " WINS!";
        this.$status.html(`<span style="color: var(--accent-emerald)">${message}</span>`);
        setTimeout(() => {
            alert(message);
            window.location.reload();
        }, 500);
    }

    highlightLastMove(from, to) {
        $('#myBoard .square-55d63').removeClass('last-move');
        $(`#myBoard .square-${from}`).addClass('last-move');
        $(`#myBoard .square-${to}`).addClass('last-move');
    }

    // --- UI Helpers ---
    removeGreySquares() {
        $('#myBoard .square-55d63').css('background', '');
    }

    greySquare(square) {
        const $square = $(`#myBoard .square-${square}`);
        const background = $square.hasClass('black-3c85d') ? '#696969' : '#a9a9a9';
        $square.css('background', background);
    }

    onMouseoverSquare(square, piece) {
        if (this.game.turn() !== this.c_player) return;
        
        const moves = this.game.moves({
            square: square,
            verbose: true
        });

        if (moves.length === 0) return;

        this.greySquare(square);
        moves.forEach(m => this.greySquare(m.to));
    }

    onMouseoutSquare(square, piece) {
        this.removeGreySquares();
    }
}

$(document).ready(() => {
    window.app = new VikaraChess();
});