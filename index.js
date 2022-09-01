const AILevels = {
	none: Symbol('none'),
	easy: Symbol('easy'),
	normal: Symbol('normal'),
};

const outcomes = {
	victory: Symbol('victory'),
	draw: Symbol('draw'),
};

function gamePlayers(player1, player2) {
	if (
		!(typeof player1 === 'object' && 'sign' in player1 && 'AI' in player1) ||
		!(typeof player2 === 'object' && 'sign' in player2 && 'AI' in player2)
	)
		throw 'Invalid players';
	return {
		empty: { sign: Symbol('empty') },
		player1,
		player2,
		getPlayer: function (sign) {
			if (this.player1.sign === sign) return this.player1;
			if (this.player2.sign === sign) return this.player2;
		},
		getOpponent: function (sign) {
			if (this.getPlayer(sign) === this.player1) return this.player2;
			if (this.getPlayer(sign) === this.player2) return this.player1;
		},
		currentPlayer: function () {
			if (this.player1.current) return this.player1;
			if (this.player2.current) return this.player2;
		},
		passTurn: function () {
			this.player1.current = !this.player1.current;
			this.player2.current = !this.player2.current;
		},
	};
}

function Player(name, current = false, AI = AILevels.none) {
	return { name, current: !!current, AI, sign: Symbol(name) };
}

