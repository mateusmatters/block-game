//#region functions that work properly
function getRandomNumSpaces(spacesAvailable, numPiecesToCreate) {
  let avgNumSpacesPerPiece = Math.floor(spacesAvailable / numPiecesToCreate);
  let residual = Math.floor(avgNumSpacesPerPiece / 2);
  let variance = Math.floor(Math.random() * (2 * residual + 1)) - residual;
  return avgNumSpacesPerPiece + variance;
}
function listStringPrint(name, list) {
  let retStr = "the list " + name + " contains the following coordinates: ";
  list.forEach((cood) => {
    retStr = retStr + cood.toString() + ", ";
  });
  console.log(retStr);
}
function filterCoordinatesAboveBelowLeftRight(cord, board, confirmedCords) {
  let above = new Coordinate(cord.rowPoint - 1, cord.colPoint);
  let below = new Coordinate(cord.rowPoint + 1, cord.colPoint);
  let left = new Coordinate(cord.rowPoint, cord.colPoint - 1);
  let right = new Coordinate(cord.rowPoint, cord.colPoint + 1);
  let cordList = [above, below, left, right];
  //each list of cords needs to check 3 things
  //1. cords need to be in bounds of board
  //2. cords need to not overlap with other pieces
  //3. cords cannot be in the confirmedCords array
  let cordsThatMeetRequirements = new Array();
  cordList.forEach((cord) => {
    if (
      cord.rowPoint >= 0 &&
      cord.rowPoint < board.numRows &&
      cord.colPoint >= 0 &&
      cord.colPoint < board.numCols &&
      board.grid[cord.rowPoint][cord.colPoint] === 0
    ) {
      let notAConfirmedCord = true;
      confirmedCords.forEach((confirmedCord) => {
        if (confirmedCord.equals(cord)) {
          notAConfirmedCord = false;
        }
      });
      if (notAConfirmedCord) {
        cordsThatMeetRequirements.push(cord);
      }
    }
  });
  return cordsThatMeetRequirements;
}
function isUniqueCoordinate(potentialCord, cordSet) {
  let addCoordinate = true;
  cordSet.forEach((preExistingCord) => {
    if (preExistingCord.equals(potentialCord)) {
      addCoordinate = false;
    }
  });
  return addCoordinate;
}
//returns a 2d array of coordinates
//let x = findBoardClusters(baord)
//x[someNum] will give you cluster someNum
//x.length will give you the total amount of clusters of a given board
//x[someNum].length will give you the amount of spaces a certain cluster holds
function findBoardClusters(board) {
  let arrayOfClusters = [];
  for (let j = 0; j < board.numCols; j++) {
    for (let i = 0; i < board.numRows; i++) {
      if (board.grid[i][j] === 0) {
        //new baseCord to check the cluster of
        baseCord = new Coordinate(i, j);
        let cordsInCluster = [baseCord];
        //this next part of code will find all the spaces that are in
        //the cluster
        for (let ittr = 0; ittr < cordsInCluster.length; ittr++) {
          let currCord = cordsInCluster[ittr];
          let filteredCords = filterCoordinatesAboveBelowLeftRight(
            currCord,
            board,
            cordsInCluster
          );
          filteredCords.forEach((cord) => {
            cordsInCluster.push(cord);
          });
          board.grid[currCord.rowPoint][currCord.colPoint] = 1000;
        }
        arrayOfClusters.push(cordsInCluster);
      }
    }
  }
  for (let j = 0; j < board.numCols; j++) {
    for (let i = 0; i < board.numRows; i++) {
      if (board.grid[i][j] === 1000) {
        board.grid[i][j] = 0;
      }
    }
  }
  return arrayOfClusters;
}
function randomArray(num) {
  // Check if the input is a positive integer greater than 0
  if (Number.isInteger(num) && num > 0) {
    const result = [];
    // Create an array with numbers from 1 to num
    const candidateNumbers = Array.from(
      { length: num },
      (_, index) => index + 1
    );

    // Shuffle the array randomly
    for (let i = candidateNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidateNumbers[i], candidateNumbers[j]] = [
        candidateNumbers[j],
        candidateNumbers[i],
      ];
    }

    // Take the first num elements as the result
    for (let i = 0; i < num; i++) {
      result.push(candidateNumbers[i]);
    }
    return result;
  }
}
function findNextBaseCord(board) {
  let baseCord = null;
  let breakOutOfDoubleForLoop = false;
  for (let j = 0; j < board.numCols; j++) {
    for (let i = 0; i < board.numRows; i++) {
      if (board.grid[i][j] === 0) {
        baseCord = new Coordinate(i, j);
        breakOutOfDoubleForLoop = true;
        break;
      }
    }
    if (breakOutOfDoubleForLoop) {
      break;
    }
  }
  return baseCord;
}

function makeUniqueCoordinatesList(confirmedCords, board) {
  let availableCords = new Array();
  confirmedCords.forEach((confirmedCord) => {
    let filteredCords = filterCoordinatesAboveBelowLeftRight(
      confirmedCord,
      board,
      confirmedCords
    );
    filteredCords.forEach((coordinate) => {
      if (isUniqueCoordinate(coordinate, availableCords)) {
        availableCords.push(coordinate);
      }
    });
  });
  return availableCords;
}

