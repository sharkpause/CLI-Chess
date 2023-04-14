const { show, hide } = require("alternate-screen")
const readline = require("readline-sync");

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const BLUE = "\x1b[34m";
const WHITE = "\x1b[37m";
const GREEN = "\x1b[32m";
const BG_BLACK = "\x1b[40m";
const BG_WHITE = "\x1b[47m";
const BG_YELLOW = "\x1b[43m";

const fileCoordinates = {
	0: 'a',
	1: 'b',
	2: 'c',
	3: 'd',
	4: 'e',
	5: 'f',
	6: 'g',
	7: 'h'
};
const rankCoordinates = {
	0: 8,
	1: 7,
	2: 6,
	3: 5,
	4: 4,
	5: 3,
	6: 2,
	7: 1
};

const coordinates = {
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

function displayBoard(board, highlightedSquares=[]) {
	highlightedSquares[highlightedSquares.indexOf("g1o")] = "g1";
	highlightedSquares[highlightedSquares.indexOf("b1o")] = "b1";
	highlightedSquares[highlightedSquares.indexOf("g8o")] = "g8";
	highlightedSquares[highlightedSquares.indexOf("b8o")] = "b8";

	let square, squareCoordinate, isWhite;

	for(let rank = 0; rank < board.length; ++rank) {
		process.stdout.write(8-rank + "\t");
		for(let file = 0; file < board[rank].length; ++file) {
			square = board[rank][file];
			squareCoordinate = fileCoordinates[file] + rankCoordinates[rank];
			isWhite = rank % 2 === file % 2;

			if(square !== '') {
				if(square.includes(RED)) {
					if(highlightedSquares.includes(squareCoordinate)) {
						process.stdout.write(BG_YELLOW + ' ' + square + WHITE + ' ');
					} else if(isWhite) {
						process.stdout.write(BG_WHITE + ' ' + square + WHITE + ' ');
					} else {
						process.stdout.write(BG_BLACK + ' ' + square + WHITE + ' ');
					}
				} else {
					if(highlightedSquares.includes(squareCoordinate)) {
						process.stdout.write(BG_YELLOW + ' ' + BLUE + square + WHITE + ' ');
					} else if(isWhite) {
						process.stdout.write(BG_WHITE + ' ' + BLUE + square + WHITE + ' ');
					} else
						process.stdout.write(BG_BLACK + BLUE + ' ' + square + WHITE + ' ');
					}
			} else {
				if(highlightedSquares.includes(squareCoordinate)) {
					process.stdout.write(BG_YELLOW + ' - ');
				} else if(isWhite) {
					process.stdout.write(BG_WHITE + ' - ');
				} else {
					process.stdout.write(BG_BLACK + ' - ');
				}
			}
			process.stdout.write(RESET);
		}

		console.log();
	}
	console.log(RESET + "\n\n\t a  b  c  d  e  f  g  h");
}

function move(before, after, board) {
	let enPassant = [];

	let beforeFile = coordinates[before[0]];
	let beforeRank = coordinates[before[1]];

	if(after.includes("o")) {
		if(after === "g8o") {
			board[beforeRank][beforeFile] = '';
			board[beforeRank][7] = '';

			board[beforeRank][6] = RED + 'K' + WHITE;
			board[beforeRank][5] = RED + 'R' + WHITE;
		} else if(after === "g1o") {
			board[beforeRank][beforeFile] = '';
			board[beforeRank][7] = '';

			board[beforeRank][6] = 'K';
			board[beforeRank][5] = 'R';
		} else if(after === "b8o") {
			board[beforeRank][beforeFile] = '';
			board[beforeRank][0] = '';

			board[beforeRank][2] = RED + 'K' + WHITE;
			board[beforeRank][3] = RED + 'R' + WHITE;
		} else if(after === "b1o") {
			board[beforeRank][beforeFile] = '';
			board[beforeRank][0] = '';

			board[beforeRank][2] = 'K';
			board[beforeRank][3] = 'R';
		}
		return;
	}

	let afterFile = coordinates[after[0]];
	let afterRank = coordinates[after[1]];
	
	let originPiece = board[beforeRank][beforeFile];

	if(beforeRank-1 === afterRank) {
		if(beforeFile-1 === afterFile && board[beforeRank][beforeFile-1].includes('P') && board[afterRank][afterFile] === '') {
			board[beforeRank][beforeFile-1] = '';
		} else if(beforeFile+1 === afterFile && board[beforeRank][beforeFile+1].includes('P') && board[afterRank][afterFile] === '') {
			board[beforeRank][beforeFile+1] = '';
		}
	}

	switch(originPiece) {
		case RED + 'p' + WHITE:
			board[afterRank][afterFile] = RED + 'P' + WHITE;

			break;
		case 'p':
			board[afterRank][afterFile] = 'P';

			break;
		case RED + 'r' + WHITE:
			board[afterRank][afterFile] = RED + 'R' + WHITE;

			break;
		case 'r':
			board[afterRank][afterFile] = 'R';

			break;
		case RED + 'k' + WHITE:
			board[afterRank][afterFile] = RED + 'K' + WHITE;
			
			break;
		case 'k':
			board[afterRank][afterFile] = 'K';

			break;
		default:
			board[afterRank][afterFile] = originPiece;
	}

	board[beforeRank][beforeFile] = '';

	if(originPiece === RED + 'p' + WHITE) {
		if(board[afterRank][afterFile-1] === 'p' || board[afterRank][afterFile-1] === 'P') {
			enPassant.push([fileCoordinates[afterFile-1] + rankCoordinates[afterRank], fileCoordinates[afterFile] + rankCoordinates[afterRank-1]]);
		}
		if(board[afterRank][afterFile+1] === 'p' || board[afterRank][afterFile+1] === 'P') {
			enPassant.push([fileCoordinates[afterFile+1] + rankCoordinates[afterRank], fileCoordinates[afterFile] + rankCoordinates[afterRank-1]]);
		}
	} else if(originPiece === 'p') {
		if(board[afterRank][afterFile-1] === RED + 'p' + WHITE || board[afterRank][afterFile-1] === RED + 'P' + WHITE) {
			enPassant.push([fileCoordinates[afterFile-1] + rankCoordinates[afterRank], fileCoordinates[afterFile] + rankCoordinates[afterRank+1]]);
		}
		if(board[afterRank][afterFile+1] === RED + 'p' + WHITE || board[afterRank][afterFile+1] === RED + 'P' + WHITE) {
			enPassant.push([fileCoordinates[afterFile+1] + rankCoordinates[afterRank], fileCoordinates[afterFile] + rankCoordinates[afterRank+1]]);
		}
	}

	return enPassant;
}

function legalMoves(pieceCoordinate, board, enPassant=[]) {
	let file = coordinates[pieceCoordinate[0]];
	let rank = coordinates[pieceCoordinate[1]];
	let testPiece = pieceCoordinate;
	let testBoard = JSON.parse(JSON.stringify(board));
	let moves = [];
	let color;
	let square;
	let kingCoordinate;
	let enemyKingMoves;
	let i;

	switch(board[rank][file]) {
		case RED + 'p' + WHITE:
			color = "Black";
			kingCoordinate = kingCoordinates(board, color);

			if(rank+2 < 8 && board[rank+2][file] === '' && board[rank+1][file] === '') {
				move(testPiece, fileCoordinates[file] + rankCoordinates[rank+2], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file] + rankCoordinates[rank+2]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
		case RED + 'P' + WHITE:
			color = "Black";
			kingCoordinate = kingCoordinates(board, color);

			if(rank < 7) {
				if(file > 0) {
					if(!board[rank+1][file-1].includes(RED) && board[rank+1][file-1] !== '') {
						move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+1], testBoard);
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(fileCoordinates[file-1] + rankCoordinates[rank+1]);
						}
					}
				}

				testBoard = JSON.parse(JSON.stringify(board));

				if(file < 7) {
					if(!board[rank+1][file+1].includes(RED) && board[rank+1][file+1] !== '') {
						move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+1], testBoard);
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(fileCoordinates[file+1] + rankCoordinates[rank+1]);
						}
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank+1 < 8 && board[rank+1][file] === '') {
				move(testPiece, fileCoordinates[file] + rankCoordinates[rank+1], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file] + rankCoordinates[rank+1]);
				}
			}

			for(let i = 0; i < enPassant.length; ++i) {
				if(enPassant[i][0] === pieceCoordinate) {
					moves.push(enPassant[i][1]);
				}
			}

			break;
		case 'p':
			color = "White";
			kingCoordinate = kingCoordinates(board, color);

			if(rank-2 >= 0 && board[rank-2][file] === '' && board[rank-1][file] === '') {
				move(testPiece, fileCoordinates[file] + rankCoordinates[rank-2], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file] + rankCoordinates[rank-2]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
		case 'P':
			color = "White";
			kingCoordinate = kingCoordinates(board, color);

			if(rank > 0) {
				if(file > 0) {
					if(board[rank-1][file-1].includes(RED)) {
						move(kingCoordinate, fileCoordinates[file-1] + rankCoordinates[rank-1], testBoard);
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(fileCoordinates[file-1] + rankCoordinates[rank-1]);
						}
					}
				}

				testBoard = JSON.parse(JSON.stringify(board));

				if(file < 7) {
					if(board[rank-1][file+1].includes(RED)) {
						move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-1], testBoard);
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(fileCoordinates[file+1] + rankCoordinates[rank-1]);
						}
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank-1 >= 0 && board[rank-1][file] === '') {
				move(testPiece, fileCoordinates[file] + rankCoordinates[rank-1], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file] + rankCoordinates[rank-1]);
				}
			}

			for(let i = 0; i < enPassant.length; ++i) {
				if(enPassant[i][0] === pieceCoordinate) {
					moves.push(enPassant[i][1]);
				}
			}

			break;
		case RED + 'B' + WHITE:
			color = "Black";
			kingCoordinate = kingCoordinates(testBoard, color)

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank-i];
				square = board[rank-i][file-i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank-i];
				square = board[rank-i][file+i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank+i];
				square = board[rank+i][file-i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank+i];
				square = board[rank+i][file+i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}
			
			break;
		case 'B':
			color = "White";
			kingCoordinate = kingCoordinates(testBoard, color)

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank-i];
				square = board[rank-i][file-i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;;

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank-i];
				square = board[rank-i][file+i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank+i];
				square = board[rank+i][file-i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank+i];
				square = board[rank+i][file+i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}
			
			break;
		case RED + 'N' + WHITE:
			color = "Black";
			kingCoordinate = kingCoordinates(testBoard, color);

			if(rank > 1 && file > 0 && (board[rank-2][file-1] === '' || !board[rank-2][file-1].includes(RED))) {
				move(kingCoordinate, fileCoordinates[file-1] + rankCoordinates[rank-2], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file-1] + rankCoordinates[rank-2]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank > 1 && file < 7 && (board[rank-2][file+1] === '' || !board[rank-2][file+1].includes(RED))) {
				move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-2], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file+1] + rankCoordinates[rank-2]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank < 6 && file > 0 && (board[rank+2][file-1] === '' || !board[rank+2][file-1].includes(RED))) {
				move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+2], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file-1] + rankCoordinates[rank+2]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank < 6 && file < 7 && (board[rank+2][file+1] === '' || !board[rank+2][file+1].includes(RED))) {
				move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+2], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file+1] + rankCoordinates[rank+2]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank > 0 && file > 1 && (board[rank-1][file-2] === '' || !board[rank-1][file-2].includes(RED))) {
				move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank-1], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file-2] + rankCoordinates[rank-1]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank < 7 && file > 1 && (board[rank+1][file-2] === '' || !board[rank+1][file-2].includes(RED))) {
				move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank+1], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file-2] + rankCoordinates[rank+1]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank > 0 && file < 6 && (board[rank-1][file+2] === '' || !board[rank-1][file+2].includes(RED))) {
				move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank-1], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file+2] + rankCoordinates[rank-1]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank < 7 && file < 6 && (board[rank+1][file+2] === '' || !board[rank+1][file+2].includes(RED))) {
				move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank+1], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file+2] + rankCoordinates[rank+1]);
				}
			}

			break;
		case 'N':
			color = "White";
			kingCoordinate = kingCoordinates(board, color);

			if(rank > 1 && file > 0 && (board[rank-2][file-1] === '' || board[rank-2][file-1].includes(RED))) {
				move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank-2], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file-1] + rankCoordinates[rank-2]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank > 1 && file < 7 && (board[rank-2][file+1] === '' || board[rank-2][file+1].includes(RED))) {
				move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-2], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file+1] + rankCoordinates[rank-2]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank < 6 && file > 0 && (board[rank+2][file-1] === '' || board[rank+2][file-1].includes(RED))) {
				move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+2], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file-1] + rankCoordinates[rank+2]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank < 6 && file < 7 && (board[rank+2][file+1] === '' || board[rank+2][file+1].includes(RED))) {
				move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+2], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file+1] + rankCoordinates[rank+2]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank > 0 && file > 1 && (board[rank-1][file-2] === '' || board[rank-1][file-2].includes(RED))) {
				move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank-1], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file-2] + rankCoordinates[rank-1]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank < 7 && file > 1 && (board[rank+1][file-2] === '' || board[rank+1][file-2].includes(RED))) {
				move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank+1], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file-2] + rankCoordinates[rank+1]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank > 0 && file < 6 && (board[rank-1][file+2] === '' || board[rank-1][file+2].includes(RED))) {
				move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank-1], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file+2] + rankCoordinates[rank-1]);
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank < 7 && file < 6 && (board[rank+1][file+2] === '' || board[rank+1][file+2].includes(RED))) {
				move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank+1], testBoard);
				if(!inCheck(kingCoordinate, testBoard, color)) {
					moves.push(fileCoordinates[file+2] + rankCoordinates[rank+1]);
				}
			}

			break;
		case RED + 'r' + WHITE:
		case RED + 'R' + WHITE:
			color = "Black";
			kingCoordinate = kingCoordinates(testBoard, color);

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file] + rankCoordinates[rank-i];
				square = board[rank-i][file];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file] + rankCoordinates[rank+i];
				square = board[rank+i][file];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// lef
			for(let i = 1; file-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank];
				square = board[rank][file-i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// right
			for(let i = 1; file+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank];
				square = board[rank][file+i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			break;
		case 'r':
		case 'R':
			color = "White";
			kingCoordinate = kingCoordinates(testBoard, color);

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file] + rankCoordinates[rank-i];
				square = board[rank-i][file];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file] + rankCoordinates[rank+i];
				square = board[rank+i][file];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// left
			for(let i = 1; file-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank];
				square = board[rank][file-i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// right
			for(let i = 1; file+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank];
				square = board[rank][file+i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			break;
		case RED + 'Q' + WHITE:
			color = "Black";
			kingCoordinate = kingCoordinates(testBoard, color)

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank-i];
				square = board[rank-i][file-i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank-i];
				square = board[rank-i][file+i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank+i];
				square = board[rank+i][file-i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank+i];
				square = board[rank+i][file+i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file] + rankCoordinates[rank-i];
				square = board[rank-i][file];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file] + rankCoordinates[rank+i];
				square = board[rank+i][file];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// left
			for(let i = 1; file-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank];
				square = board[rank][file-i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// right
			for(let i = 1; file+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank];
				square = board[rank][file+i];
				if(square === '' || !square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(!square.includes(RED) && square !== '') {
							break;
						}
					}
				} else {
					break;
				}
			}

			break;
		case 'Q':
			color = "White";
			kingCoordinate = kingCoordinates(testBoard, color);

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank-i];
				square = board[rank-i][file-i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank-i];
				square = board[rank-i][file+i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank+i];
				square = board[rank+i][file-i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank+i];
				square = board[rank+i][file+i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}
	
			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file] + rankCoordinates[rank-i];
				square = board[rank-i][file];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file] + rankCoordinates[rank+i];
				square = board[rank+i][file];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// left
			for(let i = 1; file-i >= 0; ++i) {
				moveCoordinates = fileCoordinates[file-i] + rankCoordinates[rank];
				square = board[rank][file-i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = pieceCoordinate;

			// right
			for(let i = 1; file+i < 8; ++i) {
				moveCoordinates = fileCoordinates[file+i] + rankCoordinates[rank];
				square = board[rank][file+i];
				if(square === '' || square.includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, color) === true) {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
							break;
						}
					} else {
						move(testPiece, moveCoordinates, testBoard);
						testPiece = moveCoordinates;
						if(!inCheck(kingCoordinate, testBoard, color)) {
							moves.push(moveCoordinates);
						}
						if(square.includes(RED)) {
							break;
						}
					}
				} else {
					break;
				}
			}
			
			break;
		case RED + 'k' + WHITE:
		case RED + 'K' + WHITE:
			moves = kingMoves(kingCoordinates(board, "Black"), board);
			enemyKingMoves = kingMoves(kingCoordinates(board, "White"), board);

			i = 0;
			while(i < moves.length) {
				if(enemyKingMoves.includes(moves[i])) {
					moves.splice(moves.indexOf(moves[i]), 1);
					i = 0;
				} else {
					++i;
				}
			}

			break;
		case 'k':
		case 'K':
			moves = kingMoves(kingCoordinates(board, "White"), board);
			enemyKingMoves = kingMoves(kingCoordinates(board, "Black"), board);

			i = 0;
			while(i < moves.length) {
				if(enemyKingMoves.includes(moves[i])) {
					moves.splice(moves.indexOf(moves[i]), 1);
					i = 0;
				} else {
					++i;
				}
			}
	}

	return moves;
}

