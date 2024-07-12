import {
  Gomoku,
  PeerDataTransfer,
  PeerDataTransferType,
  Player,
  Status,
} from '../../models/game';
import { Grid } from './grid';
import style from './style.module.css';
import Modal from 'react-modal';
import { ConnectionHandler } from '../../utils/connection-handler';
import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Spacing } from '../base/Spacing';
import { MovesList } from './moves-list';
import { flex1 } from '../../styles';
import { Button, Intent } from '../base/Button';
import { FlexColumn, FlexRow } from '../base/Flex';

export const RemoteGame = observer(
  ({
    host,
    boardSize = 15,
    connectionHandler,
  }: {
    host: boolean;
    boardSize?: number;
    connectionHandler: ConnectionHandler;
  }) => {
    useEffect(() => {
      Modal.setAppElement('#app');
    }, []);

    const [game, setGame] = useState<Gomoku | null>(null);
    const [player, setPlayer] = useState<Player | null>(null);

    const [takeBackRequestModalOpen, setTakeBackRequestModalOpen] = useState(false);

    useEffect(() => {
      if (host) {
        const newGame = new Gomoku({ width: boardSize, height: boardSize });
        setGame(newGame);
        const newPlayer = [Player.X, Player.O][Math.floor(Math.random() * 2)];
        setPlayer(newPlayer);

        const newGameData: PeerDataTransfer = {
          type: PeerDataTransferType.SETUP,
          payload: {
            game: newGame.toDTO(),
            player: newPlayer === Player.X ? Player.O : Player.X,
          },
        };

        const destroy = connectionHandler.addListener((data, didHandle) => {
          if (
            data.type === PeerDataTransferType.STATUS &&
            data.payload === Status.READY
          ) {
            connectionHandler.connection.send(newGameData);
            didHandle();
          }
        });

        return destroy;
      } else {
        connectionHandler.connection.send({
          type: PeerDataTransferType.STATUS,
          payload: Status.READY,
        });

        const destroy = connectionHandler.addListener((data, didHandle) => {
          if (data.type === PeerDataTransferType.SETUP) {
            setGame(Gomoku.fromDTO(data.payload.game));
            setPlayer(data.payload.player);
            didHandle();
          }
        });

        return destroy;
      }
    }, [connectionHandler]);

    useEffect(() => {
      if (!game) return;
      const destroy = connectionHandler.addListener((data, didHandle) => {
        if (data.type === PeerDataTransferType.MOVE) {
          game.placeCell(data.payload.row, data.payload.col);
          didHandle();
        }

        if (data.type === PeerDataTransferType.RESET) {
          game.reset();
          setPlayer(data.payload);
          didHandle();
        }
      });

      return destroy;
    }, [game]);

    useEffect(() => {
      if (!game) return;
      const destroy = connectionHandler.addListener((data, didHandle) => {
        if (data.type === PeerDataTransferType.REQUEST_TAKE_BACK) {
          setTakeBackRequestModalOpen(true);
          didHandle();
        }
      });

      return destroy;
    }, [game]);

    const takeBackRequestResponse = useCallback(
      (response: boolean) => {
        if (!game) return;

        const responsePayload: PeerDataTransfer = {
          type: PeerDataTransferType.TAKE_BACK_REQUEST_RESPONSE,
          payload: {
            accept: response,
          },
        };

        connectionHandler.connection.send(responsePayload);

        setTakeBackRequestModalOpen(false);

        if (response) {
          game.undoLastMove();
        }
      },
      [game, connectionHandler],
    );

    if (!game) return <div>Loading...</div>;

    return (
      <div className={style.root}>
        <div>{game.getTurn() === player ? 'Your turn' : "Opponent's turn"}</div>
        <Grid
          game={game}
          onCellClick={(location) => {
            if (player === game.getTurn() && game.placeCell(location.row, location.col)) {
              const placementData: PeerDataTransfer = {
                type: PeerDataTransferType.MOVE,
                payload: location,
              };
              connectionHandler.connection.send(placementData);
            }
          }}
        />
        <Spacing />
        <MovesList
          css={flex1}
          game={game}
          remote={true}
          onTakeBack={async () => {
            const requestTakeBackData: PeerDataTransfer = {
              type: PeerDataTransferType.REQUEST_TAKE_BACK,
              payload: {
                moves: 1,
              },
            };

            connectionHandler.connection.send(requestTakeBackData);

            const requestResponse = await new Promise<boolean>((resolve) => {
              const destroy = connectionHandler.addListener((data, didHandle) => {
                if (data.type === PeerDataTransferType.TAKE_BACK_REQUEST_RESPONSE) {
                  resolve(data.payload.accept);
                  didHandle();
                  destroy();
                }
              });
            });

            if (requestResponse) {
              game.undoLastMove();
            }
          }}
        />
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
            },
          }}
          onRequestClose={() => (game.isGameOver = false)}
          isOpen={game.isGameOver}
        >
          {game.winner ? (
            game.winner === player ? (
              <div>Way to go {game.winner} player! You won!</div>
            ) : (
              <div>{game.winner} won! You lost!</div>
            )
          ) : (
            <div>You are both losers! It was a draw.</div>
          )}
          <div
            className={style.resetButton}
            onClick={() => {
              const newPlayer = [Player.X, Player.O][Math.floor(Math.random() * 2)];
              setPlayer(newPlayer);
              const newGameData: PeerDataTransfer = {
                type: PeerDataTransferType.RESET,
                payload: newPlayer === Player.X ? Player.O : Player.X,
              };
              connectionHandler.connection.send(newGameData);
              game.reset();
            }}
          >
            Play again
          </div>
        </Modal>
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
            },
          }}
          isOpen={takeBackRequestModalOpen}
          onRequestClose={() => {
            takeBackRequestResponse(false);
          }}
        >
          <FlexColumn alignItems="center">
            <p>Opponent requested a take back, do you accept?</p>
            <Spacing />
            <FlexRow gap={5}>
              <Button onClick={() => takeBackRequestResponse(true)}>Yes</Button>
              <Button
                intent={Intent.Danger}
                onClick={() => takeBackRequestResponse(false)}
              >
                No
              </Button>
            </FlexRow>
          </FlexColumn>
        </Modal>
      </div>
    );
  },
);
