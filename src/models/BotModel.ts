import { makeAutoObservable } from 'mobx';
import { CellState, Gomoku, Player } from './game';

import AiWorkerPath from '../workers/aiWorker.ts?worker&url';

export class BotModel {
  private worker: Worker;
  lastBestMove?: number;
  progress: { completed: number; total: number; turn: CellState } | null = null;

  constructor(private game: Gomoku, public aiPlayer = Player.O) {
    makeAutoObservable(this, {}, { autoBind: true });
    this.worker = new Worker(AiWorkerPath, {
      type: 'module',
    });
    this.worker.onmessage = this.handleWorkerMessage;
  }

  handleWorkerMessage = (event: MessageEvent) => {
    const { type, ...data } = event.data;
    if (type === 'progress') {
      this.progress = data;
    } else if (type === 'result') {
      this.lastBestMove = data.bestMove;
      this.makeMove(data.bestMove);
    }
  };

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
    const aiBoard = this.convertBoardForAI(this.game.board);
    const playerType = this.game.turn === Player.X ? CellState.X : CellState.O;

    this.worker.postMessage({
      board: aiBoard,
      playerType,
      maxDepth: 3, // You can adjust this as needed
    });
  }

  makeMove(bestMove: number) {
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

  dispose() {
    this.worker.terminate();
  }
}
