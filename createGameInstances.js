//Depending on the game, update the GamePieces to the right number
let numGamePieces = 6;
let numBoardRows = 5;
let numBoardCols = 5;

let basicBoard = new GameBoard(numBoardRows, numBoardCols);
let remainingPieces = generateRandomPieces(
  numBoardRows,
  numBoardCols,
  numGamePieces
);
let usedPieces = new PiecesList();

let PIECE_NAMES = ["nopiece"];
for (let i = 1; i <= numGamePieces; i++) {
  PIECE_NAMES.push(`piece${i}`);
}
