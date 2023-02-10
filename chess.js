const { show, hide } = require("alternate-screen")
const readline = require("readline-sync");

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const BLUE = "\x1b[30m";
const WHITE = "\x1b[37m";
const BG_BLACK = "\x1b[40m";
const BG_WHITE = "\x1b[47m";

function displayBoard(board) {
	let count = 1;

	for(let rank = 0; rank < board.length; ++rank) {
		process.stdout.write((8-rank + "\t"));
		for(let file = 0; file < board[rank].length; ++file) {
			let square = board[rank][file];

			if(square != '') {
				if(count % 2 === 0) process.stdout.write(BG_BLACK + ' ' + square + ' ');
				else {
					if(!square.includes(RED))
						process.stdout.write(BG_WHITE + ' ' + BLUE + square + WHITE + ' ');
					else
					process.stdout.write(BG_WHITE + ' ' + square + ' ');
				}
			} else {
				if(count % 2 === 0) process.stdout.write(BG_BLACK +  ' - ');
				else process.stdout.write(BG_WHITE + ' - ');
			}
			process.stdout.write(RESET);
			++count;
		}

		if(rank % 2 === 0) count = 2;
		else count = 1;

		console.log();
	}
	console.log(RESET + "\n\n\t a  b  c  d  e  f  g  h\n\n");
}

