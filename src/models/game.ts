import { makeAutoObservable } from 'mobx';

export enum PlayMode {
  UNSET,
  LOCAL,
  REMOTE,
}

export enum Player {
  X = 'X',
  O = 'O',
}

export enum CellState {
  EMPTY,
  X,
  O,
}

export interface Location {
  row: number;
  col: number;
}

export interface Cell extends Location {
  value: CellState;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface GomokuDTO {
  size: Dimensions;
  winAmount: number;
  board: CellState[][];
  turn: Player;
  isGameOver: boolean;
  winner: Player | null;
  winLocations: Location[] | null;
}

export enum Status {
  READY,
  DISCONNECT,
}

export enum PeerDataTransferType {
  STATUS,
  SETUP,
  MOVE,
  RESET,
}

export const PeerDataTransferTypes = [
  PeerDataTransferType.STATUS,
  PeerDataTransferType.SETUP,
  PeerDataTransferType.MOVE,
  PeerDataTransferType.RESET,
];

export type PeerDataTransfer =
  | {
      type: PeerDataTransferType.STATUS;
      payload: Status;
    }
  | {
      type: PeerDataTransferType.SETUP;
      payload: { game: GomokuDTO; player: Player };
    }
  | {
      type: PeerDataTransferType.MOVE;
      payload: Location;
    }
  | {
      type: PeerDataTransferType.RESET;
      payload: Player;
    };

export function isPeerDataTransfer(data: any): data is PeerDataTransfer {
  return PeerDataTransferTypes.includes(data.type);
}

export class Gomoku {
  board: CellState[][];
  turn: Player;

  winLocations: Location[] | null = null;
  winner: Player | null = null;

  isGameOver = false;

  static fromDTO(dto: GomokuDTO): Gomoku {
    const gomoku = new Gomoku(dto.size, dto.winAmount);
    gomoku.board = dto.board;
    gomoku.turn = dto.turn;
    gomoku.isGameOver = dto.isGameOver;
    gomoku.winner = dto.winner;
    gomoku.winLocations = dto.winLocations;
    return gomoku;
  }

  constructor(public size: Dimensions, public winAmount = 5) {
    this.turn = Player.X;
    // this.turn = [Player.X, Player.O][Math.floor(Math.random() * 2)];

    this.board = [];
    this.setupBoard();

    makeAutoObservable(this, {}, { autoBind: true });
  }

  setupBoard() {
    for (let i = 0; i < this.size.height; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.size.width; j++) {
        this.board[i][j] = CellState.EMPTY;
      }
    }
  }

  changeTurn() {
    this.turn = this.turn === Player.X ? Player.O : Player.X;
  }

  getTurn() {
    return this.turn;
  }

  getCell(row: number, col: number): CellState {
    return this.board[row][col];
  }

  setCell(row: number, col: number, value: CellState) {
    this.board[row][col] = value;
  }

  placeCell(row: number, col: number): boolean {
    if (this.isGameOver || !this.isEmpty(row, col)) return false;

    this.setCell(row, col, playerToCellState(this.getTurn()));
    this.winLocations = this.checkWin(row, col, this.getTurn());
    if (this.winLocations !== null) {
      this.winner = this.getTurn();
      this.isGameOver = true;
    } else if (this.isFull()) {
      this.isGameOver = true;
    }
    this.changeTurn();

    return true;
  }

