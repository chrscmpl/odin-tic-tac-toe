const gameBoard = (function () {
	const _states = {
		empty: null,
		player1: 1,
		player2: 2,
	};

	const _board = Array(9).fill(_states.empty);

	const update = function (player, index) {
		//checks
		if (player !== _states.player1 && player !== _states.player2)
			throw 'invalid player for gameBoard';
		if (index > _board.length - 1) throw 'invalid index for gameBoard';
		//return if not empty
		if (_board[index] !== _states.empty) return;
		//assignment
		_board[index] = player;
	};

	const checkWin = function () {
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

	const _checkAdjacent = function (index, increment) {
		if (
			_board[index] !== _states.empty &&
			_board[index] === _board[index + increment] &&
			_board[index] === _board[index + increment * 2]
		)
			return _board[index];
		return false;
	};

	const reset = function () {
		for (let i = 0; i < _board.length; i++) _board[i] = _states.empty;
	};

	const getBoard = function () {
		return _board;
	};

	return { update, checkWin, reset, getBoard };
})();

// const displayController = (function () {})();

// function Player() {}
