
var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
let c_player = null;

function onDragStart(source, piece, position, orientation) {
  if (game.turn() != c_player) {
    return false;
  } 
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback';
  socket.emit('sync_state',game.fen(),game.turn())
  updateStatus();
}


function onChange (){
  if(game.game_over()){
    if(game.in_checkmate()){
      const winner=game.turn()=== 'b' ? 'white':'black';
      socket.emit("game_over",winner)
    }
  }

}








// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen())
}

function updateStatus() {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onChange: onChange,
};
board = Chessboard('myBoard', config)



updateStatus()


function handleButtonClick(event) {
  const timer = Number(event.target.getAttribute('data-time'));
  socket.emit('want_to_play', timer);
  $('#main-element').hide();
  $('#waiting_text_p').show();



}

document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.getElementsByClassName("timer-button");
  for (let index = 0; index < buttons.length; index++) {
    const button = buttons[index];
    button.addEventListener('click', handleButtonClick)
  }
});

const socket = io('http://localhost:3000');
socket.on("total_players_count_change", function (totalPlayersCount) {
  $("#total_players").html("Total Players: " + totalPlayersCount)
});

socket.on("match_made", (color) => {
  c_player = color;
  $('#main-element').show();
  $('#waiting_text_p').hide();
  $("#buttonsParent").html('<p id="yaps">You are playing as ' + (color === 'b' ? 'BLACK' : 'WHITE') + '</p>');
  game.reset();
  board.clear();
  board.start();
  board.orientation(color === 'b' ? 'black' : 'white');


});

socket.on('sync_state_from_server', function(fen, turn){
  game.load(fen);
  game.setTurn(turn);
  board.position(fen);
  onChange(); // <- THIS IS THE FIX!
});



socket.on("game_over_from_server",function(winner){

  const message=winner=== c_player ? "YOU WON" : "YOU LOST";
  alert(message);
  window.location.reload();
})