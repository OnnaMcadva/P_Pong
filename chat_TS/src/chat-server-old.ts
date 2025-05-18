import net, { Socket } from 'net';
import WebSocket, { WebSocketServer } from 'ws';

type Client = {
  socket: Socket;
  ws: WebSocket | null;
  id: number;
};

let count = 1;
const clients: Record<number, Client> = {};

const TCP_PORT = 4242;
const WS_PORT = 3001;

// ===== TCP SERVER =====
const tcpServer = net.createServer((socket) => {
  const clientId = count++;
  clients[clientId] = { socket, id: clientId, ws: null };

  const arriveMsg = `⚡ just arrived ⚡\n`;
  notifyOthers(socket, clientId, arriveMsg, true);

  socket.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        notifyOthers(socket, clientId, `${line}\n`);
      }
    }
  });

  socket.on('end', () => {
    const leaveMsg = `⚡ just left ⚡\n`;
    notifyOthers(socket, clientId, leaveMsg, true);
    delete clients[clientId];
    socket.destroy();
  });

  socket.on('error', () => socket.destroy());
});

/**
 * Экранирует специальные HTML-символы для предотвращения XSS-атак.
 * 
 * @param text - входная строка от пользователя
 * @returns строка с экранированными HTML-символами
 */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return char;
    }
  });
}

/**
 * Отправляет сообщение всем подключённым клиентам (TCP и WebSocket),
 * кроме отправителя (если excludeSender = true).
 * 
 * @param senderSocket - сокет клиента, отправившего сообщение
 * @param senderId - ID клиента
 * @param message - сообщение, которое нужно разослать
 * @param excludeSender - исключить ли отправителя из рассылки (по умолчанию false)
 */
function notifyOthers(senderSocket: Socket, senderId: number, message: string, excludeSender = false) {
  for (const key in clients) {
    const client = clients[key];
    if (!client.socket.writable) continue;

    const safeMessage = escapeHtml(message);

    if (client.socket === senderSocket) {
      if (!excludeSender) {
        client.socket.write(`⚙️ I: ${safeMessage}`);
        if (client.ws) client.ws.send(`⚙️ I: ${safeMessage}`);
      }
    } else {
      const formatted = `player ${senderId}: ${safeMessage}`;
      client.socket.write(formatted);
      if (client.ws) client.ws.send(formatted);
    }
  }
}

tcpServer.listen(TCP_PORT, '127.0.0.1', () => {
  console.log(`TCP Server started on 127.0.0.1:${TCP_PORT}`);
});

// ===== WS SERVER =====
const wss = new WebSocketServer({ port: WS_PORT }, () => {
  console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);
});

wss.on('connection', (ws: WebSocket) => {
  const tcp = net.createConnection({ port: TCP_PORT, host: '127.0.0.1' });

  let myClientId: number | null = null;

  tcp.on('data', (data) => {
    const text = data.toString();
    if (text.startsWith('⚡ player') && text.includes('arrived')) {
      const match = text.match(/player (\d+) just arrived/);
      if (match) myClientId = parseInt(match[1]);
      if (myClientId && clients[myClientId]) {
        clients[myClientId].ws = ws;
      }
    }

    ws.send(text);
  });

  ws.on('message', (msg) => {
    tcp.write(msg.toString() + '\n');
  });

  ws.on('close', () => tcp.end());
  ws.on('error', () => tcp.end());
  tcp.on('error', () => ws.close());
});

// npm install ws @types/ws typescript ts-node
// npx ts-node src/chat-server.ts

