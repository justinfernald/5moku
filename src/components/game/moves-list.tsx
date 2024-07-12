import { observer } from 'mobx-react-lite';
import { Cell, CellState, Gomoku } from '../../models/game';
import { FlexColumn, FlexRow } from '../base/Flex';
import { borderRadius, dropShadow, flex1, padding } from '../../styles';
import { Button } from '../base/Button';
import { Spacing } from '../base/Spacing';

export interface MovesListProps {
  game: Gomoku;
  remote: boolean;
  onTakeBack: () => void;
  className?: string;
}

export const MovesList = observer((props: MovesListProps) => {
  const { className, game, remote, onTakeBack: onTakeback } = props;

  // if (game.moves.length === 0) return null;

  return (
    <FlexColumn
      className={className}
      alignItems="center"
      css={[dropShadow(2), borderRadius('md'), { width: 155, overflow: 'auto' }]}
    >
      <FlexColumn
        css={[flex1, padding('md'), { overflow: 'auto', scrollbarWidth: 'none' }]}
      >
        {game.moves.map((move, index) => (
          <Move key={index} cell={move} turn={index + 1} />
        ))}
      </FlexColumn>
      <Spacing mainAxis={5} />
      <Button onClick={onTakeback} disabled={game.moves.length === 0}>
        {remote ? 'Request Take-back' : 'Undo'}
      </Button>
      <Spacing mainAxis={5} />
    </FlexColumn>
  );
});

export interface MoveProps {
  cell: Cell;
  turn: number;
}

export const Move = observer((props: MoveProps) => {
  const { cell, turn } = props;

  const wasX = cell.value === CellState.X;

  return (
    <FlexRow>
      <div css={{ width: 35 }}>{turn}</div>
      <div css={{ width: 37 }}>{wasX ? 'X' : 'O'}</div>
      <div css={{ width: 24 }}>{cell.col + 1}</div>

      <div css={{ width: 19 }}>{cell.row + 1}</div>
    </FlexRow>
  );
});
