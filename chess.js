const { show, hide } = require("alternate-screen")
const readline = require("readline-sync");

const GREEN = "\x1b[32m";
const WHITE = "\x1b[37m";

function displayBoard(board) {
	for(let rank = 0; rank < board.length; ++rank) {
		process.stdout.write(8-rank + "\t");
		for(let file = 0; file < board[rank].length; ++file) {
			let square = board[rank][file];
			if(square != '') {
				process.stdout.write(square + '  ');
			} else {
				process.stdout.write('-  ');
			}
		}
		console.log();
	}
	console.log("\n\n\ta  b  c  d  e  f  g  h\n\n");
}

function move(before, after, board, coordinates) {
	if(before.length >= 3 || before.length <= 1 || after.length >= 3 || after.length <= 1) return;

	let originCoordinates = [coordinates[before[0]], coordinates[before[1]]]
	let newCoordinates = [coordinates[after[0]], coordinates[after[1]]];
	let originPiece = board[coordinates[before[1]]][coordinates[before[0]]];

	board[newCoordinates[1]][newCoordinates[0]] = originPiece === GREEN + 'p' + WHITE ? GREEN + 'P' + WHITE : originPiece === GREEN + originPiece + WHITE ? GREEN + originPiece + WHITE : originPiece === 'p' ? 'P' : originPiece;
	board[originCoordinates[1]][originCoordinates[0]] = '';
}

function legalMoves(pieceCoordinate, board, coordinates) {
	let fileCoordinates = {
		0: 'a',
		1: 'b',
		2: 'c',
		3: 'd',
		4: 'e',
		5: 'f',
		6: 'g',
		7: 'h'
	};
	let rankCoordinates = {
		0: 8,
		1: 7,
		2: 6,
		3: 5,
		4: 4,
		5: 3,
		6: 2,
		7: 1
	};

	let file = coordinates[pieceCoordinate[0]];
	let rank = coordinates[pieceCoordinate[1]];
	let piece = board[rank][file];
	let moves = [];

	switch(piece) {
		case GREEN + 'p' + WHITE:
			moves.push(pieceCoordinate[0] + (parseInt(pieceCoordinate[1] - 2)));
			break;
		case 'p':
			moves.push(pieceCoordinate[0] + (parseInt(pieceCoordinate[1]) + 2));
			break;
		case 'B':
			let diagonals = [];

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0 && board[rank-i][file-i] === ''; ++i) {
				diagonals.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			moves.push(diagonals);
			diagonals = [];

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0 && board[rank-i][file+i] === ''; ++i) {
				diagonals.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			moves.push(diagonals);
			diagonals = [];

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8 && board[rank+i][file-i] === ''; ++i) {

				diagonals.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			moves.push(diagonals);
			diagonals = [];

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8 && board[rank+i][file+i] === ''; ++i) {
				diagonals.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			moves.push(diagonals);

			break;
		case 'N':
			if(rank-2 >= 0 && file-1 >= 0 && board[rank-2][file-1] === '') {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank-2]);
			}
			if(rank-2 >= 0 && file+1 < 8 && board[rank-2][file+1] === '') {
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank-2]);
			}
			if(rank+2 < 8 && file-1 >= 0 && board[rank+2][file-1] === '') {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank+2]);
			}
			if(rank+2 < 8 && file+1 < 8 && board[rank+2][file+1] === '') {
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank+2]);
			}
			if(file-2 >= 0 && rank-1 >= 0 && board[rank-1][file-2] === '') {
				moves.push(fileCoordinates[file-2] + rankCoordinates[rank-1]);
			}
			if(file-2 >= 0 && rank+1 < 8 && board[rank+1][file-2] === '') {
				moves.push(fileCoordinates[file-2] + rankCoordinates[rank+1]);
			}
			if(file+2 < 8 && rank-1 >= 0 && board[rank-1][file+2] === '') {
				moves.push(fileCoordinates[file+2] + rankCoordinates[rank-1]);
			}
			if(file+2 < 8 && rank+1 < 8 && board[rank+1][file+2] === '') {
				moves.push(fileCoordinates[file+2] + rankCoordinates[rank+1]);
			}

			break;
	}

	return moves;
}

