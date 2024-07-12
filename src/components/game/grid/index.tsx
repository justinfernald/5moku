import { c } from '../../../utils';
import { CellState, Gomoku, Location } from '../../../models/game';
import { observer } from 'mobx-react-lite';
import style from './style.module.css';

export const Grid = observer(
  ({
    game,
    onCellClick,
  }: {
    game: Gomoku;
    onCellClick: (location: Location) => void;
  }) => (
    <div className={style.root}>
      {game.board.map((row, y) => (
        <div key={y} className={style.row}>
          {row.map((cell, x) => (
            <Cell
              key={x}
              game={game}
              location={{ col: x, row: y }}
              cellState={cell}
              onClick={onCellClick}
            />
          ))}
        </div>
      ))}
    </div>
  ),
);

export const Cell = observer(
  ({
    game,
    location,
    cellState,
    onClick,
  }: {
    game: Gomoku;
    location: Location;
    cellState: CellState;
    onClick?: (location: Location) => void;
  }) => (
    <div
      className={c(style.cell, game.isWinningCell(location) ? style.winning : undefined)}
      onClick={() => onClick?.(location)}
    >
      {cellState === CellState.EMPTY ? null : cellState === CellState.X ? (
        <div className={style.x} />
      ) : (
        <div className={style.o} />
      )}
    </div>
  ),
);