function inCheck(kingCoordinate, board, color) {
	let pieceMoves;
	if(color === "White") {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file].includes(RED) && board[rank][file] !== RED + 'K' + WHITE) {
					pieceMoves = checkMoves(fileCoordinates[file] + rankCoordinates[rank], board);
					for(let i = 0; i < pieceMoves.length; ++i) {
						if(pieceMoves.includes(kingCoordinate)) return true;
					}
				}
			}
		}
	} else {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if((!board[rank][file].includes(RED) && board[rank][file] !== '') && board[rank][file] !== RED + 'K' + WHITE) {
					pieceMoves = checkMoves(fileCoordinates[file] + rankCoordinates[rank], board);
					for(let i = 0; i < pieceMoves.length; ++i) {
						if(pieceMoves.includes(kingCoordinate)) return true;
					}
				}
			}
		}
	}

	return false;
}

function kingCoordinates(board, color) {
	if(color === "White") {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file] === 'K' || board[rank][file] === 'k') {
					return fileCoordinates[file] + rankCoordinates[rank];
				}
			}
		}
	} else {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file] === RED + 'K' + WHITE || board[rank][file] === RED + 'k' + WHITE) {
					return fileCoordinates[file] + rankCoordinates[rank];
				}
			}
		}
	}
}

function kingMoves(kingCoordinate, board) {
	let kingMovesArray = [];
	let file = coordinates[kingCoordinate[0]];
	let rank = coordinates[kingCoordinate[1]];
	let testBoard = JSON.parse(JSON.stringify(board));
	let originCoordinate = kingCoordinate;
	let moveCoordinate;

	if(!board[rank][file].includes(RED)) {
		color = "White";

		// top-left
		if(rank > 0 && file > 0 && (board[rank-1][file-1] === '' || board[rank-1][file-1].includes(RED))) {
			moveCoordinate = fileCoordinates[file-1] + rankCoordinates[rank-1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// top-right
		if(rank > 0 && file < 7	&& (board[rank-1][file+1] === '' || board[rank-1][file+1].includes(RED))) {
			moveCoordinate = fileCoordinates[file+1] + rankCoordinates[rank-1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// bottom-left
		if(rank < 7 && file > 0	&& (board[rank+1][file-1] === '' || board[rank+1][file-1].includes(RED))) {
			moveCoordinate = fileCoordinates[file-1] + rankCoordinates[rank+1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// bottom-right
		if(rank < 7 && file < 7	&& (board[rank+1][file+1] === '' || board[rank+1][file+1].includes(RED))) {
			moveCoordinate = fileCoordinates[file+1] + rankCoordinates[rank+1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// up
		if(rank > 0	&& (board[rank-1][file] === '' || board[rank-1][file].includes(RED))) {
			moveCoordinate = fileCoordinates[file] + rankCoordinates[rank-1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// down
		if(rank < 7	&& (board[rank+1][file] === '' || board[rank+1][file].includes(RED))) {
			moveCoordinate = fileCoordinates[file] + rankCoordinates[rank+1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// left
		if(file > 0	&& (board[rank][file-1] === '' || board[rank][file-1].includes(RED))) {
			moveCoordinate = fileCoordinates[file-1] + rankCoordinates[rank];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// right
		if(file < 7	&& (board[rank][file+1] === '' || board[rank][file+1].includes(RED))) {
			moveCoordinate = fileCoordinates[file+1] + rankCoordinates[rank];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		if(!inCheck(kingCoordinate, testBoard, color)) {
			if(board[rank][file] === 'k' && board[7][5] === '' && board[7][6] === '' && board[7][7] === 'r') {
				move(kingCoordinate, fileCoordinates[5] + rankCoordinates[7], testBoard);
				kingCoordinate = fileCoordinates[5] + rankCoordinates[7];
				if(!inCheck(kingCoordinate, testBoard, color)) {
					move(kingCoordinate, fileCoordinates[6] + rankCoordinates[7], testBoard);
					kingCoordinate = fileCoordinates[6] + rankCoordinates[7];
					if(!inCheck(kingCoordinate, testBoard, color)) {
						kingMovesArray.push("g1o");
					}
				}
			}
			if(board[rank][file] === 'k' && board[7][3] === '' && board[7][2] === '' && board[7][0] === 'r') {
				move(kingCoordinate, fileCoordinates[3] + rankCoordinates[7], testBoard);
				kingCoordinate = fileCoordinaes[3] + rankCoordinates[7];
				if(!inCheck(kingCoordinate, testBoard, color)) {
					move(kingCoordinate, fileCoordinates[2] + rankCoordinates[7], testBoard);
					kingCoordinate = fileCoordinates[2] + rankCoordinates[7];
					if(!inCheck(kingCoordinate, testBoard, color)) {
						move(kingCoordinate, fileCoordinates[1] + rankCoordinates[7], testBoard);
						kingCoordinate = fileCoordinates[1] + rankCoordinates[7];
						if(!inCheck(kingCoordinate, testBoard, color)) {
							kingMovesArray.push("b1o");
						}
					}
				}
			}
		}
	} else {
		color = "Black";

		// top-left
		if(rank > 0 && file > 0 && (board[rank-1][file-1] === '' || !board[rank-1][file-1].includes(RED))) {
			moveCoordinate = fileCoordinates[file-1] + rankCoordinates[rank-1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// top-right
		if(rank > 0 && file < 7	&& (board[rank-1][file+1] === '' || !board[rank-1][file+1].includes(RED))) {
			moveCoordinate = fileCoordinates[file+1] + rankCoordinates[rank-1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// bottom-left
		if(rank < 7 && file > 0	&& (board[rank+1][file-1] === '' || !board[rank+1][file-1].includes(RED))) {
			moveCoordinate = fileCoordinates[file-1] + rankCoordinates[rank+1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// bottom-right
		if(rank < 7 && file < 7	&& (board[rank+1][file+1] === '' || !board[rank+1][file+1].includes(RED))) {
			moveCoordinate = fileCoordinates[file+1] + rankCoordinates[rank+1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// up
		if(rank > 0	&& (board[rank-1][file] === '' || !board[rank-1][file].includes(RED))) {
			moveCoordinate = fileCoordinates[file] + rankCoordinates[rank-1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// down
		if(rank < 7	&& (board[rank+1][file] === '' || !board[rank+1][file].includes(RED))) {
			moveCoordinate = fileCoordinates[file] + rankCoordinates[rank+1];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// left
		if(file > 0	&& (board[rank][file-1] === '' || !board[rank][file-1].includes(RED))) {
			moveCoordinate = fileCoordinates[file-1] + rankCoordinates[rank];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		// right
		if(file < 7	&& (board[rank][file+1] === '' || !board[rank][file+1].includes(RED))) {
			moveCoordinate = fileCoordinates[file+1] + rankCoordinates[rank];
			move(kingCoordinate, moveCoordinate, testBoard);
			kingCoordinate = moveCoordinate;
			if(!inCheck(kingCoordinate, testBoard, color)) {
				kingMovesArray.push(moveCoordinate);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = originCoordinate;

		if(!inCheck(kingCoordinate, testBoard, color)) {
			if(board[rank][file] === RED + 'k' + WHITE && board[0][5] === '' && board[0][6] === '' && board[0][7] === RED + 'r' + WHITE) {
				move(kingCoordinate, fileCoordinates[5] + rankCoordinates[0], testBoard);
				kingCoordinate = fileCoordinates[5] + rankCoordinates[0];
				if(!inCheck(kingCoordinate, testBoard, color)) {
					move(kingCoordinate, fileCoordinates[6] + rankCoordinates[0], testBoard);
					kingCoordinate = fileCoordinates[6] + rankCoordinates[0];
					if(!inCheck(kingCoordinate, testBoard, color)) {
						kingMovesArray.push("g1o");
					}
				}
			}
			if(board[rank][file] === RED + 'k' + WHITE && board[0][3] === '' && board[0][2] === '' && board[0][0] === RED + 'r' + WHITE) {
				move(kingCoordinate, fileCoordinates[3] + rankCoordinates[0], testBoard);
				kingCoordinate = fileCoordinaes[3] + rankCoordinates[7];
				if(!inCheck(kingCoordinate, testBoard, color)) {
					move(kingCoordinate, fileCoordinates[2] + rankCoordinates[0], testBoard);
					kingCoordinate = fileCoordinates[2] + rankCoordinates[0];
					if(!inCheck(kingCoordinate, testBoard, color)) {
						move(kingCoordinate, fileCoordinates[1] + rankCoordinates[0], testBoard);
						kingCoordinate = fileCoordinates[1] + rankCoordinates[7];
						if(!inCheck(kingCoordinate, testBoard, color)) {
							kingMovesArray.push("b1o");
						}
					}
				}
			}
		}
	}

	return kingMovesArray;
}

function checkMoves(pieceCoordinate, board) {
	let file = coordinates[pieceCoordinate[0]];
	let rank = coordinates[pieceCoordinate[1]];
	let moves = [];

	switch(board[rank][file]) {
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
		case 'B':
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i] !== '') {
					moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
					break;
				}
				moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i] !== '') {
					moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
					break;
				}
				moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i] !== '') {
					moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
					break;
				}
				moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i] !== '') {
					moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
					break;
				}
				moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			break;
		case RED + 'N' + WHITE:
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
		case 'R':
			// up
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] !== '') {
					moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
					break;
				}
				moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
			}

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] !== '') {
					moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
					break;
				}
				moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
			}

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] !== '') {
					moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
					break;
				}
				moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
			}

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] !== '') {
					moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
					break;
				}
				moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
			}

			break;
		case RED + 'Q' + WHITE:
		case 'Q':
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i] !== '') {
					moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
					break;
				}
				moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i] !== '') {
					moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
					break;
				}
				moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i] !== '') {
					moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
					break;
				}
				moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i] !== '') {
					moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
					break;
				}
				moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] !== '') {
					moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
					break;
				}
				moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
			}

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] !== '') {
					moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
					break;
				}
				moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
			}

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] !== '') {
					moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
					break;
				}
				moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
			}

			// right
			for(let i = 1; file+i >= 0; ++i) {
				if(board[rank][file+i] !== '') {
					moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
					break;
				}
				moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
			}

			break;
		}
	return moves;
}

