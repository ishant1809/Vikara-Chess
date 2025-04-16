var board = null;
var game = new Chess();
var $status = $('#status');
var $fen = $('#fen');
var $pgn = $('#pgn');
let c_player = null;
let currentMatchTime = null;
let timerInstance = null;

function startTimer(seconds, container, oncomplete) {
  let startTime, timer, obj;
  let ms = seconds * 1000;
  const display = document.getElementById(container);

  obj = {};

  obj.resume = function () {
    startTime = new Date().getTime();
    timer = setInterval(obj.step, 250);
  };

  obj.pause = function () {
    ms = obj.step();
    clearInterval(timer);
  };

  obj.step = function () {
    const now = Math.max(0, ms - (new Date().getTime() - startTime));
    const m = Math.floor(now / 60000);
    const s = Math.floor(now / 1000) % 60;
    display.innerHTML = m + ":" + (s < 10 ? "0" : "") + s;

    if (now === 0) {
      clearInterval(timer);
      obj.resume = function () { };
      if (oncomplete) oncomplete();
    }

    return now;
  };

  obj.resume();
  return obj;
}

function onDragStart(source, piece, position, orientation) {
  if (game.turn() != c_player) return false;
  if (game.game_over()) return false;
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
}

function onDrop(source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  socket.emit('sync_state', game.fen(), game.turn());

  if (timerInstance) {
    timerInstance.pause();
  }

  updateStatus();
}

function onSnapEnd() {
  board.position(game.fen());
}

function updateStatus() {
  var status = '';
  var moveColor = (game.turn() === 'b') ? 'Black' : 'White';

  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  } else if (game.in_draw()) {
    status = 'Game over, drawn position';
  } else {
    status = moveColor + ' to move';
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  $status.html(status);
  $fen.html(game.fen());
  $pgn.html(game.pgn());
}

function onChange() {
  if (game.game_over()) {
    if (game.in_checkmate()) {
      const winner = game.turn() === 'b' ? 'white' : 'black';
      socket.emit("game_over", winner);
    }
  }
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onChange: onChange
};

board = Chessboard('myBoard', config);
updateStatus();

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
    button.addEventListener('click', handleButtonClick);
  }
});

const socket = io('http://localhost:3000');

socket.on("total_players_count_change", function (totalPlayersCount) {
  $("#total_players").html("Total Players: " + totalPlayersCount);
});

socket.on("match_made", (color, time) => {
  c_player = color;
  currentMatchTime = time;

  $('#main-element').show();
  $('#waiting_text_p').hide();
  $("#buttonsParent").html(
    '<p id="yaps">You are playing as ' + (color === 'b' ? 'BLACK' : 'WHITE') + '</p>' +
    '<p id="timerDisplay"></p>'
  );

 $("#buttonsParent").addClass('flex-col');
  game.reset();
  board.clear();
  board.start();
  board.orientation(color === 'b' ? 'black' : 'white');

  if (game.turn() === c_player) {
    timerInstance = startTimer(Number(time) * 60, "timerDisplay", function () {
      alert("Time over!");
    });
  } else {
    timerInstance = null;
    $('#timerDisplay').html(currentMatchTime+ ":00")
  }
});

socket.on('sync_state_from_server', function (fen, turn) {
  game.load(fen);
  board.position(fen);
  onChange();

  if (game.turn() === c_player) {
    if (timerInstance) {
      timerInstance.resume();
    } else {
      timerInstance = startTimer(Number(currentMatchTime) * 60, "timerDisplay", function () {
        alert("Time over!");
      });
    }
  } else {
    if (timerInstance) {
      timerInstance.pause();
    }
  }
});

socket.on("game_over_from_server", function (winner) {
  alert(winner + " won the match");
  window.location.reload();
});

