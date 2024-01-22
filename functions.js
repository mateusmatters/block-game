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

let defaultNumRows = 5;
let defaultNumCols = 5;
let defaultNumPieces = 5;
let basicBoard = new GameBoard(defaultNumRows, defaultNumCols);
let PIECE_NAMES = ["nopiece"];
for (let i = 1; i <= 9; i++) {
  PIECE_NAMES.push(`piece${i}`);
}
let remainingPieces = new PiecesList();

let potentialLastItemTouched = null;
let beginningMove = 0;
var offsetX, offsetY;

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
    augPiece: new GamePiece(augmentedCoods, piece.id, basicBoard.numRows),
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
  let tempStr = ".piecelayout" + basicBoard.numRows;
  document.getElementById("pieces-list").innerHTML =
    remainingPieces.htmlString();
  let draggablePieces = document.querySelectorAll(tempStr);
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
  let tempStr = ".piecelayout" + 5;
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
  const piecesNewStuff = document.querySelectorAll(tempStr);
  eventListenersForPiecesUpdater();
  if (beatGame !== true && basicBoard.boardComplete()) {
    alert(
      "You won the game! Refresh the webpage to play on a new board or click on the buttons below to adjust the difficulty/size of the board."
    );
    beatGame = true;
  }
}

function whatItemAmITouchingOver(x, y, numRowsAndCols) {
  for (let i = 0; i < numRowsAndCols; i++) {
    for (let j = 0; j < numRowsAndCols; j++) {
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

function updateItems() {
  const items = document.querySelectorAll(".item");
  items.forEach((item) => {
    item.addEventListener("touchstart", (e) => {
      if (item.draggable === true) {
        var touch = e.touches[0];
        offsetX = touch.clientX - item.getBoundingClientRect().left;
        offsetY = touch.clientY - item.getBoundingClientRect().top;
        //the 1st index in the classlist will have the piecenumber: example "piece4"
        currDrag = parseInt(item.classList[1].charAt(5));
        let pieceOnBoard = movePlacedPieceOnBoard(currDrag);
        prevItem = item;
        movingPiece = pieceOnBoard.returnedPiece;
        mouseDownLast = true;
        displacement = getCurrentCoordinate(item).findDisplacementCoordinate(
          pieceOnBoard.baseCoordinate
        );
      }
    });
    item.addEventListener("touchmove", (e) => {
      touchMovePiece(e);
    });
    item.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (potentialLastItemTouched !== null) {
        placePieceFunctionality(potentialLastItemTouched);
      } else {
        if (touchAndMove === true) {
          putPieceBackInPiecesContainer(e);
          touchAndMove = false;
        }
      }
    });

    item.addEventListener("dragover", (e) => {
      enteringItem(e, item);
    });
    item.addEventListener("mousedown", (e) => {
      if (item.draggable === true) {
        //the 1st index in the classlist will have the piecenumber: example "piece4"
        currDrag = parseInt(item.classList[1].charAt(5));
        let pieceOnBoard = movePlacedPieceOnBoard(currDrag);
        prevItem = item;
        movingPiece = pieceOnBoard.returnedPiece;
        mouseDownLast = true;
        displacement = getCurrentCoordinate(item).findDisplacementCoordinate(
          pieceOnBoard.baseCoordinate
        );
      }
    });
    item.addEventListener("dragleave", (e) => {
      leavingItem(item);
    });
    item.addEventListener("mouseup", (e) => {
      placePieceFunctionality(item);
    });

    item.addEventListener("drop", (e) => {
      placePieceFunctionality(item);
    });
  });
}

function leavingItem(item) {
  if (currDrag !== null) {
    let findAugCords = canPutPieceOnBoardAtCoordinate(
      movingOrRemainingPiece(currDrag).piece,
      basicBoard,
      getCurrentCoordinate(item).displacePiece(displacement)
    );
    findAugCords.augPiece.coordinates.forEach((cood) => {
      let a = document.getElementById(cood.str).classList;
      a.remove("p" + currDrag);
      a.remove("invalid");

      //this bottom bit of code makes sure that a piece
      //that has already been placed will still be draggable
      //even when dragging another piece on top of if
      let temp = true;
      for (let i = 0; i < a.length; i++) {
        if (a[i].startsWith("piece")) {
          temp = false;
          break;
        }
      }
      if (temp) {
        document.getElementById(cood.str).draggable = false;
      }
    });
  }
}
function putPieceBackInPiecesContainer(event) {
  if (movingPiece !== null) {
    event.preventDefault();
    remainingPieces.add(movingPiece);
    currDrag = null;
    prevItem = null;
    movingPiece = null;
    updateLists();
    updateDomBoard();
    eventListenersForPiecesUpdater();
  }
}
function touchMovePiece(e) {
  e.preventDefault();
  var touch = e.touches[0];
  var x = touch.clientX - offsetX;
  var y = touch.clientY - offsetY;
  let touchingItem = whatItemAmITouchingOver(x, y, basicBoard.numRows);
  touchAndMove = true;
  if (touchingItem !== null) {
    // console.log("touching over" + touchingItem.id);
    if (beginningMove === 0) {
      potentialLastItemTouched = touchingItem;
      beginningMove = 1;
    }
    if (touchingItem !== potentialLastItemTouched) {
      leavingItem(potentialLastItemTouched);
      enteringItem(e, touchingItem);
      potentialLastItemTouched = touchingItem;
    }
  } else {
    if (potentialLastItemTouched !== null) {
      leavingItem(potentialLastItemTouched);
    }
    potentialLastItemTouched = null;
    beginningMove = 0;
  }
}

function eventListenersForPiecesUpdater() {
  const piecesNewStuff = document.querySelectorAll('[class^="piecelayout"]');
  // const piecesNewStuff = document.querySelectorAll(".piecelayout5");
  piecesNewStuff.forEach((piece) => {
    piece.addEventListener("touchstart", (e) => {
      currDrag = parseInt(piece.id.charAt(12));
      var touch = e.touches[0];
      offsetX = touch.clientX - piece.getBoundingClientRect().left;
      offsetY = touch.clientY - piece.getBoundingClientRect().top;
    });
    piece.addEventListener("touchmove", (e) => {
      touchMovePiece(e);
    });
    piece.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (potentialLastItemTouched !== null) {
        placePieceFunctionality(potentialLastItemTouched);
      }
      currDrag = null;
    });
  });
}

