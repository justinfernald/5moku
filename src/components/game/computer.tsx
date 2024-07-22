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
import { sleep } from '../../utils';
import { ProgressBar } from '../base/ProgressBar';

export const ComputerGame = observer(({ boardSize = 15 }: { boardSize: number }) => {
  useEffect(() => {
    Modal.setAppElement('#app');
  }, []);

  const [game] = useState(() => new Gomoku({ width: boardSize, height: boardSize }));
  const [botPlayer] = useState(() => (Math.random() > 0.5 ? Player.X : Player.O));
  const player = botPlayer === Player.X ? Player.O : Player.X;
  const [botModel] = useState(() => new BotModel(game, botPlayer));

  useEffect(() => {
    const destroy = reaction(
      () => toJS(game.board),
      async () => {
        await sleep(0);
        if (game.turn === botPlayer) {
          botModel.triggerPlayerMove();
        }
      },
      { fireImmediately: true },
    );

    return destroy;
  }, [botModel, game]);

  let isGameOver = game.isGameOver;

  return (
    <div css={[absolute(20, 20, 20, 20)]} className={style.root}>
      <div css={{ width: 'min(500px, calc(95vmin - 10px))' }}>
        <ProgressBar
          progress={botModel.progress?.completed ?? 0}
          total={botModel.progress?.total ?? 0}
        />
      </div>
      <Spacing />
      <Grid
        game={game}
        onCellClick={(location) => {
          if (game.turn === player) game.placeCell(location.row, location.col);
        }}
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
