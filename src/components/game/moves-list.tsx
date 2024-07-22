import { observer } from 'mobx-react-lite';
import { Cell, CellState, Gomoku } from '../../models/game';
import { FlexColumn, FlexRow } from '../base/Flex';
import { borderRadius, dropShadow, flex1, padding } from '../../styles';
import { Button } from '../base/Button';
import { Spacing } from '../base/Spacing';
import { useEffect, useRef } from 'react';

export interface MovesListProps {
  game: Gomoku;
  remote: boolean;
  onTakeBack: () => void;
  className?: string;
}

export const MovesList = observer((props: MovesListProps) => {
  const { className, game, remote, onTakeBack } = props;

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
          <Move
            key={index}
            cell={move}
            turn={index + 1}
            autoScrollTo={index + 1 === game.moves.length}
          />
        ))}
      </FlexColumn>
      <Spacing mainAxis={5} />
      <Button onClick={onTakeBack} disabled={game.moves.length === 0}>
        {remote ? 'Request Take-back' : 'Undo'}
      </Button>
      <Spacing mainAxis={5} />
    </FlexColumn>
  );
});

export interface MoveProps {
  cell: Cell;
  turn: number;
  autoScrollTo?: boolean;
}

export const Move = observer((props: MoveProps) => {
  const { cell, turn, autoScrollTo } = props;

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScrollTo && divRef.current) {
      divRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScrollTo]);

  const wasX = cell.value === CellState.X;

  return (
    <div ref={divRef}>
      <FlexRow>
        <div css={{ width: 35 }}>{turn}</div>
        <div css={{ width: 37 }}>{wasX ? 'X' : 'O'}</div>
        <div css={{ width: 24 }}>{cell.col + 1}</div>

        <div css={{ width: 19 }}>{cell.row + 1}</div>
      </FlexRow>
    </div>
  );
});
