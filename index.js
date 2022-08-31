const gameBoard = (function () {
	const _states = {
		empty: null,
		player1: 1,
		player2: 2,
	};

	const _board = Array(9).fill(_states.empty);

	//returns false for no winner or winning player
	const _checkVictory = function () {
		//horizontal
		for (let i = 0; i < _board.length; i += 3)
			if (_checkAdjacent(i, 1)) return _board[i];
		//vertical
		for (let i = 0; i < 3; i++) {
			if (_checkAdjacent(i, 3)) return _board[i];
		}
		//diagonal
		if (_checkAdjacent(0, 4) || _checkAdjacent(2, 2)) return _board[4];
		return false;
	};

	//checks tiles in a single row / column / diagonal for victory
	const _checkAdjacent = function (index, increment) {
		if (
			_board[index] !== _states.empty &&
			_board[index] === _board[index + increment] &&
			_board[index] === _board[index + increment * 2]
		)
			return _board[index];
		return false;
	};

	const _isFull = function () {
		return _board.forEach(tile => tile !== _states.empty);
	};

	//updates the tile and returns true if it is empty
	//returns false if it is not
	const update = function (player, index) {
		//validity checks
		if (player !== _states.player1 && player !== _states.player2)
			throw 'invalid player for gameBoard';
		if (index > _board.length - 1) throw 'invalid index for gameBoard';
		//return false if the updated tile is not empty
		if (_board[index] !== _states.empty) return false;
		//assignment
		_board[index] = player;
		return true;
	};

	//returns an object if the game is over
	//returns false if it is not
	const gameOver = function () {
		const winner = _checkVictory();
		if (winner)
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

// const displayController = (function () {})();

// function Player() {}
