# Backend (Railway)

Simple Express + MongoDB REST API for an internal staff tool.

- Auth: basic username/password from `USERS_JSON`, returns a JWT
- Uploads: images stored in `uploads/` and served from `/uploads/*`

## Setup

1) Install dependencies

```bash
npm install
```

2) Create `.env`

Copy `.env.example` to `.env` and set:

- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGIN` (comma-separated allowed origins)
- `USERS_JSON`

3) Run

```bash
npm run dev
```

Health check: `GET /health`

