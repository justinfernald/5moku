// import init from '../rust/5moku-bot/pkg/gomoku_bot_bg.wasm?init';
// import { GomokuBot } from '../rust/5moku-bot/pkg/gomoku_bot';
import { makeAutoObservable } from 'mobx';
import { AI } from './AiEngine';
import { CellState, Gomoku, Player } from './game';

export class BotModel {
  // bot?: GomokuBot;
  bot: AI = new AI();

  lastBestMove?: number;

  constructor(private game: Gomoku) {
    makeAutoObservable(this, {}, { autoBind: true });
    this.setupBot();
  }

  // async setupBot() {
  //   this.bot = new GomokuBot(3); // depth of 3
  // }

  // convertBoardToWasmBoard() {
  //   const board = this.game.board;
  //   const size = board.length;
  //   const wasmBoard = new Uint8Array(size * size);
  //   for (let i = 0; i < size; i++) {
  //     for (let j = 0; j < size; j++) {
  //       wasmBoard[i * size + j] = board[i][j];
  //     }
  //   }
  //   return wasmBoard;
  // }

  // getBestMove() {
  //   if (!this.bot) {
  //     return;
  //   }
  //   const wasmBoard = this.convertBoardToWasmBoard();
  //   const playerTurn = this.game.getTurn() === Player.X ? 1 : 2;
  //   const result = this.bot.best_move(wasmBoard, playerTurn);
  //   const [bestMove, score] = result;
  //   console.log(`Best move: ${bestMove}, Score: ${score}`);
  //   return bestMove;
  // }

  async setupBot() {}

  convertBoardForAI(board: CellState[][]): Uint8Array {
    const size = board.length;
    const aiBoard = new Uint8Array(size * size);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        aiBoard[i * size + j] = board[i][j];
      }
    }
    return aiBoard;
  }

  handleAITurn() {
    // const aiBoard = this.convertBoardForAI(this.game.board);
    // const playerType = this.game.turn === Player.X ? CellState.X : CellState.O;
    // const [score, bestMove] = this.bot.minimax(
    //   aiBoard,
    //   3,
    //   Number.MIN_SAFE_INTEGER,
    //   Number.MAX_SAFE_INTEGER,
    //   playerType,
    // );
    // if (bestMove[0] !== -1 && bestMove[1] !== -1) {
    //   this.game.placeCell(bestMove[0], bestMove[1]);
    // }
  }

  onPlayerMove(row: number, col: number) {
    if (this.game.placeCell(row, col)) {
      // Check if game is over after player move
      if (!this.game.isGameOver) {
        // AI's turn
        this.handleAITurn();
      }
    }
  }

  getBestMove() {
    if (!this.bot) {
      return;
    }

    const aiBoard = this.convertBoardForAI(this.game.board);

    this.bot.printBoard(aiBoard);

    const playerType = this.game.turn === Player.X ? CellState.X : CellState.O;

    const [score, bestMove] = this.bot.makeBestMove(aiBoard, playerType);

    console.log(`Best move: ${bestMove}, Score: ${score}`);

    this.lastBestMove = bestMove;
  }

  evalBoard() {
    if (!this.bot) {
      return;
    }

    const aiBoard = this.convertBoardForAI(this.game.board);

    this.bot.printBoard(aiBoard);

    console.log(aiBoard);

    const playerType = this.game.turn === Player.X ? CellState.X : CellState.O;

    const flippedType = playerType === CellState.X ? CellState.O : CellState.X;

    const score = this.bot.evaluateBoard(aiBoard, playerType);

    const flippedScore = this.bot.evaluateBoard(aiBoard, flippedType);

    console.log(`Score: ${score}`);
    console.log(`Flipped Score: ${flippedScore}`);
    console.log(`Difference: ${score - flippedScore}`);
  }
}
