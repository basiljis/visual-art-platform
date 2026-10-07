# Публикация dikunova.art на Timeweb Cloud Apps

## Схема
```text
Браузер ─► dikunova.art / api.dikunova.art (:443, SSL Timeweb)
            │ :8082
            ▼
         edge (nginx, всегда онлайн, заглушка при 502/503/504)
            ├─ dikunova.art      → app:8080 (Node, сайт + серверные функции)
            └─ api.dikunova.art  → бэкенд (обход блокировок для браузера)
```
Сайт — это Node-сервер (страницы рендерятся на сервере), а не статика, поэтому `app` запускается через `node .output/server/index.mjs`.

## Шаги
1. Подключить репозиторий проекта (GitHub) в Timeweb Cloud Apps → тип **Docker Compose**.
2. Внешний порт → **8082** (сервис `edge`).
3. Переменные окружения — из `.env.timeweb.example`.
4. Домены в Timeweb: `dikunova.art`, `www.dikunova.art`, `api.dikunova.art` → одно приложение, SSL включить.
5. DNS у регистратора: A-записи `@`, `www`, `api` → IP приложения Timeweb.
6. Деплой.

## Проверка
- `curl https://dikunova.art/__edge_health` → `ok`
- `curl -I https://api.dikunova.art/rest/v1/` → `401` (прокси работает)
- Открыть сайт, галерею, блог, форму «Узнать о покупке», подписку и `/admin`.

## Вход в админку
Письма подтверждения и сброса пароля ведут на адрес сайта — после переезда входите на https://dikunova.art/admin.

## Режим обслуживания вручную
```bash
docker exec <edge> touch /etc/nginx/flags/maintenance.enabled   # включить
docker exec <edge> rm /etc/nginx/flags/maintenance.enabled      # выключить
```
