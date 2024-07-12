import './App.css';

import { Header } from './components/header';
import { Home } from './routes/home';
import { RemoteJoin } from './routes/remote-join';
import { absolute } from './styles';

export const App = () => {
  const postUrl = window.location.href.split(window.location.origin)[1];
  const id = postUrl.split('?g=')[1];

  return (
    <div
      css={[absolute(0, 0, 0, 0), { display: 'flex', flexDirection: 'column' }]}
      id="app"
    >
      <Header />
      {id ? <RemoteJoin id={id} /> : <Home />}
    </div>
  );
};
