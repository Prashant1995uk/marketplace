# Notes Marketplace API

Base URL: `http://localhost:5000/api` (configurable).

All JSON bodies use `Content-Type: application/json` unless noted.

Auth: send `Authorization: Bearer <JWT>` for protected routes.

---

## Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |

---

## Auth

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/auth/signup` | No | `{ name, email, password }` | Register; returns JWT |
| POST | `/auth/login` | No | `{ email, password }` | Login; returns JWT |
| GET | `/auth/me` | Yes | — | Current user profile |

---

## Notes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notes` | Optional | List approved notes. Query: `page`, `limit`, `keyword`, `subject`, `semester`, `minRating` |
| GET | `/notes/mine` | Yes | Current user’s uploads (all statuses) |
| GET | `/notes/:id` | Optional | Single approved note |
| POST | `/notes` | Yes | Multipart: `file` (PDF), `title`, `subject`, `semester`, optional `price`, `isPaid` |
| DELETE | `/notes/:id` | Yes | Delete own note |

---

## Reviews

Nested under a note.

| Method | Path | Auth | Body |
|--------|------|------|------|
| GET | `/notes/:noteId/reviews` | No | — |
| POST | `/notes/:noteId/reviews` | Yes | `{ rating: 1-5, comment? }` |
| DELETE | `/notes/:noteId/reviews/:reviewId` | Yes | — |

---

## Downloads

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/downloads/:id` | Yes | Authorize download; returns `downloadUrl`, updates quotas |
| GET | `/downloads/mine` | Yes | Recent downloads with note metadata |

---

## Purchases (paid notes)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/purchases/:noteId` | Yes | Placeholder purchase (wire payment gateway in production) |

---

## Premium

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/premium/subscribe` | Yes | `{ paymentConfirmed: true }` placeholder |

---

## Dashboard

| Method | Path | Auth |
|--------|------|------|
| GET | `/dashboard` | Yes |

Returns profile, `leaderboardRank`.

---

## Leaderboard

| Method | Path | Query |
|--------|------|-------|
| GET | `/leaderboard` | `limit` (default 50) |

---

## AI

| Method | Path | Auth |
|--------|------|------|
| POST | `/ai/summarize/:noteId` | Yes |

Requires `OPENAI_API_KEY` on server.

---

## Ads (placeholder)

| Method | Path |
|--------|------|
| GET | `/ads/config` |

---

## Admin (`role: admin`)

| Method | Path | Body |
|--------|------|------|
| GET | `/admin/users` | Query: `page`, `limit` |
| PATCH | `/admin/users/:userId/role` | `{ role: user \| premium \| admin }` |
| GET | `/admin/notes/pending` | — |
| PATCH | `/admin/notes/:noteId/status` | `{ status: approved \| rejected }` |
| DELETE | `/admin/notes/:noteId` | — |

---

## Error format

```json
{ "success": false, "message": "Human-readable message" }
```

Common codes: `401` unauthorized, `402` payment required (paid note), `403` forbidden / quota, `404` not found, `409` conflict (duplicate upload), `422` validation, `503` service unavailable (e.g. OpenAI not configured).
