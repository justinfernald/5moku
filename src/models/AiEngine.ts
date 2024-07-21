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
  // 'UP',
  'DOWN',
  // 'LEFT',
  'RIGHT',
  // 'UP_LEFT', // currently broken
  // 'UP_RIGHT', // currently broken
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

const ThreatTypeScores = {
  [ThreatType.DOUBLE_OPEN_ONE]: 10,
  [ThreatType.SINGLE_OPEN_ONE]: 1,
  [ThreatType.DOUBLE_OPEN_TWO]: 50000,
  [ThreatType.SINGLE_OPEN_TWO]: 100,
  [ThreatType.DOUBLE_OPEN_THREE]: 500000,
  [ThreatType.SINGLE_OPEN_THREE]: 10000,
  [ThreatType.DOUBLE_OPEN_FOUR]: 1000000,
  [ThreatType.SINGLE_OPEN_FOUR]: 500000,
  [ThreatType.FIVE]: Infinity,
} as const;

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
    const lineElements = [opponent, ...line.elements.map((el) => el.type), opponent];
    const usedIndices = new Set<number>();

    const X = type;
    const B = opponent;
    const _ = CellState.EMPTY;

    const patterns = [
      { pattern: [X, X, X, X, X], threat: ThreatType.FIVE },
      {
        pattern: [_, X, X, X, X, _],
        threat: ThreatType.DOUBLE_OPEN_FOUR,
      },
      {
        pattern: [B, X, X, X, X, _],
        threat: ThreatType.SINGLE_OPEN_FOUR,
      },
      {
        pattern: [_, X, X, X, X, B],
        threat: ThreatType.SINGLE_OPEN_FOUR,
      },
      {
        pattern: [_, X, X, X, _, _],
        threat: ThreatType.DOUBLE_OPEN_THREE,
      },
      {
        pattern: [_, _, X, X, X, _],
        threat: ThreatType.DOUBLE_OPEN_THREE,
      },
      {
        pattern: [_, X, X, _, X, _],
        threat: ThreatType.DOUBLE_OPEN_THREE,
      },
      {
        pattern: [_, X, _, X, X, _],
        threat: ThreatType.DOUBLE_OPEN_THREE,
      },
      {
        pattern: [_, X, _, X, _, X, _],
        threat: ThreatType.DOUBLE_OPEN_THREE,
      },
      {
        pattern: [B, X, X, X, _, _],
        threat: ThreatType.SINGLE_OPEN_THREE,
      },
      {
        pattern: [_, _, X, X, X, B],
        threat: ThreatType.SINGLE_OPEN_THREE,
      },
      {
        pattern: [_, X, X, _, _],
        threat: ThreatType.DOUBLE_OPEN_TWO,
      },
      {
        pattern: [_, _, X, X, _],
        threat: ThreatType.DOUBLE_OPEN_TWO,
      },
      {
        pattern: [_, X, _, X, _],
        threat: ThreatType.DOUBLE_OPEN_TWO,
      },
      {
        pattern: [B, X, X, _, _, _],
        threat: ThreatType.SINGLE_OPEN_TWO,
      },
      {
        pattern: [_, _, _, X, X, B],
        threat: ThreatType.SINGLE_OPEN_TWO,
      },
      {
        pattern: [B, _, X, X, _, _],
        threat: ThreatType.SINGLE_OPEN_TWO,
      },
      {
        pattern: [_, _, X, X, _, B],
        threat: ThreatType.SINGLE_OPEN_TWO,
      },
      // more patterns are required
    ];

    for (let i = 0; i < lineElements.length; i++) {
      if (usedIndices.has(i)) continue;

      for (const { pattern, threat } of patterns) {
        if (this.matchPattern(lineElements, i, pattern)) {
          const endIndex = i + pattern.length - 1;

          // Check if any of the indices in this threat have already been used
          const threatIndices = new Set(
            Array.from({ length: pattern.length }, (_, index) => i + index),
          );
          const overlap = [...threatIndices].some((index) => usedIndices.has(index));

          if (!overlap) {
            threats.push({
              type: threat,
              startIndex: i,
              endIndex: endIndex,
            });

            // Mark all indices in this threat as used
            for (let j = i; j <= endIndex; j++) {
              usedIndices.add(j);
            }

            break; // Only count the most significant threat for each starting position
          }
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
      if (line[startIndex + i] !== pattern[i]) {
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

  evaluateBoard(board: Board, type: CellState, log = false): number {
    let score = 0;

    for (const direction of directions) {
      const lines = this.getLines(board, direction);
      for (const line of lines) {
        const threats = this.lineAnalysis(line, type);

        for (const threat of threats) {
          const threatScore = ThreatTypeScores[threat.type];
          score += threatScore;

          if (log && threatScore >= 1000) {
            console.log(threat);
          }
        }
      }
    }

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

  orderMoves(board: Board, emptyCells: number[], turn: CellState): number[] {
    const opponent = this.getOpponent(turn);
    return emptyCells.sort((a, b) => {
      const boardA = this.makeBoardCopy(board);
      const boardB = this.makeBoardCopy(board);
      boardA[a] = turn;
      boardB[b] = turn;
      const scoreA =
        this.evaluateBoard(boardA, turn) - this.evaluateBoard(boardA, opponent);
      const scoreB =
        this.evaluateBoard(boardB, turn) - this.evaluateBoard(boardB, opponent);
      return scoreB - scoreA; // Higher scores first
    });
  }

  getOpponent(type: CellState): CellState {
    return type === CellState.X ? CellState.O : CellState.X;
  }

  isWinner(board: Board, type: CellState): boolean {
    for (const direction of directions) {
      const lines = this.getLines(board, direction);
      for (const line of lines) {
        const threats = this.lineAnalysis(line, type);
        if (threats.some((threat) => threat.type === ThreatType.FIVE)) {
          return true;
        }
      }
    }

    return false;
  }

  hasWinner(board: Board): CellState | null {
    if (this.isWinner(board, CellState.X)) {
      return CellState.X;
    } else if (this.isWinner(board, CellState.O)) {
      return CellState.O;
    } else {
      return null;
    }
  }

  minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    turn: CellState.X | CellState.O,
    maxDepth: number,
  ): [number, number] {
    // console.log('Depth:', depth);
    // this.printBoard(board);

    const winner = this.hasWinner(board);

    if (winner !== null || depth === maxDepth) {
      return [
        this.evaluateBoard(board, CellState.X) - this.evaluateBoard(board, CellState.O),
        -1,
      ];
    }

    const moves = this.findEmptyAdjacentCells(board);
    let bestMove = -1;

    if (turn === CellState.X) {
      // Maximizing player
      let maxEval = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        const newBoard = this.makeBoardCopy(board);
        newBoard[moves[i]] = CellState.X;
        const [evalScore] = this.minimax(
          newBoard,
          depth + 1,
          alpha,
          beta,
          CellState.O,
          maxDepth,
        );
        if (evalScore > maxEval) {
          maxEval = evalScore;
          bestMove = moves[i];
        }
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) {
          break;
        }
      }
      return [maxEval, bestMove];
    } else {
      // Minimizing player
      let minEval = Infinity;
      for (let i = 0; i < moves.length; i++) {
        const newBoard = this.makeBoardCopy(board);
        newBoard[moves[i]] = CellState.O;
        const [evalScore] = this.minimax(
          newBoard,
          depth + 1,
          alpha,
          beta,
          CellState.X,
          maxDepth,
        );
        if (evalScore < minEval) {
          minEval = evalScore;
          bestMove = moves[i];
        }
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) {
          break;
        }
      }
      return [minEval, bestMove];
    }
  }

  makeBestMove(
    board: Board,
    type: CellState.X | CellState.O,
  ): [score: number, moveIndex: number] {
    const maxDepth = 3;
    const [score, bestMove] = this.minimax(
      board,
      0,
      Number.MIN_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      type,
      maxDepth,
    );
    return [score, bestMove];
  }

  makeBoardCopy(board: Board): Board {
    const copy: Board = new Uint8Array(15 * 15);

    for (let i = 0; i < board.length; i++) {
      copy[i] = board[i];
    }

    return copy;
  }
}
