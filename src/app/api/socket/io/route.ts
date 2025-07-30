import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  // Socket.IO connections are handled by the client-side Socket.IO client
  // This endpoint is just for health checks
  return new Response('Socket.IO endpoint is available', { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    }
  });
}

export async function POST(req: NextRequest) {
  // Socket.IO connections are handled by the client-side Socket.IO client
  // This endpoint is just for health checks
  return new Response('Socket.IO endpoint is available', { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    }
  });
}
