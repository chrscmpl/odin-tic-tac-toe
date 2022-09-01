const _AILevels = {
	none: false,
	easy: 'easy',
	normal: 'normal',
};

const gameBoard = (function () {
	const _players = {
		empty: { sign: null },
		player1: { sign: 1, AI: _AILevels.none },
		player2: { sign: 2, AI: _AILevels.normal },
	};

	const _board = Array(9).fill(_players.empty.sign);

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
			player.AI === _AILevels.normal
				? _AIMovesNormal(player.sign)
				: player.AI === _AILevels.easy
				? _AIMovesEasy()
				: null;

		if (!moves) throw `No available moves for AI: ${player.sign}, ${player.AI}`;

		// removes duplicates (on second thought I am pretty sure I don't want this)
		// moves = moves.filter((move, index, arr) => arr.indexOf(move) === index);

		return {
			sign: player.sign,
			index: moves[_random(moves.length)],
		};
	};

	// returns an array of possible indexes for the AI move,
	// checking the most strategic indexes first
	const _AIMovesNormal = function (AIsign) {
		return (
			_threeAdjacent(AIsign) ?? //check winning move
			_threeAdjacent(_adversary(AIsign)) ?? //block player from winning
			_twoAdjacent(AIsign) ?? //move towards winning move
			_twoAdjacent(_adversary(AIsign)) ?? //get in the way
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

	const _adversary = function (sign) {
		if (sign === _players.player1.sign) return _players.player2.sign;
		if (sign === _players.player2.sign) return _players.player1.sign;
	};

	const _getPlayer = function (sign) {
		for (const player in _players)
			if (_players[player].sign === sign) return _players[player];
	};

	const _random = function (n) {
		return Math.floor(Math.random() * n);
	};

	//updates the tile and returns true if it is empty
	//returns false if it is not
	const update = function (move) {
		//validity checks
		if (
			move.player !== _players.player1.sign &&
			move.player !== _players.player2.sign
		)
			throw 'invalid player for gameBoard';
		if (move.index >= _board.length || move.index < 0)
			throw 'invalid index for gameBoard';
		//call AI if function was called with a player corresponding to an AI
		const player = _getPlayer(move.player);
		if (player.AI) {
			const AIMove = _AIMove(player);
			_board[AIMove.index] = AIMove.sign;
		}
		//return false if the updated tile is not empty
		else if (_board[move.index] !== _players.empty.sign) return false;
		//assignment for human players
		else _board[move.index] = move.player;
		return true;
	};

	//returns an object if the game is over
	//returns false if it is not
	const gameOver = function () {
		const winner = _checkVictory();
		if (winner !== _players.empty.sign)
			return {
				outcome: 'victory',
				winner,
			};
		if (_isFull())
			return {
				outcome: 'draw',
			};
		return false;
	};

	//sets every tile to empty
	const reset = function () {
		for (let i = 0; i < _board.length; i++) _board[i] = _players.empty.sign;
	};

	//returns a (read only) copy of the board
	const getBoard = function () {
		return [..._board];
	};

	return { update, gameOver, reset, getBoard };
})();

const displayController = (function (displayBoard, tileAttr) {
	return {};
})(document.querySelector('.board'), 'data-index');

// function Player() {}
