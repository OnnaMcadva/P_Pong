import { WebSocketServer, WebSocket } from 'ws';

type User = {
  id: string;
  name: string;
  socket: WebSocket;
  blocked: Set<string>;
};

const wss = new WebSocketServer({ port: 3001 });
const users: Map<string, User> = new Map();

function broadcastToAllExcept(senderId: string, message: any) {
  const msg = JSON.stringify(message);
  for (const user of users.values()) {
    if (user.id !== senderId && !user.blocked.has(senderId)) {
      user.socket.send(msg);
    }
  }
}

function sendToUser(userId: string, message: any) {
  const user = users.get(userId);
  if (user) {
    user.socket.send(JSON.stringify(message));
  }
}

function broadcastUserList() {
  const list = Array.from(users.keys());
  const payload = JSON.stringify({ type: 'userlist', users: list });
  for (const user of users.values()) {
    user.socket.send(payload);
  }
}

wss.on('connection', (ws) => {
  let currentUser: User | null = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'register': {
          const id = msg.id;
          const name = msg.name || `User ${id}`;
          currentUser = { id, name, socket: ws, blocked: new Set() };
          users.set(id, currentUser);
          console.log(`${name} (${id}) connected`);
          ws.send(JSON.stringify({ type: 'system', content: `Welcome, ${name}!` }));
          broadcastUserList();
          break;
        }

        case 'message': {
          if (!currentUser) return;
          const to = msg.to;
          const content = msg.content;

          if (to === 'all') {
            broadcastToAllExcept(currentUser.id, {
              type: 'message',
              from: currentUser.id,
              content,
            });
          } else if (users.has(to) && !users.get(to)!.blocked.has(currentUser.id)) {
            sendToUser(to, {
              type: 'message',
              from: currentUser.id,
              content,
            });
          }
          break;
        }

        case 'block': {
          if (currentUser) currentUser.blocked.add(msg.userId);
          break;
        }

        case 'unblock': {
          if (currentUser) currentUser.blocked.delete(msg.userId);
          break;
        }

        case 'invite': {
          if (!currentUser) return;
          const to = msg.to;
          sendToUser(to, {
            type: 'invite',
            from: currentUser.id,
            game: msg.game || 'pong',
          });
          break;
        }
      }
    } catch (err) {
      console.error('Invalid message:', err);
    }
  });

  ws.on('close', () => {
    if (currentUser) {
      users.delete(currentUser.id);
      console.log(`${currentUser.name} disconnected`);
      broadcastUserList();
    }
  });
});

// npx ts-node server.ts