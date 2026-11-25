# MicroArts by Vivek

A full-stack storefront for handmade miniature art and personalized pencil-carving gifts, with a customer-facing gift designer and a private artist dashboard.

**Live site:** [microartsbyvivek.com](https://microartsbyvivek.com)

> This is the source code of a real production site, shared as a portfolio piece. Secrets and customer data are not part of this repository; see [LICENSE](LICENSE) for usage terms.

---

## Highlights

- **"Design Your Gift Idea" designer**: an in-browser tool where customers lay out carved pencils, photos and quotes inside a frame. It uses a custom canvas/SVG renderer with collision handling (items stay inside the frame and pencils never overlap) and live pricing. One renderer (`renderDesign`) produces the customer preview, the dashboard view and a **300 DPI print file** (PNG with `pHYs` metadata, or PDF sized exactly to the art).
- **Shared business rules**: pricing and validation live in `shared/` as dependency-free ES modules used by both the browser and the server. The server **recomputes every price** and never trusts the browser's total. Unit tests use Node's built-in test runner.
- **Artist dashboard**: CRUD for artworks and gifts with multi-image/video media (Cloudinary), stock and availability, featured items, order and custom-request tracking with status history, and design-request review with photo DPI warnings.
- **Security**: single-admin JWT auth with optional **TOTP two-factor authentication** (short-lived challenge tokens), CORS allowlist, rate-limited public endpoints, strict upload validation (type, size, count), and an unlinked, `noindex` admin route.
- **SEO without SSR**: a post-build script pre-renders a static page per artwork and gift (meta, Open Graph, canonical, JSON-LD) and regenerates the sitemap.
- **Real-world details**: WhatsApp alerts to the artist on every new request, international phone fields, a design draft autosaved in localStorage and IndexedDB, and a server wake-up step for the free-tier host.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, plain CSS, Canvas/SVG, jsPDF |
| Backend | Node.js, Express 5, Mongoose (MongoDB) |
| Media | Cloudinary (multer memory storage, no local disk) |
| Auth | JWT, bcrypt, TOTP 2FA (`otplib`) |
| Hosting | Vercel (frontend), Render (API), MongoDB Atlas |

## Project structure

```
backend/    Express API: routes, Mongoose models, auth/upload middleware, Cloudinary helpers
frontend/   React app: views, dashboard sections, designer (src/designer), SEO build script
shared/     Pricing and validation rules shared by browser and server, with unit tests
```

The site uses no router library. Views switch on state, and URLs sync through the History API with deep links resolved after data loads. [CLAUDE.md](CLAUDE.md) gives a detailed architecture walkthrough.

## Running locally

Requirements: Node.js 20+, a MongoDB database and a Cloudinary account.

```bash
# Backend
cd backend
cp .env.example .env        # fill in your own values
npm install
npm run dev                 # http://localhost:5000

# Frontend (in a second terminal)
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # http://localhost:5173

# Shared rules tests
cd shared && npm test
```

Public registration is disabled. To create a test admin account in a database named `microarts_test`, run `node backend/scripts/seedTestArtist.js`. The dashboard opens at `/studio`.

## Author

**Vivek Podagatla**: [GitHub](https://github.com/VivekPodagatla)
