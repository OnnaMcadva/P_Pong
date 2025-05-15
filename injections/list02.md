---

### 1. **SQL Injection: Параметризованные запросы / ORM**
```typescript
// Без ORM (нативный SQLite)
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database(':memory:');

// ❌ Опасный запрос (уязвим к SQL-инъекциям)
db.get(`SELECT * FROM users WHERE email = '${email}'`, (err, row) => {});

// ✅ Параметризованный запрос
db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {});

// С ORM (TypeORM)
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;
}

const user = await UserRepository.findOne({ where: { email } }); // Автоматическая защита
```

---

### 2. **XSS: Экранирование HTML/JS, CSP заголовки**
```typescript
// Fastify middleware для CSP
import fastify from 'fastify';
const app = fastify();

app.addHook('onSend', (request, reply, payload, done) => {
  reply.header(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'"
  );
  done();
});

// Экранирование HTML (используем DOMPurify)
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const { window } = new JSDOM('');
const purify = DOMPurify(window);

const cleanHTML = purify.sanitize(userInput); // Очистка перед выводом в шаблон
```

---

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

