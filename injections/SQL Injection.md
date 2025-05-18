
### 1. **SQL Injection: Параметризованные запросы  (prepared statements)

##### ✅ Используем Fastify, Node.js и нативный драйвер PostgreSQL (pg)

##### ❌ Нельзя использовать ORM (TypeORM, Prisma)

* Обновить все .ts файлы, в которых есть SQL-запросы. Найти строки с db.query(...), db.get(...), db.execute(...), которые содержат вставку переменных внутрь строки ('SELECT ... WHERE name = ' + name) и переписать их на параметризованный синтаксис.
* Если пишем вручную SQL-функции - вставлять переменные напрямую в SQL-функции, даже если они внутри DO $$ BEGIN ... $$.
* Использовать подготовленные запросы В pg.query(sql, params)
* Проверить все string interpolation В SQL (${...} внутри запроса)
* Экранировать все, что пришло от пользователя — в любом виде
* Не допускать сборки  SQL через +, .concat() или шаблонные строки
* Проверять значения фильтров, сортировок, id — валидацией через zod, Joi, или руками
* Не допускать запросов типа WHERE 1=1 из внешнего ввода
* Не допускать ORDER BY ${sort} или LIMIT ${limit} без whitelisting
* Обработать все маршруты, не только публичные, но и админские / CLI

```typescript
// 1)
// Без ORM (нативный SQLite)
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database(':memory:');

// ❌ Опасный запрос (уязвим к SQL-инъекциям)
db.get(`SELECT * FROM users WHERE email = '${email}'`, (err, row) => {});

// ✅ Параметризованный запрос
db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {});

// 2)
// ❌ Опасный запрос
const result = await db.query(
  `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`
);

// ✅ Параметризованный запрос
const result = await db.query(
  `SELECT * FROM users WHERE email = $1 AND password = $2`,
  [email, password]
);

// $1, $2 — плейсхолдеры. Массив [email, password] передаётся отдельно и безопасно экранируется драйвером pg.
```

![Screenshot from 2025-05-16 13-55-52](https://github.com/user-attachments/assets/6318b256-6525-438c-8359-b62c8dfe7d3e)