function enteringItem(e, item) {
  if (currDrag !== null) {
    e.preventDefault();
    let findAugCords = canPutPieceOnBoardAtCoordinate(
      movingOrRemainingPiece(currDrag).piece,
      basicBoard,
      getCurrentCoordinate(item).displacePiece(displacement)
    );
    let classNameToAdd =
      findAugCords.errorCode === SUCCESSFUL ? "p" + currDrag : "invalid";
    findAugCords.augPiece.coordinates.forEach((currentCoordinate) => {
      document
        .getElementById(currentCoordinate.str)
        .classList.add(classNameToAdd);
    });
  }
  if (mouseDownLast && prevItem !== null) {
    //we will always do a drag leave thing in order to bypass the
    //glitch on the first time
    let findAugCords = canPutPieceOnBoardAtCoordinate(
      movingOrRemainingPiece(currDrag).piece,
      basicBoard,
      getCurrentCoordinate(prevItem).displacePiece(displacement)
    );
    findAugCords.augPiece.coordinates.forEach((cood) => {
      document.getElementById(cood.str).classList.remove("p" + currDrag);
      document.getElementById(cood.str).classList.remove("invalid");
    });
  }
  mouseDownLast = false;
}

function generateNewGame(numRows, numCols, numGamePieces) {
  beatGame = false;
  basicBoard = new GameBoard(numRows, numCols);

  let tempStr = "gameboard-";
  if (numRows === 5) {
    tempStr = tempStr + "five";
  } else {
    tempStr = tempStr + "six";
  }
  let a = document.querySelector('[id^="gameboard"]');
  a.innerHTML = basicBoard.htmlString;
  a.id = tempStr;
  remainingPieces = generateRandomPieces(numRows, numCols, numGamePieces);

  usedPieces = new PiecesList();
  updateDomBoard();
  updateLists();
  eventListenersForPiecesUpdater();
  updateItems();
}
