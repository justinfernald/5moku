import { Gomoku, Player } from '../../models/game';
import { Grid } from './grid';
import style from './style.module.css';
import Modal from 'react-modal';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { MovesList } from './moves-list';
import { Spacing } from '../base/Spacing';
import { absolute, flex1 } from '../../styles';
import { BotModel } from '../../models/BotModel';
import { reaction, toJS } from 'mobx';

export const LocalGame = observer(({ boardSize = 15 }: { boardSize: number }) => {
  useEffect(() => {
    Modal.setAppElement('#app');
  }, []);

  const [game] = useState(() => new Gomoku({ width: boardSize, height: boardSize }));
  const [botModel] = useState(() => new BotModel(game));

  console.log('ahhh');

  useEffect(() => {
    const destroy = reaction(
      () => toJS(game.board),
      () => {
        console.log('board changed');
        setTimeout(() => {
          if (game.turn === Player.O) {
            setTimeout(() => {
              console.time('bot move');
              botModel.onPlayerMove();
              console.timeEnd('bot move');
            }, 100);
          }
        }, 100);
      },
    );

    return destroy;
  }, [botModel, game]);

  let isGameOver = game.isGameOver;

  return (
    <div css={[absolute(20, 20, 20, 20)]} className={style.root}>
      <button onClick={botModel.evalBoard}>Eval</button>
      <Grid
        game={game}
        botModel={botModel}
        onCellClick={(location) => game.placeCell(location.row, location.col)}
      />
      <Spacing />
      <MovesList css={flex1} game={game} remote={false} onTakeBack={game.undoLastMove} />
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
