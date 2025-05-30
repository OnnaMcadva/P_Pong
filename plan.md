## 🔷 ОБЩАЯ СХЕМА ПРОЕКТА ft\_transcendence

```
                             +--------------------+
                             |     HTML UI        | ← статический HTML/JS
                             | (игра + чат и т.д.)|
                             +--------------------+
                                       |
                                       ▼
        +------------------------[ FRONTEND CLIENT ]------------------------+
        | - отрисовка 3D Pong с Babylon.js                                  |
        | - подключение к WebSocket для чата                                |
        | - отправка запросов на backend (Fastify API)                      |
        | - вызовы к blockchain (результаты турнира)                        |
        | - управление страницами профиля/чатом/турнирами/игрой             |
        | Делает: Главный :)                                                |
        | Языки: TypeScript, Babylon.js, HTML, CSS                          |
        +-------------------------------------------------------------------+
                                       |
                                       ▼
        +---------------------[ BACKEND SERVER (Fastify) ]------------------+
        | - REST API: регистрация, авторизация, профили, турнирная логика   |
        | - чат-интеграция: приглашения в игру, уведомления                 |
        | - связка с WebSocket API (если нужно)                             |
        | - хранение данных в SQLite                                        |
        | Делает: Главный :)                                                |
        | Языки: Node.js, TypeScript, Fastify, SQLite                       |
        +-------------------------------------------------------------------+
                                       |
                                       +----------------+
                                                        ▼
+-----------------+       +-------------------+       +--------------------+
| Chat Client     | <---> | Chat WS Server    | <---> | Другие Chat Clients|
| - подключение к |       |                   |       |                    |
|   ws://         |       |                   |       |                    |
| - отправка/приём|       | - обработка ID    |       |                    |
|   сообщений     |       | Делает: Анна      |       | Делает: все        |
| Делает: Анна    |       | Язык:TypeScript   |       |                    |
| Язык:TypeScript |       |                   |       |                    |
+-----------------+       +-------------------+       +--------------------+
                                       |
                                       ▼
+---------------------[ AI Opponent Controller ]----------------------------+
| - «играет» как человек с задержкой в 1 секунду                           |
| - принимает данные об игре и делает ввод через эмуляцию клавиш           |
| - участвует в матчах как соперник                                        |
| Делает: Анна                                                             |
| Языки: JS или TS (в зависимости от среды игры, лучше TS)                 |
+--------------------------------------------------------------------------+

                                       ▼
+---------------------[ DATABASE (SQLite) ]---------------------------------+
| - Хранит: пользователей, результаты игр, настройки, блокировки и т.д.     |
| - Связана с backend через Fastify                                         |
| Делает: Наташа/Славик?                                                    |
| Языки: SQL, взаимодействие через Fastify API (TS)                         |
+--------------------------------------------------------------------------+

                                       ▼
+----------------------[ BLOCKCHAIN MODULE ]-------------------------------+
| - Хранит результаты турниров (публично и прозрачно)                      |
| - Интеграция через backend                                               |
| - Используется Avalanche и контракты на Solidity                         |
| Делает: Наташа/Славик?                                                   |
| Языки: Solidity, JS/TS (через Web3 или Avalanche API)                    |
+--------------------------------------------------------------------------+

---

## 📌 Итоги по технологии
| Блок                  | Делает       | Язык               |
|-----------------------|--------------|--------------------|
| Frontend Client       | Главный :)   | TypeScript + Babylon.js |
| Backend (API)         | Главный :)   | TypeScript + Fastify    |
| Chat-сервер           | Анна         | TypeScript              |
| Chat-клиент           | Анна         | TypeScript/JS           |
| AI Opponent           | Анна         | TypeScript (лучше для единства) |
| Database (SQLite)     | Команда      | SQL + Fastify           |
| Blockchain (Avalanche)| Команда      | Solidity + TS/JS        |

---


