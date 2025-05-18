// src/chat-server.ts
import { WebSocketServer, WebSocket } from 'ws';

export type ChatMessage =
  | { type: 'register'; id: string; name?: string }
  | { type: 'message'; to: string; content: string }
  | { type: 'block'; userId: string }
  | { type: 'unblock'; userId: string }
  | { type: 'invite'; to: string; game?: string }
  | { type: 'notify'; content: string }
  | { type: 'profile'; userId: string };

export type User = {
  id: string;
  name: string;
  socket: WebSocket;
  blocked: Set<string>;
};

const wss = new WebSocketServer({ port: 3001 });
const users: Map<string, User> = new Map();

function broadcastUserList() {
  const payload = JSON.stringify({ type: 'userlist', users: Array.from(users.values()).map(u => ({ id: u.id, name: u.name })) });
  for (const user of users.values()) {
    user.socket.send(payload);
  }
}

function sendToUser(userId: string, message: any) {
  const user = users.get(userId);
  if (user) {
    user.socket.send(JSON.stringify(message));
  }
}

wss.on('connection', (ws) => {
  let currentUser: User | null = null;

  ws.on('message', (data) => {
    try {
      const msg: ChatMessage = JSON.parse(data.toString());

      switch (msg.type) {
        case 'register': {
          // TODO: Replace this logic with call to backend to get nickname
          const id = msg.id;
          const name = msg.name || `User ${id}`;
          currentUser = { id, name, socket: ws, blocked: new Set() };
          users.set(id, currentUser);
          ws.send(JSON.stringify({ type: 'system', content: `Welcome, ${name}` }));
          broadcastUserList();
          break;
        }
        case 'message': {
          if (!currentUser) return;
          if (msg.to === 'all') {
            for (const user of users.values()) {
              if (user.id !== currentUser.id && !user.blocked.has(currentUser.id)) {
                user.socket.send(JSON.stringify({
                  type: 'message',
                  from: currentUser.id,
                  content: msg.content,
                }));
              }
            }
          } else {
            const recipient = users.get(msg.to);
            if (recipient && !recipient.blocked.has(currentUser.id)) {
              sendToUser(msg.to, { type: 'message', from: currentUser.id, content: msg.content });
            }
          }
          break;
        }
        case 'block': {
          currentUser?.blocked.add(msg.userId);
          break;
        }
        case 'unblock': {
          currentUser?.blocked.delete(msg.userId);
          break;
        }
        case 'invite': {
          if (!currentUser) return;
          sendToUser(msg.to, { type: 'invite', from: currentUser.id, game: msg.game || 'pong' });
          break;
        }
        case 'notify': {
          for (const user of users.values()) {
            user.socket.send(JSON.stringify({ type: 'notify', content: msg.content }));
          }
          break;
        }
        case 'profile': {
          sendToUser(msg.userId, { type: 'profile', from: currentUser?.id || 'system' });
          break;
        }
      }
    } catch (err) {
      console.error('Invalid message received:', err);
    }
  });

  ws.on('close', () => {
    if (currentUser) {
      users.delete(currentUser.id);
      broadcastUserList();
    }
  });
});

