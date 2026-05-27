# Notes Sharing & Marketplace

Full-stack app: **React (Vite) + Tailwind**, **Node.js + Express + MongoDB**, **JWT**, **Multer** with **Cloudinary** or local disk, **OpenAI** for PDF summarization.

## Repository layout

- `server/` — Express API (MVC: routes → controllers → models), `src/index.js` entry
- `client/` — React SPA, `npm run dev` for Vite

## Prerequisites

- Node.js 18+
- MongoDB running locally or a connection string
- (Optional) Cloudinary account for production file hosting
- (Optional) OpenAI API key for summarization

## 1. Backend

```bash
cd server
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, optional CLOUD_* and OPENAI_API_KEY
npm install
npm run dev
```

- API: `http://localhost:5000`
- Without Cloudinary, PDFs are stored under `server/public/uploads` and served at `http://localhost:5000/uploads/...` (set `PUBLIC_BASE_URL` in `.env` if needed).

### Create an admin user

```bash
cd server
node scripts/createAdmin.js admin@example.com yourpassword "Admin Name"
```

### API documentation

See [`server/API.md`](server/API.md) for all routes and payloads.

## 2. Frontend

```bash
cd client
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Open `http://localhost:5173`.

## 3. Integration checklist

1. Start MongoDB and confirm `MONGODB_URI` in `server/.env`.
2. Start the API (`server`: `npm run dev`).
3. Create an admin with `scripts/createAdmin.js` so you can approve uploads in **Admin**.
4. Start the client (`client`: `npm run dev`).
5. Sign up a normal user, upload a PDF, then in **Admin** approve the note.
6. Browse the marketplace, download (respects free daily limit), rate, and use **Summarize** if `OPENAI_API_KEY` is set.
7. For paid notes: set price on upload, **Purchase (demo)** on the note page, then download.
8. **Premium (demo)** uses `POST /api/premium/subscribe` with `paymentConfirmed: true`; replace with Razorpay/Stripe in production.

## Monetization notes

- **Commission**: `COMMISSION_RATE` (default `0.2` = 20%) applied in `purchaseController`.
- **Ads**: placeholder at `GET /api/ads/config`; footer references it on the client.

## Production hints

- Set `NODE_ENV=production`, strong `JWT_SECRET`, HTTPS, and restrict CORS (`CLIENT_URL`).
- Use Cloudinary (or S3) for files; avoid exposing raw disk in multi-server setups.
- Verify payments before creating `Purchase` records and before allowing download of paid notes.
