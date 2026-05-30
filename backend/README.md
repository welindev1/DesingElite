# WelinStore Backend API

NestJS + PostgreSQL + TypeORM

## Inicio rápido

```bash
cp .env.example .env
# Edita .env con tus credenciales

docker-compose up postgres -d

npm install
npm run start:dev
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- pgAdmin: http://localhost:5050

## Producción (Neon)

Agrega en .env:
```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/welinstore?sslmode=require
```

## Módulos

- `auth` — Discord OAuth2 + JWT
- `users` — Gestión de usuarios
- `licenses` — Licencias con productos JSON
- `products` — Productos con imagen principal, galería e imagen, download_link
- `plans` — Planes de suscripción
- `purchases` — Historial de compras
- `coupons` — Cupones de descuento
- `feedback` — Reviews
- `bot` — API para el bot Discord (X-Bot-Secret)
- `mta` — Validación de licencias para scripts Lua
- `dashboard` — Panel del usuario
