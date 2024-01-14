let currDrag = null;
let prevItem = null; //prev item is to avoid a glitch
let movingPiece = null;
let displacement = new Coordinate(0, 0);
let mouseDownLast = false;
let beatGame = false;

let potentialLastItemTouched = null;
beginningMove = 0;

//for touchscreen purposes
var offsetX, offsetY;

//game isntances

//#region
document.getElementById("gameboard").innerHTML = basicBoard.htmlString;
generateNewGame(5, 5, 5);

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
  if (movingPiece !== null) {
    e.preventDefault();
    remainingPieces.add(movingPiece);
    currDrag = null;
    prevItem = null;
    movingPiece = null;
    updateLists();
    updateDomBoard();
  }
});
//#endregion

//NEW STUFF
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
      e.preventDefault();
      var touch = e.touches[0];
      var x = touch.clientX - offsetX;
      var y = touch.clientY - offsetY;
      let touchingItem = whatItemAmITouchingOver(x, y);

      if (touchingItem !== null) {
        if (beginningMove === 0) {
          potentialLastItemTouched = touchingItem;
          beginningMove = 1;
          //set the color of the piece up beginning (drag over)
          let findAugCords = canPutPieceOnBoardAtCoordinate(
            movingOrRemainingPiece(currDrag).piece,
            basicBoard,
            getCurrentCoordinate(touchingItem).displacePiece(displacement)
          );
          let classNameToAdd =
            findAugCords.errorCode === SUCCESSFUL ? "p" + currDrag : "invalid";
          findAugCords.augPiece.coordinates.forEach((currentCoordinate) => {
            document
              .getElementById(currentCoordinate.str)
              .classList.add(classNameToAdd);
          });
          //set the color of the piece up end
        }
        if (touchingItem !== potentialLastItemTouched) {
          // console.log(
          //   "switched from item" +
          //     potentialLastItemTouched.id +
          //     "to item" +
          //     touchingItem.id
          // );

          //get rid of the last piece beginning (drag leave)
          let findAugCords2 = canPutPieceOnBoardAtCoordinate(
            movingOrRemainingPiece(currDrag).piece,
            basicBoard,
            getCurrentCoordinate(potentialLastItemTouched).displacePiece(
              displacement
            )
          );
          findAugCords2.augPiece.coordinates.forEach((cood) => {
            document.getElementById(cood.str).classList.remove("p" + currDrag);
            document.getElementById(cood.str).classList.remove("invalid");
          });
          //get rid of the last piece end

          //set the color of the piece up beginning (drag over)
          let findAugCords = canPutPieceOnBoardAtCoordinate(
            movingOrRemainingPiece(currDrag).piece,
            basicBoard,
            getCurrentCoordinate(touchingItem).displacePiece(displacement)
          );
          let classNameToAdd =
            findAugCords.errorCode === SUCCESSFUL ? "p" + currDrag : "invalid";
          findAugCords.augPiece.coordinates.forEach((currentCoordinate) => {
            document
              .getElementById(currentCoordinate.str)
              .classList.add(classNameToAdd);
          });
          //set the color of the piece up end
          potentialLastItemTouched = touchingItem;
        }
      } else {
        if (potentialLastItemTouched !== null) {
          //get rid of the last piece beginning (drag leave)
          let findAugCords2 = canPutPieceOnBoardAtCoordinate(
            movingOrRemainingPiece(currDrag).piece,
            basicBoard,
            getCurrentCoordinate(potentialLastItemTouched).displacePiece(
              displacement
            )
          );
          findAugCords2.augPiece.coordinates.forEach((cood) => {
            document.getElementById(cood.str).classList.remove("p" + currDrag);
            document.getElementById(cood.str).classList.remove("invalid");
          });
          //get rid of the last piece end
        }
        potentialLastItemTouched = null;
        beginningMove = 0;
        if (potentialLastItemTouched !== null) {
          //get rid of the last piece beginning (drag leave)
          let findAugCords2 = canPutPieceOnBoardAtCoordinate(
            movingOrRemainingPiece(currDrag).piece,
            basicBoard,
            getCurrentCoordinate(potentialLastItemTouched).displacePiece(
              displacement
            )
          );
          findAugCords2.augPiece.coordinates.forEach((cood) => {
            document.getElementById(cood.str).classList.remove("p" + currDrag);
            document.getElementById(cood.str).classList.remove("invalid");
          });
          //get rid of the last piece end
        }
      }
    });
    piece.addEventListener("touchend", (e) => {
      e.preventDefault();
      if (potentialLastItemTouched !== null) {
        placePieceFunctionality(potentialLastItemTouched);
        if (beatGame !== true && basicBoard.boardComplete()) {
          alert(
            "You won the game! Refresh the webpage to play on a new board or click on the buttons below to adjust the difficulty/size of the board."
          );
          beatGame = true;
        }
      }
    });
  });
}
//END OF NEW STUFF

