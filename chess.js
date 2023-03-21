const { show, hide } = require("alternate-screen")
const readline = require("readline-sync");

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const BLUE = "\x1b[34m";
const WHITE = "\x1b[37m";
const BG_BLACK = "\x1b[40m";
const BG_WHITE = "\x1b[47m";
const BG_YELLOW = "\x1b[43m";

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


function displayBoard(board, highlightedSquares=[]) {
	highlightedSquares[highlightedSquares.indexOf("g1o")] = "g1";
	highlightedSquares[highlightedSquares.indexOf("b1o")] = "b1";
	highlightedSquares[highlightedSquares.indexOf("g8o")] = "g8";
	highlightedSquares[highlightedSquares.indexOf("b8o")] = "b8";

	for(let rank = 0; rank < board.length; ++rank) {
		process.stdout.write((8-rank + "\t"));
		for(let file = 0; file < board[rank].length; ++file) {
			let square = board[rank][file];

			if(square !== '') {
				if(!square.includes(RED)) {
					if((highlightedSquares.includes(fileCoordinates[file] + rankCoordinates[rank]))) {
							process.stdout.write(BG_YELLOW + ' ' + BLUE + square + WHITE + ' ');
					} else {
						if(rank % 2 === file % 2) process.stdout.write(BG_WHITE + ' ' + BLUE + square + WHITE + ' ');
						else process.stdout.write(BG_BLACK + BLUE + ' ' + square + WHITE + ' ');
					}
				} else {
					if(highlightedSquares.includes(fileCoordinates[file] + rankCoordinates[rank])) process.stdout.write(BG_YELLOW + ' ' + square + WHITE + ' ');
					else {
						if(rank % 2 === file % 2) process.stdout.write(BG_WHITE + ' ' + square + WHITE + ' ');
						else process.stdout.write(BG_BLACK + ' ' + square + WHITE + ' ');
					}
				}
			} else {
				if(rank % 2 !== file % 2) {
					if(highlightedSquares.includes(fileCoordinates[file] + rankCoordinates[rank])) process.stdout.write(BG_YELLOW +  ' - ');
					else process.stdout.write(BG_BLACK + ' - ');
				} else {
					if(highlightedSquares.includes(fileCoordinates[file] + rankCoordinates[rank])) process.stdout.write(BG_YELLOW + ' - ');
					else process.stdout.write(BG_WHITE + ' - ');
				}
			}
			process.stdout.write(RESET);
		}

		console.log();
	}
	console.log(RESET + "\n\n\t a  b  c  d  e  f  g  h");
}

function move(before, after, board, coordinates) {
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
			console.log(fileCoordinates[afterFile-1]);
			enPassant.push([fileCoordinates[afterFile-1] + rankCoordinates[afterRank], fileCoordinates[afterFile] + rankCoordinates[afterRank+1]]);
		}
		if(board[afterRank][afterFile+1] === RED + 'p' + WHITE || board[afterRank][afterFile+1] === RED + 'P' + WHITE) {
			enPassant.push([fileCoordinates[afterFile+1] + rankCoordinates[afterRank], fileCoordinates[afterFile] + rankCoordinates[afterRank+1]]);
		}
	}

	return enPassant;
}

