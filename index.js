const gameBoard = (function () {
	const _states = {
		empty: null,
		player1: 69,
		player2: 420,
	};

	const _AI = { state: _states.player2, level: 'normal' };

	const _board = Array(9).fill(_states.empty);

	// returns the winning player or _states.empty
	const _checkVictory = function () {
		if (_hasWon(_states.player1)) return _states.player1;
		if (_hasWon(_states.player2)) return _states.player2;
		return _states.empty;
	};

	// each of these number's binary representation contains three 1s
	// in a combination that corresponds to a victory when put on the board
	// every other bit is 0
	const _winningNumbers = [448, 292, 273, 146, 84, 73, 56, 7];

	// for each winning combination, if the number representing the player's moves
	// has three 0es corresponding to the combination the player wins
	// (move (bitwise) OR winning number) === move + winning number
	const _hasWon = function (player) {
		const moves = _getMoves(player);
		for (let i = _winningNumbers.length - 1; i >= 0; i--)
			if ((moves | _winningNumbers[i]) === moves + _winningNumbers[i])
				return true;
		return false;
	};

	// returns a number whose binary representation
	// has the same length as the board,
	// has 0es corresponding to the player's moves
	// 1s everywhere else
	const _getMoves = function (player) {
		// logically equivalent, but less performant implementation
		// return parseInt(_board.map(tile => Number(tile !== player)).join(''), 2);
		let move = 0;
		for (let i = _board.length - 1; i >= 0; i--) {
			if (_board[i] !== player) move += 1 << i;
		}
		return move;
	};

	const _isFull = function () {
		return _board.every(tile => tile !== _states.empty);
	};

	const _AIMove = function () {
		return {
			player: _AI.state,
			index: _AI.level === 'normal' ? _AIMoveNormal() : _AIMoveEasy(),
		};
	};

	// returns
	const _AIMoveNormal = function () {
		return _AIThreeAdjacent() ?? _AITwoAdjacent() ?? _AIMoveEasy();
	};

	// checks if the AI can win this turn,
	// returns index of move or false if it can't
	const _AIThreeAdjacent = function () {
		for (let i = _board.length - 1; i >= 0; i--)
			if (_board[i] === _states.empty) {
				_board[i] = _AI.state;
				if (_hasWon(_AI.state)) {
					_board[i] = _states.empty;
					return i;
				}
				_board[i] = _states.empty;
			}
		return null;
	};

	// check if the AI can win in two moves
	const _AITwoAdjacent = function () {
		for (let i = _board.length - 1; i >= 0; i--)
			if (_board[i] === _states.empty) {
				_board[i] = _AI.state;
				for (let j = i - 1; j >= 0; j--) {
					_board[j] = _AI.state;
					if (_hasWon(_AI.state)) {
						_board[i] = _states.empty;
						_board[j] = _states.empty;
						return _random(2) ? i : j;
					}
					_board[j] = _states.empty;
				}
				_board[i] = _states.empty;
			}
		return null;
	};

	//returns a the index of a random empty tile
	const _AIMoveEasy = function () {
		for (let i = _board.length - 1; i >= 0; i--)
			if (_board.length[i] === _states.empty) return i;
	};

	const _random = function (n) {
		return Math.floor(Math.random() * n);
	};

	//updates the tile and returns true if it is empty
	//returns false if it is not
	const update = function (move) {
		//validity checks
		if (move.player !== _states.player1 && move.player !== _states.player2)
			throw 'invalid player for gameBoard';
		if (move.index > _board.length - 1) throw 'invalid index for gameBoard';
		//return false if the updated tile is not empty
		if (_board[move.index] !== _states.empty) return false;
		//assignment
		_board[move.index] = move.player;
		return true;
	};

	//returns an object if the game is over
	//returns false if it is not
	const gameOver = function () {
		const winner = _checkVictory();
		if (winner !== _states.empty)
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
		for (let i = 0; i < _board.length; i++) _board[i] = _states.empty;
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