const items = document.querySelectorAll(".item");
items.forEach((item) => {
  item.addEventListener("touchstart", (e) => {
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
  item.addEventListener("touchmove", (e) => {
    e.preventDefault();
    var touch = e.touches[0];
    var x = touch.clientX - offsetX;
    var y = touch.clientY - offsetY;
    let touchingItem = whatItemAmITouchingOver(x, y);
    // if (touchingItem !== null) {
    //   console.log(
    //     "item" +
    //       item.id +
    //       " is moving and we are currently touching item " +
    //       touchingItem.id
    //   );
    // }
    if (touchingItem !== null) {
      if (beginningMove === 0) {
        potentialLastItemTouched = touchingItem;
        beginningMove = 1;
        //set the color of the piece up beginning (drag over)
        let findAugCords = canPutPieceOnBoardAtCoordinate(
          movingOrRemainingPiece(currDrag).piece,
          basicBoard,
          getCurrentCoordinate(touchingItem).displacePiece(displacement)
        );
        let classNameToAdd =
          findAugCords.errorCode === SUCCESSFUL ? "p" + currDrag : "invalid";
        findAugCords.augPiece.coordinates.forEach((currentCoordinate) => {
          document
            .getElementById(currentCoordinate.str)
            .classList.add(classNameToAdd);
        });
        //set the color of the piece up end
      }
      if (touchingItem !== potentialLastItemTouched) {
        // console.log(
        //   "switched from item" +
        //     potentialLastItemTouched.id +
        //     "to item" +
        //     touchingItem.id
        // );

        //get rid of the last piece beginning (drag leave)
        let findAugCords2 = canPutPieceOnBoardAtCoordinate(
          movingOrRemainingPiece(currDrag).piece,
          basicBoard,
          getCurrentCoordinate(potentialLastItemTouched).displacePiece(
            displacement
          )
        );
        findAugCords2.augPiece.coordinates.forEach((cood) => {
          document.getElementById(cood.str).classList.remove("p" + currDrag);
          document.getElementById(cood.str).classList.remove("invalid");
        });
        //get rid of the last piece end

        //set the color of the piece up beginning (drag over)
        let findAugCords = canPutPieceOnBoardAtCoordinate(
          movingOrRemainingPiece(currDrag).piece,
          basicBoard,
          getCurrentCoordinate(touchingItem).displacePiece(displacement)
        );
        let classNameToAdd =
          findAugCords.errorCode === SUCCESSFUL ? "p" + currDrag : "invalid";
        findAugCords.augPiece.coordinates.forEach((currentCoordinate) => {
          document
            .getElementById(currentCoordinate.str)
            .classList.add(classNameToAdd);
        });
        //set the color of the piece up end
        potentialLastItemTouched = touchingItem;
      }
    } else {
      if (potentialLastItemTouched !== null) {
        //get rid of the last piece beginning (drag leave)
        let findAugCords2 = canPutPieceOnBoardAtCoordinate(
          movingOrRemainingPiece(currDrag).piece,
          basicBoard,
          getCurrentCoordinate(potentialLastItemTouched).displacePiece(
            displacement
          )
        );
        findAugCords2.augPiece.coordinates.forEach((cood) => {
          document.getElementById(cood.str).classList.remove("p" + currDrag);
          document.getElementById(cood.str).classList.remove("invalid");
        });
        //get rid of the last piece end
      }
      potentialLastItemTouched = null;
      beginningMove = 0;
      if (potentialLastItemTouched !== null) {
        //get rid of the last piece beginning (drag leave)
        let findAugCords2 = canPutPieceOnBoardAtCoordinate(
          movingOrRemainingPiece(currDrag).piece,
          basicBoard,
          getCurrentCoordinate(potentialLastItemTouched).displacePiece(
            displacement
          )
        );
        findAugCords2.augPiece.coordinates.forEach((cood) => {
          document.getElementById(cood.str).classList.remove("p" + currDrag);
          document.getElementById(cood.str).classList.remove("invalid");
        });
        //get rid of the last piece end
      }
    }
  });
  item.addEventListener("touchend", (e) => {
    if (potentialLastItemTouched !== null) {
      placePieceFunctionality(potentialLastItemTouched);
      if (beatGame !== true && basicBoard.boardComplete()) {
        alert(
          "You won the game! Refresh the webpage to play on a new board or click on the buttons below to adjust the difficulty/size of the board."
        );
        beatGame = true;
      }
    } else {
    }
  });

  item.addEventListener("dragover", (e) => {
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
    if (currDrag !== null) {
      let findAugCords = canPutPieceOnBoardAtCoordinate(
        movingOrRemainingPiece(currDrag).piece,
        basicBoard,
        getCurrentCoordinate(item).displacePiece(displacement)
      );
      findAugCords.augPiece.coordinates.forEach((cood) => {
        document.getElementById(cood.str).classList.remove("p" + currDrag);
        document.getElementById(cood.str).classList.remove("invalid");
      });
    }
  });
  item.addEventListener("mouseup", (e) => {
    placePieceFunctionality(item);
    if (beatGame !== true && basicBoard.boardComplete()) {
      alert(
        "You won the game! Refresh the webpage to play on a new board or click on the buttons below to adjust the difficulty/size of the board."
      );
      beatGame = true;
    }
  });

  item.addEventListener("drop", (e) => {
    placePieceFunctionality(item);
    if (beatGame !== true && basicBoard.boardComplete()) {
      alert(
        "You won the game! Refresh the webpage to play on a new board or click on the buttons below to adjust the difficulty/size of the board."
      );
      beatGame = true;
    }
  });
});

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
