const net = require('net');
const process = require('process');

let count = 1;
const clients = {};

if (process.argv.length !== 3) {
    process.stderr.write("Wrong number of arguments\n");
    process.exit(1);
}

const server = net.createServer();
const port = parseInt(process.argv[2]);
if (isNaN(port) || port <= 0 || port > 65535) {
    process.stderr.write("Invalid port\n");
    process.exit(1);
}

server.on('error', (err) => {
    process.stderr.write("Fatal error\n");
    process.exit(1);
});

server.on('connection', (socket) => {
    const clientId = count++;
    clients[clientId] = { socket, id: clientId };

    const arriveMsg = `⚡ player ${clientId} just arrived ⚡\n`;
    notifyOthers(socket, arriveMsg);

    socket.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (let line of lines) {
            if (line) {
                const msg = `player ${clientId}: ${line}\n`;
                notifyOthers(socket, msg);
            }
        }
    });

    socket.on('end', () => {
        const leaveMsg = `⚡ player ${clientId} just left ⚡\n`;
        notifyOthers(socket, leaveMsg);
        delete clients[clientId];
        socket.destroy();
    });

    socket.on('error', (err) => {
        socket.destroy();
    });
});

function notifyOthers(sender, message) {
    for (let key in clients) {
        const client = clients[key];
        if (client.socket !== sender && client.socket.writable) {
            client.socket.write(message);
        }
    }
}

server.listen(port, '127.0.0.1', () => {
    console.log(`Server started on 127.0.0.1:${port}`);
});
