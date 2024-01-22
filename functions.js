//classNamesForHoveringPieces

//This function returns the object to the user {errorCode, augPiece}.
//
//The parameter piece is a GamePiece, board is a GameBoard, and placementCood
//is a set of coodinates where we plan to place the highest vertical piece on the
//utmost left column.
//
//errorCode will return 1 if the piece is able to be placed, 101 if the piece will be
//out of bounds, or 102 if the piece is overlapping with another placed peace.
//
//augPiece returns a new "Augmented Game Piece" where the coordinates are the same distances
//away from each other, with the only difference being the location of the GamePiece
//(example: a piece with coordinates [(0,0)], (0,1)], (0,2)] could be augmented to be [(100,0)], (100,1)], (100,2)])

let basicBoard = new GameBoard(5, 5);
let PIECE_NAMES = ["nopiece"];
for (let i = 1; i <= 9; i++) {
  PIECE_NAMES.push(`piece${i}`);
}

function canPutPieceOnBoardAtCoordinate(piece, board, placementCood) {
  let augmentedCoods = new Array();
  let errorCode = SUCCESSFUL;
  for (let i = 0; i < piece.coordinates.length; i++) {
    const pieceCood = piece.coordinates[i];
    tempRowPoint = pieceCood.rowPoint + placementCood.rowPoint;
    tempColPoint = pieceCood.colPoint + placementCood.colPoint;
    //We want to make an augmented Piece that does not have any out of bounds
    //coordinates in order to display to the board later. This is why we have
    //this variable.
    let currentCoordinateIsOutOfBounds = false;
    if (
      tempRowPoint < 0 ||
      tempRowPoint >= board.numRows ||
      tempColPoint < 0 ||
      tempColPoint >= board.numCols
    ) {
      errorCode = OUT_OF_BOUNDS;
      currentCoordinateIsOutOfBounds = true;
    } else if (board.grid[tempRowPoint][tempColPoint] != 0) {
      errorCode = OVERLAPPING_WITH_EXISTING_PIECE;
    }
    if (!currentCoordinateIsOutOfBounds) {
      augmentedCoods.push(new Coordinate(tempRowPoint, tempColPoint));
    }
  }
  return {
    errorCode: errorCode,
    augPiece: new GamePiece(augmentedCoods, piece.id),
  };
}

function updateDomBoard() {
  for (let i = 0; i < basicBoard.numRows; i++) {
    for (let j = 0; j < basicBoard.numCols; j++) {
      let currentItem = document.getElementById(`${i}${j}`);
      let pieceToUpdate = "piece" + basicBoard.grid[i][j];
      if (basicBoard.grid[i][j] === 0) {
        pieceToUpdate = "nopiece";
      }
      PIECE_NAMES.forEach(function (piece) {
        currentItem.classList.remove(piece);
      });
      currentItem.classList.add(pieceToUpdate);
    }
  }
}

function updateLists() {
  document.getElementById("pieces-list").innerHTML =
    remainingPieces.htmlString();
  let draggablePieces = document.querySelectorAll(".piecelayout5");
  draggablePieces.forEach(function (draggablePiece) {
    draggablePiece.addEventListener("dragstart", (event) => {
      //turns string "displayPieceX" to only the number X when assigning to currDrag
      currDrag = parseInt(event.target.id[12]);
    });
  });
}

function movePlacedPieceOnBoard(pieceNum) {
  let returnedPiece = usedPieces.remove(pieceNum);
  if (returnedPiece !== null) {
    let baseCoordinate = null;
    //we reverse it to go through each column row by row
    //in order to better find the base coordinate
    for (let j = 0; j < basicBoard.numRows; j++) {
      for (let i = 0; i < basicBoard.numCols; i++) {
        if (basicBoard.grid[i][j] === pieceNum) {
          let currItem = document.getElementById("" + i + j);
          currItem.classList.add(`p${pieceNum}`);
          currItem.classList.remove(`piece${pieceNum}`);
          basicBoard.grid[i][j] = 0;
          if (baseCoordinate === null) {
            baseCoordinate = new Coordinate(i, j);
          }
        }
      }
    }
    updateDomBoard();
    return { returnedPiece: returnedPiece, baseCoordinate: baseCoordinate };
  }
  return undefined;
}

