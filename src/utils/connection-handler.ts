import { DataConnection } from 'peerjs';
import { isPeerDataTransfer, PeerDataTransfer } from '../models/game';

export class ConnectionHandler {
  listeners: ((data: PeerDataTransfer, didHandle: () => void) => void)[] = [];
  unhandledData: PeerDataTransfer[] = [];
  handledData: PeerDataTransfer[] = [];

  constructor(public connection: DataConnection) {
    connection.on('data', this.onData);
  }

  addListener(
    listener: (data: PeerDataTransfer, didHandle: () => void) => void,
  ): () => void {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  onData = (data: unknown) => {
    if (!isPeerDataTransfer(data)) {
      throw new Error('Invalid peer data transfer');
    }

    let isHandled = false;

    this.listeners.forEach((listener) => listener(data, () => (isHandled = true)));

    if (isHandled) {
      this.handledData.push(data);
    } else {
      this.unhandledData.push(data);
    }

    this.runUnhandledFix();
  };

  resendUnhandledData() {
    const newUnhandledData = [];
    for (const data of this.unhandledData) {
      let isHandled = false;

      this.listeners.forEach((listener) => listener(data, () => (isHandled = true)));

      if (isHandled) {
        this.handledData.push(data);
      } else {
        newUnhandledData.push(data);
      }
    }
    this.unhandledData = newUnhandledData;
  }

  unhandledInterval: number | undefined;

  runUnhandledFix() {
    if (this.unhandledInterval) {
      return;
    }
    this.unhandledInterval = setInterval(() => {
      if (this.unhandledData.length > 0) {
        this.resendUnhandledData();
      } else {
        clearInterval(this.unhandledInterval);
        this.unhandledInterval = undefined;
      }
    }, 500);
  }
}