const game = (function () {
	let _players;

	const _board = Array(9);

	// returns the winning player or _states.empty
	const _checkVictory = function () {
		if (_hasWon(_players.player1.sign)) return _players.player1.sign;
		if (_hasWon(_players.player2.sign)) return _players.player2.sign;
		return _players.empty.sign;
	};

	// each of these number's binary representation contains three 1s
	// in a combination that corresponds to a victory when put on the board
	// every other bit is 0
	const _winningNumbers = [448, 292, 273, 146, 84, 73, 56, 7];

	// for each winning combination, if the number representing the player's moves
	// has three 0es corresponding to the combination the player wins
	// (move (bitwise) OR winning number) === move + winning number
	//
	// EX: X O X
	//		 O X O	= 0 1 0 1 0 1 1 0 0
	// 		 O X X
	//
	//			  273 = 1 0 0 0 1 0 0 0 1
	//
	//   board				273
	// 010101100 | 100010001 = 110111101
	// 010101100 + 100010001 = 110111101
	const _hasWon = function (sign) {
		const moves = _getMoves(sign);
		for (let i = _winningNumbers.length - 1; i >= 0; i--)
			if ((moves | _winningNumbers[i]) === moves + _winningNumbers[i])
				return true;
		return false;
	};

	// returns a number whose binary representation
	// has the same length as the board,
	// has 0es corresponding to the player's moves
	// 1s everywhere else
	const _getMoves = function (sign) {
		// logically equivalent, but less performant implementation
		// return parseInt(_board.map(tile => Number(tile !== player)).join(''), 2);
		let move = 0;
		for (let i = _board.length - 1; i >= 0; i--) {
			if (_board[i] !== sign) move += 1 << i;
		}
		return move;
	};

	const _isFull = function () {
		return _board.every(tile => tile !== _players.empty.sign);
	};

	const _AIMove = function (player) {
		let moves =
			player.AI === AILevels.normal
				? _AIMovesNormal(player.sign)
				: player.AI === AILevels.easy
				? _AIMovesEasy()
				: null;

		if (!moves) throw `No available moves for AI: ${player}`;

		// removes duplicates (on second thought I am pretty sure I don't want this)
		// moves = moves.filter((move, index, arr) => arr.indexOf(move) === index);

		return {
			sign: player.sign,
			index: moves[_random(moves.length)],
		};
	};

	// returns an array of possible indexes for the AI move,
	// checking the most strategic indexes first
	const _AIMovesNormal = function (sign) {
		return (
			_threeAdjacent(sign) ?? //check winning move
			_threeAdjacent(_players.getOpponent(sign).sign) ?? //block player from winning
			_twoAdjacent(sign) ?? //move towards winning move
			_twoAdjacent(_players.getOpponent(sign).sign) ?? //get in the way
			_AIMovesEasy() //random move
		);
	};

	// checks if the player can win this turn,
	// returns array of winning indexes or false
	const _threeAdjacent = function (sign) {
		let moves = [];

		for (let i = _board.length - 1; i >= 0; i--)
			if (_board[i] === _players.empty.sign) {
				_board[i] = sign;
				if (_hasWon(sign)) moves.push(i);
				_board[i] = _players.empty.sign;
			}

		return moves.length ? moves : null;
	};

	// checks if the player can win in two moves,
	// returns array of indexes contributing to win or false
	const _twoAdjacent = function (sign) {
		let moves = [];

		for (let i = _board.length - 1; i >= 0; i--)
			if (_board[i] === _players.empty.sign) {
				_board[i] = sign;
				for (let j = i - 1; j >= 0; j--) {
					if (_board[j] === _players.empty.sign) {
						_board[j] = sign;
						if (_hasWon(sign)) {
							moves.push(i, j);
						}
						_board[j] = _players.empty.sign;
					}
				}
				_board[i] = _players.empty.sign;
			}

		return moves.length ? moves : null;
	};

	//returns the index of every empty tile
	const _AIMovesEasy = function () {
		let moves = [];

		for (let i = _board.length - 1; i >= 0; i--)
			if (_board[i] === _players.empty.sign) moves.push(i);

		return moves.length ? moves : null;
	};

	const _random = function (n) {
		return Math.floor(Math.random() * n);
	};

	//starts the game
	const start = function (players) {
		_players = players;
		for (let i = 0; i < _board.length; i++) _board[i] = _players.empty.sign;
	};

	//calls the AI if the current player is an AI
	//updates the tile and returns true if it is empty
	//returns false if it is not
	const update = function (index) {
		//validity checks
		if (index >= _board.length || index < 0)
			throw 'invalid index for gameBoard';
		//call AI if function was called with a player corresponding to an AI
		if (_players.currentPlayer().AI !== AILevels.none) {
			const AIMove = _AIMove(_players.currentPlayer());
			_board[AIMove.index] = AIMove.sign;
			return AIMove.index;
		}
		//return false if the updated tile is not empty
		if (_board[index] !== _players.empty.sign) return null;
		//assignment for human players
		_board[index] = _players.currentPlayer().sign;
		return index;
	};

	//returns an object if the game is over
	//returns false if it is not
	const gameOver = function () {
		const winner = _checkVictory();
		if (winner !== _players.empty.sign)
			return {
				outcome: outcomes.victory,
				winner: _players.getPlayer(winner),
			};
		if (_isFull())
			return {
				outcome: outcomes.draw,
			};
		return false;
	};

	//returns a (read only) copy of the board
	const getBoard = function () {
		return [..._board];
	};

	return { start, update, gameOver, getBoard };
})();

const gameBoard = (function (UIBoard) {
	const _players = gamePlayers(
		Player('player1', true),
		Player('player2', false, AILevels.normal)
	);
	game.start(_players);

	const _tiles = [...UIBoard.querySelectorAll('.tile')];

	_tiles.forEach(tile =>
		tile.addEventListener(
			'click',
			function () {
				_turn(_tiles.indexOf(this));
			}.bind(tile)
		)
	);

	const _turn = function (index) {
		const updatedIndex = game.update(index);
		if (updatedIndex !== null) {
			_tiles[updatedIndex].classList.add(_players.currentPlayer().name);
			_players.passTurn();
		}
		const gameOver = game.gameOver();
		if (gameOver) _gameOver(gameOver);
		else if (_players.currentPlayer().AI !== AILevels.none) _turn();
	};

	const _gameOver = function ({ outcome, winner }) {
		if (outcome === outcomes.victory) {
			UIBoard.classList.add(
				winner === _players.player1 ? 'victory-player1' : 'victory-player2'
			);
		} else UIBoard.classList.add('draw');
	};

	return {};
})(document.querySelector('.board'));
