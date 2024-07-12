import { Gomoku } from '../../models/game';
import { Grid } from './grid';
import style from './style.module.css';
import Modal from 'react-modal';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

export const LocalGame = observer(({ boardSize = 15 }: { boardSize: number }) => {
  useEffect(() => {
    Modal.setAppElement('#app');
  }, []);

  const [game] = useState(() => new Gomoku({ width: boardSize, height: boardSize }));

  let isGameOver = game.isGameOver;

  return (
    <div className={style.root}>
      <Grid
        game={game}
        onCellClick={(location) => game.placeCell(location.row, location.col)}
      />
      <Modal
        ariaHideApp={false}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
        onRequestClose={() => (isGameOver = false)}
        isOpen={isGameOver}
      >
        {game.winner ? (
          <div>Way to go {game.winner} player! You won!</div>
        ) : (
          <div>You are both losers! It was a draw.</div>
        )}
        <div className={style.resetButton} onClick={game.reset}>
          Play again
        </div>
      </Modal>
    </div>
  );
});
