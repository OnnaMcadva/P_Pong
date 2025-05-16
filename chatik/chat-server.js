const net = require('net');
const WebSocket = require('ws');

let count = 1;
const clients = {}; // { id: { socket, ws }, ... }

const TCP_PORT = 4242; // пока так
const WS_PORT = 3001;

// ===== TCP SERVER =====
const tcpServer = net.createServer((socket) => {
  const clientId = count++;
  clients[clientId] = { socket, id: clientId, ws: null };

  // const arriveMsg = `⚡ player ${clientId} just arrived ⚡\n`;
  const arriveMsg = `⚡ just arrived ⚡\n`;
  notifyOthers(socket, clientId, arriveMsg, true); // true => не отправлять себе

  socket.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (let line of lines) {
      if (line.trim()) {
        notifyOthers(socket, clientId, `${line}\n`);
      }
    }
  });

  socket.on('end', () => {
    // const leaveMsg = `⚡ player ${clientId} just left ⚡\n`;
    const leaveMsg = `⚡ just left ⚡\n`;
    notifyOthers(socket, clientId, leaveMsg, true);
    delete clients[clientId];
    socket.destroy();
  });

  socket.on('error', () => socket.destroy());
});

// маленькая такая защита
function escapeHtml(text) {
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

function notifyOthers(senderSocket, senderId, message, excludeSender = false) {
  for (let key in clients) {
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

    // if (client.socket === senderSocket) {
    //   if (!excludeSender) {
    //     client.socket.write(`⚙️ I: ${message}`);
    //     if (client.ws) client.ws.send(`⚙️ I: ${message}`);
    //   }
    // } else {
    //   const formatted = `player ${senderId}: ${message}`;
    //   client.socket.write(formatted);
    //   if (client.ws) client.ws.send(formatted);
    // }
  }
}

// чтобы на всех айпи работал (куак в ирке) нужно просто выставить все нули
// tcpServer.listen(TCP_PORT, '0.0.0.0', () => {
//   console.log(`TCP Server started on 0.0.0.0:${TCP_PORT}`);
// });

tcpServer.listen(TCP_PORT, '127.0.0.1', () => {
  console.log(`TCP Server started on 127.0.0.1:${TCP_PORT}`);
});

// ===== WEBSOCKET SERVER =====
const wss = new WebSocket.Server({ port: WS_PORT }, () => {
  console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);
});

wss.on('connection', (ws) => {
  const tcp = net.createConnection({ port: TCP_PORT, host: '127.0.0.1' }); // здесь тоже нули если надо
  // const tcp = net.createConnection({ port: TCP_PORT, host: '0.0.0.0' });

  let myClientId = null;

  // Когда TCP-сервер отвечает, перенаправляем в WebSocket
  tcp.on('data', (data) => {
    const text = data.toString();
    if (text.startsWith('⚡ player') && text.includes('arrived')) {
      // Получаем ID клиента, когда он подключается
      const match = text.match(/player (\d+) just arrived/);
      if (match) myClientId = parseInt(match[1]);
      if (myClientId && clients[myClientId]) {
        clients[myClientId].ws = ws; // Привязываем WS к клиенту
      }
    }

    ws.send(text);
  });

  ws.on('message', (msg) => {
    tcp.write(msg + '\n');
  });

  ws.on('close', () => tcp.end());
  ws.on('error', () => tcp.end());
  tcp.on('error', () => ws.close());
});

// node chat-server.js 4242
