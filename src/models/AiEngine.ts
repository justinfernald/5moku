import { CellState } from './game';

type Board = Uint8Array;

const Direction = {
  UP: [0, -1],
  DOWN: [0, 1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  UP_LEFT: [-1, -1],
  UP_RIGHT: [1, -1],
  DOWN_LEFT: [-1, 1],
  DOWN_RIGHT: [1, 1],
} as const;

type Direction = typeof Direction;

const directions = [
  'UP',
  'DOWN',
  'LEFT',
  'RIGHT',
  'UP_LEFT',
  'UP_RIGHT',
  'DOWN_LEFT',
  'DOWN_RIGHT',
] as const;

enum ThreatType {
  DOUBLE_OPEN_ONE = 'DOUBLE_OPEN_ONE',
  SINGLE_OPEN_ONE = 'SINGLE_OPEN_ONE',
  DOUBLE_OPEN_TWO = 'DOUBLE_OPEN_TWO',
  SINGLE_OPEN_TWO = 'SINGLE_OPEN_TWO',
  DOUBLE_OPEN_THREE = 'DOUBLE_OPEN_THREE',
  SINGLE_OPEN_THREE = 'SINGLE_OPEN_THREE',
  DOUBLE_OPEN_FOUR = 'DOUBLE_OPEN_FOUR',
  SINGLE_OPEN_FOUR = 'SINGLE_OPEN_FOUR',
  FIVE = 'FIVE',
}

interface LineThreat {
  type: ThreatType;
  startIndex: number;
  endIndex: number;
}

interface Line {
  startLocation: number;
  endLocation: number;
  elements: {
    location: number;
    type: CellState;
  }[];
  direction: keyof Direction;
}

export class AI {
  getLines(board: Board, direction: keyof Direction): Line[] {
    const [dx, dy] = Direction[direction];
    const result: Line[] = [];
    const width = 15;
    const height = 15;

    let startPositions: [number, number][] = [];

    // Determine starting positions based on direction
    switch (direction) {
      case 'RIGHT':
        startPositions = Array.from({ length: height }, (_, y) => [0, y]);
        break;
      case 'LEFT':
        startPositions = Array.from({ length: height }, (_, y) => [width - 1, y]);
        break;
      case 'DOWN':
        startPositions = Array.from({ length: width }, (_, x) => [x, 0]);
        break;
      case 'UP':
        startPositions = Array.from({ length: width }, (_, x) => [x, height - 1]);
        break;
      case 'DOWN_RIGHT':
      case 'UP_LEFT':
        for (let i = 0; i < width; i++) {
          startPositions.push([i, 0]);
          if (i !== 0) startPositions.push([0, i]);
        }
        break;
      case 'DOWN_LEFT':
      case 'UP_RIGHT':
        for (let i = 0; i < width; i++) {
          startPositions.push([width - 1 - i, 0]);
          if (i !== 0) startPositions.push([width - 1, i]);
        }
        break;
    }

    for (const [startX, startY] of startPositions) {
      let x = startX;
      let y = startY;
      const line: Line = {
        direction,
        elements: [],
        startLocation: this.positionToIndex(width, height, x, y),
        endLocation: -1,
      };

      while (x >= 0 && x < width && y >= 0 && y < height) {
        const index = this.positionToIndex(width, height, x, y);
        line.elements.push({
          location: index,
          type: this.cellStateFromIndex(board, index),
        });
        line.endLocation = index;
        x += dx;
        y += dy;
      }

      if (line.elements.length > 0) {
        result.push(line);
      }
    }

    return result;
  }
  lineAnalysis(line: Line, type: CellState): LineThreat[] {
    const threats: LineThreat[] = [];
    const opponent = type === CellState.X ? CellState.O : CellState.X;
    const lineElements = line.elements.map((el) => el.type);

    const patterns = [
      { pattern: [type, type, type, type, type], threat: ThreatType.FIVE },
      {
        pattern: [CellState.EMPTY, type, type, type, type, CellState.EMPTY],
        threat: ThreatType.DOUBLE_OPEN_FOUR,
      },
      {
        pattern: [opponent, type, type, type, type, CellState.EMPTY],
        threat: ThreatType.SINGLE_OPEN_FOUR,
      },
      {
        pattern: [CellState.EMPTY, type, type, type, type, opponent],
        threat: ThreatType.SINGLE_OPEN_FOUR,
      },
      {
        pattern: [CellState.EMPTY, type, type, type, CellState.EMPTY],
        threat: ThreatType.DOUBLE_OPEN_THREE,
      },
      {
        pattern: [CellState.EMPTY, type, type, type, CellState.EMPTY, CellState.EMPTY],
        threat: ThreatType.DOUBLE_OPEN_THREE,
      },
      {
        pattern: [CellState.EMPTY, CellState.EMPTY, type, type, type, CellState.EMPTY],
        threat: ThreatType.DOUBLE_OPEN_THREE,
      },
      {
        pattern: [opponent, type, type, type, CellState.EMPTY],
        threat: ThreatType.SINGLE_OPEN_THREE,
      },
      {
        pattern: [CellState.EMPTY, type, type, type, opponent],
        threat: ThreatType.SINGLE_OPEN_THREE,
      },
      {
        pattern: [CellState.EMPTY, type, type, CellState.EMPTY],
        threat: ThreatType.DOUBLE_OPEN_TWO,
      },
      {
        pattern: [CellState.EMPTY, type, CellState.EMPTY, type, CellState.EMPTY],
        threat: ThreatType.DOUBLE_OPEN_TWO,
      },
    ];

    for (let i = 0; i < lineElements.length; i++) {
      for (const { pattern, threat } of patterns) {
        if (this.matchPattern(lineElements, i, pattern)) {
          threats.push({
            type: threat,
            startIndex: i,
            endIndex: i + pattern.length - 1,
          });
          break; // Only count the most significant threat for each starting position
        }
      }
    }

    return threats;
  }

  private matchPattern(
    line: CellState[],
    startIndex: number,
    pattern: CellState[],
  ): boolean {
    if (startIndex + pattern.length > line.length) return false;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== CellState.EMPTY && line[startIndex + i] !== pattern[i]) {
        return false;
      }
    }
    return true;
  }

  cellStateFromPosition(
    width: number,
    _height: number,
    board: Board,
    x: number,
    y: number,
  ): CellState {
    return board[x + y * width];
  }

  cellStateFromIndex(board: Board, index: number): CellState {
    return board[index];
  }

  positionToIndex(width: number, _height: number, x: number, y: number): number {
    return x + y * width;
  }

  indexToPosition(width: number, _height: number, index: number): [number, number] {
    const x = index % width;
    const y = Math.floor(index / width);
    return [x, y];
  }

  findEmptyCells(board: Board): number[] {
    return this.findTypeCells(board, CellState.EMPTY);
  }

  findTypeCells(board: Board, type: CellState): number[] {
    const typeCells: number[] = [];

    for (let i = 0; i < board.length; i++) {
      if (board[i] === type) {
        typeCells.push(i);
      }
    }

    return typeCells;
  }

  findEmptyAdjacent(board: Board, index: number): number[] {
    const emptyCells: number[] = [];
    const maxX = 14;
    const maxY = 14;
    const adjacentCoordinates: [number, number][] = [
      [-1, -1],
      [0, -1],
      [+1, -1],
      [-1, 0],
      [+1, 0],
      [-1, +1],
      [0, +1],
      [+1, +1],
    ];

    for (const [adjX, adjY] of adjacentCoordinates) {
      const x = index % 15;
      const y = Math.floor(index / 15);
      const newX = x + adjX;
      const newY = y + adjY;
      if (newX >= 0 && newX <= maxX && newY >= 0 && newY <= maxY) {
        const newIndex = this.positionToIndex(15, 15, newX, newY);
        if (board[newIndex] === CellState.EMPTY) {
          emptyCells.push(newIndex);
        }
      }
    }

    return emptyCells;
  }

  findEmptyAdjacentCells(board: Board): number[] {
    const filledCells = [
      ...this.findTypeCells(board, CellState.X),
      ...this.findTypeCells(board, CellState.O),
    ];

    const emptyAdjacentCells: Set<number> = new Set();

    for (const index of filledCells) {
      const adjacentEmptyCells = this.findEmptyAdjacent(board, index);
      for (const adjacentCellIndex of adjacentEmptyCells) {
        emptyAdjacentCells.add(adjacentCellIndex);
      }
    }

    return Array.from(emptyAdjacentCells);
  }

  printBoard(board: Board) {
    const maxX = 15;
    const maxY = 15;
    let boardString = '';

    for (let y = 0; y < maxY; y++) {
      for (let x = 0; x < maxX; x++) {
        const index = this.positionToIndex(maxX, maxY, x, y);
        boardString +=
          board[index] === CellState.EMPTY
            ? '.'
            : board[index] === CellState.X
            ? 'X'
            : 'O';
      }
      boardString += '\n';
    }

    console.log(boardString);
  }

  evaluateBoard(board: Board, type: CellState): number {
    const linesDirections = directions.map((direction) => ({
      direction,
      lines: this.getLines(board, direction),
    }));

    // console.log(linesDirections);

    let score = 0;

    let i = 0;

    for (const linesDirection of linesDirections) {
      const lines = linesDirection.lines;

      // console.log(linesDirection.direction);

      for (const line of lines) {
        // console.log(i++);

        const threats = this.lineAnalysis(line, type);

        for (const threat of threats) {
          // console.log({ line, threat, threatType: threat.type });

          switch (threat.type) {
            case ThreatType.DOUBLE_OPEN_ONE:
              score += 10;
              break;
            case ThreatType.SINGLE_OPEN_ONE:
              score += 1;
              break;
            case ThreatType.DOUBLE_OPEN_TWO:
              score += 2000;
              break;
            case ThreatType.SINGLE_OPEN_TWO:
              score += 10;
              break;
            case ThreatType.DOUBLE_OPEN_THREE:
              score += 100000;
              break;
            case ThreatType.SINGLE_OPEN_THREE:
              score += 5000;
              break;
            case ThreatType.DOUBLE_OPEN_FOUR:
              score += 1000000;
              break;
            case ThreatType.SINGLE_OPEN_FOUR:
              score += 200000;
              break;
            case ThreatType.FIVE:
              score += Infinity;
              break;
          }
        }
      }
    }

    console.log({ score, type: type === CellState.X ? 'X' : 'O' });

    return score;
  }

  shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }

    return newArray;
  }

  minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    turn: CellState,
  ): [score: number, moveIndex: number] {
    this.printBoard(board);
    console.log({ depth, alpha, beta, turn });

    const opponent = turn === CellState.X ? CellState.O : CellState.X;

    if (depth === 0) {
      return [this.evaluateBoard(board, turn) - this.evaluateBoard(board, opponent), -1];
    }

    const emptyCells = this.findEmptyAdjacentCells(board);

    if (emptyCells.length === 0) {
      return [0, -1];
    }

    let bestScore =
      turn === CellState.X ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
    let bestMove = -1;

    for (const moveIndex of this.shuffleArray(emptyCells)) {
      const newBoard = this.makeBoardCopy(board);
      newBoard[moveIndex] = turn;

      const [score, _] = this.minimax(newBoard, depth - 1, alpha, beta, opponent);

      if (turn === CellState.X) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = moveIndex;
        }
        alpha = Math.max(alpha, bestScore);
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = moveIndex;
        }
        beta = Math.min(beta, bestScore);
      }

      if (beta <= alpha) {
        break;
      }
    }

    return [bestScore, bestMove];
  }

  makeBestMove(board: Board, type: CellState): number {
    const [_, bestMove] = this.minimax(
      board,
      3,
      Number.MIN_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      type,
    );
    return bestMove;
  }

  makeBoardCopy(board: Board): Board {
    const copy: Board = new Uint8Array(15 * 15);

    for (let i = 0; i < board.length; i++) {
      copy[i] = board[i];
    }

    return copy;
  }
}
