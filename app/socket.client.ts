import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

export const socket: Socket = io({
  autoConnect: false,
});
