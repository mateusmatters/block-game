let currDrag = null;
let prevItem = null; //prev item is to avoid a glitch
let movingPiece = null;
let displacement = new Coordinate(0, 0);
let mouseDownLast = false;
let beatGame = false;

//for touchscreen purposes
// var offsetX, offsetY;
// let potentialLastItemTouched = null;
// let beginningMove = 0;
let touchAndMove = false;

generateNewGame(defaultNumRows, defaultNumCols, defaultNumPieces);

document
  .getElementById("generate-new-board-button")
  .addEventListener("click", () => {
    let numRowsAndCols = parseInt(document.getElementById("board-size").value);
    let numPieces = parseInt(document.getElementById("difficulty").value);
    numPieces = numPieces + numRowsAndCols;
    generateNewGame(numRowsAndCols, numRowsAndCols, numPieces);
  });

document
  .getElementById("pieces-container")
  .addEventListener("dragover", (e) => {
    e.preventDefault(); //NO ERROR BUT LATER I WANT TO KNOW MORE ABOUT WHAT THIS IS AND WHY IT WORKS!!!
  });
document.getElementById("pieces-container").addEventListener("drop", (e) => {
  putPieceBackInPiecesContainer(e);
});

document.getElementById("game-buttons").addEventListener("dragover", (e) => {
  e.preventDefault();
});
document.getElementById("game-buttons").addEventListener("drop", (e) => {
  putPieceBackInPiecesContainer(e);
});
const hbomax = document.querySelectorAll(".surrounding-gameboard");
hbomax.forEach((section) => {
  section.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  section.addEventListener("drop", (e) => {
    putPieceBackInPiecesContainer(e);
  });
});
