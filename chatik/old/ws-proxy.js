// ws-proxy.js
const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: 3001 });
const TCP_PORT = 4242;

wss.on('connection', (ws) => {
  const tcp = net.createConnection({ port: TCP_PORT, host: '127.0.0.1' });

  tcp.on('data', (data) => {
    ws.send(data.toString());
  });

  ws.on('message', (message) => {
    tcp.write(message + '\n');
  });

  ws.on('close', () => tcp.end());
  ws.on('error', () => tcp.end());
  tcp.on('error', () => ws.close());
});
