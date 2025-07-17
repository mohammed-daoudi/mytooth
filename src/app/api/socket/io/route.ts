import { NextRequest } from 'next/server';
import { NextApiResponseServerIO } from '@/lib/socket';
import { initSocket } from '@/lib/socket';

export async function GET(req: NextRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    const io = initSocket(res.socket.server);
    res.socket.server.io = io;
  } else {
    console.log('Socket.io server already running');
  }

  return new Response('Socket.io server is running', { status: 200 });
}

export async function POST(req: NextRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    const io = initSocket(res.socket.server);
    res.socket.server.io = io;
  }

  return new Response('Socket.io server is running', { status: 200 });
}
