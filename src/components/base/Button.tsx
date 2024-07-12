export enum Intent {
  Primary = 'primary',
  Danger = 'danger',
  Warning = 'warning',
}

export const IntentColors: Record<Intent, { main: string; hover: string }> = {
  [Intent.Primary]: {
    main: '#007bff',
    hover: '#0056b3',
  },
  [Intent.Danger]: {
    main: '#dc3545',
    hover: '#c82333',
  },
  [Intent.Warning]: {
    main: '#ffc107',
    hover: '#e0a800',
  },
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: Intent;
}

export function Button(props: ButtonProps) {
  const { intent = Intent.Primary, ...rest } = props;

  return (
    <button
      css={{
        padding: '8px 16px',
        border: 'none',
        borderRadius: 4,
        backgroundColor: IntentColors[intent].main,
        color: 'white',
        cursor: 'pointer',
        ':hover': {
          backgroundColor: IntentColors[intent].hover,
        },

        ':disabled': {
          backgroundColor: '#ccc',
          color: '#666',
          cursor: 'not-allowed',
        },
      }}
      {...rest}
    />
  );
}
