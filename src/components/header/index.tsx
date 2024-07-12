import { useEffect, useState } from 'react';
import style from './style.module.css';

import Modal from 'react-modal';

export const Header = () => {
  useEffect(() => {
    Modal.setAppElement('#app');
  }, []);

  const [showModel, setShowModel] = useState(false);

  return (
    <header className={style.header}>
      <h1>5moku</h1>
      <div onClick={() => setShowModel((showModel) => !showModel)}>?</div>

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
            maxWidth: 500,
          },
        }}
        isOpen={showModel}
        onRequestClose={() => setShowModel(false)}
      >
        <div>
          <p>
            This is a Gomoku game created by Justin in a day-ish for fun. This was a test
            using peer to peer networking which allows for this game to run with live
            multiplier without a external server.
          </p>

          <p>
            Gomoku is an abstract strategy board game and is also called Five in a Row. It
            is traditionally played on a board with size 19x19. However, because once
            placed, pieces are not moved or removed from the board, Gomoku may also be
            played as a paper and pencil game. This game is known in several countries
            under different names. The name Gomoku comes from the Japanese language, in
            which it is referred to as gomokunarabe. Go means five, moku is a counter word
            for pieces and narabe means line-up.
          </p>

          <a href="https://github.com/justinfernald/5moku" target="blank">
            View Source Code here
          </a>
        </div>
      </Modal>
    </header>
  );
};
