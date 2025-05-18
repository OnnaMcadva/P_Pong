
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



### 3. **CSRF: CSRF-токены, проверка Origin/Referer**
```typescript
// Генерация CSRF-токена (используем fastify-csrf)
import fastifyCsrf from '@fastify/csrf-protection';

app.register(fastifyCsrf);

// В форме (Handlebars пример)
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="{{csrfToken}}">
  <!-- ... -->
</form>

// Проверка Origin (middleware)
app.addHook('preHandler', (req, reply, done) => {
  const allowedOrigins = ['https://yourdomain.com'];
  const origin = req.headers.origin;
  
  if (req.method === 'POST' && !allowedOrigins.includes(origin)) {
    throw new Error('Invalid origin');
  }
  done();
});
```

---

### 4. **Authentication & Sessions: JWT с TTL, HttpOnly куки**
```typescript
// Генерация JWT (fastify-jwt)
import fjwt from '@fastify/jwt';
app.register(fjwt, { secret: 'your-secret' });

// Логин
app.post('/login', async (req, reply) => {
  const token = app.jwt.sign({ userId: 123 }, { expiresIn: '15m' });
  
  reply.setCookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
});

// Обновление токена
app.post('/refresh', async (req, reply) => {
  const newToken = app.jwt.sign({ userId: req.user.id }, { expiresIn: '15m' });
  // ...отправка нового токена
});
```

---

### 5. **Authorization (ACL): Роли, middleware**
```typescript
// Роли пользователей (enum)
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// Middleware проверки ролей
const checkRole = (role: Role) => (req, reply, done) => {
  if (req.user.role !== role) {
    throw new Error('Forbidden');
  }
  done();
};

// Использование
app.get(
  '/admin',
  { preHandler: [checkRole(Role.ADMIN)] },
  async () => ({ message: 'Admin panel' })
);
```

---

### 6. **Rate Limiting & Bruteforce: Ограничение запросов**
```typescript
// fastify-rate-limit
import rateLimit from '@fastify/rate-limit';

app.register(rateLimit, {
  max: 100, // Макс. 100 запросов
  timeWindow: '1 minute'
});

// Капча при логине (Google reCAPTCHA)
app.post('/login', async (req) => {
  const { captcha } = req.body;
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET}&response=${captcha}`
  );
  
  if (!response.data.success) {
    throw new Error('Invalid captcha');
  }
});
```

---

### 7. **Input Validation: Валидация данных (Zod)**
```typescript
import { z } from 'zod';

// Схема валидации
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// Middleware валидации
app.post('/login', {
  schema: {
    body: loginSchema
  }
}, async (req) => {
  // Данные уже валидированы
  const { email, password } = req.body;
});
```

---

### Дополнительно: **Логирование атак**
```typescript
// Логирование подозрительных запросов
app.addHook('onRequest', (req, reply, done) => {
  if (req.body?.includes('<script>')) {
    logSuspiciousActivity(req.ip, 'XSS attempt');
  }
  done();
});
```

