// aiWorker.ts
import { AI } from '../models/AiEngine';

const ai = new AI();

self.onmessage = (event) => {
  const { board, playerType, maxDepth } = event.data;

  const [score, bestMove] = ai.minimax(
    board,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    playerType,
    maxDepth,
    (status) => {
      if (status.depth === 0) {
        self.postMessage({
          type: 'progress',
          completed: status.completed,
          total: status.total,
          turn: status.turn,
        });
      }
    },
  );

  self.postMessage({
    type: 'result',
    score,
    bestMove,
  });
};