function legalMoves(pieceCoordinate, board, coordinates, enPassant=[]) {
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

	let testBoard = JSON.parse(JSON.stringify(board));
	let directions = [];
	let file = coordinates[pieceCoordinate[0]];
	let rank = coordinates[pieceCoordinate[1]];
	let piece = board[rank][file];
	let moves = [];
	let kingCoordinate;
	let testPiece;

	switch(piece) {
		case RED + 'p' + WHITE:
			kingCoordinate = kingCoordinates(board, "Black");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank + 2 < 8 && board[rank+2][file] === '' && board[rank+1][file] === '') {
				if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank+2]);
					}
				} else {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank+2]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
		case RED + 'P' + WHITE:
			kingCoordinate = kingCoordinates(board, "Black");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank+1 < 8 && file-1 >= 0 && file+1 < 8) {
				if(!board[rank+1][file-1].includes(RED) && board[rank+1][file-1] !== '') {
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+1], testBoard, coordinates);
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-1] + rankCoordinates[rank+1]);
						}
					} else {
						moves.push(fileCoordinates[file-1] + rankCoordinates[rank+1]);
					}
				}

				testBoard = JSON.parse(JSON.stringify(board));

				if(!board[rank+1][file+1].includes(RED) && board[rank+1][file+1] !== '') {
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+1], testBoard, coordinates);
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+1] + rankCoordinates[rank+1]);
						}
					} else {
						moves.push(fileCoordinates[file+1] + rankCoordinates[rank+1]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank+1 < 8 && board[rank+1][file] === '') {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank+1]);
					}
				} else {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank+1]);
					}
				}
			}

			for(let i = 0; i < enPassant.length; ++i) {
				if(enPassant[i][0] === pieceCoordinate) {
					moves.push(enPassant[i][1]);
				}
			}

			break;
		case 'p':
			kingCoordinate = kingCoordinates(board, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank - 2 >= 0 && board[rank-2][file] === '' && board[rank-1][file] === '') {
				if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank-2]);
					}
				} else {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank-2]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
		case 'P':
			kingCoordinate = kingCoordinates(board, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank-1 >= 0 && file-1 >= 0 && file+1 < 8) {
				if(board[rank-1][file-1].includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank-1], testBoard, coordinates);
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-1] + rankCoordinates[rank-1]);
						}
					} else {
						moves.push(fileCoordinates[file-1] + rankCoordinates[rank-1]);
					}
				}

				testBoard = JSON.parse(JSON.stringify(board));

				if(board[rank-1][file+1].includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-1], testBoard, coordinates);
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+1] + rankCoordinates[rank-1]);
						}
					} else {
						moves.push(fileCoordinates[file+1] + rankCoordinates[rank-1]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank-1 >= 0 && board[rank-1][file] === '') {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank-1]);
					}
				} else {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank-1]);
					}
				}
			}

			for(let i = 0; i < enPassant.length; ++i) {
				if(enPassant[i][0] === pieceCoordinate) {
					moves.push(enPassant[i][1]);
				}
			}

			break;
		case RED + 'B' + WHITE:
			kingCoordinate = kingCoordinates(testBoard, "Black")
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);
			
			break;
		case 'B':
			kingCoordinate = kingCoordinates(testBoard, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}
			
			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			break;
		case RED + 'N' + WHITE:
			kingCoordinate = kingCoordinates(board, "Black");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank-2 >= 0 && file-1 >= 0 && (board[rank-2][file-1] === '' || !board[rank-2][file-1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file-1] + rankCoordinates[rank-2]);
					}
				} else {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file-1] + rankCoordinates[rank-2]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank-2 >= 0 && file+1 < 8 && (board[rank-2][file+1] === '' || !board[rank-2][file+1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file+1] + rankCoordinates[rank-2]);
					}
				} else {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file+1] + rankCoordinates[rank-2]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank+2 < 8 && file-1 >= 0 && (board[rank+2][file-1] === '' || !board[rank+2][file-1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file-1] + rankCoordinates[rank+2]);
					}
				} else {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file-1] + rankCoordinates[rank+2]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank+2 < 8 && file+1 < 8 && (board[rank+2][file+1] === '' || !board[rank+2][file+1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file+1] + rankCoordinates[rank+2]);
					}
				} else {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file+1] + rankCoordinates[rank+2]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file-2 >= 0 && rank-1 >= 0 && (board[rank-1][file-2] === '' || !board[rank-1][file-2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file-2] + rankCoordinates[rank-1]);
					}
				} else {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file-2] + rankCoordinates[rank-1]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file-2 >= 0 && rank+1 < 8 && (board[rank+1][file-2] === '' || !board[rank+1][file-2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file-2] + rankCoordinates[rank+1]);
					}
				} else {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file-2] + rankCoordinates[rank+1]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file+2 < 8 && rank-1 >= 0 && (board[rank-1][file+2] === '' || !board[rank-1][file+2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file+2] + rankCoordinates[rank-1]);
					}
				} else {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file+2] + rankCoordinates[rank-1]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file+2 < 8 && rank+1 < 8 && (board[rank+1][file+2] === '' || !board[rank+1][file+2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file+2] + rankCoordinates[rank+1]);
					}
				} else {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push(fileCoordinates[file+2] + rankCoordinates[rank+1]);
					}
				}
			}

			break;
		case 'N':
			kingCoordinate = kingCoordinates(testBoard, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank-2 >= 0 && file-1 >= 0 && (board[rank-2][file-1] === '' || board[rank-2][file-1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file-1] + rankCoordinates[rank-2]);
					}
				} else {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file-1] + rankCoordinates[rank-2]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank-2 >= 0 && file+1 < 8 && (board[rank-2][file+1] === '' || board[rank-2][file+1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file+1] + rankCoordinates[rank-2]);
					}
				} else {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file+1] + rankCoordinates[rank-2]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank+2 < 8 && file-1 >= 0 && (board[rank+2][file-1] === '' || board[rank+2][file-1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file-1] + rankCoordinates[rank+2]);
					}
				} else {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file-1] + rankCoordinates[rank+2]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank+2 < 8 && file+1 < 8 && (board[rank+2][file+1] === '' || board[rank+2][file+1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file+1] + rankCoordinates[rank+2]);
					}
				} else {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file+1] + rankCoordinates[rank+2]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file-2 >= 0 && rank-1 >= 0 && (board[rank-1][file-2] === '' || board[rank-1][file-2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file-2] + rankCoordinates[rank-1]);
					}
				} else {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file-2] + rankCoordinates[rank-1]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file-2 >= 0 && rank+1 < 8 && (board[rank+1][file-2] === '' || board[rank+1][file-2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file-2] + rankCoordinates[rank+1]);
					}
				} else {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file-2] + rankCoordinates[rank+1]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file+2 < 8 && rank-1 >= 0 && (board[rank-1][file+2] === '' || board[rank-1][file+2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file+2] + rankCoordinates[rank-1]);
					}
				} else {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file+2] + rankCoordinates[rank-1]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file+2 < 8 && rank+1 < 8 && (board[rank+1][file+2] === '' || board[rank+1][file+2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file+2] + rankCoordinates[rank+1]);
					}
				} else {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push(fileCoordinates[file+2] + rankCoordinates[rank+1]);
					}
				}
			}

			break;
		case RED + 'r' + WHITE:
		case RED + 'R' + WHITE:
			kingCoordinate = kingCoordinates(testBoard, "Black");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						} else {
							break;
						}
					}
				} else if(!board[rank][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						}
						break;
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						} else {
							break;
						}
					}
				} else if(!board[rank][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						}
						break;
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);

			break;
		case 'R':
		case 'r':
			kingCoordinate = kingCoordinates(testBoard, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						}
						break;
					}
				} else if(board[rank][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						}
						break;
					}
				} else if(board[rank][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);

			break;
		case RED + 'Q' + WHITE:
			kingCoordinate = kingCoordinates(testBoard, "Black")
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						} else {
							break;
						}
					}
				} else if(!board[rank][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						}
						break;
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						} else {
							break;
						}
					}
				} else if(!board[rank][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						}
						break;
					}
				} else {
					break;
				}
			}

			if(directions.length > 0) moves.push(directions);

			break;
		case 'Q':
			kingCoordinate = kingCoordinates(testBoard, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						console.log('a');
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						}
						break;
					}
				} else if(board[rank][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						} else {
							break;
						}
					}
				} else {
					break;
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						}
						break;
					}
				} else if(board[rank][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						} else {
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
			moves = kingMoves(kingCoordinates(board, "Black"), board, coordinates);

			break;
		case 'k':
		case 'K':
			moves = kingMoves(kingCoordinates(board, "White"), board, coordinates);
	}

	return moves;
}

