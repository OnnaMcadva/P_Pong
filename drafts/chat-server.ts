// src/chat-server.ts
import { WebSocketServer } from 'ws';
import type { WebSocket, RawData } from 'ws';

// export type ChatMessage =
//   | { type: 'register'; id: string; name?: string }
//   | { type: 'message'; to: string; from: string; content: string }
//   | { type: 'block'; userId: string }
//   | { type: 'unblock'; userId: string }
//   | { type: 'invite'; to: string; game?: string }
//   | { type: 'notify'; content: string }
//   | { type: 'profile'; userId: string };

export type User = {
  id: string;
  name: string;
  socket: WebSocket;
  blocked: Set<string>;
};

const wss = new WebSocketServer({ port: 3001 });
const users: Map<string, User> = new Map();

function broadcastUserList() {
  const payload = JSON.stringify({
    type: 'userlist',
    users: Array.from(users.values()).map((u) => u.id),
  });
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

wss.on('connection', (ws: WebSocket) => {
  let currentUser: User | null = null;

  ws.on('message', (data: RawData) => {
    try {
      const msg: ChatMessage = JSON.parse(data.toString());

      switch (msg.type) {
        case 'register': {
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

          const recipient = msg.to;
          const senderId = currentUser.id;

          if (recipient === 'all') {
            for (const user of users.values()) {
              if (user.id !== senderId && !user.blocked.has(senderId)) {
                user.socket.send(
                  JSON.stringify({
                    type: 'message',
                    from: senderId,
                    content: msg.content,
                  })
                );
              }
            }
          } else {
            sendToUser(recipient, {
              type: 'message',
              from: senderId,
              content: msg.content,
            });
          }
          break;
        }

        case 'block': {
          if (!currentUser) return;
          currentUser.blocked.add(msg.userId);
          break;
        }

        case 'unblock': {
          if (!currentUser) return;
          currentUser.blocked.delete(msg.userId);
          break;
        }

        case 'invite': {
          if (!currentUser) return;
          sendToUser(msg.to, {
            type: 'invite',
            from: currentUser.id,
            game: msg.game || 'pong',
          });
          break;
        }

        case 'notify': {
          if (!currentUser) return;
          for (const user of users.values()) {
            user.socket.send(JSON.stringify({ type: 'system', content: msg.content }));
          }
          break;
        }

        case 'profile': {
          if (!currentUser) return;
          console.log(`User ${currentUser.id} запрашивает профиль ${msg.userId}`);
          break;
        }

        default:
          console.warn('Unknown message type:', msg);
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'system', content: 'Invalid message format.' }));
    }
  });

  ws.on('close', () => {
    if (currentUser) {
      users.delete(currentUser.id);
      broadcastUserList();
    }
  });
});

// npx ts-node src/chat-server.ts
