const fastify = require('fastify')({ logger: true });
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

const db = new sqlite3.Database('./pong.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к базе:', err.message);
  } else {
    console.log('Подключено к базе данных SQLite.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player TEXT NOT NULL,
    player_score INTEGER NOT NULL,
    computer_score INTEGER NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Ошибка создания таблицы:', err.message);
  }
});

fastify.get('/api', async (request, reply) => {
  return { message: 'Добро пожаловать в Pong API!' };
});

fastify.post('/api/score', async (request, reply) => {
  const { player, player_score, computer_score } = request.body || {};
  if (!player || player_score === undefined || computer_score === undefined) {
    console.log('Ошибка: player, player_score или computer_score не указаны', request.body);
    return reply.status(400).send({ error: 'Укажи player, player_score и computer_score' });
  }

  console.log('Сохранение результата:', { player, player_score, computer_score });

  await new Promise((resolve, reject) => {
    db.run(`INSERT INTO scores (player, player_score, computer_score) VALUES (?, ?, ?)`, [player, player_score, computer_score], (err) => {
      if (err) {
        console.error('Ошибка при сохранении:', err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });

  reply.send({ message: 'Результат сохранён!' });
});

fastify.get('/api/scores', async (request, reply) => {
  const rows = await new Promise((resolve, reject) => {
    db.all(`SELECT * FROM scores`, [], (err, rows) => {
      if (err) {
        console.error('Ошибка при загрузке:', err.message);
        reject(err);
      } else {
        console.log('Загружены результаты:', rows);
        resolve(rows);
      }
    });
  });

  reply.send(rows);
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Сервер запущен на http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
