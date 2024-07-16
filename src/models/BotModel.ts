import { Gomoku, Player } from './game';
import init from '../rust/5moku-bot/pkg/gomoku_bot_bg.wasm?init';
import { GomokuBot } from '../rust/5moku-bot/pkg/gomoku_bot';

console.log({ init, GomokuBot });

export class BotModel {
  bot?: GomokuBot;

  constructor(private game: Gomoku) {
    this.setupBot();
  }

  async setupBot() {
    // await init({});
    this.bot = new GomokuBot(this.game.board.length, 3);
  }

  convertBoardToWasmBoard() {
    const board = this.game.board;

    const size = board.length;

    const wasmBoard = new Uint8Array(size * size);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        wasmBoard[i * size + j] = board[i][j];
      }
    }

    return wasmBoard;
  }

  getBestMove() {
    if (!this.bot) {
      return;
    }

    const wasmBoard = this.convertBoardToWasmBoard();

    const bestMove = this.bot.best_move(
      wasmBoard,
      this.game.getTurn() === Player.X ? 1 : 2,
    );

    return bestMove;
  }
}
