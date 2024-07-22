import { makeAutoObservable } from 'mobx';
import { AI } from './AiEngine';
import { CellState, Gomoku, Player } from './game';

export class BotModel {
  bot: AI = new AI();

  lastBestMove?: number;

  constructor(private game: Gomoku, public aiPlayer = Player.O) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

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
    if (!this.bot) {
      throw new Error('Bot not initialized');
    }

    const bestMove = this.getBestMove();

    if (bestMove !== -1) {
      const row = Math.floor(bestMove / this.game.board.length);
      const col = bestMove % this.game.board.length;

      this.game.placeCell(row, col);
    }
  }

  triggerPlayerMove() {
    if (!this.game.isGameOver && this.game.turn === this.aiPlayer) {
      console.time('bot move');
      this.handleAITurn();
      console.timeEnd('bot move');
    }
  }

  getBestMove() {
    if (!this.bot) {
      throw new Error('Bot not initialized');
    }

    const aiBoard = this.convertBoardForAI(this.game.board);

    this.bot.printBoard(aiBoard);

    const playerType = this.game.turn === Player.X ? CellState.X : CellState.O;

    const [score, bestMove] = this.bot.makeBestMove(aiBoard, playerType);

    console.log(`Best move: ${bestMove}, Score: ${score}`);

    this.lastBestMove = bestMove;

    return bestMove;
  }
}