function inCheck(kingCoordinate, board, coordinates, color) {
	if(color === "White") {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file].includes(RED) && board[rank][file] !== RED + 'K' + WHITE) {
					let pieceMoves = checkMoves(fileCoordinates[file] + rankCoordinates[rank], board, coordinates);
					for(let i = 0; i < pieceMoves.length; ++i) {
						if(pieceMoves[i].includes(kingCoordinate)) return true;
					}
				}
			}
		}
	} else {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if((!board[rank][file].includes(RED) && board[rank][file] !== '') && board[rank][file] !== RED + 'K' + WHITE) {
					let pieceMoves = checkMoves(fileCoordinates[file] + rankCoordinates[rank], board, coordinates);
					for(let i = 0; i < pieceMoves.length; ++i) {
						if(pieceMoves[i].includes(kingCoordinate)) return true;
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

function kingMoves(kingCoordinate, board, coordinates) {
	let kingMovesArray = [];
	let file = coordinates[kingCoordinate[0]];
	let rank = coordinates[kingCoordinate[1]];
	let testBoard = JSON.parse(JSON.stringify(board));

	if(!board[rank][file].includes(RED)) {
		let kingCoordinate = kingCoordinates(board, "White");

		// top-left
		if(rank-1 >= 0 && file-1 >= 0) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file-1] + rankCoordinates[rank-1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "White");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
				kingMovesArray.push(fileCoordinates[file-1] + rankCoordinates[rank-1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "White");

		// top-right
		if(rank-1 >= 0 && file+1 < 8) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file+1] + rankCoordinates[rank-1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "White");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
				kingMovesArray.push(fileCoordinates[file+1] + rankCoordinates[rank-1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "White");

		// bottom-left
		if(rank+1 < 8 && file-1 >= 0) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file-1] + rankCoordinates[rank+1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "White");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
				kingMovesArray.push(fileCoordinates[file-1] + rankCoordinates[rank+1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "White");

		// bottom-right
		if(rank+1 < 8 && file+1 < 8) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file+1] + rankCoordinates[rank+1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "White");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
				kingMovesArray.push(fileCoordinates[file+1] + rankCoordinates[rank+1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "White");

		// up
		if(rank-1 >= 0) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file] + rankCoordinates[rank-1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "White");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
				kingMovesArray.push(fileCoordinates[file] + rankCoordinates[rank-1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "White");

		// down
		if(rank+1 < 8) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file] + rankCoordinates[rank+1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "White");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
				kingMovesArray.push(fileCoordinates[file] + rankCoordinates[rank+1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "White");

		// left
		if(file-1 >= 0) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file-1] + rankCoordinates[rank], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "White");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
				kingMovesArray.push(fileCoordinates[file-1] + rankCoordinates[rank]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "White");

		// right
		if(file+1 < 8) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file+1] + rankCoordinates[rank], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "White");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
				kingMovesArray.push(fileCoordinates[file+1] + rankCoordinates[rank]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "White");

		if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
			if(board[rank][file] === 'k' && board[7][5] === '' && board[7][6] === '' && board[7][7] === 'r') {
				move(kingCoordinate, fileCoordinates[5] + rankCoordinates[7], testBoard, coordinates);
				kingCoordinate = kingCoordinates(testBoard, "White");
				if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
					move(kingCoordinate, fileCoordinates[6] + rankCoordinates[7], testBoard, coordinates);
					kingCoordinate = kingCoordinates(testBoard, "White");
					if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
						kingMovesArray.push("g1o");
					}
				}
			}
			if(board[rank][file] === 'k' && board[7][3] === '' && board[7][2] === '' && board[7][1] === '' && board[7][0] === 'r') {
				move(kingCoordinate, fileCoordinates[3] + rankCoordinates[7], testBoard, coordinates);
				kingCoordinate = kingCoordinates(testBoard, "White");
				if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
					move(kingCoordinate, fileCoordinates[2] + rankCoordinates[7], testBoard, coordinates);
					kingCoordinate = kingCoordinates(testBoard, "White");
					if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
						move(kingCoordinate, fileCoordinates[1] + rankCoordinates[7], testBoard, coordinates);
						kingCoordinate = kingCoordinates(testBoard, "White");
						if(!inCheck(kingCoordinate, testBoard, coordinates, "White")) {
							kingMovesArray.push("b1o");
						}
					}
				}
			}
		}
	} else {
		let kingCoordinate = kingCoordinates(board, "Black");

		// top-left
		if(rank-1 >= 0 && file-1 >= 0) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file-1] + rankCoordinates[rank-1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "Black");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
				kingMovesArray.push(fileCoordinates[file-1] + rankCoordinates[rank-1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "Black");

		// top-right
		if(rank-1 >= 0 && file+1 < 8) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file+1] + rankCoordinates[rank-1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "Black");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
				kingMovesArray.push(fileCoordinates[file+1] + rankCoordinates[rank-1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "Black");

		// bottom-left
		if(rank+1 < 8 && file-1 >= 0) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file-1] + rankCoordinates[rank+1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "Black");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
				kingMovesArray.push(fileCoordinates[file-1] + rankCoordinates[rank+1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "Black");
		// bottom-right
		if(rank+1 < 8 && file+1 < 8) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file+1] + rankCoordinates[rank+1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "Black");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
				kingMovesArray.push(fileCoordinates[file+1] + rankCoordinates[rank+1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "Black");

		// up
		if(rank-1 >= 0) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file] + rankCoordinates[rank-1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "Black");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
				kingMovesArray.push(fileCoordinates[file] + rankCoordinates[rank-1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "Black");

		// down
		if(rank+1 < 8) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file] + rankCoordinates[rank+1], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "Black");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
				kingMovesArray.push(fileCoordinates[file] + rankCoordinates[rank+1]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));

		// left
		if(file-1 >= 0) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file-1] + rankCoordinates[rank], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "Black");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
				kingMovesArray.push(fileCoordinates[file-1] + rankCoordinates[rank]);
			}
		}

		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "Black");

		// right
		if(file+1 < 8) {
			move(fileCoordinates[file] + rankCoordinates[rank], fileCoordinates[file+1] + rankCoordinates[rank], testBoard, coordinates);
			kingCoordinate = kingCoordinates(testBoard, "Black");
			if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
				kingMovesArray.push(fileCoordinates[file+1] + rankCoordinates[rank]);
			}
		}
		
		testBoard = JSON.parse(JSON.stringify(board));
		kingCoordinate = kingCoordinates(board, "Black");

		if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
			if(board[rank][file] === RED + 'k' + WHITE && board[0][5] === '' && board[0][6] === '' && board[0][7] === RED + 'r' + WHITE) {
				move(kingCoordinate, fileCoordinates[5] + rankCoordinates[0], testBoard, coordinates);
				kingCoordinate = kingCoordinates(testBoard, "Black");
				if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
					move(kingCoordinate, fileCoordinates[6] + rankCoordinates[0], testBoard, coordinates);
					kingCoordinate = kingCoordinates(testBoard, "Black");
					if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
						kingMovesArray.push("g8o");
					}
				}
			}
			if(board[rank][file] === RED + 'k' + WHITE && board[0][3] === '' && board[0][2] === '' && board[0][1] === '' && board[0][0] === RED + 'r' + WHITE) {
				move(kingCoordinate, fileCoordinates[3] + rankCoordinates[0], testBoard, coordinates);
				kingCoordinate = kingCoordinates(testBoard, "Black");
				if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
					move(kingCoordinate, fileCoordinates[2] + rankCoordinates[0], testBoard, coordinates);
					kingCoordinate = kingCoordinates(testBoard, "Black");
					if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
						move(kingCoordinate, fileCoordinates[1] + rankCoordinates[0], testBoard, coordinates);
						kingCoordinate = kingCoordinates(testBoard, "Black");
						if(!inCheck(kingCoordinate, testBoard, coordinates, "Black")) {
							kingMovesArray.push("b8o");
						}
					}
				}
			}
		}
	}
	
	let i = 0;
	while(i < kingMovesArray.length) {
		if(board
				[coordinates[kingMovesArray[i][1]]]
				[coordinates[kingMovesArray[i][0]]] !== '') {
			kingMovesArray.splice(kingMovesArray.indexOf(kingMovesArray[i]), 1);
			i = 0;
		} else {
			++i;
		}
	}

	return kingMovesArray;
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
	let count = 0;

	switch(piece) {
		case RED + 'p' + WHITE:
		case RED + 'P' + WHITE:
			if(rank+1 < 8 && file+1 < 8) {
				moves.push([fileCoordinates[file-1] + rankCoordinates[rank+1]]);
				moves.push([fileCoordinates[file+1] + rankCoordinates[rank+1]]);
			}

			break;
		case 'p':
		case 'P':
			if(rank-1 >= 0 && file-1 >= 0) {
				moves.push([fileCoordinates[file-1] + rankCoordinates[rank-1]]);
				moves.push([fileCoordinates[file+1] + rankCoordinates[rank-1]]);
			}

			break;
		case RED + 'B' + WHITE:
		case 'B':
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				}

				moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				}

				moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				}

				moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				}

				moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			if(directions.length > 0) moves.push(directions);

			break;
		case RED + 'N' + WHITE:
		case 'N':
			if(rank-2 >= 0 && file-1 >= 0) {
				moves.push([fileCoordinates[file-1] + rankCoordinates[rank-2]]);
			}
			if(rank-2 >= 0 && file+1 < 8) {
				moves.push([fileCoordinates[file+1] + rankCoordinates[rank-2]]);
			}
			if(rank+2 < 8 && file-1 >= 0) {
				moves.push([fileCoordinates[file-1] + rankCoordinates[rank+2]]);
			}
			if(rank+2 < 8 && file+1 < 8) {
				moves.push([fileCoordinates[file+1] + rankCoordinates[rank+2]]);
			}
			if(file-2 >= 0 && rank-1 >= 0) {
				moves.push([fileCoordinates[file-2] + rankCoordinates[rank-1]]);
			}
			if(file-2 >= 0 && rank+1 < 8) {
				moves.push([fileCoordinates[file-2] + rankCoordinates[rank+1]]);
			}
			if(file+2 < 8 && rank-1 >= 0) {
				moves.push([fileCoordinates[file+2] + rankCoordinates[rank-1]]);
			}
			if(file+2 < 8 && rank+1 < 8) {
				moves.push([fileCoordinates[file+2] + rankCoordinates[rank+1]]);
			}

			break;
		case RED + 'R' + WHITE:
		case 'R':
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				} else {
					moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				} else {
					moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						++count;
					} else {
						break;
					}
				} else {
					moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						++count;
					} else {
						break;
					}
				} else {
					moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
				}
			}

			if(directions.length > 0) moves.push(directions);

			break;
		case RED + 'Q' + WHITE:
		case 'Q':
			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				}

				moves.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				}

				moves.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				}

				moves.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				}

				moves.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				} else {
					moves.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				} else {
					moves.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						++count;
					} else {
						break;
					}
				} else {
					moves.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] !== '') {
					if(count === 0) {
						moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						++count;
					} else {
						break;
					}
				} else {
					moves.push(fileCoordinates[file+i] + rankCoordinates[rank]);
				}
			}

			if(directions.length > 0) moves.push(directions);

			break;
		}
	return moves;
}