// board = [
// 	[GREEN + 'R' + WHITE, GREEN + 'N' + WHITE, GREEN + 'B' + WHITE, GREEN + 'Q' + WHITE, GREEN + 'K' + WHITE, GREEN + 'B' + WHITE, GREEN + 'N' + WHITE, GREEN + 'R' + WHITE],
// [GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE],
// 	['', '', '', '', '', '', '', ''],
// 	['', '', '', '', '', '', '', ''],
// 	['', '', '', '', '', '', '', ''],
// 	['', '', '', '', '', '', '', ''],
// 	['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
// 	['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
// ];

board = [
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', 'N', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', 'B', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', '']
];

coordinates = {
	'a': 0,
	'b': 1,
	'c': 2,
	'd': 3,
	'e': 4,
	'f': 5,
	'g': 6,
	'h': 7,
	1: 7,
	2: 6,
	3: 5,
	4: 4,
	5: 3,
	6: 2,
	7: 1,
	8: 0
}

let running = true;
let pieceCoordinate, operation, op, drawOffer, turn = "White", validMove = /^[a-z][0-8]$/;

// show();
// legalMoves("e2", board, coordinates);
// legalMoves("d7", board, coordinates);

// console.log();

// move("e2", "e4", board, coordinates);
// move("f1", "c4", board, coordinates);
displayBoard(board);
console.log(legalMoves("g3", board, coordinates));
console.log(legalMoves("e5", board, coordinates));
// move("f1", "c4", board, coordinates);
// console.log();
// legalMoves("c4", board, coordinates);

// while(running) {
// 	console.clear();
// 	displayBoard(board);

// 	operation = readline.question("quit - Quits the game\nplay - Play chess\n\nEnter an operation: ");
// 	console.log();

// 	if(operation === "quit") {
// 		running = false;
// 	} else if(operation === "play") {
// 		board = [
// 			[GREEN + 'R' + WHITE, GREEN + 'N' + WHITE, GREEN + 'B' + WHITE, GREEN + 'Q' + WHITE, GREEN + 'K' + WHITE, GREEN + 'B' + WHITE, GREEN + 'N' + WHITE, GREEN + 'R' + WHITE],
// 			[GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE, GREEN + 'p' + WHITE],
// 			['', '', '', '', '', '', '', ''],
// 			['', '', '', '', '', '', '', ''],
// 			['', '', '', '', '', '', '', ''],
// 			['', '', '', '', '', '', '', ''],
// 			['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
// 			['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
// 		]

// 		let playing = true;

// 		while(playing) {
// 			console.clear();
// 			displayBoard(board);
// 			console.log("\nTurn: " + turn + '\n');

// 			op = readline.question("resign - Resigns the game\ndraw - Offers a draw\nmove - Make a move\n\nEnter an operation: ");
// 			if(op === "resign") {
// 				playing = false;
// 			} else if(op === "draw") {
// 				drawOffer = readline.question('\n' + turn + " offered a draw\nWill you accept a draw? [yes/no]: ");
// 				if(drawOffer === "yes") playing = false;
// 				else continue;
// 			} else if(op === "move") {
// 				pieceCoordinate = readline.question("\nEnter piece coordinate: ");

// 				// if(validMove.test(beforeCoordinate) && validMove.test(afterCoordinate)) {
// 				// 	move(beforeCoordinate, afterCoordinate, board, coordinates);
// 				// 	if(turn === "White") {
// 				// 		turn = "Black";
// 				// 	} else {
// 				// 		turn = "White";
// 				// 	}
// 				// }
// 			}
// 		}
// 	}
// }

// hide();