function move(before, after, board, coordinates) {
	if(before.length >= 3 || before.length <= 1 || after.length >= 3 || after.length <= 1) return;

	let originCoordinates = [coordinates[before[0]], coordinates[before[1]]]
	let newCoordinates = [coordinates[after[0]], coordinates[after[1]]];
	let originPiece = board[coordinates[before[1]]][coordinates[before[0]]];

	board[newCoordinates[1]][newCoordinates[0]] = originPiece === RED + 'p' + WHITE ? RED + 'P' + WHITE : originPiece === RED + originPiece + WHITE ? RED + originPiece + WHITE : originPiece === 'p' ? 'P' : originPiece;
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
	let directions = [];

	switch(piece) {
		case RED + 'p' + WHITE:
			if(file + 2 >= 0 && board[rank][file+2] === '') {
				moves.push(fileCoordinates[file+2] + rankCoordinates[rank]);
			}
		case RED + 'P' + WHITE:
			if(rank+1 < 8 && file+1 < 8) {
				if(board[rank+1][file-1] !== '' && !board[rank+1][file-1].includes(RED)) {
					moves.push(fileCoordinates[file-1] + rankCoordinates[rank+1]);
				}
				if(board[rank+1][file+1] !== '' && !board[rank+1][file+1].includes(RED)) {
					moves.push(fileCoordinates[file+1] + rankCoordinates[rank+1]);
				}
			}
			if(rank+1 < 0) {
				if(board[rank+1][file] === '') {
					moves.push(fileCoordinates[file] + rankCoordinates[rank+1]);
				}
			}

			break;
		case 'p':
			if(file - 2 >= 0 && board[rank][file-2] === '') {
				moves.push(pieceCoordinate[0] + (parseInt(pieceCoordinate[1]) + 2));
			}
		case 'P':
			if(rank-1 >= 0 && file-1 >= 0) {
				if(board[rank-1][file-1] !== '' && board[rank-1][file-1].includes(RED)) {
					moves.push(fileCoordinates[file-1] + rankCoordinates[rank-1]);
				}
				if(board[rank-1][file+1] !== '' && board[rank-1][file+1].includes(RED)) {
					moves.push(fileCoordinates[file+1] + rankCoordinates[rank-1]);
				}
			}
			if(rank-1 >= 0 && board[rank+1][file] === '') {
				moves.push(fileCoordinates[file] + rankCoordinates[rank+1]);
			}

			break;
		case RED + 'B' + WHITE:
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(!board[rank-i][file-i].includes(RED) && board[rank-i][file-i] !== '') {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
					break;
				} else if(board[rank-i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(!board[rank-i][file+i].includes(RED) && board[rank-i][file+i] !== '') {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
					break;
				} else if(board[rank-i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(!board[rank+i][file-i].includes(RED) && board[rank+i][file-i] !== '') {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
					break;
				} else if(board[rank+i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions = [];

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(!board[rank+i][file+i].includes(RED) && board[rank+i][file+i] !== '') {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
					break;
				} else if(board[rank+i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);

			break;
		case 'B':
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i].includes(RED)) {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
					break;
				} else if(board[rank-i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i].includes(RED)) {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
					break;
				} else if(board[rank-i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i].includes(RED)) {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
					break;
				} else if(board[rank+i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions = [];

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i].includes(RED)) {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
					break;
				} else if(board[rank+i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);

			break;
		case RED + 'N' + WHITE:
			if(rank-2 >= 0 && file-1 >= 0 && (board[rank-2][file-1] === '' || !board[rank-2][file-1].includes(RED))) {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank-2]);
			}
			if(rank-2 >= 0 && file+1 < 8 && (board[rank-2][file+1] === '' || !board[rank-2][file+1].includes(RED))) {
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank-2]);
			}
			if(rank+2 < 8 && file-1 >= 0 && (board[rank+2][file-1] === '' || !board[rank+2][file-1].includes(RED))) {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank+2]);
			}
			if(rank+2 < 8 && file+1 < 8 && (board[rank+2][file+1] === '' || !board[rank+2][file+1].includes(RED))) {
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank+2]);
			}
			if(file-2 >= 0 && rank-1 >= 0 && (board[rank-1][file-2] === '' || !board[rank-1][file-2].includes(RED))) {
				moves.push(fileCoordinates[file-2] + rankCoordinates[rank-1]);
			}
			if(file-2 >= 0 && rank+1 < 8 && (board[rank+1][file-2] === '' || !board[rank+1][file-2].includes(RED))) {
				moves.push(fileCoordinates[file-2] + rankCoordinates[rank+1]);
			}
			if(file+2 < 8 && rank-1 >= 0 && (board[rank-1][file+2] === '' || !board[rank-1][file+2].includes(RED))) {
				moves.push(fileCoordinates[file+2] + rankCoordinates[rank-1]);
			}
			if(file+2 < 8 && rank+1 < 8 && (board[rank+1][file+2] === '' || !board[rank+1][file+2].includes(RED))) {
				moves.push(fileCoordinates[file+2] + rankCoordinates[rank+1]);
			}

			break;
		case 'N':
			if(rank-2 >= 0 && file-1 >= 0 && (board[rank-2][file-1] === '' || board[rank-2][file-1].includes(RED))) {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank-2]);
			}
			if(rank-2 >= 0 && file+1 < 8 && (board[rank-2][file+1] === '' || board[rank-2][file+1].includes(RED))) {
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank-2]);
			}
			if(rank+2 < 8 && file-1 >= 0 && (board[rank+2][file-1] === '' || board[rank+2][file-1].includes(RED))) {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank+2]);
			}
			if(rank+2 < 8 && file+1 < 8 && (board[rank+2][file+1] === '' || board[rank+2][file+1].includes(RED))) {
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank+2]);
			}
			if(file-2 >= 0 && rank-1 >= 0 && (board[rank-1][file-2] === '' || board[rank-1][file-2].includes(RED))) {
				moves.push(fileCoordinates[file-2] + rankCoordinates[rank-1]);
			}
			if(file-2 >= 0 && rank+1 < 8 && (board[rank+1][file-2] === '' || board[rank+1][file-2].includes(RED))) {
				moves.push(fileCoordinates[file-2] + rankCoordinates[rank+1]);
			}
			if(file+2 < 8 && rank-1 >= 0 && (board[rank-1][file+2] === '' || board[rank-1][file+2].includes(RED))) {
				moves.push(fileCoordinates[file+2] + rankCoordinates[rank-1]);
			}
			if(file+2 < 8 && rank+1 < 8 && (board[rank+1][file+2] === '' || board[rank+1][file+2].includes(RED))) {
				moves.push(fileCoordinates[file+2] + rankCoordinates[rank+1]);
			}

			break;
		case RED + 'R' + WHITE:
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] === '') {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				} else if(!board[rank-i][file].includes(RED)) {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] === '') {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				} else if(!board[rank+i][file].includes(RED)) {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] === '') {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				} else if(!board[rank][file-i].includes(RED)) {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] === '') {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
				} else if(!board[rank][file+i].includes(RED)) {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);

			break;
		case 'R':
			// up
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] === '') {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				} else if(board[rank-i][file].includes(RED)) {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] === '') {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				} else if(board[rank+i][file].includes(RED)) {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] === '') {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				} else if(board[rank][file-i].includes(RED)) {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] === '') {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
				} else if(board[rank][file+i].includes(RED)) {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);

			break;
		case RED + 'Q' + WHITE:
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(!board[rank-i][file-i].includes(RED) && board[rank-i][file-i] !== '') {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
					break;
				} else if(board[rank-i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(!board[rank-i][file+i].includes(RED) && board[rank-i][file+i] !== '') {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
					break;
				} else if(board[rank-i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(!board[rank+i][file-i].includes(RED) && board[rank+i][file-i] !== '') {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
					break;
				} else if(board[rank+i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions = [];

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(!board[rank+i][file+i].includes(RED) && board[rank+i][file+i] !== '') {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
					break;
				} else if(board[rank+i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions = [];

			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] === '') {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				} else if(!board[rank-i][file].includes(RED)) {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] === '') {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				} else if(!board[rank+i][file].includes(RED)) {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] === '') {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				} else if(!board[rank][file-i].includes(RED)) {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] === '') {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
				} else if(!board[rank][file+i].includes(RED)) {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);

			break;
		case 'Q':
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i].includes(RED)) {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
					break;
				} else if(board[rank-i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i].includes(RED)) {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
					break;
				} else if(board[rank-i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i].includes(RED)) {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
					break;
				} else if(board[rank+i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions = [];

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i].includes(RED)) {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
					break;
				} else if(board[rank+i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions =[];

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] === '') {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				} else if(board[rank-i][file].includes(RED)) {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] === '') {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				} else if(board[rank+i][file].includes(RED)) {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] === '') {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				} else if(board[rank][file-i].includes(RED)) {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);
			directions = [];

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] === '') {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
				} else if(board[rank][file+i].includes(RED)) {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
					break;
				} else {
					break;
				}
			}

			moves.push(directions);

			break;	
		case RED + 'K' + WHITE:
			let whiteKingMoves = []
			moves = checks(fileCoordinates[file] + rankCoordinates[rank], board, coordinates, fileCoordinates, rankCoordinates);

			for(let rank = 0; rank < board.length; ++rank) {
				for(let file = 0; file < board[rank].length; ++file) {
					if(board[rank][file] === 'K') {
						whiteKingMoves = checks(fileCoordinates[file] + rankCoordinates[rank], board, coordinates, fileCoordinates, rankCoordinates);
					}
				}
			}

			for(let i = 0; i < moves.length; ++i) {
				if(whiteKingMoves.includes(moves[i])) {
					moves.splice(moves.indexOf(moves[i]), 1);
				}
			}

			break;
		case 'K':
			let blackKingMoves = [];
			moves = checks(fileCoordinates[file] + rankCoordinates[rank], board, coordinates, fileCoordinates, rankCoordinates);

			for(let rank = 0; rank < board.length; ++rank) {
				for(let file = 0; file < board[rank].length; ++file) {
					if(board[rank][file] === RED + 'K' + WHITE) {
						blackKingMoves = checks(fileCoordinates[file] + rankCoordinates[rank], board, coordinates, fileCoordinates, rankCoordinates);
					}
				}
			}

			for(let i = 0; i < moves.length; ++i) {
				if(blackKingMoves.includes(moves[i])) {
					moves.splice(moves.indexOf(moves[i]), 1);
				}
			}
	}

	return moves;
}

