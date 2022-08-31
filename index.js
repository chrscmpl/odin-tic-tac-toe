const gameBoard = (function () {
	const _states = {
		empty: null,
		player1: false,
		player2: true,
	};

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
		const move = _getMove(player);
		for (const num of _winningNumbers)
			if ((move | num) === move + num) return true;
		return false;
	};

	// returns a number whose binary representation
	// has the same length as the board,
	// has 0es corresponding to the player's moves
	// 1s everywhere else
	const _getMove = function (player) {
		// working, less performant implementation
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