function otherMoves(board, color) {
	let availableMoves = [];
	let moves = [];
	if(color === "White") {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file] !== '' && !board[rank][file].includes(RED) && board[rank][file] !== 'K') {
					moves = legalMoves(fileCoordinates[file] + rankCoordinates[rank], board);
					if(moves.length > 0) {
						availableMoves.push(legalMoves(fileCoordinates[file] + rankCoordinates[rank], board));
					}
				}
			}
		}
	} else {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file].includes(RED) && board[rank][file] !== RED + 'K' + WHITE) {
					moves = legalMoves(fileCoordinates[file] + rankCoordinates[rank], board);
					if(moves.length > 0) {
						availableMoves.push(legalMoves(fileCoordinates[file] + rankCoordinates[rank], board));
					}
				}
			}
		}
	}

	return availableMoves.length <= 0 ? false : true;
}

function ended(kingCoordinate, board, color) {
	let file = coordinates[kingCoordinate[0]];
	let rank = coordinates[kingCoordinate[1]];

	moves = legalMoves(kingCoordinates(board, color), board);

	if(!otherMoves(board, color) && moves.length <= 0) {
		if(!inCheck(fileCoordinates[file] + rankCoordinates[rank], board, color))
			return "stalemate";
		return "checkmate";
	}

	return false;
}

