import { RemoteGame } from '../../components/game/remote';
import style from './style.module.css';

import { v4 as uuid } from 'uuid';
import Peer from 'peerjs';
import { ConnectionHandler } from '../../utils/connection-handler';
import { useEffect, useState } from 'react';

export const RemoteJoin = ({ id: opponentId }: { id: string }) => {
  const [connectionHandler, setConnectionHandler] = useState<ConnectionHandler | null>(
    null,
  );

  useEffect(() => {
    const newId = uuid();
    const newPeer = new Peer(newId);
    newPeer.on('open', () => {
      const newConnection = newPeer.connect(opponentId);
      const newConnectionHandler = new ConnectionHandler(newConnection);
      newConnection.on('open', () => setConnectionHandler(newConnectionHandler));
    });
  }, []);

  return (
    <div className={style.page}>
      {connectionHandler ? (
        <RemoteGame host={false} connectionHandler={connectionHandler} />
      ) : (
        <div>Connecting...</div>
      )}
    </div>
  );
};