function checks(kingCoordinate, board, coordinates, fileCoordinates, rankCoordinates) {
	let kingMoves = [];
	let file = coordinates[kingCoordinate[0]];
	let rank = coordinates[kingCoordinate[1]];

	if(board[rank][file] === 'K') {
		// top-left
		if((rank-1 >= 0 && file-1 >= 0) && (board[rank-1][file-1].includes(RED)) || board[rank-1][file-1] === '') {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank-1]);
		}

		// top-right
		if((rank-1 >= 0 && file+1 < 8) && (board[rank-1][file+1].includes(RED)) || board[rank-1][file+1] === '') {
			kingMoves.push(fileCoordinates[file+1] + rankCoordinates[rank-1]);
		}

		// bottom-left
		if((rank+1 < 8 && file-1 >= 0) && (board[rank+1][file-1].includes(RED)) || board[rank+1][file-1] === '') {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank+1]);
		}

		// bottom-right
		if((rank+1 < 8 && file+1 < 8) && (board[rank+1][file+1].includes(RED)) || board[rank+1][file+1] === '') {
			kingMoves.push(fileCoordinates[file+1] + rankCoordinates[rank+1]);
		}

		// up
		if((rank-1 >= 0 && (board[rank-1][file].includes(RED)) || board[rank-1][file] === '')) {
			kingMoves.push(fileCoordinates[file] + rankCoordinates[rank-1]);
		}

		// down
		if((rank+1 < 8 && (board[rank+1][file].includes(RED)) || board[rank+1][file] === '')) {
			kingMoves.push(fileCoordinates[file] + rankCoordinates[rank+1]);
		}

		// left
		if((file-1 >= 0 && (board[rank][file-1].includes(RED)) || board[rank][file-1] === '')) {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank]);
		}

		// right
		if((file+1 < 8 && (board[rank][file+1].includes(RED)) || board[rank][file+1] === '')) {
			kingMoves.push(fileCoordinates[file+1] + rankCoordinates[rank]);
		}

		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file].includes(RED) && board[rank][file] !== RED + 'K' + WHITE) {
					let pieceMoves = checkMoves(fileCoordinates[file] + rankCoordinates[rank], board, coordinates);
					for(let i = 0; i < pieceMoves.length; ++i) {
						for(let j = 0; j < pieceMoves[i].length; ++j) {
							if(kingMoves.includes(pieceMoves[i][j])) {
								kingMoves.splice(kingMoves.indexOf(pieceMoves[i][j]), 1);
							}
						}
					}
				}
			}
		}
	} else {
		// top-left
		if((rank-1 >= 0 && file-1 >= 0) && (!board[rank-1][file-1].includes(RED) || board[rank-1][file-1] === '')) {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank-1]);
		}

		// top-right
		if((rank-1 >= 0 && file+1 < 8) && (!board[rank-1][file+1].includes(RED) || board[rank-1][file+1] === '')) {
			kingMoves.push(fileCoordinates[file+1] + rankCoordinates[rank-1]);
		}

		// bottom-left
		if((rank+1 < 8 && file-1 >= 0) && (!board[rank+1][file-1].includes(RED) || board[rank+1][file-1] === '')) {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank+1]);
		}

		// bottom-right
		if((rank+1 < 8 && file+1 < 8) && (!board[rank+1][file+1].includes(RED) || board[rank+1][file+1] === '')) {
			kingMoves.push(fileCoordinates[file+1] + rankCoordinates[rank+1]);
		}

		// up
		if((rank-1 >= 0 && (!board[rank-1][file].includes(RED)) || board[rank-1][file] === '')) {
			kingMoves.push(fileCoordinates[file] + rankCoordinates[rank-1]);
		}

		// down
		if((rank+1 < 8 && (!board[rank+1][file].includes(RED)) || board[rank+1][file] === '')) {
			kingMoves.push(fileCoordinates[file] + rankCoordinates[rank+1]);
		}

		// left
		if((file-1 >= 0 && (!board[rank][file-1].includes(RED)) || board[rank][file-1] === '')) {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank]);
		}

		// right
		if((file+1 < 8 && (!board[rank][file+1].includes(RED)) || board[rank][file+1] === '')) {
			kingMoves.push(fileCoordinates[file+1] + rankCoordinates[rank]);
		}

		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if((!board[rank][file].includes(RED) && board[rank][file] !== '')  && board[rank][file] !== 'K') {
					let pieceMoves = checkMoves(fileCoordinates[file] + rankCoordinates[rank], board, coordinates);
					for(let i = 0; i < pieceMoves.length; ++i) {
						for(let j = 0; j < pieceMoves[i].length; ++j) {
							if(kingMoves.includes(pieceMoves[i][j])) {
								kingMoves.splice(kingMoves.indexOf(pieceMoves[i][j]), 1);
							}
						}
					}
				}
			}
		}
	}

	return kingMoves;
}

