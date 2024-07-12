// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button(props: ButtonProps) {
  return (
    <button
      css={{
        padding: '8px 16px',
        border: 'none',
        borderRadius: 4,
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        ':hover': {
          backgroundColor: '#0056b3',
        },

        ':disabled': {
          backgroundColor: '#ccc',
          color: '#666',
          cursor: 'not-allowed',
        },
      }}
      {...props}
    />
  );
}
