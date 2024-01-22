let currDrag = null;
let prevItem = null; //prev item is to avoid a glitch
let movingPiece = null;
let displacement = new Coordinate(0, 0);
let mouseDownLast = false;
let beatGame = false;

//for touchscreen purposes
var offsetX, offsetY;
let potentialLastItemTouched = null;
beginningMove = 0;
touchAndMove = false;
let defaultNumRowsAndCols = 5;
let defaultNumPieces = 5;

//#region
document.getElementById("gameboard-five").innerHTML = basicBoard.htmlString;
generateNewGame(defaultNumRowsAndCols, defaultNumRowsAndCols, defaultNumPieces);

document
  .getElementById("generate-new-board-button")
  .addEventListener("click", () => {
    // let numRowsAndCols = parseInt(document.getElementById("board-size").value);
    let numRowsAndCols = 5;
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

//#endregion
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
function leavingItem(item) {
  if (currDrag !== null) {
    let findAugCords = canPutPieceOnBoardAtCoordinate(
      movingOrRemainingPiece(currDrag).piece,
      basicBoard,
      getCurrentCoordinate(item).displacePiece(displacement)
    );
    findAugCords.augPiece.coordinates.forEach((cood) => {
      document.getElementById(cood.str).classList.remove("p" + currDrag);
      document.getElementById(cood.str).classList.remove("invalid");
      document.getElementById(cood.str).draggable = false;
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
  let touchingItem = whatItemAmITouchingOver(x, y);
  touchAndMove = true;
  if (touchingItem !== null) {
    console.log("touching over" + touchingItem.id);
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
  const piecesNewStuff = document.querySelectorAll(".piecelayout5");
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
