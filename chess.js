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

function move(before, after, board, coordinates, fileCoordinates, rankCoordinates) {
	let enPassant = [];

	let beforeFile = coordinates[before[0]];
	let beforeRank = coordinates[before[1]];

	let afterFile = coordinates[after[0]];
	let afterRank = coordinates[after[1]];
	
	let originPiece = board[beforeRank][beforeFile];

	switch(originPiece) {
		case RED + 'p' + WHITE:
			board[afterRank][afterFile] = RED + 'P' + WHITE;
			break;
		case 'p':
			board[afterRank][afterFile] = 'P';
			break;
		default:
			board[afterRank][afterFile] = originPiece;
	}

	board[beforeRank][beforeFile] = '';

	
	if(originPiece === RED + 'p' + WHITE) {
		if(board[afterRank][afterFile-1] === 'p') {
			enPassant.push([fileCoordinates[afterFile-1] + rankCoordinates[afterRank], fileCoordinates[afterFile] + rankCoordinates[afterRank-1]]);
		}
		if(board[afterRank][afterFile+1] === 'p') {
			enPassant.push([fileCoordinates[afterFile+1] + rankCoordinates[afterRank], fileCoordinates[afterFile] + rankCoordinates[afterRank-1]]);
		}
	} else if(originPiece === 'p') {
		if(board[afterRank][afterFile-1] === RED + 'p' + WHITE) {
			enPassant.push([fileCoordinates[afterFile-1] + rankCoordinates[afterRank], fileCoordinates[afterFile] + rankCoordinates[afterRank+1]]);
		}
		if(board[afterRank][afterFile+1] === RED + 'p' + WHITE) {
			enPassant.push([fileCoordinates[afterFile+1] + rankCoordinates[afterRank], fileCoordinates[afterFile] + rankCoordinates[afterRank+1]]);
		}
	}

	return [enPassant, [before]];
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
			kingCoordinate = kingCoordinates(board, fileCoordinates, rankCoordinates, "Black");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank + 2 < 8 && board[rank+2][file] === '') {
				if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file] + rankCoordinates[rank+2]]);
					}
				} else {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file] + rankCoordinates[rank+2]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
		case RED + 'P' + WHITE:
			kingCoordinate = kingCoordinates(board, fileCoordinates, rankCoordinates, "Black");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank+1 < 8 && file-1 >= 0 && file+1 < 8) {
				if(!board[rank+1][file-1].includes(RED) && board[rank+1][file-1] !== '') {
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+1], testBoard, coordinates);
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push([fileCoordinates[file-1] + rankCoordinates[rank+1]]);
						}
					} else {
						moves.push([fileCoordinates[file-1] + rankCoordinates[rank+1]]);
					}
				}

				testBoard = JSON.parse(JSON.stringify(board));

				if(!board[rank+1][file+1].includes(RED) && board[rank+1][file+1] !== '') {
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+1], testBoard, coordinates);
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							moves.push([[fileCoordinates[file+1] + rankCoordinates[rank+1]]]);
						}
					} else {
						moves.push([fileCoordinates[file+1] + rankCoordinates[rank+1]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank+1 < 8 && board[rank+1][file] === '') {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file] + rankCoordinates[rank+1]]);
					}
				} else {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file] + rankCoordinates[rank+1]]);
					}
				}
			}

			break;
		case 'p':
			kingCoordinate = kingCoordinates(board, fileCoordinates, rankCoordinates, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank - 2 >= 0 && board[rank-2][file] === '') {
				if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file] + rankCoordinates[rank-2]]);
					}
				} else {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file] + rankCoordinates[rank-2]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));
		case 'P':
			kingCoordinate = kingCoordinates(board, fileCoordinates, rankCoordinates, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank-1 >= 0 && file-1 >= 0 && file+1 < 8) {
				if(board[rank-1][file-1].includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank-1], testBoard, coordinates);
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push([fileCoordinates[file-1] + rankCoordinates[rank-1]]);
						}
					} else {
						moves.push([fileCoordinates[file-1] + rankCoordinates[rank-1]]);
					}
				}

				testBoard = JSON.parse(JSON.stringify(board));

				if(board[rank-1][file+1].includes(RED)) {
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-1], testBoard, coordinates);
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							moves.push([fileCoordinates[file+1] + rankCoordinates[rank-1]]);
						}
					} else {
						moves.push([fileCoordinates[file+1] + rankCoordinates[rank-1]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank-1 >= 0 && board[rank-1][file] === '') {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file] + rankCoordinates[rank-1]]);
					}
				} else {
					move(testPiece, fileCoordinates[file] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file] + rankCoordinates[rank-1]]);
					}
				}
			}

			break;
		case RED + 'B' + WHITE:
			kingCoordinate = kingCoordinates(testBoard, fileCoordinates, rankCoordinates, "Black")
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
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
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
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
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
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
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
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
			kingCoordinate = kingCoordinates(testBoard, fileCoordinates, rankCoordinates, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
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

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
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

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
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

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
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
		case RED + 'N' + WHITE:
			kingCoordinate = kingCoordinates(board, fileCoordinates, rankCoordinates, "Black");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank-2 >= 0 && file-1 >= 0 && (board[rank-2][file-1] === '' || !board[rank-2][file-1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file-1] + rankCoordinates[rank-2]]);
					}
				} else {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file-1] + rankCoordinates[rank-2]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank-2 >= 0 && file+1 < 8 && (board[rank-2][file+1] === '' || !board[rank-2][file+1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file+1] + rankCoordinates[rank-2]]);
					}
				} else {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file+1] + rankCoordinates[rank-2]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank+2 < 8 && file-1 >= 0 && (board[rank+2][file-1] === '' || !board[rank+2][file-1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file-1] + rankCoordinates[rank+2]]);
					}
				} else {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file-1] + rankCoordinates[rank+2]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank+2 < 8 && file+1 < 8 && (board[rank+2][file+1] === '' || !board[rank+2][file+1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file+1] + rankCoordinates[rank+2]]);
					}
				} else {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file+1] + rankCoordinates[rank+2]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file-2 >= 0 && rank-1 >= 0 && (board[rank-1][file-2] === '' || !board[rank-1][file-2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file-2] + rankCoordinates[rank-1]]);
					}
				} else {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file-2] + rankCoordinates[rank-1]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file-2 >= 0 && rank+1 < 8 && (board[rank+1][file-2] === '' || !board[rank+1][file-2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file-2] + rankCoordinates[rank+1]]);
					}
				} else {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file-2] + rankCoordinates[rank+1]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file+2 < 8 && rank-1 >= 0 && (board[rank-1][file+2] === '' || !board[rank-1][file+2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file+2] + rankCoordinates[rank-1]]);
					}
				} else {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file+2] + rankCoordinates[rank-1]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file+2 < 8 && rank+1 < 8 && (board[rank+1][file+2] === '' || !board[rank+1][file+2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === true) {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file+2] + rankCoordinates[rank+1]]);
					}
				} else {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
						moves.push([fileCoordinates[file+2] + rankCoordinates[rank+1]]);
					}
				}
			}

			break;
		case 'N':
			kingCoordinate = kingCoordinates(testBoard, fileCoordinates, rankCoordinates, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			if(rank-2 >= 0 && file-1 >= 0 && (board[rank-2][file-1] === '' || board[rank-2][file-1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file-1] + rankCoordinates[rank-2]]);
					}
				} else {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file-1] + rankCoordinates[rank-2]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank-2 >= 0 && file+1 < 8 && (board[rank-2][file+1] === '' || board[rank-2][file+1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file+1] + rankCoordinates[rank-2]]);
					}
				} else {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank-2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file+1] + rankCoordinates[rank-2]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank+2 < 8 && file-1 >= 0 && (board[rank+2][file-1] === '' || board[rank+2][file-1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file-1] + rankCoordinates[rank+2]]);
					}
				} else {
					move(testPiece, fileCoordinates[file-1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file-1] + rankCoordinates[rank+2]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(rank+2 < 8 && file+1 < 8 && (board[rank+2][file+1] === '' || board[rank+2][file+1].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file+1] + rankCoordinates[rank+2]]);
					}
				} else {
					move(testPiece, fileCoordinates[file+1] + rankCoordinates[rank+2], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file+1] + rankCoordinates[rank+2]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file-2 >= 0 && rank-1 >= 0 && (board[rank-1][file-2] === '' || board[rank-1][file-2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file-2] + rankCoordinates[rank-1]]);
					}
				} else {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file-2] + rankCoordinates[rank-1]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file-2 >= 0 && rank+1 < 8 && (board[rank+1][file-2] === '' || board[rank+1][file-2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file-2] + rankCoordinates[rank+1]]);
					}
				} else {
					move(testPiece, fileCoordinates[file-2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file-2] + rankCoordinates[rank+1]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file+2 < 8 && rank-1 >= 0 && (board[rank-1][file+2] === '' || board[rank-1][file+2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file+2] + rankCoordinates[rank-1]]);
					}
				} else {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank-1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file+2] + rankCoordinates[rank-1]]);
					}
				}
			}

			testBoard = JSON.parse(JSON.stringify(board));

			if(file+2 < 8 && rank+1 < 8 && (board[rank+1][file+2] === '' || board[rank+1][file+2].includes(RED))) {
				if(inCheck(kingCoordinate, testBoard, coordinates, "White") === true) {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file+2] + rankCoordinates[rank+1]]);
					}
				} else {
					move(testPiece, fileCoordinates[file+2] + rankCoordinates[rank+1], testBoard, coordinates);
					if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
						moves.push([fileCoordinates[file+2] + rankCoordinates[rank+1]]);
					}
				}
			}

			break;
		case RED + 'R' + WHITE:
			kingCoordinate = kingCoordinates(testBoard, fileCoordinates, rankCoordinates, "Black");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
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
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
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
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						} else {
							break;
						}
					}
				} else if(!board[rank][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
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
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						} else {
							break;
						}
					}
				} else if(!board[rank][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
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
			kingCoordinate = kingCoordinates(testBoard, fileCoordinates, rankCoordinates, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
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
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
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
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						}
						break;
					}
				} else if(board[rank][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
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
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						}
						break;
					}
				} else if(board[rank][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
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
			kingCoordinate = kingCoordinates(testBoard, fileCoordinates, rankCoordinates, "Black")
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
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
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
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
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
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
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
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

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						} else {
							break;
						}
					}
				} else if(!board[rank-i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
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
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						} else {
							break;
						}
					}
				} else if(!board[rank+i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
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
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						} else {
							break;
						}
					}
				} else if(!board[rank][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
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
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						} else {
							break;
						}
					}
				} else if(!board[rank][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "Black") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "Black") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
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
			kingCoordinate = kingCoordinates(testBoard, fileCoordinates, rankCoordinates, "White");
			testPiece = fileCoordinates[file] + rankCoordinates[rank];

			// top-left
			for(let i = 1; file-i >= 0 && rank-i >= 0; ++i) {
				if(board[rank-i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
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

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
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

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
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

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank+i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
							break;
						}
						
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
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

			// up
			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file].includes(RED)) {
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						}
						break;
					}
				} else if(board[rank-i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank-i];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank-i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
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
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						}
						break;
					}
				} else if(board[rank+i][file] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates);
						testPiece = fileCoordinates[file] + rankCoordinates[rank+i];
						
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file] + rankCoordinates[rank+i], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
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
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						}
						break;
					}
				} else if(board[rank][file-i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file-i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file-i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
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
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						}
						break;
					}
				} else if(board[rank][file+i] === ''){
					if(inCheck(kingCoordinate, board, coordinates, "White") === true) {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates);
						testPiece = fileCoordinates[file+i] + rankCoordinates[rank];
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
							break;
						}
					} else {
						move(testPiece, fileCoordinates[file+i] + rankCoordinates[rank], testBoard, coordinates)
						if(inCheck(kingCoordinate, testBoard, coordinates, "White") === false) {
							directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
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

			let i = 0;
			while(i < moves.length) {
				if(blackKingMoves.includes(moves[i])) {
					moves.splice(moves.indexOf(moves[i]), 1);
					i = 0;
				} else {
					++i;
				}
			}
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

function kingCoordinates(board, fileCoordinates, rankCoordinates, color) {
	if(color === "White") {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file] === 'K') {
					return fileCoordinates[file] + rankCoordinates[rank];
				}
			}
		}
	} else {
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file] === RED + 'K' + WHITE) {
					return fileCoordinates[file] + rankCoordinates[rank];
				}
			}
		}
	}
}