function otherMoves(board, color, coordinates) {
	let availableMoves = [];

	if(color === "White") {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file] !== '' && !board[rank][file].includes(RED) && board[rank][file] !== 'K') {
					let moves = legalMoves(fileCoordinates[file] + rankCoordinates[rank], board, coordinates);
					if(moves.length > 0) {
						availableMoves.push(legalMoves(fileCoordinates[file] + rankCoordinates[rank], board, coordinates));
					}
				}
			}
		}
	} else {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file].includes(RED) && board[rank][file] !== RED + 'K' + WHITE) {
					let moves = legalMoves(fileCoordinates[file] + rankCoordinates[rank], board, coordinates);
					if(moves.length > 0) {
						availableMoves.push(legalMoves(fileCoordinates[file] + rankCoordinates[rank], board, coordinates));
					}
				}
			}
		}
	}

	return availableMoves.length <= 0 ? false : true;
}

function ended(kingCoordinate, board, coordinates, color) {
	let file = coordinates[kingCoordinate[0]];
	let rank = coordinates[kingCoordinate[1]];

	if(color === "White") {
		moves = kingMoves(kingCoordinates(board, "White"), board, coordinates);

		if(otherMoves(board, "White", coordinates) === false && moves.length <= 0) {
			if(inCheck(fileCoordinates[file] + rankCoordinates[rank], board, coordinates, "White") === false) return "stalemate";
			return "checkmate";
		}
	} else {
		moves = kingMoves(kingCoordinates(board, "Black"), board, coordinates);

		if(otherMoves(board, "Black", coordinates) === false && moves.length <= 0) {
			if(inCheck(fileCoordinates[file] + rankCoordinates[rank], board, coordinates, "Black") === false) return "stalemate";
			return "checkmate";
		}

	}

	return false;
}