//if piece from list or moving piece is successfully placed, this function updates
//the usedPieces list with the new piece. else, it updates the remaining pieces with
//the new piece. Function afterwards updates the DOMBoard so the graphics of the website
//match with our gameboard
function putPieceOnBoard(placementCood, movingPiece) {
  if (movingPiece.onBoard === false) {
    remainingPieces.remove(movingPiece.piece.id);
  }
  //CHANGE PARAM NAME "movingPiece" TO SOMETHING MORE FITING LATER!
  let pieceToPlace = canPutPieceOnBoardAtCoordinate(
    movingPiece.piece,
    basicBoard,
    placementCood
  );
  if (pieceToPlace.errorCode === SUCCESSFUL) {
    pieceToPlace.augPiece.coordinates.forEach((currCoordinate) => {
      basicBoard.grid[currCoordinate.rowPoint][currCoordinate.colPoint] =
        movingPiece.piece.id;
    });
    usedPieces.add(movingPiece.piece);
  } else {
    remainingPieces.add(movingPiece.piece);
  }
  updateLists();
  updateDomBoard();
  return pieceToPlace;
}

function movingOrRemainingPiece(numberOfDraggingPiece) {
  let piece = remainingPieces.find(numberOfDraggingPiece);
  let onBoard = false;
  if (piece === undefined) {
    piece = movingPiece;
    onBoard = true;
  }
  return { piece: piece, onBoard: onBoard };
}

function getCurrentCoordinate(item) {
  return new Coordinate(
    Math.floor(parseInt(item.id) / 10),
    parseInt(item.id) % 10
  );
}

function placePieceFunctionality(item) {
  let didItPut = putPieceOnBoard(
    getCurrentCoordinate(item).displacePiece(displacement),
    movingOrRemainingPiece(currDrag)
  );
  didItPut.augPiece.coordinates.forEach((cood) => {
    let currItem = document.getElementById(cood.str);
    currItem.classList.remove("p" + currDrag);
    currItem.classList.remove("invalid");

    if (didItPut.errorCode === SUCCESSFUL) {
      currItem.draggable = true;
    }
  });

  //the following for loop updates all pieces on the DOM board so that only
  //the items that contains pieces are draggable
  for (let i = 0; i < basicBoard.numRows; i++) {
    for (let j = 0; j < basicBoard.numCols; j++) {
      let currItem = document.getElementById(`${i}${j}`);
      if (currItem.classList.contains("nopiece")) {
        currItem.draggable = false;
      }
    }
  }
  currDrag = null;
  movingPiece = null;
  displacement = new Coordinate(0, 0);
  mouseDownLast = false;
  prevDrag = null;
  const piecesNewStuff = document.querySelectorAll(".piecelayout5");
  eventListenersForPiecesUpdater();
  if (beatGame !== true && basicBoard.boardComplete()) {
    alert(
      "You won the game! Refresh the webpage to play on a new board or click on the buttons below to adjust the difficulty/size of the board."
    );
    beatGame = true;
  }
}

function generateNewGame(numRows, numCols, numGamePieces) {
  beatGame = false;
  basicBoard = new GameBoard(numRows, numCols);
  remainingPieces = generateRandomPieces(numRows, numCols, numGamePieces);
  usedPieces = new PiecesList();
  updateDomBoard();
  updateLists();
  eventListenersForPiecesUpdater();
}

function whatItemAmITouchingOver(x, y) {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const itemId = `${i}${j}`;
      const itemRect = document.getElementById(itemId).getBoundingClientRect();

      if (isInsideThisItem(x, y, itemRect)) {
        return document.getElementById(itemId);
      }
    }
  }

  return null;
}
function isInsideThisItem(x, y, item) {
  return x >= item.left && x <= item.right && y >= item.top && y <= item.bottom;
}
