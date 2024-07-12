import style from './style.module.css';
import Modal from 'react-modal';

import { v4 as uuid } from 'uuid';
import Peer from 'peerjs';
import { ClipboardCopy } from '../../components/clipboard-copy';
import { PlayMode } from '../../models/game';
import { RemoteGame } from '../../components/game/remote';
import { LocalGame } from '../../components/game/local';
import { ConnectionHandler } from '../../utils/connection-handler';
import { useEffect, useState } from 'react';

export const Home = () => {
  useEffect(() => {
    Modal.setAppElement('#app');
  }, []);

  const [mode, setMode] = useState(PlayMode.UNSET);
  const [boardSize, setBoardSize] = useState(15);
  const [connectionHandler, setConnectionHandler] = useState<ConnectionHandler | null>(
    null,
  );
  const [id, setId] = useState<string | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);

  useEffect(() => {
    if (mode !== PlayMode.REMOTE) return;
    const newId = uuid();
    setId(newId);
    const newPeer = new Peer(newId);

    newPeer.on('connection', (conn) => setConnectionHandler(new ConnectionHandler(conn)));

    setPeer(newPeer);
  }, [mode]);

  return (
    <div className={style.page}>
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
            border: 'none',
            boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
          },
          overlay: {
            background: 'unset',
          },
        }}
        isOpen={mode === PlayMode.UNSET}
      >
        <div>How would you like to play?</div>
        <br />
        <div>
          <label htmlFor="board-size">{'Board Size: '}</label>
          <select
            name="board-size"
            value={boardSize}
            onChange={(e) => setBoardSize(+e.target.value)}
          >
            <option value={10}>10x10</option>
            <option value={15}>15x15</option>
            <option value={19}>19x19</option>
          </select>
        </div>
        <div className={style.buttonWrapper}>
          <div className={style.button} onClick={() => setMode(PlayMode.LOCAL)}>
            Local
          </div>
          <div className={style.button} onClick={() => setMode(PlayMode.REMOTE)}>
            Online
          </div>
        </div>
      </Modal>
      <Modal
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            border: 'none',
            boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
          },
          overlay: {
            background: 'unset',
          },
        }}
        isOpen={mode === PlayMode.REMOTE && !connectionHandler}
      >
        <div>
          Send this link to your friend...
          <br />
          or enemy.
        </div>
        <br />
        <ClipboardCopy copyText={`${window.location.origin}?g=${id}`} />{' '}
      </Modal>
      {mode !== PlayMode.UNSET && mode === PlayMode.LOCAL ? (
        <LocalGame boardSize={boardSize} />
      ) : (
        peer &&
        connectionHandler && (
          <RemoteGame
            host={true}
            boardSize={boardSize}
            connectionHandler={connectionHandler}
          />
        )
      )}
    </div>
  );
};