  getValidMoves(): Location[] {
    const {
      size: { width, height },
    } = this;

    const validMoves: Location[] = [];
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (this.isEmpty(row, col)) {
          validMoves.push({ row, col });
        }
      }
    }
    return validMoves;
  }

  isEmpty(row: number, col: number): boolean {
    return this.board[row][col] === CellState.EMPTY;
  }

  isFull(): boolean {
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[i].length; j++) {
        if (this.board[i][j] === CellState.EMPTY) {
          return false;
        }
      }
    }
    return true;
  }

  checkWin(row: number, col: number, player: Player): Location[] | null {
    const {
      size: { width, height },
      board,
      winAmount,
    } = this;

    const outputCells = [{ row, col }];

    // check horizontal
    const horizontalCells = [];
    // move left
    for (let i = col - 1; i >= 0; i--) {
      if (board[row][i] !== playerToCellState(player)) break;
      horizontalCells.unshift({ row, col: i });
    }
    // move right
    for (let i = col + 1; i < width; i++) {
      if (board[row][i] !== playerToCellState(player)) break;
      horizontalCells.push({ row, col: i });
    }

    if (horizontalCells.length >= winAmount - 1) outputCells.push(...horizontalCells);

    // check vertical
    const verticalCells = [];
    // move up
    for (let i = row - 1; i >= 0; i--) {
      if (board[i][col] !== playerToCellState(player)) break;
      verticalCells.unshift({ row: i, col });
    }
    // move down
    for (let i = row + 1; i < height; i++) {
      if (board[i][col] !== playerToCellState(player)) break;
      verticalCells.push({ row: i, col });
    }

    if (verticalCells.length >= winAmount - 1) outputCells.push(...verticalCells);

    // check top left to bottom right
    const topLeftToBottomRightCells = [];
    // move top left to bottom right
    for (let i = 1; row - i >= 0 && col - i >= 0; i++) {
      if (board[row - i][col - i] !== playerToCellState(player)) break;
      topLeftToBottomRightCells.unshift({ row: row - i, col: col - i });
    }
    // move bottom right to top left
    for (let i = 1; row + i < height && col + i < width; i++) {
      if (board[row + i][col + i] !== playerToCellState(player)) break;
      topLeftToBottomRightCells.push({ row: row + i, col: col + i });
    }

    if (topLeftToBottomRightCells.length >= winAmount - 1)
      outputCells.push(...topLeftToBottomRightCells);

    // check bottom left to top right
    const bottomLeftToTopRightCells = [];
    // move bottom left to top right
    for (let i = 1; row + i < height && col - i >= 0; i++) {
      if (board[row + i][col - i] !== playerToCellState(player)) break;
      bottomLeftToTopRightCells.unshift({ row: row + i, col: col - i });
    }
    // move top right to bottom left
    for (let i = 1; row - i >= 0 && col + i < width; i++) {
      if (board[row - i][col + i] !== playerToCellState(player)) break;
      bottomLeftToTopRightCells.push({ row: row - i, col: col + i });
    }

    if (bottomLeftToTopRightCells.length >= winAmount - 1)
      outputCells.push(...bottomLeftToTopRightCells);

    return outputCells.length > 1 ? outputCells : null;
  }

  isWinningCell(location: Location) {
    return (
      this.winLocations !== null &&
      this.winLocations.find(
        (winLocation) =>
          winLocation.col === location.col && winLocation.row === location.row,
      )
    );
  }

  fullCheckWin(): Cell[] | null {
    const {
      size: { width, height },
      board,
      winAmount,
    } = this;

    // check rows
    for (let col = 0; col < width; col++) {
      let winCells: Cell[] = [];
      let last = CellState.EMPTY;

      for (let row = 0; row < height; row++) {
        const cell = board[row][col];
        if (cell === CellState.EMPTY) {
          winCells = [];
        } else if (cell === last) {
          winCells.push({ row, col, value: cell });
        } else {
          winCells = [{ row, col, value: cell }];
        }
        last = cell;
        if (winCells.length === winAmount) {
          return winCells;
        }
      }
    }

    // check columns
    for (let row = 0; row < height; row++) {
      let winCells: Cell[] = [];
      let last = CellState.EMPTY;

      for (let col = 0; col < width; col++) {
        const cell = board[row][col];
        if (cell === CellState.EMPTY) {
          winCells = [];
        } else if (cell === last) {
          winCells.push({ row, col, value: cell });
        } else {
          winCells = [{ row, col, value: cell }];
        }
        last = cell;
        if (winCells.length === winAmount) {
          return winCells;
        }
      }
    }

    // check diagonal - top left to bottom right
    for (let line = winAmount; line <= height + width - winAmount; line++) {
      const startCol = Math.max(0, line - height);
      const digCount = Math.min(line, width - startCol, height);

      let winCells: Cell[] = [];
      let last = CellState.EMPTY;

      for (let j = 0; j < digCount; j++) {
        const row = Math.min(height, line) - j - 1;
        const col = startCol + j;

        const cell = board[row][col];
        if (cell === CellState.EMPTY) {
          winCells = [];
        } else if (cell === last) {
          winCells.push({ row, col, value: cell });
        } else {
          winCells = [{ row, col, value: cell }];
        }
        last = cell;
        if (winCells.length === winAmount) {
          return winCells;
        }
      }
    }

    // check diagonal - bottom left to top right
    for (let line = winAmount; line <= height + width - winAmount; line++) {
      const startCol = Math.max(0, line - height);
      const digCount = Math.min(line, width - startCol, height);

      let winCells: Cell[] = [];
      let last = CellState.EMPTY;

      for (let j = 0; j < digCount; j++) {
        const row = Math.min(height, line) - j - 1;
        const col = width - (startCol + j) - 1;

        const cell = board[row][col];
        if (cell === CellState.EMPTY) {
          winCells = [];
        } else if (cell === last) {
          winCells.push({ row, col, value: cell });
        } else {
          winCells = [{ row, col, value: cell }];
        }
        last = cell;
        if (winCells.length === winAmount) {
          return winCells;
        }
      }
    }

    return null;
  }

  reset() {
    this.turn = Player.X;

    this.board = [];
    this.isGameOver = false;
    this.winLocations = null;
    this.winner = null;

    this.setupBoard();
  }

  toDTO(): GomokuDTO {
    return {
      size: this.size,
      winAmount: this.winAmount,
      board: this.board,
      turn: this.turn,
      isGameOver: this.isGameOver,
      winner: this.winner,
      winLocations: this.winLocations,
    };
  }
}

export function playerToCellState(player: Player): CellState {
  return player === Player.X ? CellState.X : CellState.O;
}

export function cellStateToPlayer(cellState: CellState): Player | null {
  if (cellState === CellState.EMPTY) return null;
  return cellState === CellState.X ? Player.X : Player.O;
}
