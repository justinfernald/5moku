import { observer } from 'mobx-react-lite';

export interface ProgressBarProps {
  progress: number;
  total: number;
}

export const ProgressBar = observer((props: ProgressBarProps) => {
  const { progress, total } = props;

  return (
    <div
      css={{
        borderRadius: 10,
        width: '100%',
        backgroundColor: '#bcbcdb',
        overflow: 'hidden',
      }}
    >
      <div
        css={{
          width: `${(progress / total) * 100}%`,
          height: 20,
          backgroundColor: '#7474c7',
        }}
      ></div>
    </div>
  );
});