function promote(pawnCoordinate, board, coordinates, piece) {
	board[coordinates[pawnCoordinate[1]]][coordinates[pawnCoordinate[0]]] = piece;
}

/*
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
*/

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

let board = [
	[RED + 'r' + WHITE, '', '', '', RED + 'k' + WHITE, '', '', RED + 'r' + WHITE],
 	['', '', '', '', '', '', '', ''],
 	['', '', '', '', '', '', '', ''],
 	['', '', 'R', '', '', 'R', '', ''],
 	['', '', RED + 'R' + WHITE, '', RED + 'R' + WHITE, '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['r', '', '', '', 'k', '', '', 'r'],
];


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
let highlight = [];

show();

while(running) {
	console.clear();

	displayBoard(currentBoard);

	console.log("\n");
	if(gameConclusion !== "") console.log(gameConclusion + "\n");

	if(errorMessage !== "") console.log(errorMessage + "\n");
	errorMessage = "";

	action = readline.question("Welcome to CLI-Chess!\n\n1 - Play\n2 - Quit\n\nEnter a number: ");

	switch(parseInt(action)) {
		case 1:
			playing = true;
			currentBoard = JSON.parse(JSON.stringify(board));

			while(playing) {
				console.clear();
				displayBoard(currentBoard);
				
				console.log("\n");
				if(errorMessage !== "") console.log(errorMessage + "\n");
				errorMessage = "";

				console.log("Turn: " + turn);
				play = readline.question("\n1 - Resign\n2 - Offer draw\n3 - Make a move\n\nEnter a number: ");

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
							if(errorMessage !== "") console.log(errorMessage + "\n");
							errorMessage = "";

							drawOffer = readline.question(turn + " Offered a draw, will you accept?\n\n1 - Accept\n2 - Refuse\nEnter a number: ");

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
							if(errorMessage !== "") console.log(errorMessage + "\n");
							errorMessage = "";

							beforeCoordinate = readline.question("Enter a piece coordinate: ");
							beforeCoordinate = beforeCoordinate.toLowerCase();

							if(!/\w{1}\d{1}/i.test(beforeCoordinate)) {
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

							if(currentBoard
								[coordinates[beforeCoordinate[1]]]
								[coordinates[beforeCoordinate[0]]] === ''
							) {
								errorMessage = beforeCoordinate + " does not have any pieces on it!";
								continue;
							}
							if((turn === "White" && currentBoard
								[coordinates[beforeCoordinate[1]]]
								[coordinates[beforeCoordinate[0]]].includes(RED))
								||
								(turn === "Black" && !currentBoard
								[coordinates[beforeCoordinate[1]]]
								[coordinates[beforeCoordinate[0]]].includes(RED))
							) {
								errorMessage = "Piece on " + beforeCoordinate + " is not your piece!";
								continue;
							}

							pieceMoves = legalMoves(beforeCoordinate, currentBoard, coordinates, enPassant);
							if(pieceMoves.length <= 0) {
								errorMessage = "Piece on " + beforeCoordinate + " does not have any legal moves!";
								continue;
							}

							break;
						}
						while(true) {
							console.clear();
							highlight = JSON.parse(JSON.stringify(pieceMoves));
							displayBoard(currentBoard, highlight);

							console.log("\n");
							if(errorMessage !== "") console.log(errorMessage + "\n");
							errorMessage = "";

							for(let i = 0; i < pieceMoves.length; ++i) {
								if(pieceMoves[i] === "b1o" || pieceMoves[i] === "b8o") {
									console.log(i+1 + ' - O-O-O');
									continue;
								}
								if(pieceMoves[i] === "g1o" || pieceMoves[i] === "g8o") {
									console.log(i+1 + ' - O-O');
									continue;
								}
								console.log(i+1 + ' - ' + pieceMoves[i]);
							}
							console.log();

							afterCoordinate = readline.question("Enter a number to move the piece to: ");

							if(!/^\d$/.test(afterCoordinate) || parseInt(afterCoordinate) > pieceMoves.length || parseInt(afterCoordinate) <= 0) {
								errorMessage = '"' + afterCoordinate + '"' + " is not a valid coordinate choice!";
								continue;
							}

							break;
						}

						enPassant = move(beforeCoordinate, pieceMoves[parseInt(afterCoordinate)-1], currentBoard, coordinates);

						if(turn === "White") turn = "Black";
						else turn = "White";
						
						checkEnded = ended(kingCoordinates(currentBoard, turn), currentBoard, coordinates, turn);
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

// TODO: optimize and clean this shit
