import type { FastifyInstance } from "fastify";
import type { WebSocket } from "@fastify/websocket";
import type { FastifyRequest } from "fastify";
import type { ChatMessage, User, GUID } from "../defines/types"; // ✅

const users: Map<string, User> = new Map(); // ✅

function broadcastUserList() {
  const payload = JSON.stringify({
    type: 'userlist',
    users: Array.from(users.values()).map((u) => u.id),
  });
  for (const user of users.values()) {
    user.socket?.send(payload); // ✅
  }
}

function sendToUser(user: User, message: any) {
  user.socket?.send(JSON.stringify(message)); // ✅
}

export async function wsChatPlugin(server: FastifyInstance) {
  server.get("/ws-chat", { websocket: true }, (socket: WebSocket, _req: FastifyRequest) => {
    let currentUser: User | null = null;

    socket.on("message", (data: string) => {
      try {
        const msg: ChatMessage = JSON.parse(data.toString());

        switch (msg.type) {
          case 'register': {
            const id = msg.user.id;
            const name = msg.user.nick || `User ${id}`;
            currentUser = { ...msg.user, socket, nick: name, blocked: new Set<GUID>() }; // ✅
            users.set(id, currentUser);
            socket.send(JSON.stringify({ type: 'system', content: `Welcome, ${name}` }));
            broadcastUserList();
            break;
          }

          case 'message': {
            if (!currentUser) return;
            const senderId = currentUser.id;
            const recipientUser = users.get(msg.to.id); // ✅

            if (!recipientUser) return;
            if (recipientUser.blocked?.has(senderId)) return;

            sendToUser(recipientUser, {
              type: 'message',
              from: currentUser,
              content: msg.content,
            });
            break;
          }

          // ✅ vmesto otpravky vsem
          case 'broadcast': {
            if (!currentUser) return;
            for (const user of users.values()) {
              if (user.id !== currentUser.id && !user.blocked?.has(currentUser.id)) {
                user.socket?.send(JSON.stringify({
                  type: 'message',
                  from: currentUser,
                  content: msg.content,
                }));
              }
            }
            break;
          }

          case 'block': {
            if (!currentUser) return;
            currentUser.blocked = currentUser.blocked || new Set<GUID>();
            currentUser.blocked.add(msg.user.id); // ✅
            break;
          }

          case 'unblock': {
            if (!currentUser?.blocked) return;
            currentUser.blocked.delete(msg.user.id);
            break;
          }

          case 'invite': {
            if (!currentUser) return;
            const targetUser = users.get(msg.to.id);
            if (!targetUser) return;
            sendToUser(targetUser, {
              type: 'invite',
              from: currentUser,
              game: msg.game,
            });
            break;
          }

          case 'notify': {
            for (const user of users.values()) {
              user.socket?.send(JSON.stringify({ type: 'system', content: msg.content }));
            }
            break;
          }

          case 'profile': {
            console.log(`User ${currentUser?.id} requested profile of ${msg.user.id}`);
            break;
          }

          default:
            console.warn("Unknown message type:", msg);
        }
      } catch (err) {
        socket.send(JSON.stringify({ type: 'system', content: 'Invalid message format.' }));
      }
    });

    socket.on("close", () => {
      if (currentUser) {
        users.delete(currentUser.id);
        broadcastUserList();
      }
    });
  });
}

// npx webpack --env mode=development
// npm start