function checks(kingCoordinate, board, coordinates, fileCoordinates, rankCoordinates) {
	let kingMoves = [];
	let file = coordinates[kingCoordinate[0]];
	let rank = coordinates[kingCoordinate[1]];

	if(!board[rank][file].includes(RED)) {
		// top-left
		if(rank-1 >= 0 && file-1 >= 0) {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank-1]);
		}

		// top-right
		if(rank-1 >= 0 && file+1 < 8) {
			kingMoves.push(fileCoordinates[file+1] + rankCoordinates[rank-1]);
		}

		// bottom-left
		if(rank+1 < 8 && file-1 >= 0) {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank+1]);
		}

		// bottom-right
		if(rank+1 < 8 && file+1 < 8) {
			kingMoves.push(fileCoordinates[file+1] + rankCoordinates[rank+1]);
		}

		// up

		if(rank-1 >= 0) {
			kingMoves.push(fileCoordinates[file] + rankCoordinates[rank-1]);
		}

		// down
		if(rank+1 < 8 ) {
			kingMoves.push(fileCoordinates[file] + rankCoordinates[rank+1]);
		}

		// left
		if(file-1 >= 0) {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank]);
		}

		// right
		if(file+1 < 8) {
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
		if(rank-1 >= 0 && file-1 >= 0) {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank-1]);
		}

		// top-right
		if(rank-1 >= 0 && file+1 < 8) {
			kingMoves.push(fileCoordinates[file+1] + rankCoordinates[rank-1]);
		}

		// bottom-left
		if(rank+1 < 8 && file-1 >= 0) {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank+1]);
		}

		// bottom-right
		if(rank+1 < 8 && file+1 < 8) {
			kingMoves.push(fileCoordinates[file+1] + rankCoordinates[rank+1]);
		}

		// up

		if(rank-1 >= 0 && board[rank-1][file] === '') {
			kingMoves.push(fileCoordinates[file] + rankCoordinates[rank-1]);
		}

		// down
		if(rank+1 < 8 && board[rank+1][file] === '') {
			kingMoves.push(fileCoordinates[file] + rankCoordinates[rank+1]);
		}

		// left
		if(file-1 >= 0 && board[rank][file-1] === '') {
			kingMoves.push(fileCoordinates[file-1] + rankCoordinates[rank]);
		}

		// right
		if(file+1 < 8 && board[rank][file+1] === '') {
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
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
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
						directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						++count;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						++count;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
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
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank-i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// top-right
			for(let i = 1; file+i < 8 && rank-i >= 0; ++i) {
				if(board[rank-i][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank-i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// bottom-left
			for(let i = 1; file-i >= 0 && rank+i < 8; ++i) {
				if(board[rank+i][file-i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file-i] + rankCoordinates[rank+i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// bottom-right
			for(let i = 1; file+i < 8 && rank+i < 8; ++i) {
				if(board[rank+i][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				}

				directions.push(fileCoordinates[file+i] + rankCoordinates[rank+i]);
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			for(let i = 1; rank-i >= 0; ++i) {
				if(board[rank-i][file] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
						++count;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank-i]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// down
			for(let i = 1; rank+i < 8; ++i) {
				if(board[rank+i][file] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
						++count;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file] + rankCoordinates[rank+i]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// left
			for(let i = 1; file-i >= 0; ++i) {
				if(board[rank][file-i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
						++count;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file-i] + rankCoordinates[rank]);
				}
			}

			if(directions.length > 0) moves.push(directions);
			directions = [];
			count = 0;

			// right
			for(let i = 1; file+i < 8; ++i) {
				if(board[rank][file+i] !== '') {
					if(count === 0) {
						directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
						++count;
					} else {
						break;
					}
				} else {
					directions.push(fileCoordinates[file+i] + rankCoordinates[rank]);
				}
			}

			if(directions.length > 0) moves.push(directions);

			break;
		}
	return moves;
}

function otherMoves(board, color, coordinates, fileCoordinates, rankCoordinates) {
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

function ended(kingCoordinate, board, coordinates, color, fileCoordinates, rankCoordinates) {
	let file = coordinates[kingCoordinate[0]];
	let rank = coordinates[kingCoordinate[1]];

	if(color === "White") {
		let blackKingMoves = [];
		let moves = checks(fileCoordinates[file] + rankCoordinates[rank], board, coordinates, fileCoordinates, rankCoordinates);
		for(let rank = 0; rank < board.length; ++rank) {
			for(let file = 0; file < board[rank].length; ++file) {
				if(board[rank][file] === RED + 'K' + WHITE) {
					blackKingMoves = checks(fileCoordinates[file] + rankCoordinates[rank], board, coordinates, fileCoordinates, rankCoordinates);
				}
			}
		}

		let i = 0;
		while(i < moves.length) {
			if(blackKingMoves.includes(moves[i])) {
				moves.splice(moves.indexOf(moves[i]), 1);
				i = 0;
			} else {
				++i;
			}
		}

		if(otherMoves(board, "White", coordinates, fileCoordinates, rankCoordinates) === false && moves.length <= 0) {
			if(inCheck(fileCoordinates[file] + rankCoordinates[rank], board, coordinates, "White") === false) return "stalemate";
			return "checkmate";
		}
	}

	return false;
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

board = [
	['K', '', '', '', '', '', '', ''],
	['', RED + 'Q' + WHITE, '', '', '', '', '', ''],
	['', RED + 'K' + WHITE, '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', 'R']
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


displayBoard(board);
console.log(legalMoves("a8", board, coordinates), "legalmoves");
console.log(ended("a8", board, coordinates, "White", fileCoordinates, rankCoordinates), "ended");

// TODO: Checkmate`