function promote(pawnCoordinate, board, piece) {
	board
		[coordinates[pawnCoordinate[1]]]
		[coordinates[pawnCoordinate[0]]] = piece;
}

let board = [
 	[RED + 'r' + WHITE, RED + 'N' + WHITE, RED + 'B' + WHITE, RED + 'Q' + WHITE, RED + 'k' + WHITE, RED + 'B' + WHITE, RED + 'N' + WHITE, RED + 'r' + WHITE],
	[RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE, RED + 'p' + WHITE],
 	['', '', '', '', '', '', '', ''],
 	['', '', '', '', '', '', '', ''],
 	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
 	['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
 	['r', 'N', 'B', 'Q', 'k', 'B', 'N', 'r']
];

let promotionMap = {
	1: 'Q',
	2: 'R',
	3: 'N',
	4: 'B'
}

let running = true;
let action;
let play;
let currentBoard = JSON.parse(JSON.stringify(board));
let turn = "White";
let drawOffer;
let gameConclusion = '';
let playing;
let errorMessage = '';
let responding;
let beforeCoordinate, afterCoordinate;
let pieceMoves;
let enPassant = [];
let promotionPiece;

show();

while(running) {
	console.clear();

	displayBoard(currentBoard);

	console.log("\n");
	if(gameConclusion !== "") console.log(gameConclusion + "\n");

	if(errorMessage !== "") console.log(RED + errorMessage + RESET + "\n");
	errorMessage = "";

	action = readline.question("Welcome to CLI-Chess!\n\n" + BLUE + "1 - Play\n2 - Quit\n\n" + RESET + "Enter a number: ");

	switch(parseInt(action)) {
		case 1:
			playing = true;
			currentBoard = JSON.parse(JSON.stringify(board));

			while(playing) {
				console.clear();
				displayBoard(currentBoard);
				
				console.log("\n");
				if(errorMessage !== "") console.log(RED + errorMessage + RESET + "\n");
				errorMessage = "";

				console.log("Turn: " + turn);
				play = readline.question(BLUE + "\n1 - Resign\n2 - Offer draw\n3 - Make a move\n\n" + RESET + "Enter a number: ");

				switch(parseInt(play)) {
					case 1:
						if(turn === "White") gameConclusion = "Black wins by resignation!";
						else gameConclusion = "White wins by resignation!";
						playing = false;
						break;
					case 2:
						responding = true;

						while(responding) {
							console.clear();
							displayBoard(currentBoard);

							console.log("\n");
							if(errorMessage !== "") console.log(RED + errorMessage + RESET + "\n");
							errorMessage = "";

							drawOffer = readline.question(GREEN + turn + " Offered a draw, will you accept?\n\n" + BLUE + "1 - Accept\n2 - Refuse\n\n" + RESET + "Enter a number: ");

							switch(parseInt(drawOffer)) {
								case 1:
									gameConclusion = "Draw by agreement!";
									playing = false;
									responding = false;

									break;
								case 2:
									responding = false;

									break;
								default:
									errorMessage = '"' + drawOffer + '"' + " is not a valid response!";
							}
						}

						break;
					case 3:
						while(true) {
							console.clear();
							displayBoard(currentBoard);

							console.log("\n");
							if(errorMessage !== "") console.log(RED + errorMessage + RESET + "\n");
							errorMessage = "";

							beforeCoordinate = readline.question("Enter a piece coordinate: ").toLowerCase();

							if(!/^\w\d$/i.test(beforeCoordinate)) {
								errorMessage = '"' + beforeCoordinate + '"' + " is not a valid coordinate!";
								continue;
							}
							if(!"abcdefgh".includes(beforeCoordinate[0]) ) {
								errorMessage = "File coordinate exceeds board!";
								continue;
							} else if(parseInt(beforeCoordinate[1]) > 8) {
								errorMessage = "Rank coordinate exceeds board!";
								continue;
							}

							piece = currentBoard
								[coordinates[beforeCoordinate[1]]]
								[coordinates[beforeCoordinate[0]]];

							if(piece === '') {
								errorMessage = beforeCoordinate + " does not have any pieces on it!";
								continue;
							}
							if((turn === "White" && piece.includes(RED))
								||
								(turn === "Black" && !piece.includes(RED))
							) {
								errorMessage = "Piece on " + beforeCoordinate + " is not your piece!";
								continue;
							}

							pieceMoves = legalMoves(beforeCoordinate, currentBoard, enPassant);
							if(pieceMoves.length <= 0) {
								errorMessage = "Piece on " + beforeCoordinate + " does not have any legal moves!";
								continue;
							}

							break;
						}
						while(true) {
							console.clear();
							displayBoard(currentBoard, JSON.parse(JSON.stringify(pieceMoves)));

							console.log("\n");
							if(errorMessage !== "") console.log(RED + errorMessage + RESET + "\n");
							errorMessage = "";

							process.stdout.write(BLUE);
							for(let i = 0; i < pieceMoves.length; ++i) {
								if(pieceMoves[i] === "b1o" || pieceMoves[i] === "b8o") {
									console.log(i+1 + ' - O-O-O');
								} else if(pieceMoves[i] === "g1o" || pieceMoves[i] === "g8o") {
									console.log(i+1 + ' - O-O');
								} else {
									console.log(i+1 + ' - ' + pieceMoves[i]);
								}
							}
							console.log(RESET);

							afterCoordinate = readline.question("Enter a number to move the piece to: ");

							if(!/^\d+$/.test(afterCoordinate) || parseInt(afterCoordinate) > pieceMoves.length || parseInt(afterCoordinate) <= 0) {
								errorMessage = '"' + afterCoordinate + '"' + " is not a valid coordinate choice!";
								continue;
							}

							break;
						}

						afterCoordinate = pieceMoves[parseInt(afterCoordinate)-1];

						enPassant = move(beforeCoordinate, afterCoordinate, currentBoard);

						if(piece === 'P' && afterCoordinate[1] === '8') {
							while(true) {
								console.clear();
								displayBoard(currentBoard);

								console.log('\n');
								if(errorMessage !== '') console.log(RED + errorMessage + RESET + '\n');
								errorMessage = '';

								promotionPiece = readline.question("What would you like to promote the pawn to?\n\n" + BLUE + "1 - Queen\n2 - Rook\n3 - Knight\n4 - Bishop\n\n" + RESET + "Enter a number: ");

								if(!/^\d$/.test(promotionPiece) || parseInt(promotionPiece) > 4 || parseInt(promotionPiece) < 1) {
									errorMessage = '"' + promotionPiece+ '"' + "is an invalid promotion choice!";
									continue;
								}

								promote(afterCoordinate, currentBoard, promotionMap[promotionPiece]);
								break;
							}
						}

						if(turn === "White") turn = "Black";
						else turn = "White";
						
						checkEnded = ended(kingCoordinates(currentBoard, turn), currentBoard, turn);
						if(checkEnded === "checkmate") {
							if(turn === "Black") gameConclusion = "White wins by checkmate!";
							else gameConclusion = "Black wins by checkmate!";
							playing = false;
						} else if(checkEnded === "stalemate") {
							gameConclusion = "Draw by stalemate!";
							playing = false;
						}

						break;
					default:
						errorMessage = '"' + play + '"' + " is not a valid operation!";
				}
			}

			turn = "White";

			break;
		case 2:
			running = false;
			break;
		default:
			errorMessage = '"' + action + '"' + " is not a valid operation!";
	}
}

hide();
