const MINROW = 0;
const MAXROW = 1;
const MINCOL = 2;
const MAXCOL = 3;
const SUCCESSFUL = 1;
const OUT_OF_BOUNDS = 101;
const OVERLAPPING_WITH_EXISTING_PIECE = 102;

//This region defines various functions that will be used in the process of instantiating the following classes below
//#region
function findMinAndMax(coods) {
  //[minrow, maxrow, mincol, maxcol]
  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;

  let size = coods.length;

  for (let itt = 0; itt < size; itt++) {
    let curRow = coods[itt].rowPoint;
    let curCol = coods[itt].colPoint;
    if (curRow < minRow) {
      minRow = curRow;
    }
    if (curRow > maxRow) {
      maxRow = curRow;
    }
    if (curCol < minCol) {
      minCol = curCol;
    }
    if (curCol > minCol) {
      maxCol = curCol;
    }
  }

  return [minRow, maxRow, minCol, maxCol];
}

function create2DArray(row, col) {
  const result = [];
  for (let i = 0; i < row; i++) {
    const row = [];
    for (let j = 0; j < col; j++) {
      row.push(0);
    }
    result.push(row);
  }
  return result;
}

function htmlPieceString(coods, id, sizeBoard) {
  let temp = `<div id= "displayPiece${id}" class="piecelayout${sizeBoard}" draggable="true">`;
  let minRow = findMinAndMax(coods)[MINROW];
  let altCoods = coods.map(function (cood) {
    return new Coordinate(cood.rowPoint - minRow, cood.colPoint);
  });
  for (let rowItt = 0; rowItt < sizeBoard; rowItt++) {
    for (let colItt = 0; colItt < sizeBoard; colItt++) {
      if (containsPoint(rowItt, colItt, altCoods)) {
        temp = temp + `<div class = "pieceDisplay piece${id}"></div>`;
      } else {
        temp = temp + "<div></div>";
      }
    }
  }
  return temp + "</div>";
}

function htmlBoardString(numRows, numCols) {
  let temp = ``;
  for (let rowItt = 0; rowItt < numRows; rowItt++) {
    for (let colItt = 0; colItt < numCols; colItt++) {
      temp =
        temp +
        `<div class = "item nopiece" id = ${rowItt}${colItt} draggable = "false"></div>`;
    }
  }
  return temp;
}

function containsPoint(rowParam, colParam, coods) {
  let size = coods.length;
  let retValue = false;
  for (let itt = 0; itt < size; itt++) {
    if (coods[itt].rowPoint === rowParam && coods[itt].colPoint === colParam) {
      retValue = true;
    }
  }
  return retValue;
}
//#endregion
class Coordinate {
  constructor(rowPoint, colPoint) {
    this.rowPoint = rowPoint;
    this.colPoint = colPoint;
    this.str = "" + rowPoint + colPoint;
  }
  displacePiece(vectorCoordinate) {
    return new Coordinate(
      vectorCoordinate.rowPoint + this.rowPoint,
      vectorCoordinate.colPoint + this.colPoint
    );
  }
  findDisplacementCoordinate(baseCoordinate) {
    return new Coordinate(
      baseCoordinate.rowPoint - this.rowPoint,
      baseCoordinate.colPoint - this.colPoint
    );
  }

  equals(other) {
    return this.rowPoint === other.rowPoint && this.colPoint === other.colPoint;
  }
  toString() {
    return "(" + this.rowPoint + "," + this.colPoint + ")";
  }
  valueOf() {
    return this.str;
  }
}
//for the sake of our game, the (0,0) piece will always be the piece highest up row in the most left column
class GamePiece {
  constructor(coordinates, id, sizeBoard) {
    this.coordinates = coordinates;
    this.id = id;
    this.gridString = htmlPieceString(coordinates, id, sizeBoard);
    let temp = findMinAndMax(coordinates);
    this.minRow = temp[MINROW];
    this.maxRow = temp[MAXROW];
    this.minCol = temp[MINCOL];
    this.maxCol = temp[MAXCOL];
  }

  toString() {
    let strTemp = "Piece " + this.id + ": [";
    this.coordinates.forEach(function (cood) {
      strTemp = strTemp + `${cood.toString()}, `;
    });
    return strTemp.substring(0, strTemp.length - 2) + "]";
  }
}

class GameBoard {
  constructor(numRows, numCols) {
    this.grid = create2DArray(numRows, numCols);
    this.numRows = numRows;
    this.numCols = numCols;
    this.htmlString = htmlBoardString(numRows, numCols);
  }

  toString() {
    return this.grid;
  }

  boardComplete() {
    let retVal = true;
    for (let i = 0; i < this.numRows; i++) {
      for (let j = 0; j < this.numCols; j++) {
        if (this.grid[i][j] === 0) {
          retVal = false;
          break;
        }
      }
    }
    return retVal;
  }
}

class PiecesList {
  constructor() {
    this.list = new Array();
  }

  add(piece) {
    this.list.push(piece);
  }

  remove(pieceId) {
    let pieceInList = false;
    let indexOfPiece = -1;
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].id === pieceId) {
        //found piece
        pieceInList = true;
        indexOfPiece = i;
        break;
      }
    }
    if (pieceInList) {
      let removedPiece = this.list[indexOfPiece];
      this.list.splice(indexOfPiece, 1);
      return removedPiece;
    }
    return null;
  }

  toString() {
    if (this.list.length === 0) {
      return "[]";
    }
    let strTemp = "[";
    this.list.forEach((piece) => {
      strTemp = strTemp + "Piece " + piece.id + ", ";
    });
    return strTemp.substring(0, strTemp.length - 2) + "]";
  }

  htmlString() {
    let retVal = "";
    this.list.forEach((piece) => {
      retVal = retVal + `${piece.gridString}`;
    });
    return retVal;
  }

  find(num) {
    return this.list.find((element) => element.id === num);
  }
}