function checkMoves(pieceCoordinate, board, coordinates) {
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
	let directions = [];

	switch(piece) {
		case RED + 'p' + WHITE:
		case RED + 'P' + WHITE:
			if(rank+1 < 8 && file+1 < 8) {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank+1]);
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank+1]);
			}

			break;
		case 'p':
		case 'P':
			if(rank-1 >= 0 && file-1 >= 0) {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank-1]);
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank-1]);
			}

			break;
		case RED + 'B' + WHITE:
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i] !== '') {
					if(board[rank-i][file-i].includes(RED)) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						break;
					} else {
						break;
					}
				} else if(board[rank-i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(board[rank-i][file+i] !== '') {
					if(board[rank-i][file+i].includes(RED)) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						break;
					} else {
						break;
					}
				} else if(board[rank-i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(board[rank+i][file-i] !== '') {
					if(board[rank+i][file-i].includes(RED)) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						break;
					} else {
						break;
					}
				} else if(board[rank+i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions = [];

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(board[rank+i][file+i] !== '') {
					if(board[rank+i][file+i].includes(RED) && count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						break;
					} else {
						break;
					}
				} else if(board[rank+i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);

			break;
		case 'B':
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i].includes(RED)) {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
					break;
				} else if(board[rank-i][file-i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i])
						break;;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i].includes(RED)) {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
					break;
				} else if(board[rank-i][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+1] + rankCoordinates[rank-i])
						break;;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];
			count = 0;
			
			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i].includes(RED)) {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
					break;
				} else if(board[rank+i][file-i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i])
						break;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i].includes(RED)) {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
					break;
				} else if(board[rank+i][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i])
						break;;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);

			break;
		case RED + 'N' + WHITE:
			if(rank-2 >= 0 && file-1 >= 0) {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank-2]);
			}
			if(rank-2 >= 0 && file+1 < 8) {
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank-2]);
			}
			if(rank+2 < 8 && file-1 >= 0) {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank+2]);
			}
			if(rank+2 < 8 && file+1 < 8) {
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank+2]);
			}
			if(file-2 >= 0 && rank-1 >= 0) {
				moves.push(fileCoordinates[file-2] + rankCoordinates[rank-1]);
			}
			if(file-2 >= 0 && rank+1 < 8) {
				moves.push(fileCoordinates[file-2] + rankCoordinates[rank+1]);
			}
			if(file+2 < 8 && rank-1 >= 0) {
				moves.push(fileCoordinates[file+2] + rankCoordinates[rank-1]);
			}
			if(file+2 < 8 && rank+1 < 8) {
				moves.push(fileCoordinates[file+2] + rankCoordinates[rank+1]);
			}

			break;
		case 'N':
			if(rank-2 >= 0 && file-1 >= 0) {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank-2]);
			}
			if(rank-2 >= 0 && file+1 < 8) {
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank-2]);
			}
			if(rank+2 < 8 && file-1 >= 0) {
				moves.push(fileCoordinates[file-1] + rankCoordinates[rank+2]);
			}
			if(rank+2 < 8 && file+1 < 8) {
				moves.push(fileCoordinates[file+1] + rankCoordinates[rank+2]);
			}
			if(file-2 >= 0 && rank-1 >= 0) {
				moves.push(fileCoordinates[file-2] + rankCoordinates[rank-1]);
			}
			if(file-2 >= 0 && rank+1 < 8) {
				moves.push(fileCoordinates[file-2] + rankCoordinates[rank+1]);
			}
			if(file+2 < 8 && rank-1 >= 0) {
				moves.push(fileCoordinates[file+2] + rankCoordinates[rank-1]);
			}
			if(file+2 < 8 && rank+1 < 8) {
				moves.push(fileCoordinates[file+2] + rankCoordinates[rank+1]);
			}

			break;
		case RED + 'R' + WHITE:
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
				}
			}

			moves.push(directions);

			break;
		case 'R':
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
				}
			}

			moves.push(directions);

			break;
		case RED + 'Q' + WHITE:
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i] !== '') {
					if(board[rank-i][file-i].includes(RED) && count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						break;;
					} else {
						break;
					}
				} else if(board[rank-i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];
			count = 0;
			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(board[rank-i][file+i] !== '') {
					if(board[rank-i][file+i].includes(RED) && count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						break;;
					} else {
						break;
					}
				} else if(board[rank-i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(board[rank+i][file-i] !== '') {
					if(board[rank+i][file-i].includes(RED) && count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						break;;
					} else {
						break;
					}
				} else if(board[rank+i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(board[rank+i][file+i] !== '') {
					if(board[rank+i][file+i].includes(RED) && count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						break;;
					} else {
						break;
					}
				} else if(board[rank+i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions = [];
			count = 0;

			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
				}
			}

			moves.push(directions);

			break;
		case 'Q':
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i] !== '') {
					if(board[rank-i][file-i].includes(RED) && count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						break;;
					} else {
						break;
					}
				} else if(board[rank-i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];
			count = 0;
			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(board[rank-i][file+i] !== '') {
					if(board[rank-i][file+i].includes(RED) && count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						break;;
					} else {
						break;
					}
				} else if(board[rank-i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(board[rank+i][file-i] !== '') {
					if(board[rank+i][file-i].includes(RED) && count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						break;;
					} else {
						break;
					}
				} else if(board[rank+i][file-i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				// console.log(board[rank-i][file-1], file, rank);
				if(board[rank+i][file+i] !== '') {
					if(board[rank+i][file+i].includes(RED) && count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						break;;
					} else {
						break;
					}
				} else if(board[rank+i][file+i] !== '') {
					break;
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			moves.push(directions);
			directions = [];
			count = 0;

			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				}
			}

			moves.push(directions);
			directions = [];
			count = 0;

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						break;;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
				}
			}

			moves.push(directions);

			break;
	}
	return moves;
}

// board = [
// 	[RED + 'R' + WHITE, RED + 'N' + WHITE, RED + 'B' + WHITE, RED + 'Q' + WHITE, RED + 'K' + WHITE, RED + 'B' + WHITE, RED + 'N' + WHITE, RED + 'R' + WHITE],
// [RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE],
// 	['', '', '', '', '', '', '', ''],
// 	['', '', '', '', '', '', '', ''],
// 	['', '', '', '', '', '', '', ''],
// 	['', '', '', '', '', '', '', ''],
// 	['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
// 	['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
// ];

// board = [
// 	['', '', '', '', '', '', '', ''],
// 	['', '', '', '', '', '', '', ''],
// 	['', '', '', RED + 'R' + WHITE, '', '', '', ''],
// 	['', '', '', '', '', '', '', ''],
// 	['', '', '', '', '', '', '', ''],
// 	['', '', '', RED + 'R' + WHITE, '', '', '', ''],
// 	['', '', '', '', 'K', '', RED + 'K' + WHITE, ''],
// 	['', '', '', '', '', '', '', ''],
// ];

board = [
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', 'R', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', 'R', '', '', '', ''],
	['', '', '', '', RED + 'K' + WHITE, '', 'K', ''],
	['', '', '', '', '', '', '', ''],
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

let running = true;
let pieceCoordinate, operation, op, drawOffer, turn = "White", validMove = /^[a-z][0-8]$/;

// show();

displayBoard(board);
// console.log(legalMoves("e4", board, coordinates));
console.log(legalMoves("e2", board, coordinates));
// check = checks("e4", board, coordinates);
// for(let i = 0; i < check.length; ++i) {
// 	console.log(fileCoordinates[check[i][1]] + rankCoordinates[check[i][0]], board[check[i][0]][check[i][1]]);
// }

// while(running) {
// 	console.clear();
// 	displayBoard(board);

// 	operation = readline.question("quit - Quits the game\nplay - Play chess\n\nEnter an operation: ");
// 	console.log();

// 	if(operation === "quit") {
// 		running = false;
// 	} else if(operation === "play") {
// 		board = [
// 			[RED + 'R' + WHITE, RED + 'N' + WHITE, RED + 'B' + WHITE, RED + 'Q' + WHITE, RED + 'K' + WHITE, RED + 'B' + WHITE, RED + 'N' + WHITE, RED + 'R' + WHITE],
// 			[RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE],
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