function generateSinglePiece(
  spacesAvailable,
  numPiecesToCreate,
  board,
  minSpaces,
  maxSpaces
) {
  //this code gives us the base coordinate for the current piece we are making
  let baseCord = findNextBaseCord(board);
  let baseCordRowNum = baseCord.rowPoint;
  let baseCordColNum = baseCord.colPoint;
  let confirmedCords = [];
  let listOfClustersBeginning = findBoardClusters(board);

  //abcdefg is to help fix bug when board not updating when going
  //in og if statement. Would make piece but not update board. So
  //we have to do that at the end
  let abcdefg = false;

  if (numPiecesToCreate === listOfClustersBeginning.length) {
    confirmedCords = listOfClustersBeginning[0];
    abcdefg = true;
  } else {
    let remakePiece = true;
    //doesn't get out of while loop until it comes up with a good rando piece
    while (remakePiece === true) {
      let numSpaces = getRandomNumSpaces(spacesAvailable, numPiecesToCreate);
      confirmedCords.push(baseCord);
      board.grid[baseCord.rowPoint][baseCord.colPoint] = numPiecesToCreate;
      for (let currSpaces = 1; currSpaces < numSpaces; currSpaces++) {
        //avCords is availableCords to potentially add to the piece
        let avCords = makeUniqueCoordinatesList(confirmedCords, board);
        if (avCords.length !== 0) {
          let currCord = avCords[Math.floor(Math.random() * avCords.length)];
          confirmedCords.push(currCord);
          board.grid[currCord.rowPoint][currCord.colPoint] = numPiecesToCreate;
        }
      }

      //This segment checks if the randomly generated piece should be remade (stay in the while loop) or not
      let listOfClustersEnding = findBoardClusters(board);
      let numClusters = listOfClustersEnding.length;
      if (numClusters === 1) {
        if (numPiecesToCreate - 1 === 1) {
          //make sure last piece does not go over max size
          if (listOfClustersEnding[0].length > maxSpaces) {
            confirmedCords.forEach((cord) => {
              board.grid[cord.rowPoint][cord.colPoint] = 0;
            });
            confirmedCords = [];
          } else {
            remakePiece = false;
          }
        } else {
          remakePiece = false;
        }
      } else if (numClusters > numPiecesToCreate - 1) {
        //we do minus 1 because we already have a piece made since starting this funciton
        //remake pieces if there are more clusters than pieces left to make
        confirmedCords.forEach((cord) => {
          board.grid[cord.rowPoint][cord.colPoint] = 0;
        });
        confirmedCords = [];
      } else {
        let temp = false;
        for (let ittr = 0; ittr < listOfClustersEnding.length; ittr++) {
          let currCluster = listOfClustersEnding[ittr];
          if (currCluster.length < minSpaces) {
            confirmedCords.forEach((cord) => {
              board.grid[cord.rowPoint][cord.colPoint] = 0;
            });
            confirmedCords = [];
            temp = true;
            break;
          }
        }
        remakePiece = temp;
      }
    }
  }
  //this for loop forreal adds the piece
  for (let itr = 0; itr < confirmedCords.length; itr++) {
    let currCord = confirmedCords[itr];
    if (abcdefg === true) {
      board.grid[currCord.rowPoint][currCord.colPoint] = numPiecesToCreate;
    }
    currCord.rowPoint = currCord.rowPoint - baseCordRowNum;
    currCord.colPoint = currCord.colPoint - baseCordColNum;
    currCord.str = `${currCord.rowPoint}${currCord.colPoint}`;
  }
  return {
    piece: new GamePiece(confirmedCords, numPiecesToCreate),
    board: board,
  };
}

function generateMinAndMax(numRows, numCols, numPieces) {
  //easy is 5 num pieces   (biggest is numPieces +3)
  //medium is 5 num pieces (biggest is numPieces +2)
  //hard is 5 num pieces   (biggest is numPieces +1)
  //insane is 8 pieces     (biggest is numPieces + 0)

  //if the gameboard is in the form of nxn, then avg will be n
  let avg = numRows;
  let max = numPieces + (3 + (numPieces - avg) * -2);
  let min = 1;
  if (numRows === 5 && numCols === 5) {
    if (numPieces === 5 || numPieces === 6) {
      min = 2;
    }
  } else if (numRows === 6 && numCols === 6) {
    if (numPieces === 6) {
      min = 3;
    } else if (numPieces === 7) {
      min = 2;
    }
  }
  return { min: min, max: max };
  // let { name2, age2, city2 } = person;
}
function generateRandomPieces(numBoardRows, numBoardCols, numPiecesToCreate) {
  let testBoard = new GameBoard(numBoardRows, numBoardCols);
  let spacesAvailable = numBoardRows * numBoardCols;
  let listPieces = new PiecesList();
  let averageSpacesSinglePiece = Math.floor(
    spacesAvailable / numPiecesToCreate
  );
  //UPDATE MAX AND MIN LATER TO BE FOUND FROM FORMULA
  //Average piece will have 5 spaces (20% of the board: spacesAvailable/numPiecesToCreate)
  //the average can only give or take 12% when it comes to the 5x5 board
  let minSpacesSinglePiece = 2; //smallest piece will have 2 spaces (8% of the board)
  let maxSpacesSinglePiece = 8; //biggest piece will have 8 spaces (32% of the board)
  let randomizePieceNumsArray = randomArray(numPiecesToCreate);
  for (numPiecesToCreate; numPiecesToCreate > 0; numPiecesToCreate--) {
    let createdPiece = generateSinglePiece(
      spacesAvailable,
      numPiecesToCreate,
      testBoard,
      minSpacesSinglePiece,
      maxSpacesSinglePiece
    );
    testBoard = createdPiece.board;
    spacesAvailable = spacesAvailable - createdPiece.piece.coordinates.length;
    listPieces.add(createdPiece.piece);
  }
  return listPieces;
}
